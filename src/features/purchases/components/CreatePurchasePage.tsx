import { useEffect, useMemo, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Autocomplete,
  Grid,
  InputAdornment,
  SelectChangeEvent,
  CircularProgress,
  Tooltip,
  FormHelperText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  NewPurchaseDto,
  NewPurchaseItemDto,
  CreatePurchaseFormDto,
  PurchaseFormItem,
} from "../types";
import { ProductPickDto } from "../../products/types";
import {
  getCustomersPickList,
  selectCustomersPickList,
  selectLoadingPick,
} from "../../customers/customersSlice";
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
import { addPurchase } from "../purchasesSlice";
import AddIcon from "@mui/icons-material/Add";
import { useReloadOnSuccess } from "../../../hooks/useReloadOnSuccess";
import CreateCustomer from "../../customers/components/CreateCustomer";
import { handleApiError } from "../../../utils/errors/handleApiError";
import { showSuccessToast } from "../../../utils/toast";
import {
  getDocumentTypes,
  selectTypeOfDocuments,
} from "../typeOfDocumentSlice";

import {
  clearFieldError,
  FormErrors,
  hasErrors,
  isBackendValidationErrors,
  validateRequiredFields,
} from "../../../utils/validation/validation";
import { getActiveTaxRates, selectTaxRates } from "../../sales/taxRatesSlice";
import { uploadPurchaseDocument } from "../purchaseDocumentsSlice";
import {
  actionCellStyle,
  cellStyle,
  centerCellStyle,
  deleteItemButtonStyle,
  fixedCellWidth,
  leftBorderCellStyle,
  rightCellStyle,
  saleTableNameCellStyle,
  saleTableNameInputStyle,
  StyledTableHead,
  tableRowHoverStyle,
  tableStyle,
} from "../../../styles/tableStyles";

import { dateFieldStyle } from "../../../styles/formStyles";
import { sectionTitleStyle } from "../../../styles/typographyStyles";

import {
  addButtonStyle,
  primaryButtonStyle,
} from "../../../styles/buttonStyles";

import { colors } from "../../../styles/colors";
import CompactNumberCell from "../../../components/CompactNumberCell";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  getActiveDiscountRates,
  selectDiscountRates,
} from "../../sales/discountRatesSlice";
import { translateValidationMessage } from "../../../utils/validation/validationMessages";
import {
  validatePercentage,
  validatePrice,
  validateQuantity,
} from "../../../utils/validation/numberValidation";
import DialogTitleText from "../../../components/DialogTitleText";
import DraggableDialog from "../../../components/DraggableDialog";

const typeOptions = ["EINKAUF", "LIEFERANT_RABATT"] as const;
type PurchaseType = (typeof typeOptions)[number];

type CreatePurchaseModalProps = {
  onClose: () => void;
  onSubmitSuccess?: () => void;
};

type PurchaseItemErrors = {
  quantity?: string;
  unitPrice?: string;
  discount?: string;
  taxPercentage?: string;
};

export default function CreatePurchasePage({
  onClose,
  onSubmitSuccess,
}: CreatePurchaseModalProps) {
  const dispatch = useAppDispatch();
  const reload = useReloadOnSuccess();

  const vendorsPick = useAppSelector(selectCustomersPickList);
  const vendorsPickLoading = useAppSelector(selectLoadingPick);
  const categories = useAppSelector(selectProductCategories);
  const pickProducts = useAppSelector(selectPickProducts);
  const pickLoading = useAppSelector(selectPickLoading);
  const documentTypes = useAppSelector(selectTypeOfDocuments);
  const taxRates = useAppSelector(selectTaxRates);
  const discountRates = useAppSelector(selectDiscountRates);

  const today = dayjs();
  const todayString = today.format("YYYY-MM-DD");

  const [newPurchase, setNewPurchase] = useState<CreatePurchaseFormDto>({
    vendorId: 0,
    purchasingDate: todayString,
    type: "EINKAUF",
    documentId: 0,
    documentNumber: "",
    purchaseItems: [],
  });

  const [dateValue, setDateValue] = useState<Dayjs | null>(today);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [defaultTax, setDefaultTax] = useState(0);
  const [defaultDiscount, setDefaultDiscount] = useState(0);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors<NewPurchaseDto>>({});
  const [itemErrors, setItemErrors] = useState<
    Record<number, PurchaseItemErrors>
  >({});

  const canSearchProducts =
    selectedCategory !== null || searchTerm.trim().length >= 2;

  useEffect(() => {
    dispatch(clearPickProducts());
    dispatch(getDocumentTypes());
    dispatch(getProductCategories());
    dispatch(getActiveTaxRates());
    dispatch(getActiveDiscountRates());

    dispatch(getCustomersPickList())
      .unwrap()
      .catch((error) =>
        handleApiError(error, "Fehler beim Laden der Lieferanten"),
      );
  }, [dispatch]);

  useEffect(() => {
    if (!taxRates.length) {
      return;
    }

    const standardTaxRate = taxRates.find((taxRate) => taxRate.defaultRate);

    if (standardTaxRate) {
      setDefaultTax(standardTaxRate.value);
    }
  }, [taxRates]);

  useEffect(() => {
    if (!canSearchProducts) {
      dispatch(clearPickProducts());
      return;
    }

    const term = searchTerm.trim();

    const timer = setTimeout(() => {
      dispatch(
        getPickProducts({
          searchTerm: term,
          categoryId: selectedCategory,
          limit: 100,
        }),
      );
    }, 350);

    return () => clearTimeout(timer);
  }, [dispatch, searchTerm, selectedCategory, canSearchProducts]);

  const roundMoney = (value: number): number =>
    Math.round((value + Number.EPSILON) * 100) / 100;

  useEffect(() => {
    setNewPurchase((prev) => {
      const updatedItems = prev.purchaseItems.map((item) => {
        const quantity = Number.isFinite(Number(item.quantity))
          ? Number(item.quantity)
          : 0;

        const unitPrice = Number.isFinite(Number(item.unitPrice))
          ? Number(item.unitPrice)
          : 0;

        const discount = Number.isFinite(Number(item.discount))
          ? Number(item.discount)
          : 0;

        // Стоимость до скидки
        const priceBeforeDiscount = roundMoney(quantity * unitPrice);

        // Сумма скидки
        const discountAmount = roundMoney(
          (priceBeforeDiscount * discount) / 100,
        );

        // Netto после скидки
        const totalPrice = roundMoney(priceBeforeDiscount - discountAmount);

        // Новый общий MWSt
        const taxAmount = roundMoney((totalPrice * defaultTax) / 100);

        const totalAmount = roundMoney(totalPrice + taxAmount);

        return {
          ...item,
          discount,
          discountAmount,
          taxPercentage: defaultTax,
          totalPrice,
          taxAmount,
          totalAmount,
        };
      });

      return {
        ...prev,
        purchaseItems: updatedItems,
      };
    });
  }, [defaultTax]);

  useEffect(() => {
    setNewPurchase((prev) => {
      const updatedItems = prev.purchaseItems.map((item) => {
        const quantity = Number.isFinite(Number(item.quantity))
          ? Number(item.quantity)
          : 0;

        const unitPrice = Number.isFinite(Number(item.unitPrice))
          ? Number(item.unitPrice)
          : 0;

        const taxPercentage = Number.isFinite(Number(item.taxPercentage))
          ? Number(item.taxPercentage)
          : 0;

        // Стоимость до скидки
        const priceBeforeDiscount = roundMoney(quantity * unitPrice);

        // Сумма скидки
        const discountAmount = roundMoney(
          (priceBeforeDiscount * defaultDiscount) / 100,
        );

        // Netto после скидки
        const totalPrice = roundMoney(priceBeforeDiscount - discountAmount);

        // MWSt после скидки
        const taxAmount = roundMoney((totalPrice * taxPercentage) / 100);

        // Brutto
        const totalAmount = roundMoney(totalPrice + taxAmount);

        return {
          ...item,
          discount: defaultDiscount,
          discountAmount,
          totalPrice,
          taxAmount,
          totalAmount,
        };
      });

      return {
        ...prev,
        purchaseItems: updatedItems,
      };
    });
  }, [defaultDiscount]);

  const { subtotalBeforeDiscount, subtotal, discountAmount, taxSum, total } =
    useMemo(() => {
      let subtotalBeforeDiscount = 0;
      let subtotal = 0;
      let discountAmount = 0;
      let taxSum = 0;
      let total = 0;

      for (const item of newPurchase.purchaseItems) {
        const quantity = Number.isFinite(Number(item.quantity))
          ? Number(item.quantity)
          : 0;

        const unitPrice = Number.isFinite(Number(item.unitPrice))
          ? Number(item.unitPrice)
          : 0;

        subtotalBeforeDiscount += quantity * unitPrice;

        subtotal += Number.isFinite(Number(item.totalPrice))
          ? Number(item.totalPrice)
          : 0;

        discountAmount += Number.isFinite(Number(item.discountAmount))
          ? Number(item.discountAmount)
          : 0;

        taxSum += Number.isFinite(Number(item.taxAmount))
          ? Number(item.taxAmount)
          : 0;

        total += Number.isFinite(Number(item.totalAmount))
          ? Number(item.totalAmount)
          : 0;
      }

      return {
        subtotalBeforeDiscount: roundMoney(subtotalBeforeDiscount),
        subtotal: roundMoney(subtotal),
        discountAmount: roundMoney(discountAmount),
        taxSum: roundMoney(taxSum),
        total: roundMoney(total),
      };
    }, [newPurchase.purchaseItems]);

  const handleCreateNewVendor = () => {
    setShowCreateCustomer(true);
  };

  //--- ITEMS ---//

  const handleAddProductToCart = (product: ProductPickDto) => {
    setNewPurchase((prev) => {
      const quantity = 1;
      const unitPrice = roundMoney(Number(product.purchasingPrice) || 0);
      const discount = defaultDiscount;
      const priceBeforeDiscount = roundMoney(quantity * unitPrice);
      const discountAmount = roundMoney((priceBeforeDiscount * discount) / 100);
      const totalPrice = roundMoney(priceBeforeDiscount - discountAmount);
      const taxPercentage = defaultTax;
      const taxAmount = roundMoney((totalPrice * taxPercentage) / 100);
      const totalAmount = roundMoney(totalPrice + taxAmount);

      const item: PurchaseFormItem = {
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice,
        discount,
        taxPercentage,
        position: prev.purchaseItems.length + 1,
        discountAmount,
        totalPrice,
        taxAmount,
        totalAmount,
      };

      return {
        ...prev,
        purchaseItems: [...prev.purchaseItems, item],
      };
    });

    setErrors((prev) => clearFieldError(prev, "purchaseItems"));
  };

  const handleRemoveItem = (index: number) => {
    setNewPurchase((prev) => {
      const updatedItems = prev.purchaseItems
        .filter((_, i) => i !== index)
        .map((item, i) => ({
          ...item,
          position: i + 1,
        }));

      if (updatedItems.length === 0) {
        setErrors((current) => ({
          ...current,
          purchaseItems: "Bitte mindestens einen Artikel hinzufügen.",
        }));
      }

      return {
        ...prev,
        purchaseItems: updatedItems,
      };
    });

    setItemErrors((prev) => {
      const updatedErrors: Record<number, PurchaseItemErrors> = {};

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
  };

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newPurchase.purchaseItems.length) {
      return;
    }

    setNewPurchase((prev) => {
      const updatedItems = [...prev.purchaseItems];

      [updatedItems[index], updatedItems[newIndex]] = [
        updatedItems[newIndex],
        updatedItems[index],
      ];

      const reorderedItems = updatedItems.map((item, itemIndex) => ({
        ...item,
        position: itemIndex + 1,
      }));

      return {
        ...prev,
        purchaseItems: reorderedItems,
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

  const validatePurchaseItems = (): boolean => {
    if (newPurchase.purchaseItems.length === 0) {
      setErrors((prev) => ({
        ...prev,
        purchaseItems: "Bitte mindestens einen Artikel hinzufügen.",
      }));
      setItemErrors({});
      return false;
    }

    const newItemErrors: Record<number, PurchaseItemErrors> = {};

    newPurchase.purchaseItems.forEach((item, index) => {
      const errors: PurchaseItemErrors = {};

      const quantityError = validateQuantity(Number(item.quantity));

      if (quantityError) {
        errors.quantity = quantityError;
      }

      const unitPriceError = validatePrice(Number(item.unitPrice));

      if (unitPriceError) {
        errors.unitPrice = unitPriceError;
      }

      const discountError = validatePercentage(Number(item.discount));

      if (discountError) {
        errors.discount = discountError;
      }

      const taxError = validatePercentage(Number(item.taxPercentage));

      if (taxError) {
        errors.taxPercentage = taxError;
      }

      if (Object.keys(errors).length > 0) {
        newItemErrors[index] = errors;
      }
    });

    setItemErrors(newItemErrors);

    return Object.keys(newItemErrors).length === 0;
  };

  const clearItemError = (index: number, field: keyof PurchaseItemErrors) => {
    setItemErrors((prev) => {
      if (!prev[index]?.[field]) {
        return prev;
      }

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
    field: keyof NewPurchaseItemDto,
    value: string | number,
  ) => {
    setNewPurchase((prev) => {
      const updatedItems = [...prev.purchaseItems];

      const currentItem: PurchaseFormItem = {
        ...updatedItems[index],
        [field]: value,
      };

      const quantity = Number.isFinite(Number(currentItem.quantity))
        ? Number(currentItem.quantity)
        : 0;

      const unitPrice = Number.isFinite(Number(currentItem.unitPrice))
        ? Number(currentItem.unitPrice)
        : 0;

      const discount = Number.isFinite(Number(currentItem.discount))
        ? Number(currentItem.discount)
        : 0;

      const taxPercentage = Number.isFinite(Number(currentItem.taxPercentage))
        ? Number(currentItem.taxPercentage)
        : 0;

      // Стоимость до скидки
      const priceBeforeDiscount = roundMoney(quantity * unitPrice);

      // Сумма скидки
      const discountAmount = roundMoney((priceBeforeDiscount * discount) / 100);

      // Netto после скидки
      const totalPrice = roundMoney(priceBeforeDiscount - discountAmount);

      // MWSt считается от Netto после скидки
      const taxAmount = roundMoney((totalPrice * taxPercentage) / 100);

      // Brutto
      const totalAmount = roundMoney(totalPrice + taxAmount);

      currentItem.quantity = quantity;
      currentItem.unitPrice = unitPrice;
      currentItem.discount = discount;
      currentItem.discountAmount = discountAmount;
      currentItem.taxPercentage = taxPercentage;
      currentItem.totalPrice = totalPrice;
      currentItem.taxAmount = taxAmount;
      currentItem.totalAmount = totalAmount;

      updatedItems[index] = currentItem;

      return {
        ...prev,
        purchaseItems: updatedItems,
      };
    });
  };

  const applyBackendValidationErrors = (error: unknown): boolean => {
    if (!isBackendValidationErrors(error)) {
      return false;
    }

    const formErrors: FormErrors<NewPurchaseDto> = {};
    const purchaseItemErrors: Record<number, PurchaseItemErrors> = {};

    error.errors.forEach((validationError) => {
      const message = translateValidationMessage(validationError.message);

      if (
        validationError.field === "vendorId" ||
        validationError.field === "purchasingDate" ||
        validationError.field === "documentId" ||
        validationError.field === "documentNumber" ||
        validationError.field === "purchaseItems"
      ) {
        formErrors[validationError.field] = message;
        return;
      }

      const itemMatch = validationError.field.match(
        /^purchaseItems\[(\d+)]\.(quantity|unitPrice|discount|taxPercentage)$/,
      );

      if (!itemMatch) {
        return;
      }

      const index = Number(itemMatch[1]);
      const field = itemMatch[2] as keyof PurchaseItemErrors;

      purchaseItemErrors[index] = {
        ...purchaseItemErrors[index],
        [field]: message,
      };
    });

    setErrors(formErrors);
    setItemErrors(purchaseItemErrors);

    return true;
  };

  const handleRemoveDocumentFile = (index: number) => {
    setDocumentFiles((prev) =>
      prev.filter((_, fileIndex) => fileIndex !== index),
    );
  };

  //--- SUBMIT ---//
  const handleSubmit = async () => {
    if (loading) {
      return;
    }

    const validationErrors = validateRequiredFields(newPurchase, [
      "vendorId",
      "purchasingDate",
      "documentId",
    ]);

    if (
      newPurchase.purchasingDate &&
      dayjs(newPurchase.purchasingDate).isAfter(dayjs(), "day")
    ) {
      validationErrors.purchasingDate =
        "Das Datum darf nicht in der Zukunft liegen.";
    }

    setErrors(validationErrors);

    const itemsAreValid = validatePurchaseItems();

    if (hasErrors(validationErrors) || !itemsAreValid) {
      return;
    }

    const payload: NewPurchaseDto = {
      vendorId: newPurchase.vendorId,
      purchasingDate: newPurchase.purchasingDate,
      type: newPurchase.type,
      documentId: newPurchase.documentId,
      documentNumber: newPurchase.documentNumber.trim(),
      purchaseItems: newPurchase.purchaseItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: roundMoney(Number(item.unitPrice)),
        discount: roundMoney(Number(item.discount)),
        taxPercentage: roundMoney(Number(item.taxPercentage)),
      })),
    };

    try {
      setLoading(true);

      const createdPurchase = await dispatch(addPurchase(payload)).unwrap();

      for (const file of documentFiles) {
        await dispatch(
          uploadPurchaseDocument({
            purchaseId: createdPurchase.id,
            file,
          }),
        ).unwrap();
      }

      showSuccessToast("Erfolg", "Bestellung erfolgreich erstellt.");

      reload();
      onSubmitSuccess?.();
      onClose();
    } catch (error) {
      if (applyBackendValidationErrors(error)) {
        return;
      }

      handleApiError(error, "Die Bestellung konnte nicht erstellt werden.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DraggableDialog
      open
      onClose={loading ? undefined : onClose}
      dialogWidth={1350}
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
          <DialogTitleText>Neue Bestellung</DialogTitleText>
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
      {/* Lieferant + Neu + Datum + Type */}

      <Grid container spacing={2} sx={{ mb: 2, mt: 1 }}>
        {/* LINKS */}
        <Grid item xs={12} md={9}>
          <Box sx={{ height: "100%" }}>
            {/* Lieferant / Neu / Datum / Vorgangsart */}
            <Grid container spacing={2}>
              {/* Lieferant */}
              <Grid item xs={9}>
                <Autocomplete
                  fullWidth
                  id="vendor-autocomplete"
                  loading={vendorsPickLoading}
                  options={[...vendorsPick].sort((a, b) =>
                    a.name.localeCompare(b.name),
                  )}
                  getOptionLabel={(option) =>
                    option.customerNumber
                      ? `${option.name} (${option.customerNumber})`
                      : option.name
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  onChange={(_, value) => {
                    setNewPurchase((prev) => ({
                      ...prev,
                      vendorId: value?.id ?? 0,
                    }));

                    setErrors((prev) => clearFieldError(prev, "vendorId"));
                  }}
                  value={
                    vendorsPick.find(
                      (vendor) => vendor.id === newPurchase.vendorId,
                    ) || null
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Lieferant"
                      error={Boolean(errors.vendorId)}
                      helperText={errors.vendorId}
                      disabled={loading}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {vendorsPickLoading ? (
                              <CircularProgress size={18} />
                            ) : null}

                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Neuer Lieferant */}
              <Grid
                item
                xs={1}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <Button
                  variant="outlined"
                  disabled={loading}
                  onClick={handleCreateNewVendor}
                  startIcon={<AddIcon />}
                  sx={addButtonStyle}
                >
                  Neu
                </Button>
              </Grid>

              {/* Bestelldatum */}
              <Grid item xs={2}>
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="de"
                  localeText={
                    deDE.components.MuiLocalizationProvider.defaultProps
                      .localeText
                  }
                >
                  <DatePicker
                    label="Bestelldatum"
                    value={dateValue}
                    disableFuture
                    onChange={(newValue) => {
                      setDateValue(newValue);

                      setNewPurchase((prev) => ({
                        ...prev,
                        purchasingDate: newValue
                          ? newValue.format("YYYY-MM-DD")
                          : "",
                      }));

                      setErrors((prev) =>
                        clearFieldError(prev, "purchasingDate"),
                      );
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        sx: dateFieldStyle,
                        error: Boolean(errors.purchasingDate),
                        helperText: errors.purchasingDate,
                        disabled: loading,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>

            {/* Dokument / Dokumentnummer / Rabatt / MWSt */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Dokument */}
              <Grid item xs={3}>
                <FormControl
                  fullWidth
                  error={Boolean(errors.documentId)}
                  disabled={loading}
                >
                  <InputLabel id="purchase-document-label">Dokument</InputLabel>

                  <Select
                    labelId="purchase-document-label"
                    id="purchase-document"
                    label="Dokument"
                    value={newPurchase.documentId || ""}
                    onChange={(e: SelectChangeEvent<number>) => {
                      const selectedId = Number(e.target.value);

                      setNewPurchase((prev) => ({
                        ...prev,
                        documentId: selectedId,
                      }));

                      setErrors((prev) => clearFieldError(prev, "documentId"));
                    }}
                  >
                    <MenuItem value="">Bitte wählen</MenuItem>

                    {documentTypes.map((doc) => (
                      <MenuItem key={doc.id} value={doc.id}>
                        {doc.name}
                      </MenuItem>
                    ))}
                  </Select>

                  {errors.documentId && (
                    <FormHelperText>{errors.documentId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Dokumentnummer */}
              <Grid item xs={4}>
                <TextField
                  id="purchase-document-number"
                  label="Dokumentnummer"
                  value={newPurchase.documentNumber}
                  onChange={(e) => {
                    setNewPurchase((prev) => ({
                      ...prev,
                      documentNumber: e.target.value,
                    }));

                    setErrors((prev) =>
                      clearFieldError(prev, "documentNumber"),
                    );
                  }}
                  error={Boolean(errors.documentNumber)}
                  helperText={errors.documentNumber}
                  disabled={loading}
                  fullWidth
                />
              </Grid>

              {/* Vorgangsart */}
              <Grid item xs={2}>
                <FormControl fullWidth>
                  <InputLabel id="purchase-type-label">Vorgangsart</InputLabel>

                  <Select
                    id="purchase-type"
                    labelId="purchase-type-label"
                    label="Vorgangsart"
                    value={newPurchase.type}
                    disabled={loading}
                    onChange={(e) =>
                      setNewPurchase((prev) => ({
                        ...prev,
                        type: e.target.value as PurchaseType,
                      }))
                    }
                  >
                    {typeOptions.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* MWSt */}
              <Grid item xs={1.5}>
                <FormControl fullWidth disabled={loading}>
                  <InputLabel id="purchase-default-tax-label">
                    MWSt %
                  </InputLabel>

                  <Select
                    labelId="purchase-default-tax-label"
                    id="purchase-default-tax"
                    label="MWSt %"
                    value={defaultTax}
                    onChange={(e) => {
                      const value =
                        typeof e.target.value === "string"
                          ? parseFloat(e.target.value)
                          : e.target.value;

                      setDefaultTax(value);
                    }}
                  >
                    {taxRates.map((taxRate) => (
                      <MenuItem key={taxRate.id} value={taxRate.value}>
                        {taxRate.value}%
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Rabatt */}
              <Grid item xs={1.5}>
                <FormControl fullWidth disabled={loading}>
                  <InputLabel id="purchase-default-discount-label">
                    Rabatt %
                  </InputLabel>

                  <Select
                    labelId="purchase-default-discount-label"
                    id="purchase-default-discount"
                    label="Rabatt %"
                    value={defaultDiscount}
                    onChange={(e) => {
                      const value =
                        typeof e.target.value === "string"
                          ? parseFloat(e.target.value)
                          : e.target.value;

                      setDefaultDiscount(value);
                    }}
                  >
                    {discountRates.map((discountRate) => (
                      <MenuItem
                        key={discountRate.id}
                        value={discountRate.value}
                      >
                        {discountRate.value}%
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* RECHTS: Dokumente */}
        <Grid item xs={12} md={3}>
          <Box
            sx={{
              height: "100%",
              minHeight: 90,
              px: 1.5,
              py: 1,
              border: `1px solid ${colors.border}`,
              borderRadius: 1,
              boxSizing: "border-box",
            }}
          >
            <Button
              variant="outlined"
              component="label"
              size="small"
              startIcon={<UploadFileIcon />}
              disabled={loading}
              fullWidth
            >
              Dateien wählen
              <input
                hidden
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);

                  setDocumentFiles((prev) => [...prev, ...files]);

                  e.target.value = "";
                }}
              />
            </Button>

            {documentFiles.length > 0 && (
              <Box
                sx={{
                  mt: 0.5,
                  maxHeight: 65,
                  overflowY: "auto",
                }}
              >
                {documentFiles.map((file, index) => (
                  <Box
                    key={`${file.name}-${file.lastModified}-${index}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      minHeight: 30,
                      borderTop: `1px solid ${colors.border}`,
                    }}
                  >
                    <Tooltip title={file.name} arrow>
                      <Typography
                        variant="caption"
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          textAlign: "left",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {file.name}
                      </Typography>
                    </Tooltip>

                    <Tooltip title="Entfernen" arrow>
                      <IconButton
                        size="small"
                        disabled={loading}
                        onClick={() => handleRemoveDocumentFile(index)}
                        sx={deleteItemButtonStyle}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Artikeltabelle */}
      <Box
        sx={{
          minHeight: newPurchase.purchaseItems.length ? 120 : 80,
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
              <TableCell sx={{ ...fixedCellWidth(65), fontSize: "12px" }}>
                Pos
              </TableCell>

              <TableCell sx={{ width: "40%" }}>Name</TableCell>

              <TableCell sx={fixedCellWidth(75)}>Menge</TableCell>

              <TableCell sx={fixedCellWidth(90)}>Preis</TableCell>

              <TableCell sx={{ ...fixedCellWidth(65), fontSize: "12px" }}>
                Rabatt%
              </TableCell>

              <TableCell sx={fixedCellWidth(90)}>Netto</TableCell>

              <TableCell sx={{ ...fixedCellWidth(65), fontSize: "12px" }}>
                MWSt%
              </TableCell>

              <TableCell sx={fixedCellWidth(90)}>MWSt</TableCell>

              <TableCell sx={fixedCellWidth(40)} />
            </TableRow>
          </StyledTableHead>

          <TableBody>
            {newPurchase.purchaseItems.map((item, index) => (
              <TableRow key={index} sx={tableRowHoverStyle}>
                {/* Position */}
                <TableCell
                  sx={{
                    ...centerCellStyle,
                    ...fixedCellWidth(65),
                    ...leftBorderCellStyle,
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
                    <Typography
                      component="span"
                      sx={{
                        minWidth: 18,
                        fontSize: "0.8rem",
                        textAlign: "center",
                      }}
                    >
                      {item.position}
                    </Typography>

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
                            index === newPurchase.purchaseItems.length - 1 ||
                            loading
                          }
                          onClick={() => handleMoveItem(index, "down")}
                          sx={{ p: 0.25 }}
                        >
                          <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </TableCell>

                {/* Produktname */}
                <TableCell
                  sx={{
                    ...saleTableNameCellStyle,
                    width: "40%",
                    verticalAlign: "middle",
                    py: 1,
                  }}
                >
                  <TextField
                    id={`product-name-${index}`}
                    aria-label="Produktname"
                    variant="standard"
                    multiline
                    fullWidth
                    minRows={1}
                    value={item.productName}
                    disabled={loading}
                    onChange={(e) =>
                      handleItemChange(index, "productName", e.target.value)
                    }
                    slotProps={{
                      input: {
                        disableUnderline: true,
                      },
                    }}
                    sx={saleTableNameInputStyle}
                  />
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
                    onChange={(value) => {
                      handleItemChange(index, "quantity", value);
                      clearItemError(index, "quantity");
                    }}
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
                    onChange={(value) => {
                      handleItemChange(index, "unitPrice", value);
                      clearItemError(index, "unitPrice");
                    }}
                  />
                </TableCell>

                {/* Rabatt */}
                <TableCell
                  sx={{
                    ...cellStyle,
                    ...fixedCellWidth(65),
                  }}
                >
                  <CompactNumberCell
                    value={item.discount}
                    min={0}
                    max={100}
                    step={1}
                    disabled={loading}
                    error={Boolean(itemErrors[index]?.discount)}
                    errorText={itemErrors[index]?.discount}
                    onChange={(value) => {
                      handleItemChange(index, "discount", value);
                      clearItemError(index, "discount");
                    }}
                  />
                </TableCell>

                {/* Netto */}
                <TableCell
                  sx={{
                    ...rightCellStyle,
                    ...fixedCellWidth(90),
                  }}
                >
                  {item.totalPrice.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>

                {/* MWSt */}
                <TableCell
                  sx={{
                    ...cellStyle,
                    ...fixedCellWidth(65),
                  }}
                >
                  <CompactNumberCell
                    value={item.taxPercentage}
                    min={0}
                    max={100}
                    step={1}
                    disabled={loading}
                    error={Boolean(itemErrors[index]?.taxPercentage)}
                    errorText={itemErrors[index]?.taxPercentage}
                    onChange={(value) => {
                      handleItemChange(index, "taxPercentage", value);
                      clearItemError(index, "taxPercentage");
                    }}
                  />
                </TableCell>

                {/* MWSt Betrag */}
                <TableCell
                  sx={{
                    ...rightCellStyle,
                    ...fixedCellWidth(90),
                  }}
                >
                  {item.taxAmount.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>

                {/* Löschen */}
                <TableCell
                  sx={{
                    ...actionCellStyle,
                    ...fixedCellWidth(40),
                  }}
                >
                  <Tooltip title="Löschen" arrow>
                    <IconButton
                      size="small"
                      disabled={loading}
                      onClick={() => handleRemoveItem(index)}
                      aria-label="Zeile löschen"
                      sx={deleteItemButtonStyle}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {errors.purchaseItems && (
          <Typography
            color="error"
            variant="caption"
            sx={{
              display: "block",
              mt: 0.5,
              ml: 0.5,
            }}
          >
            {errors.purchaseItems}
          </Typography>
        )}
      </Box>

      {/*  Summen */}
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
            minWidth: 220,
            textAlign: "right",
          }}
        >
          {discountAmount > 0 && (
            <>
              <Typography>
                Netto vor Rabatt:{" "}
                {subtotalBeforeDiscount.toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                €
              </Typography>

              <Typography>
                Rabatt: -{" "}
                {discountAmount.toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                €
              </Typography>
            </>
          )}

          <Typography>
            Netto:{" "}
            {subtotal.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </Typography>

          <Typography>
            MwSt:{" "}
            {taxSum.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </Typography>

          <Typography sx={{ fontWeight: "bold" }}>
            Gesamt:{" "}
            {total.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </Typography>
        </Box>
      </Box>

      {/* ==================== PRODUKTE HINZUFÜGEN ==================== */}

      <Box sx={{ width: "100%", mt: 3 }}>
        <Typography sx={{ ...sectionTitleStyle, mb: 1 }}>
          Artikel zum Warenkorb hinzufügen
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
              onChange={(_, newCategory) => {
                setSelectedCategory(newCategory?.id ?? null);
              }}
              value={
                categories.find(
                  (category) => category.id === selectedCategory,
                ) ?? null
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  id="category-autocomplete"
                  label="Kategorie"
                  aria-label="Kategorie"
                />
              )}
            />
          </Grid>

          {/* Suche */}
          <Grid item xs={8}>
            <TextField
              id="product-filter"
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
                      onClick={() => setSearchTerm("")}
                      size="small"
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
                color: colors.accent,
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
                <TableCell sx={{ width: "40%" }}>Artikelname</TableCell>

                <TableCell sx={fixedCellWidth(140)}>Artikel</TableCell>

                <TableCell sx={{ width: "30%" }}>Lieferanten-Artikel</TableCell>

                <TableCell sx={fixedCellWidth(100)}>Preis</TableCell>
              </TableRow>
            </StyledTableHead>

            <TableBody>
              {canSearchProducts &&
                pickProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    sx={tableRowHoverStyle}
                    onDoubleClick={() => {
                      if (!loading) {
                        handleAddProductToCart(product);
                      }
                    }}
                  >
                    <TableCell sx={cellStyle}>{product.name}</TableCell>

                    <TableCell sx={cellStyle}>{product.article}</TableCell>

                    <TableCell sx={cellStyle}>
                      {product.vendorArticle ?? ""}
                    </TableCell>

                    <TableCell sx={rightCellStyle}>
                      {Number(product.purchasingPrice ?? 0).toLocaleString(
                        "de-DE",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
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
                      sx={{ color: "text.secondary" }}
                    >
                      Keine Produkte gefunden
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </Box>
      </Box>

      {showCreateCustomer && (
        <CreateCustomer
          mode="vendor"
          onClose={() => setShowCreateCustomer(false)}
          onSubmitSuccess={(createdCustomer) => {
            setShowCreateCustomer(false);

            dispatch(getCustomersPickList());

            setNewPurchase((prev) => ({
              ...prev,
              vendorId: createdCustomer.id,
            }));
          }}
        />
      )}
    </DraggableDialog>
  );
}
