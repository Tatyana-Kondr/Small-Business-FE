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
  InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Delete as DeleteIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { deDE } from '@mui/x-date-pickers/locales';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { NewPurchaseDto, NewPurchaseItemDto } from '../types';
import { Customer } from '../../customers/types';
import { getProductCategories, selectProductCategories } from '../../products/productCategoriesSlice';
import { getProducts, getProductsByCategory, selectProducts } from '../../products/productsSlice';
import { getPurchaseById, updatePurchase } from '../purchasesSlice';
import { getCustomers } from '../../customers/customersSlice';
import { Product } from '../../products/types';
import { TypeOfDocument, TypesOfDocument } from '../../../constants/enums';
import KeyboardDoubleArrowLeftOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftOutlined';
import { handleApiError } from '../../../utils/handleApiError';
import { showSuccessToast } from '../../../utils/toast';

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
});

const typeOptions = ['EINKAUF', 'LIEFERANT_RABATT'] as const;
type PurchaseType = typeof typeOptions[number];

export default function PurchaseCard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const id = Number(purchaseId);

  const [purchase, setPurchase] = useState<NewPurchaseDto>({
    vendorId: 0,
    purchasingDate: '',
    type: 'EINKAUF',
    document: '',
    documentNumber: '',
    purchaseItems: [],
    paymentStatus: '',
  });
  const [dateValue, setDateValue] = useState<Dayjs | null>(null);
  const [vendors, setVendors] = useState<Customer[]>([]);
  const categories = useAppSelector(selectProductCategories);
  const products = useAppSelector(selectProducts);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Загрузка данных покупки
    dispatch(getPurchaseById(Number(purchaseId)))
      .unwrap()
      .then(p => {
        setPurchase({
          vendorId: p.vendorId,
          purchasingDate: p.purchasingDate,
          type: p.type,
          document: p.document,
          documentNumber: p.documentNumber,
          purchaseItems: p.purchaseItems,
          paymentStatus: p.paymentStatus
        });
        setDateValue(p.purchasingDate ? dayjs(p.purchasingDate) : null);
      })
      .catch(error => handleApiError(error, "Fehler beim Laden der Bestellung."));

    // Загрузка поставщиков
    dispatch(getCustomers({ page: 0, size: 100 }))
      .unwrap()
      .then(c => setVendors(c.content))
      .catch(error => handleApiError(error, "Fehler beim Laden der Lieferanten."));

    // Загрузка категорий и продуктов
    dispatch(getProductCategories());
    dispatch(getProducts({ page: 0, size: 100 }));
  }, [dispatch, purchaseId]);

  useEffect(() => {
    if (selectedCategory !== null) {
      dispatch(getProductsByCategory({ categoryId: selectedCategory, page: 0, size: 100 }));
    }
  }, [dispatch, selectedCategory]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return products.filter(product => {
      const matchesCategory = selectedCategory === null || product.productCategory.id === selectedCategory;
      const matchesText =
        term === '' ||
        product.name.toLowerCase().includes(term) ||
        product.article?.toLowerCase().includes(term) ||
        product.vendorArticle?.toLowerCase().includes(term);

      return matchesCategory && matchesText;
    });
  }, [products, selectedCategory, searchTerm]);

  useEffect(() => {
    setSearchTerm('');
  }, [selectedCategory]);

  const { subtotal, taxSum, total } = useMemo(() => {
    if (!purchase.purchaseItems || purchase.purchaseItems.length === 0) {
      return { subtotal: 0, taxSum: 0, total: 0 };
    }

    let subtotal = 0;
    let taxSum = 0;
    let total = 0;

    for (const item of purchase.purchaseItems) {
      subtotal += item.totalPrice;
      taxSum += item.taxAmount;
      total += item.totalAmount;
    }

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxSum: parseFloat(taxSum.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }, [purchase.purchaseItems]);

  const handleAddProductToCart = (product: Product) => {
    const quantity = 1;
    const unitPrice = product.purchasingPrice;
    const totalPrice = quantity * unitPrice;
    const taxPercentage = 19;
    const taxAmount = (totalPrice * taxPercentage) / 100;
    const totalAmount = totalPrice + taxAmount;

    const item: NewPurchaseItemDto = {
      productId: product.id,
      productName: product.name,
      purchaseId: Number(purchaseId),
      quantity,
      unitPrice,
      totalPrice,
      taxPercentage,
      taxAmount,
      totalAmount,
      position: purchase.purchaseItems.length + 1,
    };

    setPurchase(prev => ({
      ...prev,
      purchaseItems: [...prev.purchaseItems, item],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setPurchase(prev => ({
      ...prev,
      purchaseItems: prev.purchaseItems.filter((_, i) => i !== index),
    }));
  };

  const recalculateItem = (item: NewPurchaseItemDto): NewPurchaseItemDto => {
    const quantity = item.quantity ?? 0;
    const unitPrice = item.unitPrice ?? 0;
    const taxPercentage = item.taxPercentage ?? 0;

    const totalPrice = quantity * unitPrice;
    const taxAmount = (totalPrice * taxPercentage) / 100;
    const totalAmount = totalPrice + taxAmount;

    return {
      ...item,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    };
  };

  const handleItemChange = (
    index: number,
    field: keyof NewPurchaseItemDto,
    value: string | number
  ) => {
    setPurchase((prevPurchase) => {
      const updatedItems = [...prevPurchase.purchaseItems];
      const currentItem = { ...updatedItems[index] };

      if (field === 'taxPercentage' || field === 'quantity' || field === 'unitPrice') {
        const parsedValue = Number(value);
        if (!isNaN(parsedValue)) {
          (currentItem as any)[field] = parsedValue;
        }
      } else {
        (currentItem as any)[field] = value;
      }

      updatedItems[index] = recalculateItem(currentItem);

      return {
        ...prevPurchase,
        purchaseItems: updatedItems,
      };
    });
  };

  const handleSubmit = () => {
    if (!purchase.purchaseItems.length) {
            handleApiError(new Error("Die Bestellung enthält keine Artikel."));
            return;
        }

        if (!purchase.vendorId || !purchase.purchasingDate) {
            handleApiError(new Error("Bitte füllen Sie alle Pflichtfelder korrekt aus."));
            return;
        }

    const updatedPurchaseItems = purchase.purchaseItems.map((item, index) => ({
      ...item,
      taxPercentage: item.taxPercentage ?? 0,
      taxAmount: ((item.unitPrice ?? 0) * (item.quantity ?? 0)) * ((item.taxPercentage ?? 0) / 100),
      totalAmount: (item.unitPrice ?? 0) * (item.quantity ?? 0) + (((item.unitPrice ?? 0) * (item.quantity ?? 0)) * ((item.taxPercentage ?? 0) / 100)),
      position: index + 1,
    }));


    const updatedPurchaseToSend: NewPurchaseDto = {
      ...purchase,
      purchaseItems: updatedPurchaseItems
    };

    dispatch(updatePurchase({ id, updatedPurchase: updatedPurchaseToSend }))
      .unwrap()
      .then(() => {
        showSuccessToast("Erfolg", "Bestellung erfolgreich aktualisiert");
        navigate('/purchases');
      })
      .catch(error => handleApiError(error, "Die Bestellung konnte nicht aktualisiert werden."));
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      <Grid container spacing={3}>

        <Grid item xs={12} md={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ color: "#0277bd", fontWeight: "bold" }}>
                {`Bestellung Nr ${id} `}
              </Typography>

              <FormControl sx={{ minWidth: 200 }}>
                <Select
                  value={purchase.type}
                  onChange={(e) =>
                    setPurchase({ ...purchase, type: e.target.value as PurchaseType })
                  }
                >
                  {typeOptions.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Autocomplete
              fullWidth
              sx={{ mb: 2 }}
              options={[...vendors].sort((a, b) => a.name.localeCompare(b.name))}
              getOptionLabel={(option) => option.name}
              onChange={(_, value) => {
                setPurchase(prev => ({
                  ...prev,
                  vendorId: value?.id ?? 0,
                }));
              }}
              value={vendors.find(v => v.id === purchase.vendorId) || null}
              renderInput={(params) => (
                <TextField {...params} label="Lieferant" />
              )}
            />

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="de"
                  localeText={deDE.components.MuiLocalizationProvider.defaultProps.localeText}
                >
                  <DatePicker
                    label="Datum auswählen"
                    value={dateValue}
                    onChange={(newValue) => {
                      setDateValue(newValue);
                      setPurchase(prev => ({
                        ...prev,
                        purchasingDate: newValue ? newValue.format('YYYY-MM-DD') : '',
                      }));
                    }}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Dokument</InputLabel>
                  <Select
                    label="Dokument"
                    value={purchase.document}
                    onChange={(e) => setPurchase(prev => ({ ...prev, document: e.target.value as TypeOfDocument }))}
                  >
                    {TypesOfDocument.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Dokumentnummer"
                  value={purchase.documentNumber}
                  onChange={(e) => setPurchase({ ...purchase, documentNumber: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Box sx={{ minHeight: 200, overflowY: 'auto', mb: 2, border: "1px solid #ddd" }}>
              <Table size="small">
                <StyledTableHead>
                  <TableRow>
                    <TableCell>Pos</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Menge</TableCell>
                    <TableCell>Preis</TableCell>
                    <TableCell>MWSt%</TableCell>
                    <TableCell>Netto</TableCell>
                    <TableCell>MWSt</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </StyledTableHead>
                <TableBody>
                  {purchase.purchaseItems.map((item, index) => (
                    <StyledTableRow key={index}>
                      <TableCell sx={{ padding: "6px 16px", borderRight: "1px solid #ddd" }}>{index + 1}</TableCell>
                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>
                        <TextField
                          variant="standard"
                          value={item.productName}
                          size="small"
                          onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                          InputProps={{ disableUnderline: true, }}
                          sx={{ fontSize: '0.875rem', '& .MuiInputBase-root': { border: 'none', }, '& .MuiInputBase-input': { fontSize: '0.875rem', padding: 0 } }}
                        />
                      </TableCell>
                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>
                        <TextField
                          variant="standard"
                          type="number"
                          value={item.quantity}
                          size="small"
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                          InputProps={{ disableUnderline: true, }}
                          sx={{ fontSize: '0.875rem', '& .MuiInputBase-root': { border: 'none', }, '& .MuiInputBase-input': { fontSize: '0.875rem', padding: 0 }, min: 0, step: 0.01 }}
                        />
                      </TableCell>
                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>
                        <TextField
                          variant="standard"
                          type="number"
                          value={item.unitPrice}
                          size="small"
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                          InputProps={{ disableUnderline: true, }}
                          sx={{ fontSize: '0.875rem', '& .MuiInputBase-root': { border: 'none', }, '& .MuiInputBase-input': { fontSize: '0.875rem', padding: 0 }, min: 0, step: 0.01 }}
                        />
                      </TableCell>
                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>
                        <TextField
                          variant="standard"
                          type="number"
                          value={item.taxPercentage}
                          size="small"
                          fullWidth
                          onChange={(e) => handleItemChange(index, 'taxPercentage', parseFloat(e.target.value))}
                          InputProps={{ disableUnderline: true, }}
                          sx={{ fontSize: '0.875rem', '& .MuiInputBase-root': { border: 'none', }, '& .MuiInputBase-input': { fontSize: '0.875rem', padding: 0 }, min: 0, step: 1 }}
                        />
                      </TableCell>
                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>
                        {item.totalPrice.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>
                        {item.taxAmount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveItem(index)}
                          aria-label="Zeile löschen"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </StyledTableRow>
                  ))}
                  {purchase.purchaseItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        Keine Artikel vorhanden
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginBottom: 5 }}>
              <Typography sx={{ fontWeight: 'bold' }}>Netto: {subtotal.toFixed(2)} €</Typography>
              <Typography sx={{ fontWeight: 'bold' }}>MwSt: {taxSum.toFixed(2)} €</Typography>
              <Typography sx={{ fontWeight: 'bold' }}>Brutto: {total.toFixed(2)} €</Typography>
            </Box>

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
                      {categories.map((cat) => (
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
                    {filteredProducts.map(product => (
                      <StyledTableRow
                        key={product.id}
                        onClick={() => handleAddProductToCart(product)}
                      >
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.article}</TableCell>
                        <TableCell>{product.vendorArticle}</TableCell>
                        <TableCell>{product.purchasingPrice.toFixed(2)}</TableCell>
                      </StyledTableRow>
                    ))}
                    {filteredProducts.length === 0 && (
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

            <Box sx={{ display: 'flex', justifyContent: "space-between", mt: 3 }}>
              <Button
                onClick={handleGoBack}
                sx={{
                  fontSize: 12,
                  minWidth: 40,
                  minHeight: 40,
                  padding: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 1,
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: "transparent", // фон не меняется при ховере
                    "& .MuiSvgIcon-root": {
                      color: "#00838f", // цвет иконки при наведении
                    },
                  },
                  "& .MuiSvgIcon-root": {
                    transition: "color 0.3s ease", // плавный переход цвета
                  },
                }}>
                <KeyboardDoubleArrowLeftOutlinedIcon fontSize="large" />
                ZURÜCK
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!purchase.vendorId || !purchase.purchasingDate || purchase.purchaseItems.length === 0}
              >
                Aktualisieren
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
