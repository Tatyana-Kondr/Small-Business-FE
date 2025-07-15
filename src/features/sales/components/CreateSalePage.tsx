import { useEffect, useMemo, useState } from 'react';
import {
    Box, TextField, Button, Typography, IconButton,
    FormControl, Select, MenuItem, Table, TableHead,
    TableRow, TableCell, TableBody, Autocomplete,
    Container,
    Grid,
    styled,
    Paper,
    InputAdornment,
    InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import { Customer } from '../../customers/types';
import { Product } from '../../products/types';
import { getCustomersWithCustomerNumber } from '../../customers/customersSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { ClearIcon, DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/de';
import { deDE } from '@mui/x-date-pickers/locales';
import { getProducts, getProductsByCategory, selectProducts } from '../../products/productsSlice';
import { getProductCategories, selectProductCategories } from '../../products/productCategoriesSlice';
import { useNavigate } from 'react-router-dom';
import { ArrowBackIos } from '@mui/icons-material';
import { NewSaleDto, NewSaleItemDto, NewShippingDimensionsDto } from '../types';
import { addSale } from '../salesSlice';
import { Shipping, TermsOfPayment } from '../../../constants/enums';
import { Dialog, DialogContent } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CreateCustomer from '../../customers/CreateCustomer';

const StyledTableHead = styled(TableHead)(({
    backgroundColor: "#1a3d6d",
    "& th": {
        position: "sticky",
        top: 0,
        backgroundColor: "#1a3d6d",
        color: "white",
        fontWeight: "bold",
        borderRight: "1px solid #ddd",
        zIndex: 1,
    },
}));
const StyledTableRow = styled(TableRow)({
    "&:hover": {
        backgroundColor: "#f5f5f5", // Подсветка строки при наведении
        cursor: "pointer",
    },
});

const typeOptions = ['VERKAUF', 'KUNDENERSTATTUNG'] as const;
type SaleType = typeof typeOptions[number];

export default function CreateSalePage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [newSale, setNewSale] = useState<Omit<NewSaleDto, 'paymentStatus'>>({
        customerId: 0,
        invoiceNumber: '',
        accountObject: '',
        typeOfOperation: 'VERKAUF',
        shipping: '',
        termsOfPayment: 'ÜBERWEISUNG_14_TAGE',
        salesDate: '',
        paymentDate: '',
        orderNumber: '',
        orderType: '',
        deliveryDate: '',
        deliveryBill: '',
        defaultTax: 19,
        defaultDiscount: 0,
        salesItems: [],
    });

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [dateValue, setDateValue] = useState<Dayjs | null>(null);
    const categories = useAppSelector(selectProductCategories);
    const products = useAppSelector(selectProducts);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [weightInput, setWeightInput] = useState<string>('');
    const [openCreateCustomer, setOpenCreateCustomer] = useState(false);
    const [deliveryDateValue, setDeliveryDateValue] = useState<Dayjs | null>(
        newSale.deliveryDate ? dayjs(newSale.deliveryDate) : null
    );


    useEffect(() => {
        dispatch(getProductCategories());
        dispatch(getCustomersWithCustomerNumber({ page: 0, size: 100 }))
            .unwrap()
            .then(customers => setCustomers(customers.content))
            .catch(error => console.error("Fehler beim Laden von Kunden", error));
    }, [dispatch]);

    useEffect(() => {
        if (selectedCategory !== null) {
            dispatch(getProductsByCategory({ categoryId: selectedCategory, page: 0, size: 100 }));
        } else {
            dispatch(getProducts({ page: 0, size: 100 }));
        }
    }, [selectedCategory, dispatch]);

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
        setSearchTerm("");
    }, [selectedCategory]);

    const { subtotal, discountSum, taxSum, total } = useMemo(() => {
        if (!newSale.salesItems || newSale.salesItems.length === 0) {
            return { subtotal: 0, discountSum: 0, taxSum: 0, total: 0 };
        }

        let subtotal = 0;
        let discountSum = 0;
        let taxSum = 0;
        let total = 0;

        for (const item of newSale.salesItems) {
            subtotal += item.totalPrice;
            discountSum += item.discountAmount;
            taxSum += item.taxAmount;
            total += item.totalAmount;
        }

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            discountSum: parseFloat(discountSum.toFixed(2)),
            taxSum: parseFloat(taxSum.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
        };
    }, [newSale.salesItems]);

    useEffect(() => {
        setNewSale(prev => {
            const updatedItems = prev.salesItems.map(item => {
                const quantity = item.quantity;
                const unitPrice = item.unitPrice;
                const subTotalPrice = quantity * unitPrice;
                const discountAmount = (subTotalPrice * item.discount) / 100;
                const totalPrice = subTotalPrice - discountAmount;
                const taxAmount = (totalPrice * prev.defaultTax) / 100;
                const totalAmount = totalPrice + taxAmount;

                return {
                    ...item,
                    tax: prev.defaultTax,
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
    }, [newSale.defaultTax]);


    const handleAddProductToCart = (product: Product) => {
        const quantity = 1;
        const unitPrice = product.sellingPrice;
        const totalPrice = quantity * unitPrice;
        const discount = newSale.defaultDiscount;
        const discountAmount = (totalPrice * discount) / 100;
        const totalPriceWithDiscount = totalPrice - discountAmount;
        const tax = newSale.defaultTax;
        const taxAmount = (totalPriceWithDiscount * tax) / 100;
        const totalAmount = totalPriceWithDiscount + taxAmount;

        const item: NewSaleItemDto = {
            position: newSale.salesItems.length + 1,
            saleId: 0,
            productId: product.id,
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

        setNewSale(prev => ({
            ...prev,
            salesItems: [...prev.salesItems, item],
        }));
    };

    const handleRemoveItem = (index: number) => {
        setNewSale(prev => ({
            ...prev,
            salesItems: prev.salesItems.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = () => {
        if (
            !newSale.customerId ||
            !newSale.salesDate ||
            newSale.salesItems.length === 0
        ) {
            alert("Пожалуйста, заполните все обязательные поля корректно.");
            return;
        }

        const updatedSaleItems = newSale.salesItems.map((item, index) => ({
            ...item,
            position: index + 1,
        }));

        const newSaleToSend: NewSaleDto = {
            ...newSale,
            salesItems: updatedSaleItems,
            paymentStatus: 'NICHT_BEZAHLT',
        };

        dispatch(addSale(newSaleToSend))
            .unwrap()
            .then(() => {
                alert('Продажа успешно создана');
                navigate('/sales');
            })
            .catch((error) => {
                console.error('Ошибка при создании покупки:', error);
                alert('Не удалось создать покупку');
            });
    };

    const updateShippingDimension = (
        field: keyof NewShippingDimensionsDto,
        value: string
    ) => {
        const parsed = value.trim() === '' ? null : parseFloat(value.replace(',', '.'));

        setNewSale(prev => ({
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
        setNewSale(prev => {
            const updatedItems = [...prev.salesItems];
            const currentItem = { ...updatedItems[index], [field]: value };

            // Пересчитать суммы, если изменилось числовое поле
            const subTotalPrice = currentItem.quantity * currentItem.unitPrice;
            currentItem.discountAmount = (subTotalPrice * currentItem.discount) / 100;
            currentItem.totalPrice = subTotalPrice - currentItem.discountAmount;
            const appliedTax = currentItem.tax ?? newSale.defaultTax;
            currentItem.taxAmount = (currentItem.totalPrice * appliedTax) / 100;
            currentItem.totalAmount = currentItem.totalPrice + currentItem.taxAmount;

            updatedItems[index] = currentItem;

            return {
                ...prev,
                salesItems: updatedItems,
            };
        });
    };

    const handleGoBack = () => {
        navigate(-1)
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 3 }}>
            <Grid container spacing={3}>

                <Box sx={{ position: "absolute", top: 75, left: 20 }}>
                    <Button variant="outlined" startIcon={<ArrowBackIos />} onClick={handleGoBack}>
                        Zurück
                    </Button>
                </Box>

                {/* форма и добавленные товары */}
                <Grid item xs={12} md={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" sx={{ color: "#1a3d6d", fontWeight: "bold" }}>
                                Neuer Auftrag
                            </Typography>
                            <FormControl sx={{ minWidth: 200 }}>
                                <Select
                                    value={newSale.typeOfOperation}
                                    onChange={(e) =>
                                        setNewSale({ ...newSale, typeOfOperation: e.target.value as SaleType })
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
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            {/* Kunde */}
                            <Grid item xs={8}>
                                <Autocomplete
                                    fullWidth
                                    options={[...customers].sort((a, b) => a.name.localeCompare(b.name))}
                                    getOptionLabel={(option) => option.name}
                                    onChange={(_, value) => {
                                        setNewSale((prev) => ({
                                            ...prev,
                                            customerId: value?.id ?? 0,
                                        }));
                                    }}
                                    value={customers.find((v) => v.id === newSale.customerId) || null}
                                    renderInput={(params) => <TextField {...params} label="Kunde" />}
                                />
                            </Grid>
                            {/* Кнопка для создания нового клиента */}
                            <Grid item xs={1}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => setOpenCreateCustomer(true)}
                                    startIcon={<AddIcon />}
                                    sx={{ height: "100%" }}
                                >
                                    Neu
                                </Button>
                            </Grid>

                            {/* Datum auswählen */}
                            <Grid item xs={3}>
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
                                            const formattedDate = newValue ? newValue.format("YYYY-MM-DD") : "";

                                            setNewSale((prev) => ({
                                                ...prev,
                                                salesDate: formattedDate,
                                                deliveryDate: prev.deliveryDate || formattedDate,
                                            }));

                                            if (!deliveryDateValue && newValue) {
                                                setDeliveryDateValue(newValue);
                                            }
                                        }}
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                        </Grid>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={5}>
                                <FormControl fullWidth>
                                    <TextField
                                        label="Objekt"
                                        value={newSale.accountObject}
                                        onChange={(e) => setNewSale({ ...newSale, accountObject: e.target.value })}
                                        fullWidth
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={5}>
                                <FormControl fullWidth>
                                    <InputLabel>Zahlbedinung</InputLabel>
                                    <Select
                                        label="Zahlbedinung"
                                        value={newSale.termsOfPayment}
                                        onChange={(e) => setNewSale(prev => ({ ...prev, termsOfPayment: e.target.value as TermsOfPayment }))}
                                    >
                                        {TermsOfPayment.map((type) => (
                                            <MenuItem key={type} value={type}>
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={1}>
                                <FormControl fullWidth>
                                    <InputLabel id="default-tax-label">MWSt %</InputLabel>
                                    <Select
                                        fullWidth
                                        labelId="default-tax-label"
                                        id="default-tax-select"
                                        value={newSale.defaultTax}
                                        label="MWSt %"
                                        onChange={(e) =>
                                            setNewSale(prev => ({
                                                ...prev,
                                                defaultTax: typeof e.target.value === 'string'
                                                    ? parseFloat(e.target.value)
                                                    : e.target.value,
                                            }))
                                        }
                                    >
                                        <MenuItem value={0}>0%</MenuItem>
                                        <MenuItem value={7}>7%</MenuItem>
                                        <MenuItem value={19}>19%</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={1}>
                                <FormControl fullWidth>
                                    <InputLabel id="default-tax-label">Rabatt %</InputLabel>
                                    <Select
                                        fullWidth
                                        labelId="default-discount-label"
                                        id="default-discount-select"
                                        value={newSale.defaultDiscount}
                                        label="Rabatt %"
                                        onChange={(e) =>
                                            setNewSale(prev => ({
                                                ...prev,
                                                defaultDiscount: typeof e.target.value === 'string'
                                                    ? parseFloat(e.target.value)
                                                    : e.target.value,
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
                            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                                <Typography gutterBottom sx={{ color: "#1a3d6d", fontWeight: 'bold', mb: 2, textAlign: 'left', }}>
                                    Versand & Maße
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                        <FormControl fullWidth>
                                            <InputLabel>Versand</InputLabel>
                                            <Select
                                                label="Versand"
                                                value={newSale.shipping}
                                                onChange={(e) => setNewSale(prev => ({ ...prev, shipping: e.target.value as Shipping }))}
                                            >
                                                {Shipping.map((type) => (
                                                    <MenuItem key={type} value={type}>
                                                        {type}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={3}>
                                                <TextField
                                                    label="Breite (cm)"
                                                    value={newSale.shippingDimensions?.width ?? ''}
                                                    onChange={(e) => updateShippingDimension('width', e.target.value)}
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid item xs={3}>
                                                <TextField
                                                    label="Länge (cm)"
                                                    value={newSale.shippingDimensions?.length ?? ''}
                                                    onChange={(e) => updateShippingDimension('length', e.target.value)}
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid item xs={3}>
                                                <TextField
                                                    label="Höhe (cm)"
                                                    value={newSale.shippingDimensions?.height ?? ''}
                                                    onChange={(e) => updateShippingDimension('height', e.target.value)}
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid item xs={3}>
                                                <TextField
                                                    label="Gewicht (kg)"
                                                    value={weightInput}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setWeightInput(val);
                                                        const parsed = parseFloat(val.replace(',', '.'));
                                                        setNewSale((prev) => ({
                                                            ...prev,
                                                            shippingDimensions: {
                                                                ...prev.shippingDimensions,
                                                                weight: isNaN(parsed) ? null : parsed,
                                                            },
                                                        }));
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
                                <Typography gutterBottom sx={{ color: "#1a3d6d", fontWeight: 'bold', mb: 2, textAlign: 'left', }}>
                                    Bestellung
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                        <TextField
                                            label="Bestell-Nr"
                                            value={newSale.orderNumber}
                                            onChange={(e) => setNewSale({ ...newSale, orderNumber: e.target.value })}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            label="Bestellart"
                                            value={newSale.orderType}
                                            onChange={(e) => setNewSale({ ...newSale, orderType: e.target.value })}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
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
                                                    setNewSale((prev) => ({
                                                        ...prev,
                                                        deliveryDate: newValue ? newValue.format('YYYY-MM-DD') : '',
                                                    }));
                                                }}
                                                slotProps={{ textField: { fullWidth: true } }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>



                        <Box sx={{ minHeight: 200, overflowY: 'auto', mb: 2, border: "1px solid #ddd" }}>
                            <Table size="small">
                                <StyledTableHead>
                                    <TableRow>
                                        <TableCell>Pos</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Menge</TableCell>
                                        <TableCell>Preis</TableCell>
                                        <TableCell>Rabatt%</TableCell>
                                        <TableCell>MWSt%</TableCell>
                                        <TableCell>Netto</TableCell>
                                        <TableCell>MWSt</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </StyledTableHead>
                                <TableBody>
                                    {newSale.salesItems.map((item, index) => (
                                        <StyledTableRow key={index}>
                                            <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd", borderLeft: "1px solid #ddd" }}>{item.position}</TableCell>
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
                                                    value={item.discount}
                                                    size="small"
                                                    fullWidth
                                                    onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value))}
                                                    InputProps={{ disableUnderline: true, }}
                                                    sx={{ fontSize: '0.875rem', '& .MuiInputBase-root': { border: 'none', }, '& .MuiInputBase-input': { fontSize: '0.875rem', padding: 0 }, min: 0, step: 1 }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>
                                                <TextField
                                                    variant="standard"
                                                    type="number"
                                                    value={item.tax}
                                                    size="small"
                                                    fullWidth
                                                    onChange={(e) => handleItemChange(index, 'tax', parseFloat(e.target.value))}
                                                    InputProps={{ disableUnderline: true, }}
                                                    sx={{ fontSize: '0.875rem', '& .MuiInputBase-root': { border: 'none', }, '& .MuiInputBase-input': { fontSize: '0.875rem', padding: 0 }, min: 0, step: 1 }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>{item.totalPrice.toFixed(2)}</TableCell>
                                            <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>{item.taxAmount.toFixed(2)}</TableCell>
                                            <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>
                                                <IconButton onClick={() => handleRemoveItem(index)} size="small" color="error">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </StyledTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                            <Button variant="contained" color="primary" onClick={handleSubmit}>
                                Speichern
                            </Button>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography>Netto: {subtotal.toFixed(2)}</Typography>
                                <Typography>Rabatt: {discountSum.toFixed(2)}</Typography>
                                <Typography>MWSt: {taxSum.toFixed(2)}</Typography>
                                <Typography variant="h6">Gesamtbetrag: {total.toFixed(2)}</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* фильтрация и выбор товаров */}

                <Grid item xs={12} md={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={6}>
                                <Autocomplete
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    options={categories}
                                    getOptionLabel={(option) => option.name}
                                    onChange={(_, newCategory) => {
                                        setSelectedCategory(newCategory?.id ?? null);
                                    }}
                                    value={categories.find(c => c.id === selectedCategory) || null}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Kategorie" />
                                    )}
                                />

                                <TextField
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    label="Suchen und filtern"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        endAdornment: searchTerm && (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setSearchTerm('')} size="small">
                                                    <ClearIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ height: 200, overflowY: 'auto', mb: 2, border: "1px solid #ddd" }}>
                                    <Table size="small" stickyHeader>
                                        <StyledTableHead>
                                            <TableRow>
                                                <TableCell style={{ display: "none" }}>ID</TableCell>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Artikel</TableCell>
                                                <TableCell>LieferantArtikel</TableCell>

                                            </TableRow>
                                        </StyledTableHead>
                                        <TableBody>
                                            {filteredProducts.map(product => (
                                                <StyledTableRow key={product.id} hover onDoubleClick={() => handleAddProductToCart(product)}>
                                                    <TableCell sx={{ display: "none", padding: "6px 6px", borderRight: "1px solid #ddd", borderLeft: "1px solid #ddd" }}>{product.id}</TableCell>
                                                    <TableCell sx={{ maxWidth: "400px", padding: "6px 6px", borderRight: "1px solid #ddd" }}>{product.name}</TableCell>
                                                    <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>{product.article}</TableCell>
                                                    <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>{product.vendorArticle}</TableCell>
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid >
            <Dialog open={openCreateCustomer} onClose={() => setOpenCreateCustomer(false)}  maxWidth={false} >
                <DialogContent>
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: {
                                xs: '100%',   // 100% ширины экрана на телефонах
                                sm: '90%',    // до 90% на маленьких экранах
                                md: '800px',  // фиксированная ширина на десктопе
                            },
                        }}
                    >
                        <CreateCustomer
                            onClose={() => setOpenCreateCustomer(false)}
                            onCustomerCreated={(newCustomer) => {
                                setCustomers((prev) => [...prev, newCustomer]);
                                setNewSale((prev) => ({ ...prev, customerId: newCustomer.id }));
                                setOpenCreateCustomer(false);
                            }}
                        />
                    </Box>
                </DialogContent>
            </Dialog>

        </Container >
    );

}



