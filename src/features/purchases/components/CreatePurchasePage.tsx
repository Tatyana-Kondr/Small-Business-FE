import { useEffect, useMemo, useState } from 'react';
import {
    Box, TextField, Button, Typography, IconButton,
    FormControl, InputLabel, Select, MenuItem, Table, TableHead,
    TableRow, TableCell, TableBody, Autocomplete,
    Grid,
    styled,
    Paper,
    InputAdornment,
    Dialog,
    SelectChangeEvent,
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
import { getAllProducts, getAllProductsByCategory, selectProductsPaged } from '../../products/productsSlice';
import { getProductCategories, selectProductCategories } from '../../products/productCategoriesSlice';
import { addPurchase } from '../purchasesSlice';
import AddIcon from "@mui/icons-material/Add";
import { useReloadOnSuccess } from '../../../hooks/useReloadOnSuccess';
import CreateCustomer from '../../customers/components/CreateCustomer';
import { handleApiError } from '../../../utils/handleApiError';
import { showSuccessToast } from '../../../utils/toast';
import { getDocumentTypes, selectTypeOfDocuments } from '../typeOfDocumentSlice';

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
        backgroundColor: "#f5f5f5", // Подсветка строки при наведении
        cursor: "pointer",
    },
});

const typeOptions = ['EINKAUF', 'LIEFERANT_RABATT'] as const;
type PurchaseType = typeof typeOptions[number];

type CreatePurchaseModalProps = {
    onClose: () => void;
    onSubmitSuccess?: () => void;
};

export default function CreatePurchasePage({ onClose, onSubmitSuccess }: CreatePurchaseModalProps) {
    const dispatch = useAppDispatch();
    const reload = useReloadOnSuccess();

    const [newPurchase, setNewPurchase] = useState<Omit<NewPurchaseDto, 'paymentStatus'>>({
        vendorId: 0,
        purchasingDate: '',
        type: 'EINKAUF',
        documentId: 0,
        documentNumber: '',
        purchaseItems: [],
    });

    const [vendors, setVendors] = useState<Customer[]>([]);
    const [dateValue, setDateValue] = useState<Dayjs | null>(null);
    const categories = useAppSelector(selectProductCategories);
    const products = useAppSelector(selectProductsPaged);
    const documentTypes = useAppSelector(selectTypeOfDocuments);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateCustomer, setShowCreateCustomer] = useState(false);

    useEffect(() => {
        dispatch(getDocumentTypes());
    }, [dispatch]);

    useEffect(() => {
        dispatch(getProductCategories());
        dispatch(getCustomers({ page: 0, size: 100 }))
            .unwrap()
            .then(customers => setVendors(customers.content))
            .catch(error => handleApiError(error, "Fehler beim Laden der Lieferanten"));
    }, [dispatch]);

    useEffect(() => {
        if (selectedCategory !== null) {
            dispatch(getAllProductsByCategory({ categoryId: selectedCategory }));
        } else {
            dispatch(getAllProducts({  }));
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

    const handleCreateNewVendor = () => {
        setShowCreateCustomer(true);
    };

    const handleSubmit = () => {
        if (!newPurchase.purchaseItems.length) {
            handleApiError(new Error("Die Bestellung enthält keine Artikel."));
            return;
        }

        if (!newPurchase.vendorId || !newPurchase.purchasingDate) {
            handleApiError(new Error("Bitte füllen Sie alle Pflichtfelder korrekt aus."));
            return;
        }

        const updatedPurchaseItems = newPurchase.purchaseItems.map((item, index) => ({
            ...item,
            position: index + 1,
        }));

        const newPurchaseToSend: NewPurchaseDto = {
            ...newPurchase,
            purchaseItems: updatedPurchaseItems,
            paymentStatus: 'AUSSTEHEND',
        };

        dispatch(addPurchase(newPurchaseToSend))
            .unwrap()
            .then(() => {
                showSuccessToast("Erfolg", "Bestellung erfolgreich erstellt.");
                reload();
                onSubmitSuccess?.();
                onClose();
            })
            .catch(error => handleApiError(error, "Die Bestellung konnte nicht erstellt werden."));
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

    return (
        <Dialog open onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
            <Grid container spacing={3} sx={{ p: 2 }}>
                {/* форма и добавленные товары */}
                <Grid item xs={12} md={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ textAlign: "left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd" }}>
                                NEUE BESTELLUNG
                            </Typography>
                            <FormControl sx={{ minWidth: 200 }} size="small">
                                <InputLabel id="purchase-type-label">Typ</InputLabel>
                                <Select
                                    labelId="purchase-type-label"
                                    id="purchase-type-select"
                                    value={newPurchase.type}
                                    onChange={(e) =>
                                        setNewPurchase({ ...newPurchase, type: e.target.value as PurchaseType })
                                    }
                                    label="Typ"
                                    aria-label="Typ der Anschaffung"
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
                            <Grid item xs={10}>
                                <Autocomplete
                                    fullWidth
                                    id="vendor-autocomplete"
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
                                        <TextField
                                            {...params}
                                            label="Lieferant"
                                            id="vendor-autocomplete-input"
                                            aria-label="Lieferant auswählen"
                                        />
                                    )}
                                />

                            </Grid>
                            <Grid item xs={1}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={handleCreateNewVendor}
                                    startIcon={<AddIcon />}
                                    sx={{ height: "100%", "&:hover": { borderColor: "#00acc1" } }}
                                >
                                    Neu
                                </Button>

                            </Grid>
                        </Grid>

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
                                                documentId: selectedId, // ✅ теперь сохраняем id, а не сам объект
                                            }));
                                        }}
                                    >
                                        <MenuItem value="">Bitte wählen</MenuItem>
                                        {documentTypes.map((doc) => (
                                            <MenuItem key={doc.id} value={doc.id}>
                                                {doc.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                            </Grid>

                            <Grid item xs={4}>
                                <TextField
                                    id="purchase-document-number"
                                    label="Dokumentnummer"
                                    value={newPurchase.documentNumber}
                                    onChange={(e) =>
                                        setNewPurchase({ ...newPurchase, documentNumber: e.target.value })
                                    }
                                    fullWidth
                                    aria-label="Dokumentnummer eingeben"
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
                                            <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd", borderLeft: "1px solid #ddd" }}>
                                                {item.position}
                                            </TableCell>
                                            <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>
                                                <TextField
                                                    id={`productName-${index}`}
                                                    variant="standard"
                                                    value={item.productName}
                                                    size="small"
                                                    onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                                                    InputProps={{ disableUnderline: true }}
                                                    inputProps={{ 'aria-label': 'Produktname' }}
                                                    sx={{
                                                        fontSize: '0.875rem',
                                                        '& .MuiInputBase-root': { border: 'none' },
                                                        '& .MuiInputBase-input': { fontSize: '0.875rem', padding: 0 },
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>
                                                <TextField
                                                    id={`quantity-${index}`}
                                                    variant="standard"
                                                    type="number"
                                                    value={item.quantity}
                                                    size="small"
                                                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                                                    InputProps={{ disableUnderline: true }}
                                                    inputProps={{ 'aria-label': 'Menge', min: 0, step: 0.01 }}
                                                    sx={{
                                                        fontSize: '0.875rem',
                                                        '& .MuiInputBase-root': { border: 'none' },
                                                        '& .MuiInputBase-input': { fontSize: '0.875rem', padding: 0 },
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>
                                                <TextField
                                                    id={`unitPrice-${index}`}
                                                    variant="standard"
                                                    type="number"
                                                    value={item.unitPrice}
                                                    size="small"
                                                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                                                    InputProps={{ disableUnderline: true }}
                                                    inputProps={{ 'aria-label': 'Einzelpreis', min: 0, step: 0.01 }}
                                                    sx={{
                                                        fontSize: '0.875rem',
                                                        '& .MuiInputBase-root': { border: 'none' },
                                                        '& .MuiInputBase-input': { fontSize: '0.875rem', padding: 0 },
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>
                                                <TextField
                                                    id={`taxPercentage-${index}`}
                                                    variant="standard"
                                                    type="number"
                                                    value={item.taxPercentage}
                                                    size="small"
                                                    fullWidth
                                                    onChange={(e) => handleItemChange(index, 'taxPercentage', parseFloat(e.target.value))}
                                                    InputProps={{ disableUnderline: true }}
                                                    inputProps={{ 'aria-label': 'Steuersatz', min: 0, step: 1 }}
                                                    sx={{
                                                        fontSize: '0.875rem',
                                                        '& .MuiInputBase-root': { border: 'none' },
                                                        '& .MuiInputBase-input': { fontSize: '0.875rem', padding: 0 },
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>
                                                {item.totalPrice.toFixed(2)}
                                            </TableCell>
                                            <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>
                                                {item.taxAmount.toFixed(2)}
                                            </TableCell>
                                            <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>
                                                <IconButton
                                                    onClick={() => handleRemoveItem(index)}
                                                    size="small"
                                                    color="error"
                                                    aria-label={`Position ${item.position} löschen`}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </StyledTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={2}>
                                <Button onClick={onClose} sx={{ marginTop: 7, width: "100%", "&:hover": { borderColor: "#00acc1" } }}>
                                    Abbrechen
                                </Button>
                            </Grid>
                            <Grid item xs={2}>
                                <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ marginTop: 7, width: "100%" }}>
                                    Speichern
                                </Button>
                            </Grid>
                            <Grid item xs={8} sx={{ textAlign: 'right' }}>
                                <Typography>Netto: {subtotal.toFixed(2)}</Typography>
                                <Typography>MWSt: {taxSum.toFixed(2)}</Typography>
                                <Typography variant="h6">Gesamtbetrag: {total.toFixed(2)}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* фильтрация и выбор товаров */}

                <Grid item xs={12} md={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography gutterBottom sx={{ color: "#00acc1", mb: 2, textAlign: 'left' }}>
                            Artikel zum Warenkorb hinzufügen
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={6}>
                                <Autocomplete
                                    fullWidth
                                    sx={{ mb: 2, mt: 1 }}
                                    options={categories}
                                    getOptionLabel={(option) => option.name}
                                    onChange={(_, newCategory) => {
                                        setSelectedCategory(newCategory?.id ?? null);
                                    }}
                                    value={categories.find(c => c.id === selectedCategory) || null}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            id="category-autocomplete"
                                            label="Kategorie"
                                            aria-label="Kategorie"
                                        />
                                    )}
                                />

                                <TextField
                                    id="product-filter"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    label="Suchen und filtern"
                                    aria-label="Suchen und filtern"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        endAdornment: searchTerm && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setSearchTerm('')}
                                                    size="small"
                                                    aria-label="Suche zurücksetzen"
                                                >
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
            {showCreateCustomer && (
                <CreateCustomer
                    onClose={() => setShowCreateCustomer(false)}
                    onSubmitSuccess={(createdCustomer) => {
                        setShowCreateCustomer(false);
                        // Добавим нового поставщика
                        setVendors(prev => [...prev, createdCustomer]);
                        // Выберем его как активного
                        setNewPurchase(prev => ({
                            ...prev,
                            vendorId: createdCustomer.id,
                        }));
                    }}
                />
            )}
        </Dialog>
    );

}



