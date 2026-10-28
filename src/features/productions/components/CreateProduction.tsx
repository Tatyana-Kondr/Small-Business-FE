import { useEffect, useMemo, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Autocomplete,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ProductPickDto } from "../../products/types";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  ClearIcon,
  DatePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/de";
import { deDE } from "@mui/x-date-pickers/locales";
import {
  clearPickProducts,
  getPickProducts,
  selectPickLoading,
  selectPickProducts,
} from "../../products/productsSlice";
import {
  getProductCategories,
  selectProductCategories,
} from "../../products/productCategoriesSlice";

import { handleApiError } from "../../../utils/errors/handleApiError";
import { showSuccessToast } from "../../../utils/toast";
import { NewProductionDto, NewProductionItemDto } from "../types";
import { addProduction } from "../productionsSlice";
import {
  actionCellStyle,
  cellStyle,
  centerCellStyle,
  deleteItemButtonStyle,
  fixedCellWidth,
  leftBorderCellStyle,
  rightCellStyle,
  saleTableNameCellStyle,
  StyledTableHead,
  tableRowHoverStyle,
  tableStyle,
} from "../../../styles/tableStyles";
import CompactNumberCell from "../../../components/CompactNumberCell";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { dateFieldStyle } from "../../../styles/formStyles";
import { colors } from "../../../styles/colors";
import { sectionTitleStyle } from "../../../styles/typographyStyles";
import { primaryButtonStyle } from "../../../styles/buttonStyles";
import { isBackendValidationErrors } from "../../../utils/validation/validation";
import { translateValidationMessage } from "../../../utils/validation/validationMessages";
import {
  validatePrice,
  validateQuantity,
} from "../../../utils/validation/numberValidation";
import DraggableDialog from "../../../components/DraggableDialog";
import DialogTitleText from "../../../components/DialogTitleText";
import { formatNumber } from "../../../utils/formatNumber";

// ----------------------------------------------------
// Типы формы
// ----------------------------------------------------

type ProductionFormItem = NewProductionItemDto & {
  totalPrice: number;
};

type ProductionFormData = Omit<NewProductionDto, "productionItems"> & {
  amount: number;
  productionItems: ProductionFormItem[];
};

type MainProductErrors = {
  productId?: string;
  quantity?: string;
  unitPrice?: string;
};

type ProductionItemErrors = {
  quantity?: string;
  unitPrice?: string;
};

type FormErrors = {
  dateOfProduction?: string;
  margin?: string;
};

type CreateProductionModalProps = {
  onClose: () => void;
  onSubmitSuccess?: () => void;
};

// ----------------------------------------------------
// Вспомогательные функции
// ----------------------------------------------------

const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const MARGIN_ERROR =
  "Der Wert des hergestellten Produkts muss höher sein als die Materialkosten.";

const MATERIALS_ERROR = "Bitte fügen Sie mindestens ein Material hinzu.";

// ----------------------------------------------------
// Компонент
// ----------------------------------------------------

export default function CreateProduction({
  onClose,
  onSubmitSuccess,
}: CreateProductionModalProps) {
  const dispatch = useAppDispatch();

  // --------------------------------------------------
  // Redux
  // --------------------------------------------------

  const pickProducts = useAppSelector(selectPickProducts);
  const pickLoading = useAppSelector(selectPickLoading);
  const categories = useAppSelector(selectProductCategories);

  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const [newProduction, setNewProduction] = useState<ProductionFormData>(
    () => ({
      productId: 0,
      dateOfProduction: dayjs().format("YYYY-MM-DD"),
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      productionItems: [],
    }),
  );

  const [dateValue, setDateValue] = useState<Dayjs | null>(() => dayjs());

  const [mainProduct, setMainProduct] = useState<ProductPickDto | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(false);

  const [mainProductErrors, setMainProductErrors] = useState<MainProductErrors>(
    {},
  );

  const [materialsError, setMaterialsError] = useState("");

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [itemErrors, setItemErrors] = useState<
    Record<number, ProductionItemErrors>
  >({});

  const canSearchProducts =
    selectedCategory !== null || searchTerm.trim().length >= 2;

  // --------------------------------------------------
  // Загрузка категорий
  // --------------------------------------------------

  useEffect(() => {
    dispatch(clearPickProducts());
    dispatch(getProductCategories());
  }, [dispatch]);

  // --------------------------------------------------
  // Поиск продуктов
  // --------------------------------------------------

  useEffect(() => {
    if (!canSearchProducts) {
      dispatch(clearPickProducts());
      return;
    }

    const timer = setTimeout(() => {
      dispatch(
        getPickProducts({
          searchTerm: searchTerm.trim(),
          categoryId: selectedCategory,
          limit: 100,
        }),
      );
    }, 350);

    return () => clearTimeout(timer);
  }, [dispatch, searchTerm, selectedCategory, canSearchProducts]);

  // --------------------------------------------------
  // Расчёты
  // --------------------------------------------------

  const { materialsTotal, productTotal, margin, marginPercent } =
    useMemo(() => {
      const materialsTotal = roundMoney(
        newProduction.productionItems.reduce(
          (sum, item) => sum + item.totalPrice,
          0,
        ),
      );

      const productTotal = roundMoney(newProduction.amount);
      const margin = roundMoney(productTotal - materialsTotal);

      const marginPercent =
        productTotal !== 0 ? roundMoney((margin / productTotal) * 100) : 0;

      return {
        materialsTotal,
        productTotal,
        margin,
        marginPercent,
      };
    }, [newProduction]);

  const hasMarginData =
    newProduction.productId > 0 && newProduction.productionItems.length > 0;

  const hasInvalidMargin = hasMarginData && margin <= 0;

  // --------------------------------------------------
  // Ошибки главного продукта
  // --------------------------------------------------

  const clearMainProductError = (field: keyof MainProductErrors) => {
    setMainProductErrors((prev) => {
      if (!prev[field]) return prev;

      const updated = { ...prev };
      delete updated[field];

      return updated;
    });
  };

  // --------------------------------------------------
  // Выбор готового продукта
  // --------------------------------------------------

  const handleAddProductAsMain = (product: ProductPickDto) => {
    const unitPrice = roundMoney(Number(product.sellingPrice) || 0);

    setMainProduct(product);

    setNewProduction((prev) => ({
      ...prev,
      productId: product.id,
      unitPrice,
      amount: roundMoney(prev.quantity * unitPrice),
    }));

    clearMainProductError("productId");
    setFormErrors((prev) => ({
      ...prev,
      margin: undefined,
    }));
  };

  // --------------------------------------------------
  // Изменение готового продукта
  // --------------------------------------------------

  const handleMainChange = (field: "quantity" | "unitPrice", value: number) => {
    setNewProduction((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      return {
        ...updated,
        amount: roundMoney(updated.quantity * updated.unitPrice),
      };
    });

    clearMainProductError(field);

    setFormErrors((prev) => ({
      ...prev,
      margin: undefined,
    }));
  };

  // --------------------------------------------------
  // Проверка готового продукта
  // --------------------------------------------------

  const validateMainProduct = (): boolean => {
    const errors: MainProductErrors = {};

    if (!newProduction.productId) {
      errors.productId = "Bitte wählen Sie ein Hauptprodukt.";
    }

    const quantityError = validateQuantity(Number(newProduction.quantity));

    if (quantityError) {
      errors.quantity = quantityError;
    }

    const unitPriceError = validatePrice(Number(newProduction.unitPrice));

    if (unitPriceError) {
      errors.unitPrice = unitPriceError;
    }

    setMainProductErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // --------------------------------------------------
  // Добавление материала
  // --------------------------------------------------

  const handleAddProductAsMaterial = (product: ProductPickDto) => {
    const quantity = 1;
    const unitPrice = roundMoney(Number(product.purchasingPrice) || 0);

    const item: ProductionFormItem = {
      productId: product.id,
      productArticle: product.article ?? "",
      productName: product.name ?? "",
      quantity,
      unitPrice,
      totalPrice: roundMoney(quantity * unitPrice),
    };

    setNewProduction((prev) => ({
      ...prev,
      productionItems: [...prev.productionItems, item],
    }));

    setMaterialsError("");

    setFormErrors((prev) => ({
      ...prev,
      margin: undefined,
    }));
  };

  // --------------------------------------------------
  // Удаление материала
  // --------------------------------------------------

  const handleRemoveItem = (index: number) => {
    const remainingCount = newProduction.productionItems.length - 1;

    setNewProduction((prev) => ({
      ...prev,
      productionItems: prev.productionItems.filter((_, i) => i !== index),
    }));

    setItemErrors((prev) => {
      const updatedErrors: Record<number, ProductionItemErrors> = {};

      Object.entries(prev).forEach(([key, errors]) => {
        const currentIndex = Number(key);

        if (currentIndex < index) {
          updatedErrors[currentIndex] = errors;
        }

        if (currentIndex > index) {
          updatedErrors[currentIndex - 1] = errors;
        }
      });

      return updatedErrors;
    });

    setMaterialsError(remainingCount === 0 ? MATERIALS_ERROR : "");

    setFormErrors((prev) => ({
      ...prev,
      margin: undefined,
    }));
  };

  // --------------------------------------------------
  // Перемещение материала
  // --------------------------------------------------

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newProduction.productionItems.length) {
      return;
    }

    setNewProduction((prev) => {
      const updatedItems = [...prev.productionItems];

      [updatedItems[index], updatedItems[newIndex]] = [
        updatedItems[newIndex],
        updatedItems[index],
      ];

      return {
        ...prev,
        productionItems: updatedItems,
      };
    });

    setItemErrors((prev) => {
      const updatedErrors = { ...prev };

      const currentErrors = prev[index];
      const targetErrors = prev[newIndex];

      delete updatedErrors[index];
      delete updatedErrors[newIndex];

      if (currentErrors) {
        updatedErrors[newIndex] = currentErrors;
      }

      if (targetErrors) {
        updatedErrors[index] = targetErrors;
      }

      return updatedErrors;
    });
  };

  // --------------------------------------------------
  // Очистка ошибки материала
  // --------------------------------------------------

  const clearItemError = (index: number, field: keyof ProductionItemErrors) => {
    setItemErrors((prev) => {
      if (!prev[index]?.[field]) return prev;

      const updated = { ...prev };
      const rowErrors = { ...updated[index] };

      delete rowErrors[field];

      if (Object.keys(rowErrors).length === 0) {
        delete updated[index];
      } else {
        updated[index] = rowErrors;
      }

      return updated;
    });
  };

  // --------------------------------------------------
  // Изменение количества / цены материала
  // --------------------------------------------------

  const handleItemChange = (
    index: number,
    field: "quantity" | "unitPrice",
    value: number,
  ) => {
    setNewProduction((prev) => {
      const updatedItems = [...prev.productionItems];

      const currentItem = {
        ...updatedItems[index],
        [field]: value,
      };

      currentItem.totalPrice = roundMoney(
        currentItem.quantity * currentItem.unitPrice,
      );

      updatedItems[index] = currentItem;

      return {
        ...prev,
        productionItems: updatedItems,
      };
    });

    clearItemError(index, field);

    setFormErrors((prev) => ({
      ...prev,
      margin: undefined,
    }));
  };

  // --------------------------------------------------
  // Проверка материалов
  // --------------------------------------------------

  const validateProductionItems = (): boolean => {
    if (newProduction.productionItems.length === 0) {
      setMaterialsError(MATERIALS_ERROR);
      setItemErrors({});
      return false;
    }

    setMaterialsError("");

    const newItemErrors: Record<number, ProductionItemErrors> = {};

    newProduction.productionItems.forEach((item, index) => {
      const errors: ProductionItemErrors = {};

      const quantityError = validateQuantity(Number(item.quantity));

      if (quantityError) {
        errors.quantity = quantityError;
      }

      const unitPriceError = validatePrice(Number(item.unitPrice));

      if (unitPriceError) {
        errors.unitPrice = unitPriceError;
      }

      if (Object.keys(errors).length > 0) {
        newItemErrors[index] = errors;
      }
    });

    setItemErrors(newItemErrors);

    return Object.keys(newItemErrors).length === 0;
  };

  // --------------------------------------------------
  // Проверка формы
  // --------------------------------------------------

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    const productionDate = dayjs(newProduction.dateOfProduction);

    if (
      !newProduction.dateOfProduction ||
      !dateValue ||
      !dateValue.isValid() ||
      !productionDate.isValid()
    ) {
      errors.dateOfProduction = "Bitte wählen Sie ein gültiges Datum.";
    } else if (productionDate.isAfter(dayjs(), "day")) {
      errors.dateOfProduction = "Das Datum darf nicht in der Zukunft liegen.";
    }

    if (hasInvalidMargin) {
      errors.margin = MARGIN_ERROR;
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // --------------------------------------------------
  // Ошибки backend
  // --------------------------------------------------

  const applyBackendValidationErrors = (error: unknown): boolean => {
    if (!isBackendValidationErrors(error)) {
      return false;
    }

    const mainErrors: MainProductErrors = {};
    const backendFormErrors: FormErrors = {};

    const productionItemErrors: Record<number, ProductionItemErrors> = {};

    let newMaterialsError = "";

    error.errors.forEach((validationError) => {
      const message = translateValidationMessage(validationError.message);

      const fieldName = validationError.field;

      if (fieldName === "productId") {
        mainErrors.productId = message;
        return;
      }

      if (fieldName === "dateOfProduction") {
        backendFormErrors.dateOfProduction = message;
        return;
      }

      if (fieldName === "quantity") {
        mainErrors.quantity = message;
        return;
      }

      if (fieldName === "unitPrice") {
        mainErrors.unitPrice = message;
        return;
      }

      if (fieldName === "productionItems") {
        newMaterialsError = message;
        return;
      }

      const itemMatch = fieldName.match(
        /^productionItems\[(\d+)\]\.(quantity|unitPrice)$/,
      );

      if (!itemMatch) return;

      const index = Number(itemMatch[1]);
      const field = itemMatch[2] as keyof ProductionItemErrors;

      productionItemErrors[index] = {
        ...productionItemErrors[index],
        [field]: message,
      };
    });

    setMainProductErrors(mainErrors);
    setFormErrors(backendFormErrors);
    setItemErrors(productionItemErrors);
    setMaterialsError(newMaterialsError);

    return true;
  };

  // --------------------------------------------------
  // Сохранение
  // --------------------------------------------------

  const handleSubmit = async () => {
    if (loading) return;

    const formIsValid = validateForm();
    const mainProductIsValid = validateMainProduct();
    const itemsAreValid = validateProductionItems();

    if (!formIsValid || !mainProductIsValid || !itemsAreValid) {
      return;
    }

    const payload: NewProductionDto = {
      dateOfProduction: newProduction.dateOfProduction,
      productId: newProduction.productId,
      quantity: newProduction.quantity,
      unitPrice: newProduction.unitPrice,

      productionItems: newProduction.productionItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };

    try {
      setLoading(true);

      await dispatch(addProduction(payload)).unwrap();

      showSuccessToast("Erfolg", "Herstellung erfolgreich erstellt.");

      onSubmitSuccess?.();
      onClose();
    } catch (error) {
      if (applyBackendValidationErrors(error)) {
        return;
      }

      handleApiError(error, "Die Herstellung konnte nicht erstellt werden.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // JSX
  // --------------------------------------------------

  return (
    <DraggableDialog
      open
      onClose={loading ? undefined : onClose}
      dialogWidth={1300}
      maxWidth={false}
      scroll="paper"
      title={
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <DialogTitleText>Neue Herstellung</DialogTitleText>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mr: 1,
            }}
          >
            <Typography
              sx={{
                fontWeight: 500,
                whiteSpace: "nowrap",
                color: colors.darkGrey,
              }}
            >
              Datum:
            </Typography>

            <Box sx={{ width: 160 }}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="de"
                localeText={
                  deDE.components.MuiLocalizationProvider.defaultProps
                    .localeText
                }
              >
                <DatePicker
                  value={dateValue}
                  disableFuture
                  onChange={(newValue) => {
                    setDateValue(newValue);

                    setNewProduction((prev) => ({
                      ...prev,
                      dateOfProduction:
                        newValue && newValue.isValid()
                          ? newValue.format("YYYY-MM-DD")
                          : "",
                    }));

                    setFormErrors((prev) => ({
                      ...prev,
                      dateOfProduction: undefined,
                    }));
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      sx: dateFieldStyle,
                      disabled: loading,
                      error: Boolean(formErrors.dateOfProduction),
                      helperText: formErrors.dateOfProduction,
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Box>
        </Box>
      }
      actions={
        <Button
          variant="contained"
          disabled={loading}
          onClick={handleSubmit}
          sx={primaryButtonStyle}
        >
          {loading ? "Speichern..." : "Speichern"}
        </Button>
      }
    >
      {/* ============================================ */}
      {/* PRODUZIERTES PRODUKT */}
      {/* ============================================ */}

      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography sx={sectionTitleStyle}>Produziertes Produkt</Typography>

        <Table size="small" sx={tableStyle}>
          <StyledTableHead>
            <TableRow>
              <TableCell sx={fixedCellWidth(120)}>Artikel</TableCell>

              <TableCell>Name</TableCell>

              <TableCell sx={fixedCellWidth(100)}>Menge</TableCell>

              <TableCell sx={fixedCellWidth(110)}>Preis</TableCell>

              <TableCell sx={fixedCellWidth(120)}>Summe</TableCell>
            </TableRow>
          </StyledTableHead>

          <TableBody>
            <TableRow sx={tableRowHoverStyle}>
              <TableCell
                sx={{
                  ...cellStyle,
                  ...fixedCellWidth(120),
                  borderLeft: "1px solid #ddd",
                }}
              >
                {mainProduct?.article ?? ""}
              </TableCell>

              <TableCell sx={cellStyle}>{mainProduct?.name ?? ""}</TableCell>

              <TableCell
                sx={{
                  ...cellStyle,
                  ...fixedCellWidth(100),
                }}
              >
                <CompactNumberCell
                  value={newProduction.quantity}
                  min={0}
                  step={0.001}
                  align="center"
                  disabled={loading}
                  error={Boolean(mainProductErrors.quantity)}
                  errorText={mainProductErrors.quantity}
                  onChange={(value) => handleMainChange("quantity", value)}
                />
              </TableCell>

              <TableCell
                sx={{
                  ...cellStyle,
                  ...fixedCellWidth(110),
                }}
              >
                <CompactNumberCell
                  value={newProduction.unitPrice}
                  min={0}
                  step={0.01}
                  disabled={loading}
                  error={Boolean(mainProductErrors.unitPrice)}
                  errorText={mainProductErrors.unitPrice}
                  onChange={(value) => handleMainChange("unitPrice", value)}
                />
              </TableCell>

              <TableCell
                sx={{
                  ...rightCellStyle,
                  ...fixedCellWidth(120),
                }}
              >
                {formatNumber(newProduction.amount)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {mainProductErrors.productId && (
          <Typography
            variant="caption"
            color="error"
            sx={{
              display: "block",
              mt: 0.5,
            }}
          >
            {mainProductErrors.productId}
          </Typography>
        )}
      </Box>

      {/* ============================================ */}
      {/* MATERIALIEN */}
      {/* ============================================ */}

      <Typography
        sx={{
          ...sectionTitleStyle,
          mt: 1,
        }}
      >
        Materialien
      </Typography>

      <Box
        sx={{
          minHeight: newProduction.productionItems.length ? 120 : 80,
          maxHeight: 600,
          overflowY: "auto",
          mb: 2,
          border: `1px solid ${colors.border}`,
          width: "100%",
        }}
      >
        <Table size="small" sx={tableStyle}>
          <StyledTableHead>
            <TableRow>
              <TableCell
                sx={{
                  ...fixedCellWidth(45),
                  fontSize: "12px",
                }}
              >
                Pos
              </TableCell>

              <TableCell sx={fixedCellWidth(120)}>Artikel</TableCell>

              <TableCell sx={{ width: "40%" }}>Name</TableCell>

              <TableCell sx={fixedCellWidth(75)}>Menge</TableCell>

              <TableCell sx={fixedCellWidth(90)}>Preis</TableCell>

              <TableCell sx={fixedCellWidth(90)}>Summe</TableCell>

              <TableCell sx={fixedCellWidth(65)} />
            </TableRow>
          </StyledTableHead>

          <TableBody>
            {newProduction.productionItems.map((item, index) => (
              <TableRow
                key={`${item.productId}-${index}`}
                sx={tableRowHoverStyle}
              >
                {/* Position */}

                <TableCell
                  sx={{
                    ...centerCellStyle,
                    ...fixedCellWidth(45),
                    ...leftBorderCellStyle,
                  }}
                >
                  {index + 1}
                </TableCell>

                {/* Artikel */}

                <TableCell
                  sx={{
                    ...cellStyle,
                    ...fixedCellWidth(120),
                  }}
                >
                  {item.productArticle ?? String(item.productId)}
                </TableCell>

                {/* Name */}

                <TableCell
                  sx={{
                    ...saleTableNameCellStyle,
                    width: "40%",
                    verticalAlign: "middle",
                    py: 1,
                  }}
                >
                  {item.productName ?? String(item.productId)}
                </TableCell>

                {/* Menge */}

                <TableCell
                  sx={{
                    ...cellStyle,
                    ...fixedCellWidth(75),
                  }}
                >
                  <CompactNumberCell
                    value={item.quantity}
                    min={0}
                    step={0.001}
                    align="center"
                    disabled={loading}
                    error={Boolean(itemErrors[index]?.quantity)}
                    errorText={itemErrors[index]?.quantity}
                    onChange={(value) =>
                      handleItemChange(index, "quantity", value)
                    }
                  />
                </TableCell>

                {/* Preis */}

                <TableCell
                  sx={{
                    ...cellStyle,
                    ...fixedCellWidth(90),
                  }}
                >
                  <CompactNumberCell
                    value={item.unitPrice}
                    min={0}
                    step={0.01}
                    disabled={loading}
                    error={Boolean(itemErrors[index]?.unitPrice)}
                    errorText={itemErrors[index]?.unitPrice}
                    onChange={(value) =>
                      handleItemChange(index, "unitPrice", value)
                    }
                  />
                </TableCell>

                {/* Summe */}

                <TableCell
                  sx={{
                    ...rightCellStyle,
                    ...fixedCellWidth(90),
                  }}
                >
                  {formatNumber(item.totalPrice)}
                </TableCell>

                {/* Aktionen */}

                <TableCell
                  sx={{
                    ...actionCellStyle,
                    ...fixedCellWidth(65),
                    p: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.25,
                    }}
                  >
                    <Tooltip title="Nach oben" arrow>
                      <span>
                        <IconButton
                          size="small"
                          disabled={index === 0 || loading}
                          onClick={() => handleMoveItem(index, "up")}
                          sx={{ p: 0.25 }}
                        >
                          <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Nach unten" arrow>
                      <span>
                        <IconButton
                          size="small"
                          disabled={
                            index ===
                              newProduction.productionItems.length - 1 ||
                            loading
                          }
                          onClick={() => handleMoveItem(index, "down")}
                          sx={{ p: 0.25 }}
                        >
                          <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Löschen" arrow>
                      <span>
                        <IconButton
                          size="small"
                          disabled={loading}
                          onClick={() => handleRemoveItem(index)}
                          aria-label="Zeile löschen"
                          sx={deleteItemButtonStyle}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}

            {newProduction.productionItems.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                  sx={{ color: "text.secondary" }}
                >
                  Keine Materialien vorhanden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {materialsError && (
        <Typography
          variant="caption"
          color="error"
          sx={{
            display: "block",
            mt: -1,
            mb: 1,
          }}
        >
          {materialsError}
        </Typography>
      )}

      {/* ============================================ */}
      {/* SUMMEN */}
      {/* ============================================ */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-end",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            minWidth: 280,
            textAlign: "right",
          }}
        >
          <Typography>Materialien: {formatNumber(materialsTotal)} €</Typography>

          <Typography>
            Produziertes Produkt: {formatNumber(productTotal)} €
          </Typography>

          <Typography
            sx={{
              fontWeight: "bold",
              color: hasInvalidMargin
                ? "error.main"
                : margin > 0
                  ? "success.main"
                  : "text.primary",
            }}
          >
            Marge: {formatNumber(margin)} € ({formatNumber(marginPercent)} %)
          </Typography>

          {hasInvalidMargin && (
            <Typography
              variant="caption"
              color="error"
              sx={{
                display: "block",
                mt: 0.5,
              }}
            >
              {MARGIN_ERROR}
            </Typography>
          )}

          {formErrors.margin && !hasInvalidMargin && (
            <Typography
              variant="caption"
              color="error"
              sx={{
                display: "block",
                mt: 0.5,
              }}
            >
              {formErrors.margin}
            </Typography>
          )}
        </Box>
      </Box>

      {/* ============================================ */}
      {/* PRODUKTE HINZUFÜGEN */}
      {/* ============================================ */}

      <Box sx={{ width: "100%", mt: 3 }}>
        <Typography
          sx={{
            ...sectionTitleStyle,
            mb: 1,
          }}
        >
          Produkte hinzufügen
        </Typography>

        {/* Kategorie + Suche */}

        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          {/* Kategorie */}

          <Grid item xs={4}>
            <Autocomplete
              fullWidth
              disabled={loading}
              options={[...categories].sort((a, b) =>
                a.name.localeCompare(b.name),
              )}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={
                categories.find(
                  (category) => category.id === selectedCategory,
                ) ?? null
              }
              onChange={(_, newCategory) => {
                setSelectedCategory(newCategory?.id ?? null);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  id="production-category"
                  label="Kategorie"
                  aria-label="Kategorie"
                />
              )}
            />
          </Grid>

          {/* Suche */}

          <Grid item xs={8}>
            <TextField
              id="production-product-search"
              fullWidth
              disabled={loading}
              placeholder="Produktname, Artikel, Lieferanten-Artikel suchen..."
              aria-label="Produkt suchen"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      disabled={loading}
                      onClick={() => setSearchTerm("")}
                      aria-label="Suche zurücksetzen"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>
        </Grid>

        {/* ========================================== */}
        {/* Suchergebnisse */}
        {/* ========================================== */}

        <Box
          sx={{
            maxHeight: 263,
            overflowY: "auto",
            border: `1px solid ${colors.border}`,
          }}
        >
          {pickLoading && (
            <Box
              sx={{
                p: 1,
                textAlign: "center",
                color: colors.accentBlue,
              }}
            >
              <CircularProgress size={20} />

              <Typography variant="caption" sx={{ ml: 1 }}>
                Produkte werden geladen…
              </Typography>
            </Box>
          )}

          <Table size="small" stickyHeader sx={tableStyle}>
            <StyledTableHead>
              <TableRow>
                <TableCell sx={{ width: "35%" }}>Artikelname</TableCell>

                <TableCell sx={fixedCellWidth(140)}>Artikel</TableCell>

                <TableCell sx={{ width: "25%" }}>Lieferanten-Artikel</TableCell>

                <TableCell sx={fixedCellWidth(100)}>Preis</TableCell>

                <TableCell sx={fixedCellWidth(220)}>Aktionen</TableCell>
              </TableRow>
            </StyledTableHead>

            <TableBody>
              {canSearchProducts &&
                pickProducts.map((product) => (
                  <TableRow key={product.id} sx={tableRowHoverStyle}>
                    {/* Name */}

                    <TableCell sx={cellStyle}>{product.name}</TableCell>

                    {/* Artikel */}

                    <TableCell sx={cellStyle}>{product.article}</TableCell>

                    {/* Lieferanten-Artikel */}

                    <TableCell sx={cellStyle}>
                      {product.vendorArticle ?? ""}
                    </TableCell>

                    {/* Einkaufspreis */}

                    <TableCell sx={rightCellStyle}>
                      {formatNumber(Number(product.purchasingPrice ?? 0))}
                    </TableCell>

                    {/* Beide Buttons */}

                    <TableCell
                      sx={{
                        ...centerCellStyle,
                        ...fixedCellWidth(220),
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Button
                          size="small"
                          disabled={loading}
                          onClick={() => handleAddProductAsMain(product)}
                        >
                          Als Produkt
                        </Button>

                        <Button
                          size="small"
                          disabled={loading}
                          onClick={() => handleAddProductAsMaterial(product)}
                        >
                          Als Material
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}

              {!pickLoading &&
                canSearchProducts &&
                pickProducts.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{
                        color: "text.secondary",
                      }}
                    >
                      Keine Produkte gefunden
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </DraggableDialog>
  );
}
