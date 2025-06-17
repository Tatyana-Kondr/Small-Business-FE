import { useEffect, useMemo, useState } from 'react';
import {
    Box, TextField, Button, Typography, IconButton,
    FormControl, InputLabel, Select, MenuItem, Table, TableHead,
    TableRow, TableCell, TableBody, Autocomplete,
    Container,
    Grid,
    styled,
    Paper,
    InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { NewPurchaseDto, NewPurchaseItemDto } from '../types';
import { Customer } from '../../customers/types';
import { Product } from '../../products/types';
import { getCustomers } from '../../customers/customersSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { ClearIcon, DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/de';
import { deDE } from '@mui/x-date-pickers/locales';
import { getProducts, getProductsByCategory, selectProducts } from '../../products/productsSlice';
import { getProductCategories, selectProductCategories } from '../../products/productCategoriesSlice';
import { useNavigate } from 'react-router-dom';
import { addPurchase } from '../purchasesSlice';
import { ArrowBackIos } from '@mui/icons-material';
import { TypeOfDocument, TypesOfDocument } from '../../../constants/enums';

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

const typeOptions = ['EINKAUF', 'LIEFERANT_RABATT'] as const;
type PurchaseType = typeof typeOptions[number];

export default function CreatePurchasePage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [newPurchase, setNewPurchase] = useState<Omit<NewPurchaseDto, 'paymentStatus'>>({
        vendorId: 0,
        purchasingDate: '',
        type: 'EINKAUF',
        document: '',
        documentNumber: '',
        purchaseItems: [],
    });

    const [vendors, setVendors] = useState<Customer[]>([]);
    const [dateValue, setDateValue] = useState<Dayjs | null>(null);
    const categories = useAppSelector(selectProductCategories);
    const products = useAppSelector(selectProducts);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        dispatch(getProductCategories());
        dispatch(getCustomers({ page: 0, size: 100 }))
            .unwrap()
            .then(customers => setVendors(customers.content))
            .catch(error => console.error("Ошибка при загрузке поставщиков", error));
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

    const { subtotal, taxSum, total } = useMemo(() => {
        if (!newPurchase.purchaseItems || newPurchase.purchaseItems.length === 0) {
            return { subtotal: 0, taxSum: 0, total: 0 };
        }

        let subtotal = 0;
        let taxSum = 0;
        let total = 0;

        for (const item of newPurchase.purchaseItems) {
            subtotal += item.totalPrice;
            taxSum += item.taxAmount;
            total += item.totalAmount;
        }

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            taxSum: parseFloat(taxSum.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
        };
    }, [newPurchase.purchaseItems]);

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
            purchaseId: 0,
            quantity,
            unitPrice,
            totalPrice,
            taxPercentage,
            taxAmount,
            totalAmount,
            position: newPurchase.purchaseItems.length + 1,
        };

        setNewPurchase(prev => ({
            ...prev,
            purchaseItems: [...prev.purchaseItems, item],
        }));
    };

    const handleRemoveItem = (index: number) => {
        setNewPurchase(prev => ({
            ...prev,
            purchaseItems: prev.purchaseItems.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = () => {
        if (
            !newPurchase.vendorId ||
            !newPurchase.purchasingDate ||
            newPurchase.purchaseItems.length === 0
        ) {
            alert("Пожалуйста, заполните все обязательные поля корректно.");
            return;
        }

        const updatedPurchaseItems = newPurchase.purchaseItems.map((item, index) => ({
            ...item,
            position: index + 1,
        }));

        const newPurchaseToSend: NewPurchaseDto = {
            ...newPurchase,
            purchaseItems: updatedPurchaseItems,
            paymentStatus: 'NICHT_BEZAHLT',
        };

        dispatch(addPurchase(newPurchaseToSend))
            .unwrap()
            .then(() => {
                alert('Покупка успешно создана');
                navigate('/purchases'); 
            })
            .catch((error) => {
                console.error('Ошибка при создании покупки:', error);
                alert('Не удалось создать покупку');
            });
    };


    const handleItemChange = (
        index: number,
        field: keyof NewPurchaseItemDto,
        value: string | number
    ) => {
        setNewPurchase(prev => {
            const updatedItems = [...prev.purchaseItems];
            const currentItem = { ...updatedItems[index], [field]: value };

            // Пересчитать суммы, если изменилось числовое поле
            currentItem.totalPrice = currentItem.quantity * currentItem.unitPrice;
            currentItem.taxAmount = (currentItem.totalPrice * currentItem.taxPercentage) / 100;
            currentItem.totalAmount = currentItem.totalPrice + currentItem.taxAmount;

            updatedItems[index] = currentItem;

            return {
                ...prev,
                purchaseItems: updatedItems,
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
                                Neu Bestellung
                            </Typography>
                            <FormControl sx={{ minWidth: 200 }}>
                                <Select
                                    value={newPurchase.type}
                                    onChange={(e) =>
                                        setNewPurchase({ ...newPurchase, type: e.target.value as PurchaseType })
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
                                setNewPurchase(prev => ({
                                    ...prev,
                                    vendorId: value?.id ?? 0,
                                }));
                            }}
                            value={vendors.find(v => v.id === newPurchase.vendorId) || null}
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
                                            setNewPurchase(prev => ({
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
                                        value={newPurchase.document}
                                        onChange={(e) => setNewPurchase(prev => ({ ...prev, document: e.target.value as TypeOfDocument }))}
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
                                    value={newPurchase.documentNumber}
                                    onChange={(e) => setNewPurchase({ ...newPurchase, documentNumber: e.target.value })}
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
                                    {newPurchase.purchaseItems.map((item, index) => (
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
                                                    value={item.taxPercentage}
                                                    size="small"
                                                    fullWidth
                                                    onChange={(e) => handleItemChange(index, 'taxPercentage', parseFloat(e.target.value))}
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
            </Grid>
        </Container>
    );

}



