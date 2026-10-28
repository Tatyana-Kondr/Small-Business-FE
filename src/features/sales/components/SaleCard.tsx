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
  Tooltip,
  Alert,
  SelectChangeEvent,
  CircularProgress,
  FormHelperText,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Dialog,
} from "@mui/material";
import { Delete as DeleteIcon, Clear as ClearIcon } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { deDE } from "@mui/x-date-pickers/locales";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  getProductCategories,
  selectProductCategories,
} from "../../products/productCategoriesSlice";
import {
  getPickProducts,
  clearPickProducts,
  selectPickLoading,
  selectPickProducts,
} from "../../products/productsSlice";
import {
  getCustomersPickListWithCustomerNumber,
  selectCustomersPickListWithNumber,
  selectLoadingPick,
} from "../../customers/customersSlice";
import { ProductPickDto } from "../../products/types";
import { handleApiError } from "../../../utils/errors/handleApiError";
import { showSuccessToast } from "../../../utils/toast";
import {
  NewSaleDto,
  NewShippingDimensionsDto,
  SaleFormDto,
  SaleFormItem,
  Shipping,
} from "../types";
import { getSaleById, updateSale } from "../salesSlice";
import { getShippings, selectShippings } from "../shippingsSlice";
import { getTermsOfPayment, selectTermsOfPayment } from "../termOfPaymentSlice";
import CompactNumberCell from "../../../components/CompactNumberCell";
import {
  clearFieldError,
  FormErrors,
  hasErrors,
  isBackendValidationErrors,
  validateRequiredFields,
} from "../../../utils/validation/validation";
import {
  dateFieldStyle,
  compactDimensionFieldStyle,
} from "../../../styles/formStyles";
import { primaryButtonStyle } from "../../../styles/buttonStyles";
import { sectionTitleStyle } from "../../../styles/typographyStyles";
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
import { getActiveTaxRates, selectTaxRates } from "../taxRatesSlice";

import {
  getActiveDiscountRates,
  selectDiscountRates,
} from "../discountRatesSlice";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {
  validatePercentage,
  validatePrice,
  validateQuantity,
} from "../../../utils/validation/numberValidation";
import { translateValidationMessage } from "../../../utils/validation/validationMessages";
import { formatNumber } from "../../../utils/formatNumber";

const typeOptions = ["VERKAUF", "KUNDENERSTATTUNG"] as const;
type SaleType = (typeof typeOptions)[number];

type SaleItemErrors = {
  quantity?: string;
  unitPrice?: string;
  discount?: string;
  tax?: string;
};

export default function SaleCard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { saleId } = useParams<{ saleId: string }>();
  const id = Number(saleId);

  const [sale, setSale] = useState<SaleFormDto>({
    customerId: 0,
    customerName: "",
    invoiceNumber: "",
    accountObject: "",
    typeOfOperation: "VERKAUF",
    shippingId: null,
    shippingDimensions: {
      width: null,
      height: null,
      length: null,
      weight: null,
    },
    termsOfPaymentId: 0,
    salesDate: "",
    paymentStatus: "",
    hasPayments: false,
    paymentDate: "",
    orderNumber: "",
    orderType: "",
    deliveryDate: "",
    deliveryBill: "",
    salesItems: [],
  });

  const [dateValue, setDateValue] = useState<Dayjs | null>(null);
  const customersPickWithNumber = useAppSelector(
    selectCustomersPickListWithNumber,
  );
  const customersPickLoading = useAppSelector(selectLoadingPick);
  const categories = useAppSelector(selectProductCategories);
  const pickProducts = useAppSelector(selectPickProducts);
  const productsPickLoading = useAppSelector(selectPickLoading);
  const shippings = useAppSelector(selectShippings);
  const termsOfPayment = useAppSelector(selectTermsOfPayment);
  const taxRates = useAppSelector(selectTaxRates);
  const discountRates = useAppSelector(selectDiscountRates);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<Shipping | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [deliveryDateValue, setDeliveryDateValue] = useState<Dayjs | null>(
    sale.deliveryDate ? dayjs(sale.deliveryDate) : null,
  );
  const [errors, setErrors] = useState<FormErrors<NewSaleDto>>({});
  const [itemErrors, setItemErrors] = useState<Record<number, SaleItemErrors>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  const [savedOverpayment, setSavedOverpayment] = useState(0);
  const [overpaymentDialogOpen, setOverpaymentDialogOpen] = useState(false);

  const canSearchProducts =
    selectedCategory !== null || searchTerm.trim().length >= 2;
  const [defaultTax, setDefaultTax] = useState<number | "mixed">(0);
  const [defaultDiscount, setDefaultDiscount] = useState<number | "mixed">(0);

  const isPaid = sale.paymentStatus === "BEZAHLT";
  const formattedPaymentDate = sale.paymentDate
    ? dayjs(sale.paymentDate).format("DD.MM.YYYY")
    : null;

  useEffect(() => {
    dispatch(getTermsOfPayment());
    dispatch(getActiveTaxRates());
    dispatch(getActiveDiscountRates());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getCustomersPickListWithCustomerNumber())
      .unwrap()
      .catch((error) => handleApiError(error, "Fehler beim Laden der Kunden."));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getSaleById(Number(saleId)))
      .unwrap()
      .then((s) => {
        setSale({
          customerId: s.customerId,
          customerName: s.customerName,
          invoiceNumber: s.invoiceNumber,
          accountObject: s.accountObject,
          typeOfOperation: s.typeOfOperation,
          shippingId: s.shippingId ?? null,
          shippingDimensions: s.shippingDimensions ?? {
            width: null,
            height: null,
            length: null,
            weight: null,
          },
          termsOfPaymentId: s.termsOfPayment?.id ?? 0,
          salesDate: s.salesDate,
          paymentStatus: s.paymentStatus,
          hasPayments: s.hasPayments,
          paymentDate: s.paymentDate,
          orderNumber: s.orderNumber,
          orderType: s.orderType,
          deliveryDate: s.deliveryDate,
          deliveryBill: s.deliveryBill,
          salesItems: s.saleItems,
        });
        setTotalPaid(Number(s.totalPaid ?? 0));
        setSavedOverpayment(Number(s.overpayment ?? 0));
        setDateValue(s.salesDate ? dayjs(s.salesDate) : null);
        setDeliveryDateValue(s.deliveryDate ? dayjs(s.deliveryDate) : null);
        const itemTaxes = [
          ...new Set(s.saleItems.map((item) => Number(item.tax ?? 0))),
        ];

        const itemDiscounts = [
          ...new Set(s.saleItems.map((item) => Number(item.discount ?? 0))),
        ];

        setDefaultTax(itemTaxes.length === 1 ? itemTaxes[0] : "mixed");

        setDefaultDiscount(
          itemDiscounts.length === 1 ? itemDiscounts[0] : "mixed",
        );
      })
      .catch((error) =>
        handleApiError(error, "Fehler beim Laden des Auftrags."),
      );

    dispatch(getShippings());
    dispatch(getProductCategories());
  }, [dispatch, saleId]);

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

  // 3. Автоматическая подстановка Versand после загрузки shippings + sale
  useEffect(() => {
    if (shippings.length && sale.shippingId) {
      const shipping = shippings.find((s) => s.id === sale.shippingId) || null;
      setSelectedShipping(shipping);
    }
  }, [shippings, sale.shippingId]);

  useEffect(() => {
    if (sale.shippingDimensions && sale.shippingDimensions.weight != null) {
      setWeightInput(
        sale.shippingDimensions.weight.toFixed(3).replace(".", ","),
      );
    } else {
      setWeightInput("");
    }
  }, [sale.shippingDimensions?.weight]);


  const updateShippingDimension = (
    field: keyof NewShippingDimensionsDto,
    value: string,
  ) => {
    const parsed =
      value.trim() === "" ? null : parseFloat(value.replace(",", "."));

    setSale((prev) => ({
      ...prev,
      shippingDimensions: {
        ...prev.shippingDimensions,
        [field]: isNaN(parsed!) ? null : parsed,
      },
    }));
  };

  const roundMoney = (value: number) =>
    Math.round((value + Number.EPSILON) * 100) / 100;

  const { subtotalBeforeDiscount, subtotal, discountAmount, taxSum, total } =
    useMemo(() => {
      let subtotalBeforeDiscount = 0;
      let subtotal = 0;
      let discountAmount = 0;
      let taxSum = 0;
      let total = 0;

      for (const item of sale.salesItems) {
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
    }, [sale.salesItems]);

  const overpayment = roundMoney(Math.max(0, totalPaid - total));

  const formatMoney = (value: number) =>
    value.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });

  const handleAddProductToCart = (product: ProductPickDto) => {
    const quantity = 1;
    const unitPrice = roundMoney(Number(product.sellingPrice ?? 0));
    const discount = defaultDiscount === "mixed" ? 0 : defaultDiscount;
    const priceBeforeDiscount = roundMoney(quantity * unitPrice);
    const discountAmount = roundMoney((priceBeforeDiscount * discount) / 100);
    const totalPrice = roundMoney(priceBeforeDiscount - discountAmount);
    const tax = defaultTax === "mixed" ? 0 : defaultTax;
    const taxAmount = roundMoney((totalPrice * tax) / 100);
    const totalAmount = roundMoney(totalPrice + taxAmount);

    const item: SaleFormItem = {
      position: sale.salesItems.length + 1,
      productId: product.id,
      productArticle: product.article,
      productName: product.name,
      quantity,
      unitPrice,
      discount,
      discountAmount,
      totalPrice,
      tax,
      taxAmount,
      totalAmount,
    };

    setSale((prev) => ({
      ...prev,
      salesItems: [...prev.salesItems, item],
    }));

    setErrors((prev) => clearFieldError(prev, "salesItems"));
    setItemErrors((prev) => {
      const updated = { ...prev };
      delete updated[sale.salesItems.length];
      return updated;
    });
  };

  //---ITEMS---//
  const handleRemoveItem = (index: number) => {
    setSale((prev) => {
      const updatedItems = prev.salesItems
        .filter((_, i) => i !== index)
        .map((item, i) => ({
          ...item,
          position: i + 1,
        }));

      return {
        ...prev,
        salesItems: updatedItems,
      };
    });

    setItemErrors((prev) => {
      const updated: Record<number, SaleItemErrors> = {};

      Object.entries(prev).forEach(([key, value]) => {
        const oldIndex = Number(key);

        if (oldIndex < index) {
          updated[oldIndex] = value;
        }

        if (oldIndex > index) {
          updated[oldIndex - 1] = value;
        }
      });

      return updated;
    });
  };

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= sale.salesItems.length) {
      return;
    }

    setSale((prev) => {
      const updatedItems = [...prev.salesItems];

      // Меняем строки местами
      [updatedItems[index], updatedItems[targetIndex]] = [
        updatedItems[targetIndex],
        updatedItems[index],
      ];

      // Восстанавливаем position
      const reorderedItems = updatedItems.map((item, i) => ({
        ...item,
        position: i + 1,
      }));

      return {
        ...prev,
        salesItems: reorderedItems,
      };
    });

    // Ошибки должны двигаться вместе со строками
    setItemErrors((prev) => {
      const updated = { ...prev };

      const currentErrors = updated[index];
      const targetErrors = updated[targetIndex];

      if (targetErrors) {
        updated[index] = targetErrors;
      } else {
        delete updated[index];
      }

      if (currentErrors) {
        updated[targetIndex] = currentErrors;
      } else {
        delete updated[targetIndex];
      }

      return updated;
    });
  };

  const recalculateItem = (item: SaleFormItem): SaleFormItem => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const discount = Number(item.discount) || 0;
    const tax = Number(item.tax) || 0;

    const priceBeforeDiscount = roundMoney(quantity * unitPrice);

    const discountAmount = roundMoney((priceBeforeDiscount * discount) / 100);

    const totalPrice = roundMoney(priceBeforeDiscount - discountAmount);

    const taxAmount = roundMoney((totalPrice * tax) / 100);

    const totalAmount = roundMoney(totalPrice + taxAmount);

    return {
      ...item,
      discount,
      discountAmount,
      totalPrice,
      tax,
      taxAmount,
      totalAmount,
    };
  };

  const clearItemError = (index: number, field: keyof SaleItemErrors) => {
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
    field: keyof SaleFormItem,
    value: string | number,
  ) => {
    setSale((prevSale) => {
      const updatedItems = [...prevSale.salesItems];
      const currentItem = { ...updatedItems[index] };

      if (
        field === "tax" ||
        field === "discount" ||
        field === "quantity" ||
        field === "unitPrice"
      ) {
        const parsedValue = Number(value);

        if (!isNaN(parsedValue)) {
          (currentItem as any)[field] = parsedValue;
        }
      } else {
        (currentItem as any)[field] = value;
      }

      updatedItems[index] = recalculateItem(currentItem);

      return {
        ...prevSale,
        salesItems: updatedItems,
      };
    });

    if (
      field === "quantity" ||
      field === "unitPrice" ||
      field === "discount" ||
      field === "tax"
    ) {
      clearItemError(index, field as keyof SaleItemErrors);
    }
  };

  const validateSaleItems = (): boolean => {
    if (sale.salesItems.length === 0) {
      setErrors((prev) => ({
        ...prev,
        salesItems: "Bitte mindestens einen Artikel hinzufügen.",
      }));

      setItemErrors({});

      return false;
    }

    const newItemErrors: Record<number, SaleItemErrors> = {};

    sale.salesItems.forEach((item, index) => {
      const errors: SaleItemErrors = {};

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

      const taxError = validatePercentage(Number(item.tax));

      if (taxError) {
        errors.tax = taxError;
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

    const formErrors: FormErrors<NewSaleDto> = {};
    const saleItemErrors: Record<number, SaleItemErrors> = {};

    error.errors.forEach((validationError) => {
      const message = translateValidationMessage(validationError.message);

      if (
        validationError.field === "customerId" ||
        validationError.field === "salesDate" ||
        validationError.field === "termsOfPaymentId" ||
        validationError.field === "salesItems"
      ) {
        formErrors[validationError.field] = message;
        return;
      }

      const itemMatch = validationError.field.match(
        /^salesItems\[(\d+)]\.(quantity|unitPrice|discount|tax)$/,
      );

      if (!itemMatch) {
        return;
      }

      const index = Number(itemMatch[1]);
      const field = itemMatch[2] as keyof SaleItemErrors;

      saleItemErrors[index] = {
        ...saleItemErrors[index],
        [field]: message,
      };
    });

    setErrors(formErrors);
    setItemErrors(saleItemErrors);

    return true;
  };

  // --- SUBMIT ---//
  const saveSale = async () => {
    if (loading || isPaid) {
      return;
    }

    const updatedSaleToSend: NewSaleDto = {
      customerId: sale.customerId,
      customerName: sale.customerName,
      invoiceNumber: sale.invoiceNumber,
      accountObject: sale.accountObject,
      typeOfOperation: sale.typeOfOperation,
      shippingId: sale.shippingId,
      shippingDimensions: sale.shippingDimensions,
      termsOfPaymentId: sale.termsOfPaymentId,
      salesDate: sale.salesDate,
      orderNumber: sale.orderNumber,
      orderType: sale.orderType,
      deliveryDate: sale.deliveryDate,
      deliveryBill: sale.deliveryBill,

      salesItems: sale.salesItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: roundMoney(Number(item.unitPrice)),
        discount: Number(item.discount),
        tax: Number(item.tax),
      })),
    };

    try {
      setLoading(true);

      const updatedSale = await dispatch(
        updateSale({
          id,
          updatedSale: updatedSaleToSend,
        }),
      ).unwrap();

      // Обновляем финансовые данные
      setTotalPaid(Number(updatedSale.totalPaid ?? 0));
      setSavedOverpayment(Number(updatedSale.overpayment ?? 0));

      // Обновляем карточку продажи
      setSale({
        customerId: updatedSale.customerId,
        customerName: updatedSale.customerName,
        invoiceNumber: updatedSale.invoiceNumber,
        accountObject: updatedSale.accountObject,
        typeOfOperation: updatedSale.typeOfOperation,
        shippingId: updatedSale.shippingId ?? null,
        shippingDimensions: updatedSale.shippingDimensions ?? {
          width: null,
          height: null,
          length: null,
          weight: null,
        },
        termsOfPaymentId: updatedSale.termsOfPayment?.id ?? 0,
        salesDate: updatedSale.salesDate,
        paymentStatus: updatedSale.paymentStatus,
        paymentDate: updatedSale.paymentDate,
        hasPayments: updatedSale.hasPayments,
        orderNumber: updatedSale.orderNumber,
        orderType: updatedSale.orderType,
        deliveryDate: updatedSale.deliveryDate,
        deliveryBill: updatedSale.deliveryBill,
        salesItems: updatedSale.saleItems,
      });

      // Обновляем даты
      setDateValue(updatedSale.salesDate ? dayjs(updatedSale.salesDate) : null);

      setDeliveryDateValue(
        updatedSale.deliveryDate ? dayjs(updatedSale.deliveryDate) : null,
      );

      // Обновляем значения MWSt и Rabatt
      const itemTaxes = [
        ...new Set(updatedSale.saleItems.map((item) => Number(item.tax ?? 0))),
      ];

      const itemDiscounts = [
        ...new Set(
          updatedSale.saleItems.map((item) => Number(item.discount ?? 0)),
        ),
      ];

      setDefaultTax(itemTaxes.length === 1 ? itemTaxes[0] : "mixed");

      setDefaultDiscount(
        itemDiscounts.length === 1 ? itemDiscounts[0] : "mixed",
      );

      // Очищаем ошибки
      setErrors({});
      setItemErrors({});

      showSuccessToast("Erfolg", "Auftrag erfolgreich aktualisiert.");
    } catch (error) {
      if (applyBackendValidationErrors(error)) {
        return;
      }

      handleApiError(error, "Der Auftrag konnte nicht aktualisiert werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (loading || isPaid) return;

    const validationErrors = validateRequiredFields(sale, [
      "customerId",
      "salesDate",
      "termsOfPaymentId",
    ]);

    if (sale.salesDate && dayjs(sale.salesDate).isAfter(dayjs(), "day")) {
      validationErrors.salesDate =
        "Das Datum darf nicht in der Zukunft liegen.";
    }

    setErrors(validationErrors);

    const itemsAreValid = validateSaleItems();

    if (hasErrors(validationErrors) || !itemsAreValid) {
      return;
    }

    if (overpayment > 0) {
      setOverpaymentDialogOpen(true);
      return;
    }

    void saveSale();
  };

  const selectedCustomer =
    customersPickWithNumber.find((c) => c.id === sale.customerId) ??
    (sale.customerName
      ? { id: sale.customerId, name: sale.customerName, customerNumber: null }
      : null);

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
            {isPaid && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Dieser Auftrag ist vollständig bezahlt.
                {formattedPaymentDate &&
                  ` Letzte Zahlung am ${formattedPaymentDate}.`}
              </Alert>
            )}

            {savedOverpayment > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Überzahlung: {formatMoney(savedOverpayment)}
              </Alert>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                pr: 4,
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                Auftrag Nr. {id}
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {/* Kunde */}
              <Grid item xs={7}>
                <Autocomplete
                  fullWidth
                  clearOnEscape
                  disabled={isPaid || loading || sale.hasPayments}
                  loading={customersPickLoading}
                  options={[...customersPickWithNumber].sort((a, b) =>
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
                  value={selectedCustomer}
                  onChange={(_, value) => {
                    setSale((prev) => ({
                      ...prev,
                      customerId: value?.id ?? 0,
                      customerName: value?.name ?? "",
                    }));

                    setErrors((prev) => clearFieldError(prev, "customerId"));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Kunde"
                      error={Boolean(errors.customerId)}
                      helperText={errors.customerId}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {customersPickLoading && (
                              <CircularProgress size={18} />
                            )}

                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
                {sale.hasPayments && (
    <FormHelperText sx={{ ml: 1 }}>
        Der Kunde kann nicht geändert werden, da bereits Zahlungen vorhanden sind.
    </FormHelperText>
)}
              </Grid>

              {/* Rechnung */}
              <Grid item xs={1.5}>
                <TextField
                  label="Rechnung"
                  value={sale.invoiceNumber}
                  onChange={(e) =>
                    setSale({ ...sale, invoiceNumber: e.target.value })
                  }
                  disabled={isPaid || loading}
                  fullWidth
                />
              </Grid>

              {/* Auftragsdatum */}
              <Grid item xs={1.5}>
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="de"
                  localeText={
                    deDE.components.MuiLocalizationProvider.defaultProps
                      .localeText
                  }
                >
                  <DatePicker
                    label="Auftragsdatum"
                    value={dateValue}
                    onChange={(newValue) => {
                      setDateValue(newValue);

                      setSale((prev) => ({
                        ...prev,
                        salesDate: newValue
                          ? newValue.format("YYYY-MM-DD")
                          : "",
                      }));

                      setErrors((prev) => clearFieldError(prev, "salesDate"));
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        sx: dateFieldStyle,
                        error: Boolean(errors.salesDate),
                        helperText: errors.salesDate,
                      },
                    }}
                    disabled={isPaid || loading}
                  />
                </LocalizationProvider>
              </Grid>

              {/* Vorgangsart */}
              <Grid item xs={2}>
                <FormControl fullWidth disabled={isPaid || loading}>
                  <InputLabel id="sale-type-label">Vorgangsart</InputLabel>
                  <Select
                    labelId="typeOfOperation-label"
                    value={sale.typeOfOperation}
                    label="Art der Operation"
                    onChange={(e) =>
                      setSale({
                        ...sale,
                        typeOfOperation: e.target.value as SaleType,
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

            <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
              {/* Objekt */}
              <Grid item xs={4}>
                <TextField
                  id="account-object"
                  name="accountObject"
                  label="Objekt"
                  value={sale.accountObject}
                  onChange={(e) =>
                    setSale((prev) => ({
                      ...prev,
                      accountObject: e.target.value,
                    }))
                  }
                  fullWidth
                  disabled={isPaid || loading}
                />
              </Grid>

              {/* Zahlungsbedingung */}
              <Grid item xs={3}>
                <FormControl
                  fullWidth
                  error={Boolean(errors.termsOfPaymentId)}
                  disabled={isPaid || loading}
                >
                  <InputLabel id="terms-of-payment-label">
                    Zahlungsbedingung
                  </InputLabel>

                  <Select
                    id="terms-of-payment"
                    labelId="terms-of-payment-label"
                    label="Zahlungsbedingung"
                    value={sale.termsOfPaymentId || ""}
                    onChange={(e: SelectChangeEvent<number>) => {
                      const selectedId = Number(e.target.value);

                      setSale((prev) => ({
                        ...prev,
                        termsOfPaymentId: selectedId,
                      }));

                      setErrors((prev) =>
                        clearFieldError(prev, "termsOfPaymentId"),
                      );
                    }}
                  >
                    <MenuItem value="">Bitte wählen</MenuItem>

                    {termsOfPayment.map((term) => (
                      <MenuItem key={term.id} value={term.id}>
                        {term.name}
                      </MenuItem>
                    ))}
                  </Select>

                  {errors.termsOfPaymentId && (
                    <FormHelperText>{errors.termsOfPaymentId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Lieferschein */}
              <Grid item xs={1.5}>
                <TextField
                  label="Lieferschein"
                  value={sale.deliveryBill}
                  onChange={(e) =>
                    setSale((prev) => ({
                      ...prev,
                      deliveryBill: e.target.value,
                    }))
                  }
                  disabled={isPaid || loading}
                  fullWidth
                />
              </Grid>

              {/* Lieferdatum */}
              <Grid item xs={1.5}>
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="de"
                  localeText={
                    deDE.components.MuiLocalizationProvider.defaultProps
                      .localeText
                  }
                >
                  <DatePicker
                    label="Datum der Lieferung"
                    value={deliveryDateValue}
                    onChange={(newValue) => {
                      setDeliveryDateValue(newValue);

                      setSale((prev) => ({
                        ...prev,
                        deliveryDate: newValue
                          ? newValue.format("YYYY-MM-DD")
                          : "",
                      }));
                    }}
                    disabled={isPaid || loading}
                    slotProps={{
                      textField: {
                        id: "delivery-date",
                        fullWidth: true,
                        size: "small",
                        sx: dateFieldStyle,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              {/* MWSt */}
              <Grid item xs={1}>
                <FormControl fullWidth>
                  <InputLabel id="sale-default-tax-label">MWSt %</InputLabel>

                  <Select
                    labelId="sale-default-tax-label"
                    label="MWSt %"
                    disabled={loading || isPaid}
                    value={defaultTax}
                    onChange={(e) => {
                      const value = Number(e.target.value);

                      setDefaultTax(value);

                      setSale((prev) => ({
                        ...prev,
                        salesItems: prev.salesItems.map((item) =>
                          recalculateItem({
                            ...item,
                            tax: value,
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

              {/* Rabatt */}
              <Grid item xs={1}>
                <FormControl fullWidth disabled={isPaid || loading}>
                  <InputLabel id="default-discount-label">Rabatt %</InputLabel>

                  <Select
                    labelId="default-discount-label"
                    label="Rabatt %"
                    disabled={loading || isPaid}
                    value={defaultDiscount}
                    onChange={(e) => {
                      const value = Number(e.target.value);

                      setDefaultDiscount(value);

                      setSale((prev) => ({
                        ...prev,
                        salesItems: prev.salesItems.map((item) =>
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
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              {/* ==================== BESTELLDATEN ==================== */}
              <Grid item xs={12} md={5}>
                <Typography sx={sectionTitleStyle}>Bestelldaten</Typography>
                <Grid container spacing={2}>
                  {/* Bestell-Nr */}
                  <Grid item xs={6}>
                    <TextField
                      id="order-number"
                      label="Bestell-Nr"
                      value={sale.orderNumber}
                      onChange={(e) =>
                        setSale((prev) => ({
                          ...prev,
                          orderNumber: e.target.value,
                        }))
                      }
                      disabled={isPaid || loading}
                      fullWidth
                    />
                  </Grid>

                  {/* Bestellart */}
                  <Grid item xs={6}>
                    <TextField
                      id="order-type"
                      label="Bestellart"
                      value={sale.orderType}
                      onChange={(e) =>
                        setSale((prev) => ({
                          ...prev,
                          orderType: e.target.value,
                        }))
                      }
                      disabled={isPaid || loading}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* ==================== VERSAND & MASSE ==================== */}
              <Grid item xs={12} md={7}>
                <Box sx={{ mb: 2.5, pl: 2 }}>
                  <Typography sx={{ ...sectionTitleStyle }}>
                    Versand & Maße
                  </Typography>
                  <Grid container spacing={2}>
                    {/* Versand */}
                    <Grid item xs={5}>
                      <Autocomplete
                        fullWidth
                        disabled={isPaid || loading}
                        options={[...shippings].sort((a, b) =>
                          a.name.localeCompare(b.name),
                        )}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        value={selectedShipping}
                        onChange={(_, value) => {
                          setSelectedShipping(value);

                          setSale((prev) => ({
                            ...prev,
                            shippingId: value?.id ?? null,
                          }));
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label="Versand" fullWidth />
                        )}
                      />
                    </Grid>

                    {/* Maße */}
                    <Grid item xs={1.75}>
                      <TextField
                        id="shipping-width"
                        label="Breite (cm)"
                        value={sale.shippingDimensions?.width ?? ""}
                        sx={compactDimensionFieldStyle}
                        onChange={(e) =>
                          updateShippingDimension("width", e.target.value)
                        }
                        disabled={isPaid || loading}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={1.75}>
                      <TextField
                        id="shipping-length"
                        label="Länge (cm)"
                        value={sale.shippingDimensions?.length ?? ""}
                        sx={compactDimensionFieldStyle}
                        onChange={(e) =>
                          updateShippingDimension("length", e.target.value)
                        }
                        disabled={isPaid || loading}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={1.75}>
                      <TextField
                        id="shipping-height"
                        label="Höhe (cm)"
                        value={sale.shippingDimensions?.height ?? ""}
                        sx={compactDimensionFieldStyle}
                        onChange={(e) =>
                          updateShippingDimension("height", e.target.value)
                        }
                        disabled={isPaid || loading}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={1.75}>
                      <TextField
                        id="shipping-weight"
                        label="Gewicht (kg)"
                        value={weightInput}
                        disabled={isPaid || loading}
                        sx={compactDimensionFieldStyle}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9,]/g, "");

                          setWeightInput(value);
                        }}
                        onBlur={() => {
                          const parsed = parseFloat(
                            weightInput.replace(",", "."),
                          );

                          setSale((prev) => ({
                            ...prev,
                            shippingDimensions: {
                              ...prev.shippingDimensions,
                              weight: isNaN(parsed)
                                ? null
                                : Number(parsed.toFixed(3)),
                            },
                          }));

                          if (!isNaN(parsed)) {
                            setWeightInput(parsed.toFixed(3).replace(".", ","));
                          }
                        }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>

            {/* Artikeln_Tabelle */}
            <Box
              sx={{
                minHeight: 200,
                overflowY: "auto",
                mb: 2,
                mt: 2,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Table size="small">
                <StyledTableHead>
                  <TableRow>
                    <TableCell sx={{ ...fixedCellWidth(65), fontSize: "12px" }}>
                      Pos
                    </TableCell>
                    <TableCell sx={fixedCellWidth(110)}>Artikel</TableCell>
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
                  {sale.salesItems.map((item, index) => (
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
                                disabled={index === 0 || loading || isPaid}
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
                                  index === sale.salesItems.length - 1 ||
                                  loading ||
                                  isPaid
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

                      {/* Artikel */}
                      <TableCell sx={{ ...cellStyle, ...fixedCellWidth(110) }}>
                        {item.productArticle}
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
                          value={item.productName}
                          disabled={isPaid || loading}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "productName",
                              e.target.value,
                            )
                          }
                          slotProps={{ input: { disableUnderline: true } }}
                          sx={saleTableNameInputStyle}
                        />
                      </TableCell>

                      {/* Menge */}
                      <TableCell sx={{ ...cellStyle, ...fixedCellWidth(75) }}>
                        <CompactNumberCell
                          value={item.quantity}
                          min={0}
                          step={1}
                          disabled={isPaid || loading}
                          error={Boolean(itemErrors[index]?.quantity)}
                          errorText={itemErrors[index]?.quantity}
                          onChange={(value) =>
                            handleItemChange(index, "quantity", value)
                          }
                        />
                      </TableCell>

                      {/* Preis */}
                      <TableCell sx={{ ...cellStyle, ...fixedCellWidth(90) }}>
                        <CompactNumberCell
                          value={item.unitPrice}
                          min={0}
                          step={0.01}
                          disabled={isPaid || loading}
                          error={Boolean(itemErrors[index]?.unitPrice)}
                          errorText={itemErrors[index]?.unitPrice}
                          onChange={(value) =>
                            handleItemChange(index, "unitPrice", value)
                          }
                        />
                      </TableCell>

                      {/* Rabatt */}
                      <TableCell sx={{ ...cellStyle, ...fixedCellWidth(65) }}>
                        <CompactNumberCell
                          value={item.discount ?? 0}
                          min={0}
                          max={100}
                          step={1}
                          disabled={isPaid || loading}
                          error={Boolean(itemErrors[index]?.discount)}
                          errorText={itemErrors[index]?.discount}
                          onChange={(value) =>
                            handleItemChange(index, "discount", value)
                          }
                        />
                      </TableCell>

                      {/* Netto */}
                      <TableCell
                        sx={{ ...rightCellStyle, ...fixedCellWidth(90) }}
                      >
                        {formatNumber(item.totalPrice)}
                      </TableCell>

                      {/* MWSt */}
                      <TableCell sx={{ ...cellStyle, ...fixedCellWidth(65) }}>
                        <CompactNumberCell
                          value={item.tax ?? 0}
                          min={0}
                          max={100}
                          step={1}
                          disabled={isPaid || loading}
                          error={Boolean(itemErrors[index]?.tax)}
                          errorText={itemErrors[index]?.tax}
                          onChange={(value) =>
                            handleItemChange(index, "tax", value)
                          }
                        />
                      </TableCell>

                      {/* MWSt Betrag */}
                      <TableCell
                        sx={{ ...rightCellStyle, ...fixedCellWidth(90) }}
                      >
                        {formatNumber(item.taxAmount)}
                      </TableCell>

                      <TableCell
                        sx={{ ...actionCellStyle, ...fixedCellWidth(40) }}
                      >
                        <Tooltip title="Löschen" arrow>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveItem(index)}
                              disabled={isPaid || loading}
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

                  {sale.salesItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} align="center">
                        Keine Artikel vorhanden
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {errors.salesItems && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    ml: 0.5,
                  }}
                >
                  {errors.salesItems}
                </Typography>
              )}
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
                    isPaid ||
                    loading ||
                    !sale.customerId ||
                    !sale.salesDate ||
                    !sale.termsOfPaymentId ||
                    sale.salesItems.length === 0
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

                <Typography>Netto: {formatNumber(subtotal)} €</Typography>

                <Typography>MWSt: {formatNumber(taxSum)} €</Typography>

                <Typography variant="h6" fontWeight="bold">
                  Gesamtbetrag: {formatNumber(total)} €
                </Typography>
              </Box>
            </Box>

            {!isPaid && (
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
                  {productsPickLoading && (
                    <Box
                      sx={{
                        p: 1,
                        textAlign: "center",
                        color: "#00acc1",
                      }}
                    >
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
                              {formatNumber(product.sellingPrice)}
                            </TableCell>
                          </TableRow>
                        ))}

                      {canSearchProducts &&
                        !productsPickLoading &&
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
            )}
          </Paper>
        </Grid>
      </Grid>
      <Dialog
        open={overpaymentDialogOpen}
        onClose={() => {
          if (!loading) setOverpaymentDialogOpen(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Überzahlung festgestellt</DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Durch die Änderung des Auftrags entsteht eine Überzahlung.
          </DialogContentText>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography>
              Neuer Auftragsbetrag: <strong>{formatMoney(total)}</strong>
            </Typography>

            <Typography>
              Bereits bezahlt: <strong>{formatMoney(totalPaid)}</strong>
            </Typography>

            <Typography color="error" fontWeight="bold">
              Überzahlung: {formatMoney(overpayment)}
            </Typography>
          </Box>

          <DialogContentText sx={{ mt: 2 }}>
            Möchten Sie den Auftrag trotzdem speichern?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOverpaymentDialogOpen(false)}
            disabled={loading}
          >
            Abbrechen
          </Button>

          <Button
            variant="contained"
            disabled={loading}
            onClick={async () => {
              setOverpaymentDialogOpen(false);
              await saveSale();
            }}
          >
            Trotzdem speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
