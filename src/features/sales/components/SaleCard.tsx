import { useEffect, useMemo, useState } from 'react';
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
} from '@mui/material';
import { Delete as DeleteIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { deDE } from '@mui/x-date-pickers/locales';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { getProductCategories, selectProductCategories } from '../../products/productCategoriesSlice';
import { getPickProducts, getProductsByCategory, selectPickLoading, selectPickProducts } from '../../products/productsSlice';
import { getCustomersPickListWithCustomerNumber, selectCustomersPickListWithNumber, selectLoadingPick } from '../../customers/customersSlice';
import { ProductPickDto } from '../../products/types';
import { handleApiError } from '../../../utils/handleApiError';
import { showSuccessToast } from '../../../utils/toast';
import { NewSaleDto, NewSaleItemDto, NewShippingDimensionsDto, Shipping } from '../types';
import { getSaleById } from '../salesSlice';
import { getShippings, selectShippings } from '../shippingsSlice';
import { getTermsOfPayment, selectTermsOfPayment } from '../termOfPaymentSlice';
import CompactNumberCell from '../../../components/CompactNumberCell';
import { backendErrorsToFormErrors, clearFieldError, FormErrors, hasErrors, isBackendValidationErrors, validateRequiredFields } from '../../../utils/validation/validation';
import { fetchUpdateSale } from '../api';
import { HttpError } from '../../../utils/handleFetchError';
import { formSectionStyle, saleDateFieldStyle } from '../../../styles/formStyles';
import { cancelButtonStyle, primaryButtonStyle } from '../../../styles/buttonStyles';
import { formSaleSectionTitleStyle } from '../../../styles/typographyStyles';
import { fixedCellWidth, saleTableCellStyle, saleTableCenterCellStyle, saleTableDeleteCellStyle, saleTableNameCellStyle, saleTableNameInputStyle, saleTableRightCellStyle, StyledTableHead, tableRowHoverStyle } from '../../../styles/tableStyles';
import { colors } from '../../../styles/colors';
import { formatNumber } from '../../../utils/formatNumber';


const typeOptions = ['VERKAUF', 'KUNDENERSTATTUNG'] as const;
type SaleType = typeof typeOptions[number];

export default function SaleCard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { saleId } = useParams<{ saleId: string }>();
  const id = Number(saleId);

  const [sale, setSale] = useState<NewSaleDto>({
    customerId: 0,
    customerName: '',
    invoiceNumber: '',
    accountObject: '',
    typeOfOperation: 'VERKAUF',
    shippingId: null,
    shippingDimensions: {
      width: null,
      height: null,
      length: null,
      weight: null
    },
    termsOfPaymentId: 0,
    salesDate: '',
    paymentStatus: '',
    paymentDate: '',
    orderNumber: '',
    orderType: '',
    deliveryDate: '',
    deliveryBill: '',
    defaultTax: 19,
    defaultDiscount: 0,
    salesItems: [],
  });

  const [dateValue, setDateValue] = useState<Dayjs | null>(null);
  const customersPickWithNumber = useAppSelector(selectCustomersPickListWithNumber);
  const customersPickLoading = useAppSelector(selectLoadingPick);
  const categories = useAppSelector(selectProductCategories);
  const pickProducts = useAppSelector(selectPickProducts);
  const productsPickLoading = useAppSelector(selectPickLoading);
  const shippings = useAppSelector(selectShippings);
  const termsOfPayment = useAppSelector(selectTermsOfPayment);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<Shipping | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [weightInput, setWeightInput] = useState("");
  const [deliveryDateValue, setDeliveryDateValue] = useState<Dayjs | null>(sale.deliveryDate ? dayjs(sale.deliveryDate) : null);
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  const [errors, setErrors] = useState<FormErrors<NewSaleDto>>({});
  const [loading, setLoading] = useState(false);

  const isPaid = sale.paymentStatus === "BEZAHLT";
  const formattedPaymentDate = sale.paymentDate ? dayjs(sale.paymentDate).format("DD.MM.YYYY") : null;

  // 1. Загружаем данные продажи и справочники
  useEffect(() => {
    dispatch(getTermsOfPayment());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getCustomersPickListWithCustomerNumber())
      .unwrap()
      .catch(error => handleApiError(error, "Fehler beim Laden der Kunden."));
  }, [dispatch]);


  useEffect(() => {
    dispatch(getSaleById(Number(saleId)))
      .unwrap()
      .then(s => {
        console.log("SALE FROM BACKEND:", s);

        setSale({
          customerId: s.customerId,
          customerName: s.customerName,
          invoiceNumber: s.invoiceNumber,
          accountObject: s.accountObject,
          typeOfOperation: s.typeOfOperation,
          shippingId: s.shippingId,
          shippingDimensions: s.shippingDimensions ?? {
            width: null,
            height: null,
            length: null,
            weight: null
          },
          termsOfPaymentId: s.termsOfPayment?.id ?? 0,
          salesDate: s.salesDate,
          paymentStatus: s.paymentStatus,
          paymentDate: s.paymentDate,
          orderNumber: s.orderNumber,
          orderType: s.orderType,
          deliveryDate: s.deliveryDate,
          deliveryBill: s.deliveryBill,
          defaultTax: s.defaultTax,
          defaultDiscount: s.defaultDiscount,
          salesItems: s.saleItems
        });
        setDateValue(s.salesDate ? dayjs(s.salesDate) : null);
        setDeliveryDateValue(s.deliveryDate ? dayjs(s.deliveryDate) : null);
      })
      .catch(error => handleApiError(error, "Fehler beim Laden des Auftrags."));

    dispatch(getShippings());
    dispatch(getProductCategories());
  }, [dispatch, saleId]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(
      getPickProducts({
        searchTerm: debouncedTerm,
        categoryId: selectedCategory ?? null,
        limit: 50,
      })
    );
  }, [dispatch, debouncedTerm, selectedCategory]);


  // 3. Автоматическая подстановка Versand после загрузки shippings + sale
  useEffect(() => {
    if (shippings.length && sale.shippingId) {
      const shipping = shippings.find(s => s.id === sale.shippingId) || null;
      setSelectedShipping(shipping);
    }
  }, [shippings, sale.shippingId]);

  useEffect(() => {
    if (sale.shippingDimensions && sale.shippingDimensions.weight != null) {
      setWeightInput(sale.shippingDimensions.weight.toFixed(3).replace(".", ","));
    } else {
      setWeightInput("");
    }
  }, [sale.shippingDimensions?.weight]);

  const recalcAllItems = (
    items: NewSaleItemDto[],
    field: "tax" | "discount",
    value: number
  ): NewSaleItemDto[] => {
    return items.map(item => {

      // обновляем только tax или только discount
      const tax = field === "tax" ? value : item.tax ?? 0;
      const discount = field === "discount" ? value : item.discount ?? 0;

      const quantity = item.quantity ?? 0;
      const unitPrice = item.unitPrice ?? 0;

      const subTotal = quantity * unitPrice;
      const discountAmount = (subTotal * discount) / 100;
      const totalPrice = subTotal - discountAmount;

      const taxAmount = (totalPrice * tax) / 100;
      const totalAmount = totalPrice + taxAmount;

      return {
        ...item,
        tax,
        discount,
        discountAmount: Number(discountAmount.toFixed(2)),
        totalPrice: Number(totalPrice.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2)),
      };
    });
  };

  useEffect(() => {
    setSale(prev => ({
      ...prev,
      salesItems: recalcAllItems(prev.salesItems, "tax", prev.defaultTax)
    }));
  }, [sale.defaultTax]);

  useEffect(() => {
    setSale(prev => ({
      ...prev,
      salesItems: recalcAllItems(prev.salesItems, "discount", prev.defaultDiscount)
    }));
  }, [sale.defaultDiscount]);

  useEffect(() => {
    if (sale.invoiceNumber) {
      const parts = sale.invoiceNumber.split("-");
      if (parts.length === 3) {
        const [, year, number] = parts;
        const newDeliveryBill = `LF-${year}-${number}`;
        setSale(prev => ({
          ...prev,
          deliveryBill: newDeliveryBill,
        }));
      }
    }
  }, [sale.invoiceNumber]);

  useEffect(() => {
    if (selectedCategory !== null) {
      dispatch(getProductsByCategory({ categoryId: selectedCategory, page: 0, size: 100 }));
    }
  }, [dispatch, selectedCategory]);

  useEffect(() => {
    setSearchTerm('');
  }, [selectedCategory]);

  const { subtotal, taxSum, total } = useMemo(() => {
    if (!sale.salesItems || sale.salesItems.length === 0) {
      return { subtotal: 0, taxSum: 0, total: 0 };
    }

    let subtotal = 0;
    let taxSum = 0;
    let total = 0;

    for (const item of sale.salesItems) {
      subtotal += item.totalPrice;
      taxSum += item.taxAmount;
      total += item.totalAmount;
    }

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxSum: parseFloat(taxSum.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }, [sale.salesItems]);


  const handleAddProductToCart = (
    product: ProductPickDto
  ) => {
    setSale((prev) => {
      const quantity = 1;
      const unitPrice = Number(
        product.sellingPrice ?? 0
      );

      const totalBeforeDiscount =
        roundMoney(quantity * unitPrice);

      const discount = prev.defaultDiscount;

      const discountAmount = roundMoney(
        (totalBeforeDiscount * discount) / 100
      );

      const totalPrice = roundMoney(
        totalBeforeDiscount - discountAmount
      );

      const tax = prev.defaultTax;

      const taxAmount = roundMoney(
        (totalPrice * tax) / 100
      );

      const totalAmount = roundMoney(
        totalPrice + taxAmount
      );

      const item: NewSaleItemDto = {
        position: prev.salesItems.length + 1,
        saleId: id,
        productId: product.id,
        productArticle: product.article,
        productName: product.name,
        quantity,
        unitPrice,
        totalPrice,
        discount,
        discountAmount,
        tax,
        taxAmount,
        totalAmount,
      };

      return {
        ...prev,
        salesItems: [
          ...prev.salesItems,
          item,
        ],
      };
    });

    setErrors((prev) =>
      clearFieldError(prev, "salesItems")
    );
  };


  const handleRemoveItem = (index: number) => {
    setSale(prev => ({
      ...prev,
      salesItems: prev.salesItems.filter((_, i) => i !== index),
    }));
  };

  const recalculateItem = (item: NewSaleItemDto): NewSaleItemDto => {
    const quantity = item.quantity ?? 0;
    const unitPrice = item.unitPrice ?? 0;
    const discount = item.discount ?? 0;
    const tax = item.tax ?? 0;
    const subTotalPrice = quantity * unitPrice;

    const discountAmount = (subTotalPrice * discount) / 100;
    const totalPrice = subTotalPrice - discountAmount;
    const taxAmount = (totalPrice * tax) / 100;
    const totalAmount = totalPrice + taxAmount;

    return {
      ...item,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    };
  };

  const updateShippingDimension = (
    field: keyof NewShippingDimensionsDto,
    value: string
  ) => {
    const parsed = value.trim() === '' ? null : parseFloat(value.replace(',', '.'));

    setSale(prev => ({
      ...prev,
      shippingDimensions: {
        ...prev.shippingDimensions,
        [field]: isNaN(parsed!) ? null : parsed,
      },
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof NewSaleItemDto,
    value: string | number
  ) => {
    setSale((prevSale) => {
      const updatedItems = [...prevSale.salesItems];
      const currentItem = { ...updatedItems[index] };

      if (field === 'tax' || field === 'quantity' || field === 'unitPrice') {
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
  };

  const roundMoney = (value: number): number => {
    return Number(value.toFixed(2));
  };

  const handleSubmit = async () => {
    const validationErrors = validateRequiredFields(sale, [
      "customerId",
      "salesDate",
      "termsOfPaymentId",
    ]);

    if (!sale.salesItems.length) {
      validationErrors.salesItems =
        "Bitte mindestens einen Artikel hinzufügen.";
    }

    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    setLoading(true);

    try {
      const updatedSaleItems = sale.salesItems.map(
        (item, index) => ({
          ...item,
          position: index + 1,

          unitPrice: roundMoney(
            Number(item.unitPrice)
          ),

          discountAmount: roundMoney(
            Number(item.discountAmount)
          ),

          totalPrice: roundMoney(
            Number(item.totalPrice)
          ),

          taxAmount: roundMoney(
            Number(item.taxAmount)
          ),

          totalAmount: roundMoney(
            Number(item.totalAmount)
          ),
        })
      );

      const updatedSaleToSend: NewSaleDto = {
        ...sale,
        paymentDate: sale.paymentDate,
        salesItems: updatedSaleItems,
      };

      await fetchUpdateSale(id, updatedSaleToSend);

      showSuccessToast(
        "Erfolg",
        "Auftrag erfolgreich aktualisiert."
      );

      navigate("/sales");

    } catch (error) {
      if (
        error instanceof HttpError &&
        isBackendValidationErrors(error.data)
      ) {
        setErrors(
          backendErrorsToFormErrors<NewSaleDto>(
            error.data.errors
          )
        );

        return;
      }

      handleApiError(
        error,
        "Der Auftrag konnte nicht aktualisiert werden."
      );

    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer =
    customersPickWithNumber.find(c => c.id === sale.customerId)
    ?? (sale.customerName
      ? { id: sale.customerId, name: sale.customerName, customerNumber: null }
      : null);

  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      <Grid container spacing={3} sx={{ p: 2 }}>
        {/* форма и добавленные товары */}
        <Grid item xs={12} md={12}>
          <Paper elevation={3} sx={{ p: 3 }}>

            {isPaid && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Dieser Auftrag ist bereits bezahlt
                {formattedPaymentDate ? ` am ${formattedPaymentDate}.` : "."}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ color: "#0277bd", fontWeight: "bold" }}>
                {`Auftrag Nr. ${id} `}
              </Typography>

              <Grid item xs={3} sx={{ pl: 2, pb: 2, pt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="typeOfOperation-label">Art der Operation</InputLabel>
                  <Select
                    labelId="typeOfOperation-label"
                    value={sale.typeOfOperation}
                    label="Art der Operation"
                    onChange={(e) => setSale({ ...sale, typeOfOperation: e.target.value as SaleType })}
                    disabled={isPaid} // блокируем если BEZAHLT
                  >
                    {typeOptions.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              {/* Kunde */}
              <Grid item xs={6}>
                <Autocomplete
                  fullWidth
                  loading={customersPickLoading}
                  options={[...customersPickWithNumber].sort((a, b) => a.name.localeCompare(b.name))}
                  getOptionLabel={(option) =>
                    option.customerNumber ? `${option.name} (${option.customerNumber})` : option.name
                  }
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={selectedCustomer}
                  onChange={(_, value) => {
                    setSale((prev) => ({
                      ...prev,
                      customerId: value?.id ?? 0,
                    }));

                    setErrors((prev) =>
                      clearFieldError(prev, "customerId")
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Kunde"
                      error={Boolean(errors.customerId)}
                      helperText={errors.customerId}
                      disabled={isPaid || loading}
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
                  disabled={isPaid || loading}
                />

              </Grid>
              {/* Datum */}
              <Grid item xs={3}>
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="de"
                  localeText={deDE.components.MuiLocalizationProvider.defaultProps.localeText}
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

                      setErrors((prev) =>
                        clearFieldError(prev, "salesDate")
                      );
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        sx: saleDateFieldStyle,
                        error: Boolean(errors.salesDate),
                        helperText: errors.salesDate,
                      },
                    }}
                    disabled={isPaid || loading}
                  />
                </LocalizationProvider>
              </Grid>
              {/* Rechnung */}
              <Grid item xs={3}>
                <TextField
                  label="Rechnung"
                  value={sale.invoiceNumber}
                  onChange={(e) => setSale({ ...sale, invoiceNumber: e.target.value })}
                  disabled={isPaid || loading}
                  fullWidth
                />
              </Grid>
            </Grid>

            {/* Details Block */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
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
                  disabled={loading}
                />
              </Grid>

              {/* Zahlungsbedingung */}
              <Grid item xs={4}>
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
                        clearFieldError(
                          prev,
                          "termsOfPaymentId"
                        )
                      );
                    }}
                  >
                    <MenuItem value="">
                      Bitte wählen
                    </MenuItem>

                    {termsOfPayment.map((term) => (
                      <MenuItem key={term.id} value={term.id}>
                        {term.name}
                      </MenuItem>
                    ))}
                  </Select>

                  {errors.termsOfPaymentId && (
                    <FormHelperText>
                      {errors.termsOfPaymentId}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* MWSt */}
              <Grid item xs={2}>
                <FormControl
                  fullWidth
                  disabled={isPaid || loading}
                >
                  <InputLabel id="default-tax-label">
                    MWSt %
                  </InputLabel>

                  <Select
                    labelId="default-tax-label"
                    label="MWSt %"
                    value={sale.defaultTax}
                    onChange={(e) =>
                      setSale((prev) => ({
                        ...prev,
                        defaultTax: Number(e.target.value),
                      }))
                    }
                  >
                    <MenuItem value={0}>0%</MenuItem>
                    <MenuItem value={7}>7%</MenuItem>
                    <MenuItem value={19}>19%</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Rabatt */}
              <Grid item xs={2}>
                <FormControl
                  fullWidth
                  disabled={isPaid || loading}
                >
                  <InputLabel id="default-discount-label">
                    Rabatt %
                  </InputLabel>

                  <Select
                    labelId="default-discount-label"
                    label="Rabatt %"
                    value={sale.defaultDiscount}
                    onChange={(e) =>
                      setSale((prev) => ({
                        ...prev,
                        defaultDiscount: Number(e.target.value),
                      }))
                    }
                  >
                    <MenuItem value={0}>0%</MenuItem>
                    <MenuItem value={5}>5%</MenuItem>
                    <MenuItem value={10}>10%</MenuItem>
                    <MenuItem value={15}>15%</MenuItem>
                    <MenuItem value={20}>20%</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* 📦 Versand & Maße Block */}
            <Grid item xs={12}>
              <Paper sx={formSectionStyle}>
                <Typography sx={formSaleSectionTitleStyle}>
                  Versand & Maße
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Autocomplete
                      fullWidth
                      options={[...shippings].sort((a, b) => a.name.localeCompare(b.name))}
                      getOptionLabel={(option) => option.name}
                      value={selectedShipping}
                      onChange={(_, value) => {
                        setSelectedShipping(value);
                        setSale(prev => ({ ...prev, shippingId: value?.id ?? null }));
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Versand" />
                      )}
                    />
                  </Grid>

                  <Grid item xs={8}>
                    <Grid container spacing={2}>
                      <Grid item xs={3}>
                        <TextField
                          id="shipping-width"
                          label="Breite (cm)"
                          value={sale.shippingDimensions?.width ?? ''}
                          onChange={(e) => updateShippingDimension('width', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          id="shipping-length"
                          label="Länge (cm)"
                          value={sale.shippingDimensions?.length ?? ''}
                          onChange={(e) => updateShippingDimension('length', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          id="shipping-height"
                          label="Höhe (cm)"
                          value={sale.shippingDimensions?.height ?? ''}
                          onChange={(e) => updateShippingDimension('height', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          id="shipping-weight"
                          label="Gewicht (kg)"
                          value={weightInput}
                          onChange={(e) => {
                            // разрешаем только цифры и запятую
                            const val = e.target.value.replace(/[^0-9,]/g, "");
                            setWeightInput(val);
                          }}
                          onBlur={() => {
                            // при потере фокуса — преобразуем в число и сохраняем в sale
                            const parsed = parseFloat(weightInput.replace(",", "."));
                            setSale((prev) => ({
                              ...prev,
                              shippingDimensions: {
                                ...prev.shippingDimensions,
                                weight: isNaN(parsed) ? null : Number(parsed.toFixed(3)),
                              },
                            }));
                            // форматируем в поле
                            if (!isNaN(parsed)) {
                              setWeightInput(parsed.toFixed(3).replace(".", ","));
                            }
                          }}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* 📝 Bestellung Block */}
            <Grid item xs={12}>
              <Paper sx={formSectionStyle}>
                <Typography sx={formSaleSectionTitleStyle}>
                  Bestelldaten
                </Typography>
                <Grid container spacing={2}>
                  {/* Lieferschein */}
                  <Grid item xs={3}>
                    <TextField
                      label="Lieferschein"
                      value={sale.deliveryBill}
                      onChange={(e) => setSale({ ...sale, deliveryBill: e.target.value })}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={3}>
                    <LocalizationProvider
                      dateAdapter={AdapterDayjs}
                      adapterLocale="de"
                      localeText={deDE.components.MuiLocalizationProvider.defaultProps.localeText}
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
                        slotProps={{
                          textField: {
                            id: "delivery-date",
                            fullWidth: true,
                            size: "small",
                            sx: saleDateFieldStyle,
                          },
                        }}
                        disabled={loading}
                      />
                    </LocalizationProvider>
                  </Grid>


                  <Grid item xs={3}>
                    <TextField
                      id="order-number"
                      label="Bestell-Nr"
                      value={sale.orderNumber}
                      onChange={(e) => setSale({ ...sale, orderNumber: e.target.value })}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={3}>
                    <TextField
                      id="order-type"
                      label="Bestellart"
                      value={sale.orderType}
                      onChange={(e) => setSale({ ...sale, orderType: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Artikeln_Tabelle */}
            <Box sx={{ minHeight: 200, overflowY: 'auto', mb: 2, border: "1px solid #ddd" }}>
              <Table size="small">
                <StyledTableHead>
                  <TableRow>
                    <TableCell sx={{ ...fixedCellWidth(45), fontSize: "12px" }}>Pos</TableCell>
                    <TableCell sx={fixedCellWidth(110)}>Artikel</TableCell>
                    <TableCell sx={{ width: "40%" }}>Name</TableCell>
                    <TableCell sx={fixedCellWidth(75)}>Menge</TableCell>
                    <TableCell sx={fixedCellWidth(90)}>Preis</TableCell>
                    <TableCell sx={{ ...fixedCellWidth(75), fontSize: "12px" }}>Rabatt%</TableCell>
                    <TableCell sx={{ ...fixedCellWidth(75), fontSize: "12px" }}>MWSt%</TableCell>
                    <TableCell sx={fixedCellWidth(90)}>Netto</TableCell>
                    <TableCell sx={fixedCellWidth(90)}>MWSt</TableCell>
                    <TableCell sx={fixedCellWidth(40)}></TableCell>
                  </TableRow>
                </StyledTableHead>
                <TableBody>
                  {sale.salesItems.map((item, index) => (
                    <TableRow key={index} sx={tableRowHoverStyle}>
                      <TableCell sx={{ ...saleTableCenterCellStyle, ...fixedCellWidth(45), borderLeft: `1px solid ${colors.border}`, }}>{index + 1}</TableCell>
                      <TableCell sx={{ ...saleTableCellStyle, ...fixedCellWidth(110), }}>
                        <TextField
                          variant="standard"
                          value={item.productArticle}
                          onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                          slotProps={{ input: { disableUnderline: true, }, }}
                        />
                      </TableCell>
                      <TableCell sx={{ ...saleTableNameCellStyle, width: "40%", verticalAlign: "middle", py: 1 }}>
                        <TextField
                          variant="standard"
                          multiline
                          minRows={1}
                          maxRows={3}
                          fullWidth
                          value={item.productName}
                          disabled={isPaid}
                          onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                          slotProps={{ input: { disableUnderline: true, }, }}
                          sx={saleTableNameInputStyle}
                        />
                      </TableCell>
                      <TableCell sx={{ ...saleTableCellStyle, ...fixedCellWidth(75), }}>
                        <CompactNumberCell
                          value={item.quantity}
                          disabled={isPaid}
                          min={0}
                          step={1}
                          align="center"
                          onChange={(value) =>
                            handleItemChange(index, "quantity", value)
                          }
                        />
                      </TableCell>
                      <TableCell sx={{ ...saleTableCellStyle, ...fixedCellWidth(90), }}>
                        <CompactNumberCell
                          value={item.unitPrice}
                          disabled={isPaid}
                          min={0}
                          step={0.01}
                          onChange={(value) =>
                            handleItemChange(
                              index,
                              "unitPrice",
                              value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell sx={{ ...saleTableCellStyle, ...fixedCellWidth(75), }}>
                        <CompactNumberCell
                          value={item.discount}
                          disabled={isPaid}
                          min={0}
                          max={100}
                          step={1}
                          onChange={(value) =>
                            handleItemChange(
                              index,
                              "discount",
                              value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell sx={{ ...saleTableCellStyle, ...fixedCellWidth(75), }}>
                        <CompactNumberCell
                          value={item.tax}
                          disabled={isPaid}
                          min={0}
                          max={100}
                          step={1}
                          onChange={(value) =>
                            handleItemChange(
                              index,
                              "tax",
                              value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell sx={{ ...saleTableRightCellStyle, ...fixedCellWidth(90), }}>
                        {item.totalPrice.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell sx={{ ...saleTableRightCellStyle, ...fixedCellWidth(90), }}>
                        {item.taxAmount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell sx={{ ...saleTableDeleteCellStyle, ...fixedCellWidth(40), }}>
                        <Tooltip title="Löschen" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveItem(index)}
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
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sale.salesItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
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
                  onClick={() => navigate("/sales")}
                  sx={cancelButtonStyle}
                  disabled={loading}
                >
                  Abbrechen
                </Button>

                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  sx={primaryButtonStyle}
                  disabled={isPaid || loading}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Aktualisieren"
                  )}
                </Button>
              </Box>

              <Box
                sx={{
                  minWidth: 260,
                  textAlign: "right",
                }}
              >
                <Typography>
                  Netto: {subtotal.toFixed(2)} €
                </Typography>

                <Typography>
                  MWSt: {taxSum.toFixed(2)} €
                </Typography>

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

            {!isPaid && (
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={4}>
                    <FormControl fullWidth>
                      <Select
                        value={selectedCategory || ''}
                        onChange={(e) =>
                          setSelectedCategory(e.target.value ? Number(e.target.value) : null)
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
                            <IconButton onClick={() => setSearchTerm('')}>
                              <ClearIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ maxHeight: 263, overflowY: 'auto', mt: 1, border: "1px solid #ddd" }}>
                  {productsPickLoading && (
                    <Box sx={{ p: 1, textAlign: "center", color: "#00acc1" }}>
                      <CircularProgress size={20} />
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        Produkte werden geladen…
                      </Typography>
                    </Box>
                  )}

                  {!productsPickLoading && pickProducts.length === 0 && (searchTerm.length >= 2 || selectedCategory !== null) && (
                    <Box sx={{ p: 1, textAlign: "center", color: "text.secondary" }}>
                      <Typography variant="caption">
                        Keine Produkte gefunden
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
                      {pickProducts.map(p => (
                        <TableRow key={p.id} sx={tableRowHoverStyle} onDoubleClick={() => handleAddProductToCart(p)}>
                          <TableCell sx={saleTableCellStyle}>{p.name}</TableCell>
                          <TableCell sx={saleTableCellStyle}>{p.article}</TableCell>
                          <TableCell sx={saleTableCellStyle}>{p.vendorArticle ?? ''}</TableCell>
                          <TableCell sx={saleTableRightCellStyle}>
                            {formatNumber(p.sellingPrice ?? 0)}
                          </TableCell>
                        </TableRow>
                      ))}

                      {!productsPickLoading && pickProducts.length === 0 && (
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
      </Grid >
    </Container >
  );
}
