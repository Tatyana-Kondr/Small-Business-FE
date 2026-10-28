import { useEffect, useMemo, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Autocomplete,
  Grid,
  InputAdornment,
  InputLabel,
  Tooltip,
  SelectChangeEvent,
  CircularProgress,
  FormHelperText,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import {
  ClearIcon,
  DatePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { deDE } from "@mui/x-date-pickers/locales";

import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/de";

import {
  NewSaleDto,
  NewShippingDimensionsDto,
  CreateSaleFormDto,
  SaleFormItem,
} from "../types";

import { ProductPickDto } from "../../products/types";

import {
  getCustomersPickListWithCustomerNumber,
  selectCustomersPickListWithNumber,
  selectLoadingPick,
} from "../../customers/customersSlice";

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

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";

import CreateCustomer from "../../customers/components/CreateCustomer";

import { handleApiError } from "../../../utils/errors/handleApiError";
import { showSuccessToast } from "../../../utils/toast";

import {
  clearFieldError,
  FormErrors,
  hasErrors,
  isBackendValidationErrors,
  validateRequiredFields,
} from "../../../utils/validation/validation";

import { translateValidationMessage } from "../../../utils/validation/validationMessages";

import {
  validatePercentage,
  validatePrice,
  validateQuantity,
} from "../../../utils/validation/numberValidation";

import { getShippings, selectShippings } from "../shippingsSlice";

import { getTermsOfPayment, selectTermsOfPayment } from "../termOfPaymentSlice";

import { getActiveTaxRates, selectTaxRates } from "../taxRatesSlice";

import {
  getActiveDiscountRates,
  selectDiscountRates,
} from "../discountRatesSlice";

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

import {
  dateFieldStyle,
  compactDimensionFieldStyle,
} from "../../../styles/formStyles";

import { sectionTitleStyle } from "../../../styles/typographyStyles";

import {
  addButtonStyle,
  primaryButtonStyle,
} from "../../../styles/buttonStyles";

import { colors } from "../../../styles/colors";

import CompactNumberCell from "../../../components/CompactNumberCell";
import DraggableDialog from "../../../components/DraggableDialog";
import DialogTitleText from "../../../components/DialogTitleText";
import { addSale } from "../salesSlice";
import { formatNumber } from "../../../utils/formatNumber";

const typeOptions = ["VERKAUF", "KUNDENERSTATTUNG"] as const;

type SaleType = (typeof typeOptions)[number];

type SaleItemErrors = {
  quantity?: string;
  unitPrice?: string;
  discount?: string;
  tax?: string;
};

type CreateSaleModalProps = {
  onClose: () => void;
  onSubmitSuccess?: () => void;
};

export default function CreateSaleModal({
  onClose,
  onSubmitSuccess,
}: CreateSaleModalProps) {
  const dispatch = useAppDispatch();

  const today = dayjs();
  const todayString = today.format("YYYY-MM-DD");

  const customersPickWithNumber = useAppSelector(
    selectCustomersPickListWithNumber,
  );
  const customersPickLoading = useAppSelector(selectLoadingPick);
  const categories = useAppSelector(selectProductCategories);
  const shippings = useAppSelector(selectShippings);
  const termsOfPayment = useAppSelector(selectTermsOfPayment);
  const pickProducts = useAppSelector(selectPickProducts);
  const productsPickLoading = useAppSelector(selectPickLoading);
  const taxRates = useAppSelector(selectTaxRates);
  const discountRates = useAppSelector(selectDiscountRates);

  //--- FORM STATE ---//

  const [newSale, setNewSale] = useState<CreateSaleFormDto>({
    customerId: 0,
    invoiceNumber: "",
    accountObject: "",
    typeOfOperation: "VERKAUF",
    shippingId: null,
    termsOfPaymentId: 4,
    salesDate: todayString,
    orderNumber: "",
    orderType: "",
    deliveryDate: todayString,
    deliveryBill: "",
    salesItems: [],
  });

  const [defaultTax, setDefaultTax] = useState(0);
  const [defaultDiscount, setDefaultDiscount] = useState(0);
  const [dateValue, setDateValue] = useState<Dayjs | null>(today);
  const [deliveryDateValue, setDeliveryDateValue] = useState<Dayjs | null>(
    today,
  );
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors<NewSaleDto>>({});
  const [itemErrors, setItemErrors] = useState<Record<number, SaleItemErrors>>(
    {},
  );

  const canSearchProducts =
    selectedCategory !== null || searchTerm.trim().length >= 2;

  //--- INITIAL DATA ---//

  useEffect(() => {
    dispatch(clearPickProducts());

    dispatch(getProductCategories());
    dispatch(getShippings());
    dispatch(getTermsOfPayment());
    dispatch(getActiveTaxRates());
    dispatch(getActiveDiscountRates());

    dispatch(getCustomersPickListWithCustomerNumber())
      .unwrap()
      .catch((error) => handleApiError(error, "Fehler beim Laden der Kunden"));
  }, [dispatch]);

  //--- DEFAULT TAX ---//

  useEffect(() => {
    if (!taxRates.length) {
      return;
    }

    const standardTaxRate = taxRates.find((taxRate) => taxRate.defaultRate);

    if (standardTaxRate) {
      setDefaultTax(standardTaxRate.value);
    }
  }, [taxRates]);

  //--- PRODUCT SEARCH ---//

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

  //--- MONEY ---//

  const roundMoney = (value: number): number =>
    Math.round((value + Number.EPSILON) * 100) / 100;

  //--- APPLY DEFAULT TAX TO ALL ITEMS ---//

  useEffect(() => {
    setNewSale((prev) => {
      const updatedItems = prev.salesItems.map((item) => {
        const quantity = Number.isFinite(Number(item.quantity))
          ? Number(item.quantity)
          : 0;

        const unitPrice = Number.isFinite(Number(item.unitPrice))
          ? Number(item.unitPrice)
          : 0;

        const discount = Number.isFinite(Number(item.discount))
          ? Number(item.discount)
          : 0;

        const priceBeforeDiscount = roundMoney(quantity * unitPrice);
        const discountAmount = roundMoney(
          (priceBeforeDiscount * discount) / 100,
        );
        const totalPrice = roundMoney(priceBeforeDiscount - discountAmount);
        const taxAmount = roundMoney((totalPrice * defaultTax) / 100);
        const totalAmount = roundMoney(totalPrice + taxAmount);

        return {
          ...item,
          tax: defaultTax,
          discountAmount,
          totalPrice,
          taxAmount,
          totalAmount,
        };
      });

      return {
        ...prev,
        salesItems: updatedItems,
      };
    });
  }, [defaultTax]);

  //--- APPLY DEFAULT DISCOUNT TO ALL ITEMS ---//

  useEffect(() => {
    setNewSale((prev) => {
      const updatedItems = prev.salesItems.map((item) => {
        const quantity = Number.isFinite(Number(item.quantity))
          ? Number(item.quantity)
          : 0;

        const unitPrice = Number.isFinite(Number(item.unitPrice))
          ? Number(item.unitPrice)
          : 0;

        const tax = Number.isFinite(Number(item.tax)) ? Number(item.tax) : 0;

        const priceBeforeDiscount = roundMoney(quantity * unitPrice);

        const discountAmount = roundMoney(
          (priceBeforeDiscount * defaultDiscount) / 100,
        );

        const totalPrice = roundMoney(priceBeforeDiscount - discountAmount);

        const taxAmount = roundMoney((totalPrice * tax) / 100);

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
        salesItems: updatedItems,
      };
    });
  }, [defaultDiscount]);

  //--- TOTALS ---//

  const { subtotalBeforeDiscount, subtotal, discountAmount, taxSum, total } =
    useMemo(() => {
      let subtotalBeforeDiscount = 0;
      let subtotal = 0;
      let discountAmount = 0;
      let taxSum = 0;
      let total = 0;

      for (const item of newSale.salesItems) {
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
    }, [newSale.salesItems]);

  //--- CUSTOMER ---//

  const handleCreateNewCustomer = () => {
    setShowCreateCustomer(true);
  };

  //--- ITEMS ---//

  const handleAddProductToCart = (product: ProductPickDto) => {
    setNewSale((prev) => {
      const quantity = 1;

      const unitPrice = roundMoney(Number(product.sellingPrice) || 0);

      const discount = defaultDiscount;

      const tax = defaultTax;

      const priceBeforeDiscount = roundMoney(quantity * unitPrice);

      const discountAmount = roundMoney((priceBeforeDiscount * discount) / 100);

      const totalPrice = roundMoney(priceBeforeDiscount - discountAmount);

      const taxAmount = roundMoney((totalPrice * tax) / 100);

      const totalAmount = roundMoney(totalPrice + taxAmount);

      const item: SaleFormItem = {
        position: prev.salesItems.length + 1,

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

      return {
        ...prev,
        salesItems: [...prev.salesItems, item],
      };
    });

    setErrors((prev) => clearFieldError(prev, "salesItems"));
  };

  const handleRemoveItem = (index: number) => {
    setNewSale((prev) => {
      const updatedItems = prev.salesItems
        .filter((_, i) => i !== index)
        .map((item, itemIndex) => ({
          ...item,
          position: itemIndex + 1,
        }));

      if (updatedItems.length === 0) {
        setErrors((current) => ({
          ...current,
          salesItems: "Bitte mindestens einen Artikel hinzufügen.",
        }));
      }

      return {
        ...prev,
        salesItems: updatedItems,
      };
    });

    setItemErrors((prev) => {
      const updatedErrors: Record<number, SaleItemErrors> = {};

      Object.entries(prev).forEach(([key, rowErrors]) => {
        const currentIndex = Number(key);

        if (currentIndex < index) {
          updatedErrors[currentIndex] = rowErrors;
        }

        if (currentIndex > index) {
          updatedErrors[currentIndex - 1] = rowErrors;
        }
      });

      return updatedErrors;
    });
  };

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newSale.salesItems.length) {
      return;
    }

    setNewSale((prev) => {
      const updatedItems = [...prev.salesItems];

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
        salesItems: reorderedItems,
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

  //--- ITEM VALIDATION ---//

  const validateSaleItems = (): boolean => {
    if (newSale.salesItems.length === 0) {
      setErrors((prev) => ({
        ...prev,
        salesItems: "Bitte mindestens einen Artikel hinzufügen.",
      }));

      setItemErrors({});

      return false;
    }

    const newItemErrors: Record<number, SaleItemErrors> = {};

    newSale.salesItems.forEach((item, index) => {
      const rowErrors: SaleItemErrors = {};

      const quantityError = validateQuantity(Number(item.quantity));

      if (quantityError) {
        rowErrors.quantity = quantityError;
      }

      const unitPriceError = validatePrice(Number(item.unitPrice));

      if (unitPriceError) {
        rowErrors.unitPrice = unitPriceError;
      }

      const discountError = validatePercentage(Number(item.discount));

      if (discountError) {
        rowErrors.discount = discountError;
      }

      const taxError = validatePercentage(Number(item.tax));

      if (taxError) {
        rowErrors.tax = taxError;
      }

      if (Object.keys(rowErrors).length > 0) {
        newItemErrors[index] = rowErrors;
      }
    });

    setItemErrors(newItemErrors);

    return Object.keys(newItemErrors).length === 0;
  };

  const clearItemError = (index: number, field: keyof SaleItemErrors) => {
    setItemErrors((prev) => {
      if (!prev[index]?.[field]) {
        return prev;
      }

      const updated = { ...prev };

      const rowErrors = {
        ...updated[index],
      };

      delete rowErrors[field];

      if (Object.keys(rowErrors).length === 0) {
        delete updated[index];
      } else {
        updated[index] = rowErrors;
      }

      return updated;
    });
  };

  //--- ITEM CHANGE ---//

  const handleItemChange = (
    index: number,
    field: keyof SaleFormItem,
    value: string | number,
  ) => {
    setNewSale((prev) => {
      const updatedItems = [...prev.salesItems];

      const currentItem: SaleFormItem = {
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

      const tax = Number.isFinite(Number(currentItem.tax))
        ? Number(currentItem.tax)
        : 0;

      const priceBeforeDiscount = roundMoney(quantity * unitPrice);

      const discountAmount = roundMoney((priceBeforeDiscount * discount) / 100);

      const totalPrice = roundMoney(priceBeforeDiscount - discountAmount);

      const taxAmount = roundMoney((totalPrice * tax) / 100);

      const totalAmount = roundMoney(totalPrice + taxAmount);

      currentItem.quantity = quantity;
      currentItem.unitPrice = unitPrice;
      currentItem.discount = discount;
      currentItem.discountAmount = discountAmount;
      currentItem.totalPrice = totalPrice;
      currentItem.tax = tax;
      currentItem.taxAmount = taxAmount;
      currentItem.totalAmount = totalAmount;

      updatedItems[index] = currentItem;

      return {
        ...prev,
        salesItems: updatedItems,
      };
    });
  };

  //--- BACKEND VALIDATION ---//

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

  //--- SUBMIT ---//

  const handleSubmit = async () => {
    if (loading) {
      return;
    }

    const validationErrors = validateRequiredFields(
      {
        customerId: newSale.customerId,
        salesDate: newSale.salesDate,
        termsOfPaymentId: newSale.termsOfPaymentId,
      },
      ["customerId", "salesDate", "termsOfPaymentId"],
    );

    if (newSale.salesDate && dayjs(newSale.salesDate).isAfter(dayjs(), "day")) {
      validationErrors.salesDate =
        "Das Auftragsdatum darf nicht in der Zukunft liegen.";
    }

    setErrors(validationErrors);

    const itemsAreValid = validateSaleItems();

    if (hasErrors(validationErrors) || !itemsAreValid) {
      return;
    }

    const dtoToSend: NewSaleDto = {
      customerId: newSale.customerId,
      invoiceNumber: newSale.invoiceNumber,
      accountObject: newSale.accountObject,
      typeOfOperation: newSale.typeOfOperation,
      shippingId: newSale.shippingId,
      shippingDimensions: newSale.shippingDimensions,
      termsOfPaymentId: newSale.termsOfPaymentId,
      salesDate: newSale.salesDate,
      orderNumber: newSale.orderNumber,
      orderType: newSale.orderType,
      deliveryDate: newSale.deliveryDate,
      deliveryBill: newSale.deliveryBill,
      salesItems: newSale.salesItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        tax: item.tax,
      })),
    };

    try {
      setLoading(true);

      await dispatch(addSale(dtoToSend)).unwrap();

      showSuccessToast("Erfolg", "Auftrag erfolgreich erstellt.");

      onSubmitSuccess?.();

      onClose();
    } catch (error) {
      if (applyBackendValidationErrors(error)) {
        return;
      }

      handleApiError(error, "Der Auftrag konnte nicht erstellt werden.");
    } finally {
      setLoading(false);
    }
  };

  //--- SHIPPING DIMENSIONS ---//

  const updateShippingDimension = (
    field: keyof NewShippingDimensionsDto,
    value: string,
  ) => {
    const parsed =
      value.trim() === "" ? null : parseFloat(value.replace(",", "."));

    setNewSale((prev) => ({
      ...prev,

      shippingDimensions: {
        ...prev.shippingDimensions,

        [field]: isNaN(parsed!) ? null : parsed,
      },
    }));
  };

  return (
    <DraggableDialog
      open
      onClose={loading ? undefined : onClose}
      dialogWidth={1410}
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
          <DialogTitleText>Neuer Auftrag</DialogTitleText>
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
      {/* Kunde + Neu + Datum  */}

      <Grid container spacing={2} sx={{ mb: 2, mt: 1 }}>
        {/* Kunde */}
        <Grid item xs={7}>
          <Autocomplete
            fullWidth
            id="customer-autocomplete"
            loading={customersPickLoading}
            disabled={loading}
            options={[...customersPickWithNumber].sort((a, b) =>
              a.name.localeCompare(b.name),
            )}
            getOptionLabel={(option) =>
              option.customerNumber
                ? `${option.name} (${option.customerNumber})`
                : option.name
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_, value) => {
              setNewSale((prev) => ({
                ...prev,
                customerId: value?.id ?? 0,
              }));

              setErrors((prev) => clearFieldError(prev, "customerId"));
            }}
            value={
              customersPickWithNumber.find(
                (customer) => customer.id === newSale.customerId,
              ) ?? null
            }
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
                      {customersPickLoading ? (
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

        {/* Neuer Kunde */}
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
            onClick={handleCreateNewCustomer}
            startIcon={<AddIcon />}
            sx={addButtonStyle}
          >
            Neu
          </Button>
        </Grid>

        {/* Auftragsdatum */}
        <Grid item xs={2}>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="de"
            localeText={
              deDE.components.MuiLocalizationProvider.defaultProps.localeText
            }
          >
            <DatePicker
              label="Auftragsdatum"
              value={dateValue}
              disableFuture
              onChange={(newValue) => {
                setDateValue(newValue);

                const formattedDate = newValue
                  ? newValue.format("YYYY-MM-DD")
                  : "";

                setNewSale((prev) => ({
                  ...prev,
                  salesDate: formattedDate,
                  deliveryDate: prev.deliveryDate || formattedDate,
                }));

                setErrors((prev) => clearFieldError(prev, "salesDate"));

                if (!deliveryDateValue && newValue) {
                  setDeliveryDateValue(newValue);
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  sx: dateFieldStyle,
                  error: Boolean(errors.salesDate),
                  helperText: errors.salesDate,
                  disabled: loading,
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Vorgangsart */}
        <Grid item xs={2}>
          <FormControl fullWidth disabled={loading}>
            <InputLabel id="sale-type-label">Vorgangsart</InputLabel>

            <Select
              id="sale-type"
              labelId="sale-type-label"
              label="Vorgangsart"
              value={newSale.typeOfOperation}
              onChange={(e) =>
                setNewSale((prev) => ({
                  ...prev,
                  typeOfOperation: e.target.value as SaleType,
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
      </Grid>

      {/* ==================== OBJEKT / ZAHLUNG / MWST / RABATT ==================== */}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Objekt */}

        <Grid item xs={4}>
          <FormControl fullWidth>
            <TextField
              id="account-object"
              name="accountObject"
              label="Objekt"
              value={newSale.accountObject ?? ""}
              disabled={loading}
              onChange={(e) =>
                setNewSale((prev) => ({
                  ...prev,
                  accountObject: e.target.value,
                }))
              }
              fullWidth
            />
          </FormControl>
        </Grid>

        {/* Zahlungsbedingung */}

        <Grid item xs={4}>
          <FormControl fullWidth error={Boolean(errors.termsOfPaymentId)}>
            <InputLabel id="terms-of-payment-label">
              Zahlungsbedingung
            </InputLabel>

            <Select
              id="terms-of-payment"
              labelId="terms-of-payment-label"
              label="Zahlungsbedingung"
              value={newSale.termsOfPaymentId || ""}
              disabled={loading}
              onChange={(e: SelectChangeEvent<number>) => {
                const selectedId = Number(e.target.value);

                setNewSale((prev) => ({
                  ...prev,
                  termsOfPaymentId: selectedId,
                }));

                setErrors((prev) => clearFieldError(prev, "termsOfPaymentId"));
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

        {/* Lieferdatum */}
        <Grid item xs={2}>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="de"
            localeText={
              deDE.components.MuiLocalizationProvider.defaultProps.localeText
            }
          >
            <DatePicker
              label="Datum der Lieferung"
              value={deliveryDateValue}
              disabled={loading}
              onChange={(newValue) => {
                setDeliveryDateValue(newValue);

                setNewSale((prev) => ({
                  ...prev,
                  deliveryDate: newValue ? newValue.format("YYYY-MM-DD") : "",
                }));
              }}
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
            <InputLabel id="default-tax-label" htmlFor="default-tax-select">
              MWSt %
            </InputLabel>

            <Select
              id="default-tax-select"
              labelId="default-tax-label"
              label="MWSt %"
              value={defaultTax}
              disabled={loading}
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

        <Grid item xs={1}>
          <FormControl fullWidth>
            <InputLabel
              id="default-discount-label"
              htmlFor="default-discount-select"
            >
              Rabatt %
            </InputLabel>

            <Select
              id="default-discount-select"
              labelId="default-discount-label"
              label="Rabatt %"
              value={defaultDiscount}
              disabled={loading}
              onChange={(e) => {
                const value =
                  typeof e.target.value === "string"
                    ? parseFloat(e.target.value)
                    : e.target.value;

                setDefaultDiscount(value);
              }}
            >
              {discountRates.map((discountRate) => (
                <MenuItem key={discountRate.id} value={discountRate.value}>
                  {discountRate.value}%
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* ==================== BESTELLDATEN ==================== */}

        <Grid item xs={12} md={5}>
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={sectionTitleStyle}>Bestelldaten</Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  id="order-number"
                  label="Bestell-Nr"
                  value={newSale.orderNumber ?? ""}
                  disabled={loading}
                  onChange={(e) =>
                    setNewSale((prev) => ({
                      ...prev,
                      orderNumber: e.target.value,
                    }))
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  id="order-type"
                  label="Bestellart"
                  value={newSale.orderType ?? ""}
                  disabled={loading}
                  onChange={(e) =>
                    setNewSale((prev) => ({
                      ...prev,
                      orderType: e.target.value,
                    }))
                  }
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* ==================== VERSAND & MASSE ==================== */}
        <Grid item xs={12} md={7}>
          <Box sx={{ mb: 2.5, pl: 2 }}>
            <Typography sx={sectionTitleStyle}>Versand & Maße</Typography>
            <Grid container spacing={2}>
              {/* Versand */}
              <Grid item xs={5}>
                <FormControl fullWidth>
                  <InputLabel id="shipping-label">Versand</InputLabel>

                  <Select
                    labelId="shipping-label"
                    label="Versand"
                    value={newSale.shippingId ?? ""}
                    disabled={loading}
                    onChange={(e) =>
                      setNewSale((prev) => ({
                        ...prev,
                        shippingId:
                          e.target.value === "" ? null : Number(e.target.value),
                      }))
                    }
                  >
                    <MenuItem value="">
                      <em>Kein Versand</em>
                    </MenuItem>

                    {shippings.map((shipping) => (
                      <MenuItem key={shipping.id} value={shipping.id}>
                        {shipping.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Maße */}
              <Grid item xs={1.75}>
                <TextField
                  id="shipping-width"
                  label="Breite (cm)"
                  value={newSale.shippingDimensions?.width ?? ""}
                  disabled={loading}
                  sx={compactDimensionFieldStyle}
                  onChange={(e) =>
                    updateShippingDimension("width", e.target.value)
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={1.75}>
                <TextField
                  id="shipping-length"
                  label="Länge (cm)"
                  value={newSale.shippingDimensions?.length ?? ""}
                  disabled={loading}
                  sx={compactDimensionFieldStyle}
                  onChange={(e) =>
                    updateShippingDimension("length", e.target.value)
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={1.75}>
                <TextField
                  id="shipping-height"
                  label="Höhe (cm)"
                  value={newSale.shippingDimensions?.height ?? ""}
                  disabled={loading}
                  sx={compactDimensionFieldStyle}
                  onChange={(e) =>
                    updateShippingDimension("height", e.target.value)
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={1.75}>
                <TextField
                  id="shipping-weight"
                  label="Gewicht (kg)"
                  value={weightInput}
                  disabled={loading}
                  sx={compactDimensionFieldStyle}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9,]/g, "");

                    setWeightInput(value);
                  }}
                  onBlur={() => {
                    const parsed = parseFloat(weightInput.replace(",", "."));

                    setNewSale((prev) => ({
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

      {/* ==================== ARTIKELTABELLE ==================== */}

      <Box
        sx={{
          minHeight: newSale.salesItems.length ? 120 : 80,
          maxHeight: 600,
          overflowY: "auto",
          mb: 2,
          border: `1px solid ${colors.border}`,
        }}
      >
        <Table size="small" sx={tableStyle}>
          <StyledTableHead>
            <TableRow>
              <TableCell
                sx={{
                  ...fixedCellWidth(65),
                  fontSize: "12px",
                }}
              >
                Pos
              </TableCell>

              <TableCell sx={fixedCellWidth(110)}>Artikel</TableCell>

              <TableCell sx={{ width: "40%" }}>Name</TableCell>

              <TableCell sx={fixedCellWidth(75)}>Menge</TableCell>

              <TableCell sx={fixedCellWidth(90)}>Preis</TableCell>

              <TableCell
                sx={{
                  ...fixedCellWidth(75),
                  fontSize: "12px",
                }}
              >
                Rabatt%
              </TableCell>

              <TableCell
                sx={{
                  ...fixedCellWidth(75),
                  fontSize: "12px",
                }}
              >
                MWSt%
              </TableCell>

              <TableCell sx={fixedCellWidth(90)}>Netto</TableCell>

              <TableCell sx={fixedCellWidth(90)}>MWSt</TableCell>

              <TableCell sx={fixedCellWidth(40)} />
            </TableRow>
          </StyledTableHead>

          <TableBody>
            {newSale.salesItems.map((item, index) => (
              <TableRow
                key={`${item.productId}-${index}`}
                sx={tableRowHoverStyle}
              >
                {/* Position + Verschieben */}

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
                            index === newSale.salesItems.length - 1 || loading
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

                <TableCell
                  sx={{
                    ...cellStyle,
                    ...fixedCellWidth(110),
                  }}
                >
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
                    step={1}
                    align="center"
                    onChange={(value) => {
                      handleItemChange(index, "quantity", value);

                      clearItemError(index, "quantity");
                    }}
                    error={Boolean(itemErrors[index]?.quantity)}
                    errorText={itemErrors[index]?.quantity}
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
                    onChange={(value) => {
                      handleItemChange(index, "unitPrice", value);

                      clearItemError(index, "unitPrice");
                    }}
                    error={Boolean(itemErrors[index]?.unitPrice)}
                    errorText={itemErrors[index]?.unitPrice}
                  />
                </TableCell>

                {/* Rabatt */}

                <TableCell
                  sx={{
                    ...cellStyle,
                    ...fixedCellWidth(75),
                  }}
                >
                  <CompactNumberCell
                    value={item.discount}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(value) => {
                      handleItemChange(index, "discount", value);

                      clearItemError(index, "discount");
                    }}
                    error={Boolean(itemErrors[index]?.discount)}
                    errorText={itemErrors[index]?.discount}
                  />
                </TableCell>

                {/* MWSt */}

                <TableCell
                  sx={{
                    ...cellStyle,
                    ...fixedCellWidth(75),
                  }}
                >
                  <CompactNumberCell
                    value={item.tax}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(value) => {
                      handleItemChange(index, "tax", value);

                      clearItemError(index, "tax");
                    }}
                    error={Boolean(itemErrors[index]?.tax)}
                    errorText={itemErrors[index]?.tax}
                  />
                </TableCell>

                {/* Netto */}

                <TableCell
                  sx={{
                    ...rightCellStyle,
                    ...fixedCellWidth(90),
                  }}
                >
                  {Number(item.totalPrice ?? 0).toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>

                {/* MWSt Betrag */}

                <TableCell
                  sx={{
                    ...rightCellStyle,
                    ...fixedCellWidth(90),
                  }}
                >
                  {Number(item.taxAmount ?? 0).toLocaleString("de-DE", {
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

        {errors.salesItems && (
          <Typography
            color="error"
            variant="caption"
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

      {/* ==================== SUMMEN ==================== */}

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
                Rabatt:{" "}
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
            MWSt:{" "}
            {taxSum.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </Typography>

          <Typography variant="h6">
            Gesamtbetrag:{" "}
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
          {productsPickLoading && (
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
                      {product.sellingPrice != null
                        ? formatNumber(product.sellingPrice)
                        : ""}
                    </TableCell>
                  </TableRow>
                ))}

              {!productsPickLoading &&
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

      {/* ==================== CREATE CUSTOMER ==================== */}

      {showCreateCustomer && (
        <CreateCustomer
          mode="customer"
          onClose={() => setShowCreateCustomer(false)}
          onSubmitSuccess={(createdCustomer) => {
            setShowCreateCustomer(false);

            dispatch(getCustomersPickListWithCustomerNumber());

            setNewSale((prev) => ({
              ...prev,
              customerId: createdCustomer.id,
            }));

            setErrors((prev) => clearFieldError(prev, "customerId"));
          }}
        />
      )}
    </DraggableDialog>
  );
}
