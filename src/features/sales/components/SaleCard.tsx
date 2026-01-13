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
  TableHead,
  TableRow,
  TextField,
  Typography,
  Autocomplete,
  InputLabel,
  Tooltip,
  Alert,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Delete as DeleteIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { deDE } from '@mui/x-date-pickers/locales';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { Customer } from '../../customers/types';
import { getProductCategories, selectProductCategories } from '../../products/productCategoriesSlice';
import { getPickProducts, getProductsByCategory, selectPickLoading, selectPickProducts } from '../../products/productsSlice';
import { getCustomersWithCustomerNumber } from '../../customers/customersSlice';
import { ProductPickDto } from '../../products/types';
import { handleApiError } from '../../../utils/handleApiError';
import { showSuccessToast } from '../../../utils/toast';
import { NewSaleDto, NewSaleItemDto, NewShippingDimensionsDto, Shipping } from '../types';
import { getSaleById, updateSale } from '../salesSlice';
import { getShippings, selectShippings } from '../shippingsSlice';
import { getTermsOfPayment, selectTermsOfPayment } from '../termOfPaymentSlice';
import CompactNumberCell from '../../../components/CompactNumberCell';

const StyledTableHead = styled(TableHead)(({
  backgroundColor: "#1a3d6d",
  "& th": {
    position: "sticky",
    top: 0,
    backgroundColor: "#1a3d6d",
    color: "white",
    fontWeight: "bold",
    borderRight: "1px solid #ddd",
    textAlign: "center",
    zIndex: 1,
  },
}));

const StyledTableRow = styled(TableRow)({
  "&:hover": {
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
  },
  "& td": {
    verticalAlign: "middle", // выравнивание по вертикали
  },
});

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const categories = useAppSelector(selectProductCategories);
  const pickProducts = useAppSelector(selectPickProducts);
  const pickLoading = useAppSelector(selectPickLoading);
  const shippings = useAppSelector(selectShippings);
  const termsOfPayment = useAppSelector(selectTermsOfPayment);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<Shipping | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [weightInput, setWeightInput] = useState("");
  const [deliveryDateValue, setDeliveryDateValue] = useState<Dayjs | null>(
    sale.deliveryDate ? dayjs(sale.deliveryDate) : null
  );
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  const isPaid = sale.paymentStatus === "BEZAHLT";

  // 1. Загружаем данные продажи и справочники
  useEffect(() => {
    dispatch(getTermsOfPayment());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getCustomersWithCustomerNumber({ page: 0, size: 100 }))
      .unwrap()
      .then(c => setCustomers(c.content))
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

  useEffect(() => {
    if (sale.customerId && customers.length > 0) {
      const customer = customers.find(c => c.id === sale.customerId);
      if (customer) {
        // обновит value в Autocomplete
        setSale(prev => ({ ...prev, customerId: customer.id }));
      }
    }
  }, [customers, sale.customerId]);

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


  const handleAddProductToCart = (product: ProductPickDto) => {
    const quantity = 1;
    const unitPrice = Number(product.sellingPrice ?? 0); // если number
    const totalPrice = quantity * unitPrice;

    const discount = sale.defaultDiscount;
    const discountAmount = (totalPrice * discount) / 100;
    const totalPriceWithDiscount = totalPrice - discountAmount;

    const tax = sale.defaultTax;
    const taxAmount = (totalPriceWithDiscount * tax) / 100;
    const totalAmount = totalPriceWithDiscount + taxAmount;

    const item: NewSaleItemDto = {
      position: sale.salesItems.length + 1,
      saleId: 0,
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

    setSale(prev => ({
      ...prev,
      salesItems: [...prev.salesItems, item],
    }));
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

  const handleSubmit = () => {

    if (!sale.salesItems.length) {
      handleApiError(new Error("Der Auftrag enthält keine Artikel."));
      return;
    }

    if (!sale.customerId || !sale.salesDate) {
      handleApiError(new Error("Bitte füllen Sie alle Pflichtfelder korrekt aus."));
      return;
    }

    const updatedSaleItems = sale.salesItems.map((item, index) => ({
      ...item,
      taxPercentage: item.tax ?? 0,
      taxAmount: ((item.unitPrice ?? 0) * (item.quantity ?? 0)) * ((item.tax ?? 0) / 100),
      totalAmount: (item.unitPrice ?? 0) * (item.quantity ?? 0) + (((item.unitPrice ?? 0) * (item.quantity ?? 0)) * ((item.tax ?? 0) / 100)),
      position: index + 1,
    }));

    const updatedSaleToSend: NewSaleDto = {
      customerId: sale.customerId,
      invoiceNumber: sale.invoiceNumber,
      accountObject: sale.accountObject,
      typeOfOperation: sale.typeOfOperation,
      shippingId: sale.shippingId,
      shippingDimensions: sale.shippingDimensions,
      termsOfPaymentId: sale.termsOfPaymentId,
      salesDate: sale.salesDate,
      paymentStatus: sale.paymentStatus,
      paymentDate: sale.paymentDate,
      orderNumber: sale.orderNumber,
      orderType: sale.orderType,
      deliveryDate: sale.deliveryDate,
      deliveryBill: sale.deliveryBill,
      defaultTax: sale.defaultTax,
      defaultDiscount: sale.defaultDiscount,
      salesItems: updatedSaleItems
    };
    console.log("UPDATED SALE TO SEND:", updatedSaleToSend);

    dispatch(updateSale({ id, updatedSale: updatedSaleToSend }))
      .unwrap()
      .then(() => {
        showSuccessToast("Erfolg", "Auftrag erfolgreich aktualisiert");
        navigate('/sales');
      })
      .catch(error => handleApiError(error, "Der Auftrag konnte nicht aktualisiert werden."));
  };

  const selectedCustomer =
    customers.find(c => c.id === sale.customerId)
    ?? (sale.customerName
      ? { id: sale.customerId, name: sale.customerName }
      : null);

  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      <Grid container spacing={3} sx={{ p: 2 }}>
        {/* форма и добавленные товары */}
        <Grid item xs={12} md={12}>
          <Paper elevation={3} sx={{ p: 3 }}>

            {isPaid && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Dieser Auftrag ist bereits <b>bezahlt</b>.
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ color: "#0277bd", fontWeight: "bold" }}>
                {`Auftrag Nr. ${id} `}
              </Typography>

              <Grid item xs={4} sx={{ pl: 2, pb: 2, pt: 2 }}>
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

            <Grid container spacing={2}>
              {/* Kunde */}
              <Grid item xs={8}>
                <Autocomplete
                  fullWidth
                  sx={{ mb: 3 }}
                  options={[...customers].sort((a, b) => a.name.localeCompare(b.name))}
                  getOptionLabel={(option) => option.name}
                  value={selectedCustomer}
                  onChange={(_, value) =>
                    setSale(prev => ({ ...prev, customerId: value?.id ?? 0 }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Kunde" />
                  )}
                  disabled={isPaid} // блокируем если BEZAHLT
                />
              </Grid>
              {/* Datum */}
              <Grid item xs={4}>
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="de"
                  localeText={deDE.components.MuiLocalizationProvider.defaultProps.localeText}
                >
                  <DatePicker
                    label="Datum"
                    value={dateValue}
                    onChange={(newValue) => {
                      setDateValue(newValue);
                      setSale(prev => ({
                        ...prev,
                        salesDate: newValue ? newValue.format('YYYY-MM-DD') : '',
                      }));
                    }}
                    slotProps={{ textField: { fullWidth: true } }}
                    disabled={isPaid}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>

            {/* Details Block */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {/* Rechnung */}
              <Grid item xs={3}>
                <TextField
                  label="Rechnung"
                  value={sale.invoiceNumber}
                  onChange={(e) => setSale({ ...sale, invoiceNumber: e.target.value })}
                  disabled={isPaid}
                  fullWidth
                />
              </Grid>

              <Grid item xs={4}>
                <FormControl fullWidth>
                  <TextField
                    id="account-object"
                    name="accountObject"
                    label="Objekt"
                    value={sale.accountObject}
                    onChange={(e) => setSale({ ...sale, accountObject: e.target.value })}
                    fullWidth
                  />
                </FormControl>
              </Grid>

              <Grid item xs={5}>
                <FormControl fullWidth>
                  <InputLabel id="terms-of-payment-label">Zahlungsbedingung</InputLabel>

                  <Select
                    id="terms-of-payment"
                    labelId="terms-of-payment-label"
                    label="Zahlungsbedingung"
                    value={sale.termsOfPaymentId || ""}
                    onChange={(e: SelectChangeEvent<number>) => {
                      const selectedId = Number(e.target.value);
                      setSale(prev => ({
                        ...prev,
                        termsOfPaymentId: selectedId,
                      }));
                    }}
                  >
                    <MenuItem value="">Bitte wählen</MenuItem>

                    {termsOfPayment.map(term => (
                      <MenuItem key={term.id} value={term.id}>
                        {term.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

              </Grid>
            </Grid>

            {/* 📦 Versand & Maße Block */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                <Typography gutterBottom sx={{ color: "#00acc1", mb: 2, textAlign: 'left' }}>
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
              <Paper elevation={2} sx={{ p: 2, mb: 5 }}>
                <Typography gutterBottom sx={{ color: "#00acc1", mb: 2, textAlign: 'left' }}>
                  Lieferung & Bestelldaten
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
                            deliveryDate: newValue ? newValue.format('YYYY-MM-DD') : '',
                          }));
                        }}
                        slotProps={{
                          textField: { id: 'delivery-date', fullWidth: true },
                        }}
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

            {/* DefaultTax and DefaultDiscount */}
            <Grid container spacing={2} justifyContent="flex-end" sx={{ mb: 2 }}>
              <Grid item xs={2}>
                <FormControl fullWidth>
                  <InputLabel id="default-tax-label" htmlFor="default-tax-select">MWSt %</InputLabel>
                  <Select
                    id="default-tax-select"
                    labelId="default-tax-label"
                    label="MWSt %"
                    value={sale.defaultTax}
                    onChange={(e) =>
                      setSale(prev => ({
                        ...prev,
                        defaultTax: typeof e.target.value === 'string'
                          ? parseFloat(e.target.value)
                          : e.target.value,
                      }))
                    }
                    disabled={isPaid}
                  >
                    <MenuItem value={0}>0%</MenuItem>
                    <MenuItem value={7}>7%</MenuItem>
                    <MenuItem value={19}>19%</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={2}>
                <FormControl fullWidth>
                  <InputLabel id="default-discount-label" htmlFor="default-discount-select">Rabatt %</InputLabel>
                  <Select
                    id="default-discount-select"
                    labelId="default-discount-label"
                    label="Rabatt %"
                    value={sale.defaultDiscount}
                    onChange={(e) =>
                      setSale(prev => ({
                        ...prev,
                        defaultDiscount: typeof e.target.value === 'string'
                          ? parseFloat(e.target.value)
                          : e.target.value,
                      }))
                    }
                    disabled={isPaid}
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

            {/* Artikeln_Tabelle */}
            <Box sx={{ minHeight: 200, overflowY: 'auto', mb: 2, border: "1px solid #ddd" }}>
              <Table size="small">
                <StyledTableHead>
                  <TableRow>
                    <TableCell sx={{ width: 50, fontSize: "12px" }}>Pos</TableCell>
                    <TableCell sx={{ width: 100 }}>Artikel</TableCell>
                    <TableCell sx={{ minWidth: 200 }}>Name</TableCell>
                    <TableCell sx={{ width: 70 }}>Menge</TableCell>
                    <TableCell sx={{ width: 90 }}>Preis</TableCell>
                    <TableCell sx={{ width: 70, fontSize: "12px" }}>Rabatt%</TableCell>
                    <TableCell sx={{ width: 70, fontSize: "12px" }}>MWSt%</TableCell>
                    <TableCell sx={{ width: 90 }}>Netto</TableCell>
                    <TableCell sx={{ width: 90 }}>MWSt</TableCell>
                    <TableCell sx={{ width: 40 }}></TableCell>
                  </TableRow>
                </StyledTableHead>
                <TableBody>
                  {sale.salesItems.map((item, index) => (
                    <StyledTableRow key={index}>
                      <TableCell sx={{ padding: "6px 16px", borderRight: "1px solid #ddd", textAlign: "center", width: 50, }}>{index + 1}</TableCell>
                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd", minWidth: 200, textAlign: "left" }}>
                        <TextField
                          variant="standard"
                          value={item.productArticle}
                          size="small"
                          onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                          InputProps={{ disableUnderline: true, }}
                          sx={{ fontSize: '0.875rem', '& .MuiInputBase-root': { border: 'none', }, '& .MuiInputBase-input': { fontSize: '0.875rem', padding: 0 } }}
                        />
                      </TableCell>
                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd", minWidth: 200, textAlign: "left" }}>
                        <TextField
                          variant="standard"
                          multiline
                          minRows={1}
                          maxRows={4}
                          value={item.productName}
                          size="small"
                          onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                          InputProps={{ disableUnderline: true, }}
                          sx={{ fontSize: '0.875rem', '& .MuiInputBase-root': { border: 'none', }, '& .MuiInputBase-input': { fontSize: '0.875rem', padding: 0 } }}
                        />
                      </TableCell>
                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd", width: "70px" }}>
                        <TextField
                          variant="standard"
                          type="number"
                          value={item.quantity}
                          size="small"
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                          onFocus={(e) => { setTimeout(() => e.target.select(), 0); }}
                          InputProps={{ disableUnderline: true, sx: { textAlign: "center" } }}
                          sx={{ fontSize: '0.875rem', '& .MuiInputBase-root': { border: 'none', }, '& .MuiInputBase-input': { fontSize: '0.875rem', padding: 0, textAlign: 'center' }, min: 0, step: 0.01 }}
                          disabled={isPaid}
                        />
                      </TableCell>
                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd", width: "70px" }}>
                        <CompactNumberCell
                          value={item.unitPrice}
                          disabled={isPaid}
                          onChange={(val) => handleItemChange(index, "unitPrice", val)}
                        />
                      </TableCell>
                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd", width: 70 }}>
                        <CompactNumberCell
                          value={item.discount}
                          disabled={isPaid}
                          onChange={(val) => handleItemChange(index, "discount", val)}
                        />
                      </TableCell>
                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd", width: 70 }}>
                        <CompactNumberCell
                          value={item.tax}
                          disabled={isPaid}
                          onChange={(val) => handleItemChange(index, "tax", val)}
                        />
                      </TableCell>
                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd", width: 90, textAlign: "right" }}>
                        {item.totalPrice.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd", width: 90, textAlign: "right" }}>
                        {item.taxAmount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
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
                    </StyledTableRow>
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
            </Box>

            <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 5 }}>

              <Grid item xs={4}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={!sale.customerId || !sale.salesDate || sale.salesItems.length === 0}
                  fullWidth
                >
                  Aktualisieren
                </Button>
              </Grid>

              <Grid item xs={8}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                  <Typography>Netto: {subtotal.toFixed(2)} €</Typography>
                  <Typography>MWSt: {taxSum.toFixed(2)} €</Typography>
                  <Typography variant='h6' sx={{ fontWeight: 'bold' }}>Gesamtbetrag: {total.toFixed(2)} €</Typography>
                </Box>
              </Grid>
            </Grid>

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
                  {pickLoading && (
                    <Box sx={{ p: 1, textAlign: "center", color: "#00acc1" }}>
                      <CircularProgress size={20} />
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        Produkte werden geladen…
                      </Typography>
                    </Box>
                  )}

                  {!pickLoading && pickProducts.length === 0 && (searchTerm.length >= 2 || selectedCategory !== null) && (
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
                        <StyledTableRow key={p.id} onClick={() => handleAddProductToCart(p)}>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.article}</TableCell>
                          <TableCell>{p.vendorArticle ?? ''}</TableCell>
                          <TableCell align="right">
                            {Number(p.sellingPrice ?? 0).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                        </StyledTableRow>
                      ))}

                      {!pickLoading && pickProducts.length === 0 && (
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
