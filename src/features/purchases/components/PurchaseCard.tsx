import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
  Autocomplete,
  InputLabel,
  SelectChangeEvent,
  CircularProgress,
  Tooltip,
  FormHelperText,
} from "@mui/material";
import { Delete as DeleteIcon, Clear as ClearIcon } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { deDE } from "@mui/x-date-pickers/locales";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  NewPurchaseDto,
  NewPurchaseItemDto,
  PurchaseFormDto,
  PurchaseFormItem,
  TypeOfDocument,
} from "../types";
import {
  getProductCategories,
  selectProductCategories,
} from "../../products/productCategoriesSlice";
import {
  clearPickProducts,
  getPickProducts,
  selectPickLoading,
  selectPickProducts,
} from "../../products/productsSlice";
import { getPurchaseById, updatePurchase } from "../purchasesSlice";
import {
  getCustomersPickList,
  selectCustomersPickList,
  selectLoadingPick,
} from "../../customers/customersSlice";
import { ProductPickDto } from "../../products/types";
import { handleApiError } from "../../../utils/errors/handleApiError";
import { showSuccessToast } from "../../../utils/toast";
import {
  getDocumentTypes,
  selectTypeOfDocuments,
} from "../typeOfDocumentSlice";
import CompactNumberCell from "../../../components/CompactNumberCell";
import { primaryButtonStyle } from "../../../styles/buttonStyles";
import {
  actionCellStyle,
  cellStyle,
  centerCellStyle,
  fixedCellWidth,
  leftBorderCellStyle,
  rightCellStyle,
  saleTableNameCellStyle,
  saleTableNameInputStyle,
  StyledTableHead,
  tableRowHoverStyle,
} from "../../../styles/tableStyles";
import { colors } from "../../../styles/colors";
import { dateFieldStyle } from "../../../styles/formStyles";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  deletePurchaseDocument,
  getPurchaseDocuments,
  selectPurchaseDocuments,
  selectPurchaseDocumentsLoading,
  uploadPurchaseDocument,
} from "../purchaseDocumentsSlice";
import { openPurchaseDocument } from "../api";
import { getActiveTaxRates, selectTaxRates } from "../../sales/taxRatesSlice";
import {
  getActiveDiscountRates,
  selectDiscountRates,
} from "../../sales/discountRatesSlice";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {
  clearFieldError,
  FormErrors,
  hasErrors,
  isBackendValidationErrors,
  validateRequiredFields,
} from "../../../utils/validation/validation";
import {
  validatePercentage,
  validatePrice,
  validateQuantity,
} from "../../../utils/validation/numberValidation";
import { translateValidationMessage } from "../../../utils/validation/validationMessages";
import { formatNumber } from "../../../utils/formatNumber";

const typeOptions = ["EINKAUF", "LIEFERANT_RABATT"] as const;
type PurchaseType = (typeof typeOptions)[number];

type PurchaseItemErrors = {
  quantity?: string;
  unitPrice?: string;
  discount?: string;
  taxPercentage?: string;
};

export default function PurchaseCard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const id = Number(purchaseId);

  const [purchase, setPurchase] = useState<PurchaseFormDto>({
    vendorId: 0,
    vendorName: "",
    purchasingDate: "",
    type: "EINKAUF",
    documentId: 0,
    documentNumber: "",
    purchaseItems: [],
    paymentStatus: "",
    hasPayments: false,
  });
  const [dateValue, setDateValue] = useState<Dayjs | null>(null);
  const vendorsPick = useAppSelector(selectCustomersPickList);
  const vendorsPickLoading = useAppSelector(selectLoadingPick);
  const categories = useAppSelector(selectProductCategories);
  const pickProducts = useAppSelector(selectPickProducts);
  const pickLoading = useAppSelector(selectPickLoading);
  const documentTypes = useAppSelector(selectTypeOfDocuments);
  const taxRates = useAppSelector(selectTaxRates);
  const discountRates = useAppSelector(selectDiscountRates);
  const purchaseDocuments = useAppSelector(selectPurchaseDocuments);
  const purchaseDocumentsLoading = useAppSelector(
    selectPurchaseDocumentsLoading,
  );
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [defaultTax, setDefaultTax] = useState<number | "mixed">(0);
  const [defaultDiscount, setDefaultDiscount] = useState<number | "mixed">(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [documentDataChanged, setDocumentDataChanged] = useState(false);
  const [errors, setErrors] = useState<FormErrors<NewPurchaseDto>>({});
  const [itemErrors, setItemErrors] = useState<
    Record<number, PurchaseItemErrors>
  >({});

  const canSearchProducts =
    selectedCategory !== null || searchTerm.trim().length >= 2;

  useEffect(() => {
    dispatch(getDocumentTypes());
    dispatch(getActiveTaxRates());
    dispatch(getActiveDiscountRates());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getCustomersPickList())
      .unwrap()
      .catch((error) =>
        handleApiError(error, "Fehler beim Laden der Lieferanten."),
      );

    dispatch(getPurchaseById(Number(purchaseId)))
      .unwrap()
      .then((p) => {
        setPurchase({
          vendorId: p.vendorId,
          vendorName: p.vendorName,
          purchasingDate: p.purchasingDate,
          type: p.type,
          documentId: p.document?.id ?? 0,
          document: p.document,
          documentNumber: p.documentNumber,
          purchaseItems: p.purchaseItems,
          paymentStatus: p.paymentStatus,
          hasPayments: p.hasPayments,
        });
        setDateValue(p.purchasingDate ? dayjs(p.purchasingDate) : null);
        const itemTaxes = [
          ...new Set(
            p.purchaseItems.map((item) => Number(item.taxPercentage ?? 0)),
          ),
        ];

        const itemDiscounts = [
          ...new Set(p.purchaseItems.map((item) => Number(item.discount ?? 0))),
        ];

        setDefaultTax(itemTaxes.length === 1 ? itemTaxes[0] : "mixed");

        setDefaultDiscount(
          itemDiscounts.length === 1 ? itemDiscounts[0] : "mixed",
        );
      })
      .catch((error) =>
        handleApiError(error, "Fehler beim Laden der Bestellung."),
      );

    dispatch(getProductCategories());
  }, [dispatch, purchaseId]);

  useEffect(() => {
    setSearchTerm("");
  }, [selectedCategory]);

  useEffect(() => {
    const term = searchTerm.trim();

    if (selectedCategory === null && term.length < 2) {
      dispatch(clearPickProducts());
      return;
    }

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
  }, [dispatch, searchTerm, selectedCategory]);

  useEffect(() => {
    if (!id || Number.isNaN(id)) return;

    dispatch(getPurchaseDocuments(id))
      .unwrap()
      .catch((error) =>
        handleApiError(error, "Fehler beim Laden der Dokumente."),
      );
  }, [dispatch, id]);

  const roundMoney = (value: number) =>
    Math.round((value + Number.EPSILON) * 100) / 100;

  const { subtotalBeforeDiscount, subtotal, discountAmount, taxSum, total } =
    useMemo(() => {
      let subtotalBeforeDiscount = 0;
      let subtotal = 0;
      let discountAmount = 0;
      let taxSum = 0;
      let total = 0;

      for (const item of purchase.purchaseItems) {
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
    }, [purchase.purchaseItems]);

  //---DOCUMENT--//

  const handleRemoveDocumentFile = (index: number) => {
    setDocumentFiles((prev) =>
      prev.filter((_, fileIndex) => fileIndex !== index),
    );
  };

  const handleUploadDocument = async () => {
    if (documentFiles.length === 0) {
      handleApiError(
        new Error("Bitte wählen Sie zuerst mindestens eine Datei aus."),
      );
      return;
    }

    try {
      setLoading(true);

      for (const file of documentFiles) {
        await dispatch(
          uploadPurchaseDocument({
            purchaseId: id,
            file,
          }),
        ).unwrap();
      }

      setDocumentFiles([]);

      showSuccessToast(
        "Erfolg",
        documentFiles.length === 1
          ? "Dokument erfolgreich hochgeladen"
          : `${documentFiles.length} Dokumente erfolgreich hochgeladen`,
      );
    } catch (error) {
      handleApiError(error, "Dokumente konnten nicht hochgeladen werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await dispatch(deletePurchaseDocument(documentId)).unwrap();

      showSuccessToast("Erfolg", "Dokument erfolgreich gelöscht");
    } catch (error) {
      handleApiError(error, "Dokument konnte nicht gelöscht werden.");
    }
  };

  //---ITEMS---//
  const handleAddProductToCart = (product: ProductPickDto) => {
    const quantity = 1;
    const unitPrice = roundMoney(Number(product.purchasingPrice) || 0);
    const discount = defaultDiscount === "mixed" ? 0 : defaultDiscount;
    const priceBeforeDiscount = roundMoney(quantity * unitPrice);
    const discountAmount = roundMoney((priceBeforeDiscount * discount) / 100);
    const totalPrice = roundMoney(priceBeforeDiscount - discountAmount);
    const taxPercentage =
      defaultTax === "mixed"
        ? (taxRates.find((rate) => rate.defaultRate)?.value ?? 0)
        : defaultTax;
    const taxAmount = roundMoney((totalPrice * taxPercentage) / 100);
    const totalAmount = roundMoney(totalPrice + taxAmount);

    const item: PurchaseFormItem = {
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice,
      discount,
      taxPercentage,
      position: purchase.purchaseItems.length + 1,
      discountAmount,
      totalPrice,
      taxAmount,
      totalAmount,
    };

    setPurchase((prev) => ({
      ...prev,
      purchaseItems: [...prev.purchaseItems, item],
    }));

    setErrors((prev) => clearFieldError(prev, "purchaseItems"));
  };

  const handleRemoveItem = (index: number) => {
    setPurchase((prev) => {
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

    if (newIndex < 0 || newIndex >= purchase.purchaseItems.length) {
      return;
    }

    setPurchase((prev) => {
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

  const recalculateItem = (item: PurchaseFormItem): PurchaseFormItem => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const discount = Number(item.discount) || 0;
    const taxPercentage = Number(item.taxPercentage) || 0;
    const priceBeforeDiscount = roundMoney(quantity * unitPrice);
    const discountAmount = roundMoney((priceBeforeDiscount * discount) / 100);
    const totalPrice = roundMoney(priceBeforeDiscount - discountAmount);
    const taxAmount = roundMoney((totalPrice * taxPercentage) / 100);
    const totalAmount = roundMoney(totalPrice + taxAmount);

    return {
      ...item,
      discount,
      discountAmount,
      totalPrice,
      taxAmount,
      totalAmount,
    };
  };

  const clearItemError = (index: number, field: keyof PurchaseItemErrors) => {
    setItemErrors((prev) => {
      const rowErrors = prev[index];

      if (!rowErrors?.[field]) {
        return prev;
      }

      const updatedRowErrors = { ...rowErrors };
      delete updatedRowErrors[field];

      const updatedErrors = { ...prev };

      if (Object.keys(updatedRowErrors).length === 0) {
        delete updatedErrors[index];
      } else {
        updatedErrors[index] = updatedRowErrors;
      }

      return updatedErrors;
    });
  };

  const handleItemChange = (
    index: number,
    field: keyof NewPurchaseItemDto,
    value: string | number,
  ) => {
    setPurchase((prev) => {
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

      const priceBeforeDiscount = roundMoney(quantity * unitPrice);

      const discountAmount = roundMoney((priceBeforeDiscount * discount) / 100);

      const totalPrice = roundMoney(priceBeforeDiscount - discountAmount);

      const taxAmount = roundMoney((totalPrice * taxPercentage) / 100);

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

    if (
      field === "quantity" ||
      field === "unitPrice" ||
      field === "discount" ||
      field === "taxPercentage"
    ) {
      clearItemError(index, field as keyof PurchaseItemErrors);
    }
  };

  const validatePurchaseItems = (): boolean => {
    if (purchase.purchaseItems.length === 0) {
      setErrors((prev) => ({
        ...prev,
        purchaseItems: "Bitte mindestens einen Artikel hinzufügen.",
      }));

      setItemErrors({});

      return false;
    }

    const newItemErrors: Record<number, PurchaseItemErrors> = {};

    purchase.purchaseItems.forEach((item, index) => {
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

  // --- SUBMIT ---//
  const handleSubmit = async () => {
    if (loading) {
      return;
    }

    const validationErrors = validateRequiredFields(purchase, [
      "vendorId",
      "purchasingDate",
      "documentId",
    ]);

    if (
      purchase.purchasingDate &&
      dayjs(purchase.purchasingDate).isAfter(dayjs(), "day")
    ) {
      validationErrors.purchasingDate =
        "Das Datum darf nicht in der Zukunft liegen.";
    }

    setErrors(validationErrors);

    const itemsAreValid = validatePurchaseItems();

    if (hasErrors(validationErrors) || !itemsAreValid) {
      return;
    }

    const updatedPurchaseToSend: NewPurchaseDto = {
      vendorId: purchase.vendorId,
      purchasingDate: purchase.purchasingDate,
      type: purchase.type,
      documentId: purchase.documentId,
      documentNumber: purchase.documentNumber.trim(),
      purchaseItems: purchase.purchaseItems.map((item) => ({
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

      const updatedPurchase = await dispatch(
        updatePurchase({
          id,
          updatedPurchase: updatedPurchaseToSend,
        }),
      ).unwrap();

      setPurchase({
        vendorId: updatedPurchase.vendorId,
        vendorName: updatedPurchase.vendorName,
        purchasingDate: updatedPurchase.purchasingDate,
        type: updatedPurchase.type,
        documentId: updatedPurchase.document?.id ?? 0,
        document: updatedPurchase.document,
        documentNumber: updatedPurchase.documentNumber,
        paymentStatus: updatedPurchase.paymentStatus,
        hasPayments: updatedPurchase.hasPayments,
        purchaseItems: updatedPurchase.purchaseItems,
      });

      setDateValue(
        updatedPurchase.purchasingDate
          ? dayjs(updatedPurchase.purchasingDate)
          : null,
      );

      const itemTaxes = [
        ...new Set(
          updatedPurchase.purchaseItems.map((item) =>
            Number(item.taxPercentage ?? 0),
          ),
        ),
      ];

      const itemDiscounts = [
        ...new Set(
          updatedPurchase.purchaseItems.map((item) =>
            Number(item.discount ?? 0),
          ),
        ),
      ];

      setDefaultTax(itemTaxes.length === 1 ? itemTaxes[0] : "mixed");

      setDefaultDiscount(
        itemDiscounts.length === 1 ? itemDiscounts[0] : "mixed",
      );

      setErrors({});
      setItemErrors({});
      setDocumentDataChanged(false);

      showSuccessToast("Erfolg", "Bestellung erfolgreich aktualisiert");
    } catch (error) {
      if (applyBackendValidationErrors(error)) {
        return;
      }

      handleApiError(error, "Die Bestellung konnte nicht aktualisiert werden.");
    } finally {
      setLoading(false);
    }
  };

  const selectedVendor =
    vendorsPick.find((v) => v.id === purchase.vendorId) ??
    (purchase.vendorName
      ? {
          id: purchase.vendorId,
          name: purchase.vendorName,
          customerNumber: null,
        }
      : null);

  const getDocumentFileName = (fileUrl: string): string => {
    return fileUrl.split("/").pop() ?? fileUrl;
  };

  return (
    <Container maxWidth="xl">
      <Grid container spacing={3} sx={{ p: 2 }}>
        <Grid item xs={12} md={12}>
          <Paper elevation={3} sx={{ p: 3, position: "relative" }}>
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

                  transition:
                    "color 0.2s ease-in-out, background-color 0.2s ease-in-out",

                  "&:hover": {
                    color: colors.grey,
                    transform: "scale(1.1)",
                  },
                }}
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                pr: 4,
              }}
            >
              <Typography
                variant="h5"
                sx={{ color: "#0277bd", fontWeight: "bold" }}
              >
                {`Bestellung Nr. ${id}`}
              </Typography>
            </Box>

            {/* Lieferant */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {/* LINKS: Bestelldaten */}
              <Grid item xs={12} md={9} sx={{ mt: 1 }}>
                <Box
                  sx={{
                    height: "100%",
                  }}
                >
                  {/* Lieferant / Datum */}
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <Autocomplete
                        fullWidth
                        disabled={loading || purchase.hasPayments}
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
                        value={selectedVendor}
                        onChange={(_, value) => {
                          setPurchase((prev) => ({
                            ...prev,
                            vendorId: value?.id ?? 0,
                            vendorName: value?.name ?? "",
                          }));

                          setDocumentDataChanged(true);

                          setErrors((prev) =>
                            clearFieldError(prev, "vendorId"),
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Lieferant"
                            error={Boolean(errors.vendorId)}
                            helperText={errors.vendorId}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {vendorsPickLoading && (
                                    <CircularProgress size={18} />
                                  )}

                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                      />
                      {purchase.hasPayments && (
                        <FormHelperText sx={{ ml: 1 }}>
                          Der Lieferant kann nicht geändert werden, da bereits
                          Zahlungen vorhanden sind.
                        </FormHelperText>
                      )}
                    </Grid>

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
                          label="Datum"
                          disabled={loading}
                          value={dateValue}
                          disableFuture
                          onChange={(newValue) => {
                            setDateValue(newValue);

                            setPurchase((prev) => ({
                              ...prev,
                              purchasingDate: newValue
                                ? newValue.format("YYYY-MM-DD")
                                : "",
                            }));
                            setDocumentDataChanged(true);
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
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>

                    <Grid item xs={2}>
                      <FormControl fullWidth>
                        <InputLabel id="purchase-type-label">
                          Vorgangsart
                        </InputLabel>

                        <Select
                          disabled={loading}
                          labelId="purchase-type-label"
                          label="Art der Operation"
                          value={purchase.type}
                          onChange={(e) =>
                            setPurchase({
                              ...purchase,
                              type: e.target.value as PurchaseType,
                            })
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
                  </Grid>

                  {/* Dokument / Dokumentnummer / Rabatt / MWSt */}
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={4}>
                      <FormControl fullWidth error={Boolean(errors.documentId)}>
                        <InputLabel id="purchase-document-label">
                          Dokument
                        </InputLabel>

                        <Select
                          disabled={loading}
                          labelId="purchase-document-label"
                          label="Dokument"
                          value={purchase.documentId || ""}
                          onChange={(e: SelectChangeEvent<number>) => {
                            const selectedId = Number(e.target.value);

                            setPurchase((prev) => ({
                              ...prev,
                              documentId: selectedId,
                            }));
                            setDocumentDataChanged(true);
                            setErrors((prev) =>
                              clearFieldError(prev, "documentId"),
                            );
                          }}
                        >
                          <MenuItem value="">Bitte wählen</MenuItem>

                          {documentTypes.map((doc: TypeOfDocument) => (
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

                    <Grid item xs={4}>
                      <TextField
                        label="Dokumentnummer"
                        disabled={loading}
                        error={Boolean(errors.documentNumber)}
                        helperText={errors.documentNumber}
                        value={purchase.documentNumber}
                        onChange={(e) => {
                          setPurchase((prev) => ({
                            ...prev,
                            documentNumber: e.target.value,
                          }));
                          setDocumentDataChanged(true);
                          setErrors((prev) =>
                            clearFieldError(prev, "documentNumber"),
                          );
                        }}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={2}>
                      <FormControl fullWidth>
                        <InputLabel id="purchase-default-discount-label">
                          Rabatt %
                        </InputLabel>

                        <Select
                          labelId="purchase-default-discount-label"
                          label="Rabatt %"
                          disabled={loading}
                          value={defaultDiscount}
                          onChange={(e) => {
                            const value = Number(e.target.value);

                            setDefaultDiscount(value);

                            setPurchase((prev) => ({
                              ...prev,
                              purchaseItems: prev.purchaseItems.map((item) =>
                                recalculateItem({
                                  ...item,
                                  discount: value,
                                }),
                              ),
                            }));
                          }}
                        >
                          {defaultDiscount === "mixed" && (
                            <MenuItem value="mixed" disabled>
                              Mix
                            </MenuItem>
                          )}

                          {discountRates.map((rate) => (
                            <MenuItem key={rate.id} value={rate.value}>
                              {rate.value}%
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={2}>
                      <FormControl fullWidth>
                        <InputLabel id="purchase-default-tax-label">
                          MWSt %
                        </InputLabel>

                        <Select
                          labelId="purchase-default-tax-label"
                          label="MWSt %"
                          disabled={loading}
                          value={defaultTax}
                          onChange={(e) => {
                            const value = Number(e.target.value);

                            setDefaultTax(value);

                            setPurchase((prev) => ({
                              ...prev,
                              purchaseItems: prev.purchaseItems.map((item) =>
                                recalculateItem({
                                  ...item,
                                  taxPercentage: value,
                                }),
                              ),
                            }));
                          }}
                        >
                          {defaultTax === "mixed" && (
                            <MenuItem value="mixed" disabled>
                              Mix
                            </MenuItem>
                          )}

                          {taxRates.map((rate) => (
                            <MenuItem key={rate.id} value={rate.value}>
                              {rate.value}%
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
                  {/* Upload */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: purchaseDocuments.length > 0 ? 0.5 : 0,
                    }}
                  >
                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                      disabled={loading}
                      startIcon={<UploadFileIcon />}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        whiteSpace: "nowrap",
                      }}
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

                    <Tooltip
                      title={
                        documentDataChanged
                          ? "Bitte speichern Sie zuerst die Änderungen der Bestelldaten."
                          : ""
                      }
                      arrow
                    >
                      <span>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleUploadDocument}
                          disabled={
                            loading ||
                            documentFiles.length === 0 ||
                            purchaseDocumentsLoading ||
                            documentDataChanged
                          }
                          sx={{
                            minWidth: 42,
                            px: 1,
                            "&:hover": {
                              backgroundColor: colors.accentDark,
                            },
                          }}
                        >
                          <UploadFileIcon fontSize="small" />
                        </Button>
                      </span>
                    </Tooltip>
                  </Box>

                  {/* Выбранный файл до загрузки */}
                  {documentFiles.length > 0 && (
                    <Box
                      sx={{
                        mb: 0.5,
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
                              sx={{
                                p: 0.4,
                                "&:hover": {
                                  color: "#d32f2f",
                                  backgroundColor: "transparent",
                                },
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {purchaseDocumentsLoading && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        py: 0.5,
                      }}
                    >
                      <CircularProgress size={18} />
                    </Box>
                  )}

                  {/* Загруженные документы */}
                  {!purchaseDocumentsLoading && (
                    <Box
                      sx={{
                        maxHeight: 65,
                        overflowY: "auto",
                      }}
                    >
                      {purchaseDocuments.map((document) => (
                        <Box
                          key={document.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            minHeight: 30,
                            borderTop: `1px solid ${colors.border}`,
                          }}
                        >
                          <Tooltip
                            title={getDocumentFileName(document.fileUrl)}
                            arrow
                          >
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
                              {getDocumentFileName(document.fileUrl)}
                            </Typography>
                          </Tooltip>

                          <Tooltip title="Öffnen" arrow>
                            <IconButton
                              size="small"
                              onClick={() =>
                                openPurchaseDocument(document.fileUrl)
                              }
                              sx={{
                                p: 0.4,
                                "&:hover": {
                                  color: colors.accentBlue,
                                  backgroundColor: "transparent",
                                },
                              }}
                            >
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Löschen" arrow>
                            <IconButton
                              size="small"
                              disabled={loading}
                              onClick={() => handleDeleteDocument(document.id)}
                              sx={{
                                p: 0.4,
                                "&:hover": {
                                  color: "#d32f2f",
                                  backgroundColor: "transparent",
                                },
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ))}

                      {purchaseDocuments.length === 0 && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            textAlign: "left",
                            mt: 0.5,
                          }}
                        >
                          Keine Dokumente
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Artikeln_Tabelle */}
            <Box
              sx={{
                minHeight: 200,
                overflowY: "auto",
                mb: 2,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Table size="small">
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
                    <TableCell sx={fixedCellWidth(40)}></TableCell>
                  </TableRow>
                </StyledTableHead>

                <TableBody>
                  {purchase.purchaseItems.map((item, index) => (
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
                                  index === purchase.purchaseItems.length - 1 ||
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
                          variant="standard"
                          multiline
                          minRows={1}
                          maxRows={3}
                          fullWidth
                          disabled={loading}
                          value={item.productName}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "productName",
                              e.target.value,
                            )
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
                          step={1}
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

                      {/* Rabatt */}
                      <TableCell
                        sx={{
                          ...cellStyle,
                          ...fixedCellWidth(65),
                        }}
                      >
                        <CompactNumberCell
                          value={item.discount ?? 0}
                          min={0}
                          max={100}
                          step={1}
                          disabled={loading}
                          error={Boolean(itemErrors[index]?.discount)}
                          errorText={itemErrors[index]?.discount}
                          onChange={(value) =>
                            handleItemChange(index, "discount", value)
                          }
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
                          onChange={(value) =>
                            handleItemChange(index, "taxPercentage", value)
                          }
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

                      <TableCell
                        sx={{
                          ...actionCellStyle,
                          ...fixedCellWidth(40),
                        }}
                      >
                        <Tooltip title="Löschen" arrow>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveItem(index)}
                              disabled={loading}
                              aria-label="Zeile löschen"
                              sx={{
                                p: 0.5,
                                transition: "transform 0.2s ease-in-out",

                                "&:hover": {
                                  color: "#d32f2f",
                                  transform: "scale(1.2)",
                                  backgroundColor: "transparent",
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                  {purchase.purchaseItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        Keine Artikel vorhanden
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 3,
                mt: 3,
                mb: 5,
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
                  onClick={handleSubmit}
                  sx={{ ...primaryButtonStyle, width: 200 }}
                  disabled={
                    loading ||
                    !purchase.vendorId ||
                    !purchase.purchasingDate ||
                    purchase.purchaseItems.length === 0
                  }
                >
                  {loading ? "Speichern..." : "Aktualisieren"}
                </Button>
              </Box>

              <Box
                sx={{
                  minWidth: 260,
                  textAlign: "right",
                }}
              >
                {discountAmount > 0 && (
                  <>
                    <Typography>
                      Netto vor Rabatt: {subtotalBeforeDiscount.toFixed(2)} €
                    </Typography>

                    <Typography>
                      Rabatt: -{discountAmount.toFixed(2)} €
                    </Typography>
                  </>
                )}

                <Typography>Netto: {subtotal.toFixed(2)} €</Typography>

                <Typography>MWSt: {taxSum.toFixed(2)} €</Typography>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                  }}
                >
                  Gesamtbetrag: {total.toFixed(2)} €
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <Select
                      value={selectedCategory || ""}
                      onChange={(e) =>
                        setSelectedCategory(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      displayEmpty
                    >
                      <MenuItem value="">Alle Kategorien</MenuItem>
                      {[...categories]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((cat) => (
                          <MenuItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    placeholder="Produktname, Artikel, Lieferanten-Artikel suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setSearchTerm("")}>
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Box
                sx={{
                  maxHeight: 263,
                  overflowY: "auto",
                  mt: 1,
                  border: "1px solid #ddd",
                }}
              >
                {pickLoading && (
                  <Box sx={{ p: 1, textAlign: "center", color: "#00acc1" }}>
                    <CircularProgress size={20} />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      Produkte werden geladen…
                    </Typography>
                  </Box>
                )}

                <Table size="small">
                  <StyledTableHead>
                    <TableRow>
                      <TableCell>Artikelname</TableCell>
                      <TableCell>Artikel</TableCell>
                      <TableCell>Lieferanten-Artikel</TableCell>
                      <TableCell>Preis</TableCell>
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

                          <TableCell sx={cellStyle}>
                            {product.article}
                          </TableCell>

                          <TableCell sx={cellStyle}>
                            {product.vendorArticle ?? ""}
                          </TableCell>

                          <TableCell sx={rightCellStyle}>
                            {product.purchasingPrice != null
                              ? formatNumber(product.purchasingPrice)
                              : ""}
                          </TableCell>
                        </TableRow>
                      ))}
                    {canSearchProducts &&
                      !pickLoading &&
                      pickProducts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            Keine Produkte gefunden
                          </TableCell>
                        </TableRow>
                      )}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
