import { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ClearIcon from "@mui/icons-material/Clear";

import { useNavigate, useParams } from "react-router-dom";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { deDE } from "@mui/x-date-pickers/locales";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/de";

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { ProductPickDto } from "../../products/types";
import { NewProductionDto, NewProductionItemDto, Production } from "../types";

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

import { getProductionById, updateProduction } from "../productionsSlice";

import { handleApiError } from "../../../utils/errors/handleApiError";
import { showSuccessToast } from "../../../utils/toast";

import { isBackendValidationErrors } from "../../../utils/validation/validation";

import { translateValidationMessage } from "../../../utils/validation/validationMessages";

import { validateQuantity } from "../../../utils/validation/numberValidation";

import CompactNumberCell from "../../../components/CompactNumberCell";
import PageTitle from "../../../components/PageTitle";

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

import { dateFieldStyle } from "../../../styles/formStyles";
import { sectionTitleStyle } from "../../../styles/typographyStyles";
import { colors } from "../../../styles/colors";

import {
  primaryButtonStyle,
} from "../../../styles/buttonStyles";

// =====================================================
// TYPES
// =====================================================

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

// =====================================================
// CONSTANTS
// =====================================================

const MATERIALS_ERROR = "Bitte fügen Sie mindestens ein Material hinzu.";

const MARGIN_ERROR =
  "Der Wert des hergestellten Produkts muss höher sein als die Materialkosten.";

const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const formatMoney = (value: number): string =>
  value.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const toFormData = (production: Production): ProductionFormData => ({
  productId: production.productId,
  productArticle: production.productArticle,
  productName: production.productName,
  dateOfProduction: production.dateOfProduction,
  quantity: production.quantity,
  unitPrice: production.unitPrice,
  amount: production.amount,

  productionItems: production.productionItems.map((item) => ({
    productId: item.productId,
    productArticle: item.productArticle,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
  })),
});

// =====================================================
// COMPONENT
// =====================================================

export default function EditProduction() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { productionId } = useParams<{
    productionId: string;
  }>();

  const id = Number(productionId);

  // ---------------------------------------------------
  // REDUX
  // ---------------------------------------------------

  const pickProducts = useAppSelector(selectPickProducts);
  const pickLoading = useAppSelector(selectPickLoading);
  const categories = useAppSelector(selectProductCategories);

  // ---------------------------------------------------
  // STATE
  // ---------------------------------------------------

  const [production, setProduction] = useState<ProductionFormData>({
    productId: 0,
    productArticle: "",
    productName: "",
    dateOfProduction: "",
    quantity: 0,
    unitPrice: 0,
    amount: 0,
    productionItems: [],
  });

  const [dateValue, setDateValue] = useState<Dayjs | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [mainProductErrors, setMainProductErrors] = useState<MainProductErrors>(
    {},
  );

  const [itemErrors, setItemErrors] = useState<
    Record<number, ProductionItemErrors>
  >({});

  const [materialsError, setMaterialsError] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const canSearchProducts =
    selectedCategory !== null || searchTerm.trim().length >= 2;

  // ===================================================
  // LOAD DATA
  // ===================================================

  useEffect(() => {
    dispatch(getProductCategories());
    dispatch(clearPickProducts());
  }, [dispatch]);

  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) {
      setPageLoading(false);
      return;
    }

    let active = true;

    setPageLoading(true);

    dispatch(getProductionById(id))
      .unwrap()
      .then((result) => {
        if (!active) return;

        setProduction(toFormData(result));

        setDateValue(
          result.dateOfProduction ? dayjs(result.dateOfProduction) : null,
        );

        setMainProductErrors({});
        setItemErrors({});
        setMaterialsError("");
        setFormErrors({});
      })
      .catch((error) => {
        if (active) {
          handleApiError(error, "Fehler beim Laden der Herstellung.");
        }
      })
      .finally(() => {
        if (active) setPageLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dispatch, id]);

  // ===================================================
  // PRODUCT SEARCH
  // ===================================================

  useEffect(() => {
    setSearchTerm("");
  }, [selectedCategory]);

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

  // ===================================================
  // TOTALS
  // ===================================================

  const { materialsTotal, productTotal, margin, marginPercent } =
    useMemo(() => {
      const materialsTotal = roundMoney(
        production.productionItems.reduce(
          (sum, item) => sum + Number(item.totalPrice || 0),
          0,
        ),
      );

      const productTotal = roundMoney(Number(production.amount || 0));

      const margin = roundMoney(productTotal - materialsTotal);

      const marginPercent =
        productTotal !== 0 ? roundMoney((margin / productTotal) * 100) : 0;

      return {
        materialsTotal,
        productTotal,
        margin,
        marginPercent,
      };
    }, [production]);

  const hasMarginData =
    production.productId > 0 && production.productionItems.length > 0;

  const hasInvalidMargin = hasMarginData && margin <= 0;

  // ===================================================
  // MAIN PRODUCT
  // ===================================================

  const clearMainProductError = (field: keyof MainProductErrors) => {
    setMainProductErrors((prev) => {
      if (!prev[field]) return prev;

      const updated = { ...prev };
      delete updated[field];

      return updated;
    });
  };

  const handleAddProductAsMain = (product: ProductPickDto) => {
    const unitPrice = roundMoney(Number(product.sellingPrice) || 0);

    setProduction((prev) => ({
      ...prev,
      productId: product.id,
      productArticle: product.article ?? "",
      productName: product.name ?? "",
      unitPrice,
      amount: roundMoney(prev.quantity * unitPrice),
    }));

    clearMainProductError("productId");

    setFormErrors((prev) => ({
      ...prev,
      margin: undefined,
    }));
  };

  const handleMainChange = (field: "quantity" | "unitPrice", value: number) => {
    setProduction((prev) => {
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

  const validateMainProduct = (): boolean => {
    const errors: MainProductErrors = {};

    if (!production.productId) {
      errors.productId = "Bitte wählen Sie ein Hauptprodukt.";
    }

    const quantityError = validateQuantity(Number(production.quantity));

    if (quantityError) {
      errors.quantity = quantityError;
    }

    const unitPrice = Number(production.unitPrice);

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      errors.unitPrice = "Der Preis muss größer als 0,00 € sein.";
    }

    setMainProductErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // ===================================================
  // MATERIALS
  // ===================================================

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

    setProduction((prev) => ({
      ...prev,
      productionItems: [...prev.productionItems, item],
    }));

    setMaterialsError("");

    setFormErrors((prev) => ({
      ...prev,
      margin: undefined,
    }));
  };

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

  const handleItemChange = (
    index: number,
    field: "quantity" | "unitPrice",
    value: number,
  ) => {
    setProduction((prev) => {
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

    if (field === "unitPrice") {
      setItemErrors((prev) => {
        const updated = { ...prev };
        const rowErrors = { ...updated[index] };

        if (!Number.isFinite(value) || value <= 0) {
          rowErrors.unitPrice = "Der Preis muss größer als 0,00 € sein.";
        } else {
          delete rowErrors.unitPrice;
        }

        if (Object.keys(rowErrors).length === 0) {
          delete updated[index];
        } else {
          updated[index] = rowErrors;
        }

        return updated;
      });
    } else {
      clearItemError(index, field);
    }

    setFormErrors((prev) => ({
      ...prev,
      margin: undefined,
    }));
  };

  const handleRemoveItem = (index: number) => {
    const remainingCount = production.productionItems.length - 1;

    setProduction((prev) => ({
      ...prev,
      productionItems: prev.productionItems.filter((_, i) => i !== index),
    }));

    setMaterialsError(remainingCount === 0 ? MATERIALS_ERROR : "");

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

    setFormErrors((prev) => ({
      ...prev,
      margin: undefined,
    }));
  };

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= production.productionItems.length) {
      return;
    }

    setProduction((prev) => {
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

  // ===================================================
  // VALIDATION
  // ===================================================

  const validateProductionItems = (): boolean => {
    if (production.productionItems.length === 0) {
      setMaterialsError("Bitte fügen Sie mindestens ein Material hinzu.");
      setItemErrors({});
      return false;
    }

    setMaterialsError("");

    const newItemErrors: Record<number, ProductionItemErrors> = {};

    production.productionItems.forEach((item, index) => {
      const errors: ProductionItemErrors = {};

      const quantityError = validateQuantity(Number(item.quantity));

      if (quantityError) {
        errors.quantity = quantityError;
      }

      const unitPrice = Number(item.unitPrice);

      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        errors.unitPrice = "Der Preis muss größer als 0,00 € sein.";
      }

      if (Object.keys(errors).length > 0) {
        newItemErrors[index] = errors;
      }
    });

    setItemErrors(newItemErrors);

    return Object.keys(newItemErrors).length === 0;
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!production.dateOfProduction || !dateValue || !dateValue.isValid()) {
      errors.dateOfProduction = "Bitte wählen Sie ein gültiges Datum.";
    } else if (dateValue.isAfter(dayjs(), "day")) {
      errors.dateOfProduction = "Das Datum darf nicht in der Zukunft liegen.";
    }

    if (hasInvalidMargin) {
      errors.margin = MARGIN_ERROR;
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

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

      if (fieldName === "quantity") {
        mainErrors.quantity = message;
        return;
      }

      if (fieldName === "unitPrice") {
        mainErrors.unitPrice = message;
        return;
      }

      if (fieldName === "dateOfProduction") {
        backendFormErrors.dateOfProduction = message;
        return;
      }

      if (fieldName === "productionItems") {
        newMaterialsError = message;
        return;
      }

      const match = fieldName.match(
        /^productionItems\[(\d+)\]\.(quantity|unitPrice)$/,
      );

      if (!match) return;

      const index = Number(match[1]);

      const field = match[2] as keyof ProductionItemErrors;

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

  // ===================================================
  // SUBMIT
  // ===================================================

  const handleSubmit = async () => {
    if (loading || pageLoading) return;

    const formIsValid = validateForm();
    const mainIsValid = validateMainProduct();
    const itemsAreValid = validateProductionItems();

    if (!formIsValid || !mainIsValid || !itemsAreValid) {
      return;
    }

    // Только поля, ожидаемые backend.
    // amount и totalPrice не отправляем.

    const payload: NewProductionDto = {
      productId: production.productId,
      dateOfProduction: production.dateOfProduction,
      quantity: production.quantity,
      unitPrice: production.unitPrice,

      productionItems: production.productionItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };

    try {
      setLoading(true);

      const updatedProduction = await dispatch(
        updateProduction({
          id,
          updatedProduction: payload,
        }),
      ).unwrap();

      // Аналогично PurchaseCard:
      // обновляем форму данными ответа backend.

      setProduction(toFormData(updatedProduction));

      setDateValue(
        updatedProduction.dateOfProduction
          ? dayjs(updatedProduction.dateOfProduction)
          : null,
      );

      setMainProductErrors({});
      setItemErrors({});
      setMaterialsError("");
      setFormErrors({});

      showSuccessToast("Erfolg", "Herstellung erfolgreich aktualisiert.");
    } catch (error) {
      if (applyBackendValidationErrors(error)) {
        return;
      }

      handleApiError(
        error,
        "Die Herstellung konnte nicht aktualisiert werden.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // JSX
  // ===================================================

  return (
    <Container maxWidth="xl">
      <Grid container spacing={3} sx={{ p: 2 }}>
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              position: "relative",
            }}
          >
            {/* Schließen */}

            <Tooltip title="Schließen" arrow>
              <IconButton
                onClick={() => navigate(-1)}
                disabled={loading}
                aria-label="Schließen"
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1,
                  color: colors.iconGrey,
                  "&:hover": {
                    color: colors.grey,
                    transform: "scale(1.1)",
                  },
                }}
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>

            {/* HEADER */}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                pr: 4,
              }}
            >
              <PageTitle>HERSTELLUNG NR. {id}</PageTitle>

              <Box sx={{ width: 220 }}>
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="de"
                  localeText={
                    deDE.components.MuiLocalizationProvider.defaultProps
                      .localeText
                  }
                >
                  <DatePicker
                    label="Datum auswählen"
                    value={dateValue}
                    disableFuture
                    onChange={(newValue) => {
                      setDateValue(newValue);

                      setProduction((prev) => ({
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
                        disabled: loading || pageLoading,
                        error: Boolean(formErrors.dateOfProduction),
                        helperText: formErrors.dateOfProduction,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </Box>

            {pageLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  p: 5,
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* ================================== */}
                {/* PRODUZIERTES PRODUKT */}
                {/* ================================== */}

                <Box sx={{ mt: 3, mb: 2 }}>
                  <Typography sx={sectionTitleStyle}>
                    Produziertes Produkt
                  </Typography>

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
                          {production.productArticle ?? ""}
                        </TableCell>

                        <TableCell sx={cellStyle}>
                          {production.productName ?? ""}
                        </TableCell>

                        <TableCell
                          sx={{
                            ...cellStyle,
                            ...fixedCellWidth(100),
                          }}
                        >
                          <CompactNumberCell
                            value={production.quantity}
                            min={0}
                            step={0.001}
                            align="center"
                            disabled={loading}
                            error={Boolean(mainProductErrors.quantity)}
                            errorText={mainProductErrors.quantity}
                            onChange={(value) =>
                              handleMainChange("quantity", value)
                            }
                          />
                        </TableCell>

                        <TableCell
                          sx={{
                            ...cellStyle,
                            ...fixedCellWidth(110),
                          }}
                        >
                          <CompactNumberCell
                            value={production.unitPrice}
                            min={0}
                            step={0.01}
                            disabled={loading}
                            error={Boolean(mainProductErrors.unitPrice)}
                            errorText={mainProductErrors.unitPrice}
                            onChange={(value) =>
                              handleMainChange("unitPrice", value)
                            }
                          />
                        </TableCell>

                        <TableCell
                          sx={{
                            ...rightCellStyle,
                            ...fixedCellWidth(120),
                          }}
                        >
                          {formatMoney(production.amount)}
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

                {/* ================================== */}
                {/* MATERIALIEN */}
                {/* ================================== */}

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
                    minHeight: production.productionItems.length ? 120 : 80,
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
                        <TableCell sx={fixedCellWidth(45)}>Pos</TableCell>

                        <TableCell sx={fixedCellWidth(120)}>Artikel</TableCell>

                        <TableCell sx={{ width: "40%" }}>Name</TableCell>

                        <TableCell sx={fixedCellWidth(75)}>Menge</TableCell>

                        <TableCell sx={fixedCellWidth(90)}>Preis</TableCell>

                        <TableCell sx={fixedCellWidth(90)}>Summe</TableCell>

                        <TableCell sx={fixedCellWidth(90)} />
                      </TableRow>
                    </StyledTableHead>

                    <TableBody>
                      {production.productionItems.map((item, index) => (
                        <TableRow
                          key={`${item.productId}-${index}`}
                          sx={tableRowHoverStyle}
                        >
                          {/* Pos */}

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
                            {formatMoney(item.totalPrice)}
                          </TableCell>

                          {/* Aktionen */}

                          <TableCell
                            sx={{
                              ...actionCellStyle,
                              ...fixedCellWidth(90),
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
                                    <ArrowUpwardIcon
                                      sx={{
                                        fontSize: 16,
                                      }}
                                    />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip title="Nach unten" arrow>
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={
                                      index ===
                                        production.productionItems.length - 1 ||
                                      loading
                                    }
                                    onClick={() =>
                                      handleMoveItem(index, "down")
                                    }
                                    sx={{ p: 0.25 }}
                                  >
                                    <ArrowDownwardIcon
                                      sx={{
                                        fontSize: 16,
                                      }}
                                    />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip title="Löschen" arrow>
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={loading}
                                    onClick={() => handleRemoveItem(index)}
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

                      {production.productionItems.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            align="center"
                            sx={{
                              color: "text.secondary",
                            }}
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

                {/* ================================== */}
                {/* BUTTONS + SUMMEN */}
                {/* ================================== */}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                    }}
                  >

                    <Button
                      variant="contained"
                      disabled={loading}
                      onClick={handleSubmit}
                      sx={primaryButtonStyle}
                    >
                      {loading ? "Speichern..." : "Aktualisieren"}
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      minWidth: 280,
                      textAlign: "right",
                    }}
                  >
                    <Typography>
                      Materialien: {formatMoney(materialsTotal)} €
                    </Typography>

                    <Typography>
                      Produziertes Produkt: {formatMoney(productTotal)} €
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
                      Marge: {formatMoney(margin)} € (
                      {formatMoney(marginPercent)} %)
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
              </>
            )}
          </Paper>
        </Grid>

        {/* ====================================== */}
        {/* PRODUKTE HINZUFÜGEN */}
        {/* ====================================== */}

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography sx={sectionTitleStyle}>Produkte hinzufügen</Typography>

            {/* Kategorie + Suche */}

            <Grid
              container
              spacing={2}
              alignItems="center"
              sx={{ mb: 2, mt: 1 }}
            >
              <Grid item xs={4}>
                <Autocomplete
                  fullWidth
                  disabled={loading || pageLoading}
                  options={[...categories].sort((a, b) =>
                    a.name.localeCompare(b.name),
                  )}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
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
                      label="Kategorie"
                      aria-label="Kategorie"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={8}>
                <TextField
                  fullWidth
                  disabled={loading || pageLoading}
                  placeholder="Produktname, Artikel, Lieferanten-Artikel suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    endAdornment: searchTerm ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          disabled={loading}
                          onClick={() => setSearchTerm("")}
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                />
              </Grid>
            </Grid>

            {/* Suchergebnisse */}

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
                    color: "text.secondary",
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

                    <TableCell sx={{ width: "25%" }}>
                      Lieferanten-Artikel
                    </TableCell>

                    <TableCell sx={fixedCellWidth(220)}>Aktionen</TableCell>
                  </TableRow>
                </StyledTableHead>

                <TableBody>
                  {canSearchProducts &&
                    pickProducts.map((product) => (
                      <TableRow key={product.id} sx={tableRowHoverStyle}>
                        <TableCell sx={cellStyle}>{product.name}</TableCell>

                        <TableCell
                          sx={{
                            ...cellStyle,
                            ...fixedCellWidth(140),
                          }}
                        >
                          {product.article}
                        </TableCell>

                        <TableCell sx={cellStyle}>
                          {product.vendorArticle ?? ""}
                        </TableCell>

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
                              disabled={loading || pageLoading}
                              onClick={() => handleAddProductAsMain(product)}
                            >
                              Als Produkt
                            </Button>

                            <Button
                              size="small"
                              disabled={loading || pageLoading}
                              onClick={() =>
                                handleAddProductAsMaterial(product)
                              }
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
                          colSpan={4}
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
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
