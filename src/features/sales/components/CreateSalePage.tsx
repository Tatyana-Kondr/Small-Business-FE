import { useEffect, useMemo, useState } from 'react';
import {
    Box, TextField, Button, Typography, IconButton,
    FormControl, Select, MenuItem, Table,
    TableRow, TableCell, TableBody, Autocomplete,
    Grid,
    Paper,
    InputAdornment,
    InputLabel,
    Tooltip,
    SelectChangeEvent,
    CircularProgress,
    FormHelperText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ProductPickDto } from '../../products/types';
import { getCustomersPickListWithCustomerNumber, selectCustomersPickListWithNumber, selectLoadingPick } from '../../customers/customersSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { ClearIcon, DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/de';
import { deDE } from '@mui/x-date-pickers/locales';
import { getPickProducts, selectPickLoading, selectPickProducts } from '../../products/productsSlice';
import { getProductCategories, selectProductCategories } from '../../products/productCategoriesSlice';
import { NewSaleDto, NewSaleItemDto, NewShippingDimensionsDto } from '../types';
import { Dialog } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CreateCustomer from '../../customers/components/CreateCustomer';
import { handleApiError } from '../../../utils/handleApiError';
import { showSuccessToast } from '../../../utils/toast';
import { getShippings, selectShippings } from '../shippingsSlice';
import { getTermsOfPayment, selectTermsOfPayment } from '../termOfPaymentSlice';
import { actionIconButtonStyle, fixedCellWidth, saleTableCellStyle, saleTableCenterCellStyle, saleTableDeleteCellStyle, saleTableNameCellStyle, saleTableNameInputStyle, saleTableRightCellStyle, StyledTableHead, tableRowHoverStyle, tableStyle } from '../../../styles/tableStyles';
import { formSectionStyle, saleDateFieldStyle } from '../../../styles/formStyles';
import { formSaleSectionTitleStyle } from '../../../styles/typographyStyles';
import { addButtonStyle, cancelButtonStyle, primaryButtonStyle } from '../../../styles/buttonStyles';
import { HttpError } from "../../../utils/handleFetchError";
import { backendErrorsToFormErrors, clearFieldError, FormErrors, hasErrors, isBackendValidationErrors, validateRequiredFields } from '../../../utils/validation/validation';
import { fetchAddSale } from '../api';
import { colors } from '../../../styles/colors';
import CompactNumberCell from '../../../components/CompactNumberCell';


const typeOptions = ['VERKAUF', 'KUNDENERSTATTUNG'] as const;
type SaleType = typeof typeOptions[number];

type CreateSaleModalProps = {
    onClose: () => void;
    onSubmitSuccess?: () => void;
};

export default function CreateSaleModal({ onClose, onSubmitSuccess }: CreateSaleModalProps) {
    const dispatch = useAppDispatch();
    const today = dayjs();
    const todayString = today.format("YYYY-MM-DD");

    type SaleFormDto = Omit<NewSaleDto, "paymentStatus">;
    const [newSale, setNewSale] = useState<SaleFormDto>({
        customerId: 0,
        invoiceNumber: '',
        accountObject: '',
        typeOfOperation: 'VERKAUF',
        shippingId: null,
        termsOfPaymentId: 4,
        salesDate: todayString,
        paymentDate: '',
        orderNumber: '',
        orderType: '',
        deliveryDate: todayString,
        deliveryBill: '',
        defaultTax: 19,
        defaultDiscount: 0,
        salesItems: [],
    });

    const customersPickWithNumber = useAppSelector(selectCustomersPickListWithNumber);
    const customersPickLoading = useAppSelector(selectLoadingPick);
    const [dateValue, setDateValue] = useState<Dayjs | null>(today);
    const categories = useAppSelector(selectProductCategories);
    const shippings = useAppSelector(selectShippings);
    const termsOfPayment = useAppSelector(selectTermsOfPayment);
    const pickProducts = useAppSelector(selectPickProducts);
    const productsPickLoading = useAppSelector(selectPickLoading);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [weightInput, setWeightInput] = useState<string>('');
    const [deliveryDateValue, setDeliveryDateValue] = useState<Dayjs | null>(today);
    const [showCreateCustomer, setShowCreateCustomer] = useState(false);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors<NewSaleDto>>({});


    useEffect(() => {
        dispatch(getProductCategories());
        dispatch(getShippings());
        dispatch(getTermsOfPayment());
        dispatch(getCustomersPickListWithCustomerNumber())
            .unwrap()
            .catch(error => handleApiError(error, "Fehler beim Laden der Kunden"));
    }, [dispatch]);

    useEffect(() => {
        const term = searchTerm.trim();

        // если ничего не выбрано и мало символов — очищаем список и не дергаем сервер
        if (selectedCategory === null && term.length < 2) {
            // можно очистить список отдельным action, но проще: просто не показывать таблицу
            return;
        }

        const t = setTimeout(() => {
            dispatch(
                getPickProducts({
                    searchTerm: term,
                    categoryId: selectedCategory,
                    limit: 50,
                })
            );
        }, 350);

        return () => clearTimeout(t);
    }, [dispatch, searchTerm, selectedCategory]);

    useEffect(() => {
        setSearchTerm("");
    }, [selectedCategory]);

    const { subtotal, taxSum, total } = useMemo(() => {
        if (!newSale.salesItems.length) {
            return {
                subtotal: 0,
                taxSum: 0,
                total: 0,
            };
        }

        let subtotal = 0;
        let taxSum = 0;
        let total = 0;

        for (const item of newSale.salesItems) {
            subtotal += Number.isFinite(
                Number(item.totalPrice)
            )
                ? Number(item.totalPrice)
                : 0;

            taxSum += Number.isFinite(
                Number(item.taxAmount)
            )
                ? Number(item.taxAmount)
                : 0;

            total += Number.isFinite(
                Number(item.totalAmount)
            )
                ? Number(item.totalAmount)
                : 0;
        }

        return {
            subtotal: Number(subtotal.toFixed(2)),
            taxSum: Number(taxSum.toFixed(2)),
            total: Number(total.toFixed(2)),
        };
    }, [newSale.salesItems]);

    useEffect(() => {
        setNewSale(prev => {
            const updatedItems = prev.salesItems.map(item => {
                const quantity = item.quantity;
                const unitPrice = item.unitPrice;
                const subTotalPrice = quantity * unitPrice;

                const discount = prev.defaultDiscount;
                const discountAmount = (subTotalPrice * discount) / 100;
                const totalPrice = subTotalPrice - discountAmount;

                const tax = prev.defaultTax;
                const taxAmount = (totalPrice * tax) / 100;
                const totalAmount = totalPrice + taxAmount;

                return {
                    ...item,
                    discount,
                    tax,
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
    }, [newSale.defaultTax, newSale.defaultDiscount]);

    const handleAddProductToCart = (product: ProductPickDto) => {
        setNewSale((prev) => {
            const quantity = 1;
            const unitPrice = product.sellingPrice;

            const totalPriceBeforeDiscount = roundMoney(
                quantity * unitPrice
            );

            const discount = prev.defaultDiscount;

            const discountAmount = roundMoney(
                (totalPriceBeforeDiscount * discount) / 100
            );

            const totalPrice = roundMoney(
                totalPriceBeforeDiscount - discountAmount
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

            const updatedItems = [...prev.salesItems, item];

            console.log("Artikel im Auftrag:", updatedItems);

            return {
                ...prev,
                salesItems: updatedItems,
            };
        });
        setErrors((prev) =>
            clearFieldError(prev, "salesItems")
        );

    };

    const handleRemoveItem = (index: number) => {
        setNewSale(prev => ({
            ...prev,
            salesItems: prev.salesItems.filter((_, i) => i !== index),
        }));
    };

    const handleCreateNewCustomer = () => {
        setShowCreateCustomer(true);
    };

    const handleSubmit = async () => {
        const validationErrors = validateRequiredFields(newSale, [
            "customerId",
            "salesDate",
            "termsOfPaymentId",
        ]);

        if (!newSale.salesItems.length) {
            validationErrors.salesItems =
                "Bitte mindestens einen Artikel hinzufügen.";
        }

        setErrors(validationErrors);

        if (hasErrors(validationErrors)) {
            return;
        }
        setLoading(true);

        try {
            const updatedSaleItems = newSale.salesItems.map(
                (item, index) => ({
                    ...item,
                    position: index + 1,
                    unitPrice: roundMoney(Number(item.unitPrice)),
                    discountAmount: roundMoney(Number(item.discountAmount)),
                    totalPrice: roundMoney(Number(item.totalPrice)),
                    taxAmount: roundMoney(Number(item.taxAmount)),
                    totalAmount: roundMoney(Number(item.totalAmount)),
                })
            );

            const dtoToSend: NewSaleDto = {
                ...newSale,
                paymentDate: undefined,
                salesItems: updatedSaleItems,
                paymentStatus: "OFFEN",
            };

            await fetchAddSale(dtoToSend);

            showSuccessToast(
                "Erfolg",
                "Auftrag erfolgreich erstellt."
            );

            onSubmitSuccess?.();
            onClose();

        } catch (error) {
            if (
                error instanceof HttpError &&
                isBackendValidationErrors(error.data)
            ) {
                setErrors(
                    backendErrorsToFormErrors<SaleFormDto>(
                        error.data.errors
                    )
                );

                return;
            }

            handleApiError(
                error,
                "Der Auftrag konnte nicht erstellt werden."
            );

        } finally {
            setLoading(false);
        }
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

    const roundMoney = (value: number): number => {
        return Number(value.toFixed(2));
    };

    const handleItemChange = (
        index: number,
        field: keyof NewSaleItemDto,
        value: string | number
    ) => {
        setNewSale((prev) => {
            const updatedItems = [...prev.salesItems];

            const currentItem: NewSaleItemDto = {
                ...updatedItems[index],
                [field]: value,
            };

            const quantity = Number.isFinite(
                Number(currentItem.quantity)
            )
                ? Number(currentItem.quantity)
                : 0;

            const unitPrice = Number.isFinite(
                Number(currentItem.unitPrice)
            )
                ? Number(currentItem.unitPrice)
                : 0;

            const discount = Number.isFinite(
                Number(currentItem.discount)
            )
                ? Number(currentItem.discount)
                : 0;

            const tax = Number.isFinite(
                Number(currentItem.tax)
            )
                ? Number(currentItem.tax)
                : prev.defaultTax;

            const subtotalBeforeDiscount = roundMoney(
                quantity * unitPrice
            );

            const discountAmount = roundMoney(
                (subtotalBeforeDiscount * discount) / 100
            );

            const totalPrice = roundMoney(
                subtotalBeforeDiscount - discountAmount
            );

            const taxAmount = roundMoney(
                (totalPrice * tax) / 100
            );

            const totalAmount = roundMoney(
                totalPrice + taxAmount
            );

            currentItem.quantity = quantity;
            currentItem.unitPrice = unitPrice;
            currentItem.discount = discount;
            currentItem.tax = tax;
            currentItem.discountAmount = discountAmount;
            currentItem.totalPrice = totalPrice;
            currentItem.taxAmount = taxAmount;
            currentItem.totalAmount = totalAmount;

            updatedItems[index] = currentItem;

            return {
                ...prev,
                salesItems: updatedItems,
            };
        });
    };

    return (
        <Dialog open onClose={onClose} maxWidth="lg" fullWidth scroll="paper" >
            <Grid container spacing={3} sx={{ p: 2 }}>
                {/* форма и добавленные товары */}
                <Grid item xs={12} md={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ textAlign: "left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd" }}>
                                NEUER AUFTRAG
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
                                    loading={customersPickLoading}
                                    options={[...customersPickWithNumber].sort((a, b) => a.name.localeCompare(b.name))}
                                    getOptionLabel={(option) =>
                                        option.customerNumber ? `${option.name} (${option.customerNumber})` : option.name
                                    }
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    onChange={(_, value) => {
                                        setNewSale((prev) => ({
                                            ...prev,
                                            customerId: value?.id ?? 0,
                                        }));

                                        setErrors((prev) =>
                                            clearFieldError(prev, "customerId")
                                        );
                                    }}
                                    value={customersPickWithNumber.find((v) => v.id === newSale.customerId) || null}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Kunde"
                                            error={Boolean(errors.customerId)}
                                            helperText={errors.customerId}
                                            disabled={loading}
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
                            {/* Кнопка для создания нового клиента */}
                            <Grid item xs={1} sx={{ display: "flex", alignItems: "flex-start" }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleCreateNewCustomer}
                                    startIcon={<AddIcon />}
                                    sx={addButtonStyle}
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
                                        label="Auftragsdatum"
                                        value={dateValue}
                                        onChange={(newValue) => {
                                            setDateValue(newValue);

                                            const formattedDate = newValue
                                                ? newValue.format("YYYY-MM-DD")
                                                : "";

                                            setNewSale((prev) => ({
                                                ...prev,
                                                salesDate: formattedDate,
                                                deliveryDate:
                                                    prev.deliveryDate || formattedDate,
                                            }));

                                            setErrors((prev) =>
                                                clearFieldError(prev, "salesDate")
                                            );

                                            if (!deliveryDateValue && newValue) {
                                                setDeliveryDateValue(newValue);
                                            }
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
                                                sx: saleDateFieldStyle,
                                                error: Boolean(errors.salesDate),
                                                helperText: errors.salesDate,
                                                disabled: loading,
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                        </Grid>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={4}>
                                <FormControl fullWidth>
                                    <TextField
                                        id="account-object"
                                        name="accountObject"
                                        label="Objekt"
                                        value={newSale.accountObject}
                                        onChange={(e) => setNewSale({ ...newSale, accountObject: e.target.value })}
                                        fullWidth
                                    />
                                </FormControl>
                            </Grid>

                            <Grid item xs={4}>
                                <FormControl
                                    fullWidth
                                    error={Boolean(errors.termsOfPaymentId)}
                                >
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
                                            <MenuItem
                                                key={term.id}
                                                value={term.id}
                                            >
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

                            <Grid item xs={2}>
                                <FormControl fullWidth>
                                    <InputLabel id="default-tax-label" htmlFor="default-tax-select">MWSt %</InputLabel>
                                    <Select
                                        id="default-tax-select"
                                        labelId="default-tax-label"
                                        label="MWSt %"
                                        value={newSale.defaultTax}
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

                            <Grid item xs={2}>
                                <FormControl fullWidth>
                                    <InputLabel id="default-discount-label" htmlFor="default-discount-select">Rabatt %</InputLabel>
                                    <Select
                                        id="default-discount-select"
                                        labelId="default-discount-label"
                                        label="Rabatt %"
                                        value={newSale.defaultDiscount}
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
                                            onChange={(_, value) => {
                                                setNewSale((prev) => ({
                                                    ...prev,
                                                    shippingId: value?.id ?? null,
                                                }));
                                            }}
                                            value={shippings.find((v) => v.id === newSale.shippingId) || null}
                                            renderInput={(params) => <TextField {...params} label="Versand" />}
                                        />
                                    </Grid>

                                    <Grid item xs={8}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={3}>
                                                <TextField
                                                    id="shipping-width"
                                                    label="Breite (cm)"
                                                    value={newSale.shippingDimensions?.width ?? ''}
                                                    onChange={(e) => updateShippingDimension('width', e.target.value)}
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid item xs={3}>
                                                <TextField
                                                    id="shipping-length"
                                                    label="Länge (cm)"
                                                    value={newSale.shippingDimensions?.length ?? ''}
                                                    onChange={(e) => updateShippingDimension('length', e.target.value)}
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid item xs={3}>
                                                <TextField
                                                    id="shipping-height"
                                                    label="Höhe (cm)"
                                                    value={newSale.shippingDimensions?.height ?? ''}
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
                                                        const val = e.target.value.replace(/[^0-9,]/g, "");
                                                        setWeightInput(val);
                                                    }}
                                                    onBlur={() => {
                                                        const parsed = parseFloat(weightInput.replace(",", "."));
                                                        setNewSale((prev) => ({
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


                        {/*  Bestellung Block */}
                        <Grid item xs={12}>
                            <Paper sx={formSectionStyle}>
                                <Typography sx={formSaleSectionTitleStyle}>
                                    Bestelldaten
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                        <TextField
                                            id="order-number"
                                            label="Bestell-Nr"
                                            value={newSale.orderNumber}
                                            onChange={(e) => setNewSale({ ...newSale, orderNumber: e.target.value })}
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid item xs={4}>
                                        <TextField
                                            id="order-type"
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
                                                slotProps={{
                                                    textField: { id: 'delivery-date', fullWidth: true, size: "small", sx: saleDateFieldStyle, },
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Artikeln_Tabelle */}
                        <Box sx={{ minHeight: 200, overflowY: 'auto', mb: 2, border: "1px solid #ddd" }}>
                            <Table size="small" sx={tableStyle}>
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
                                    {newSale.salesItems.map((item, index) => (
                                        <TableRow key={index} sx={tableRowHoverStyle}>
                                            <TableCell sx={{ ...saleTableCenterCellStyle, ...fixedCellWidth(45), borderLeft: `1px solid ${colors.border}`, }}>{item.position}</TableCell>
                                            <TableCell sx={{ ...saleTableCellStyle, ...fixedCellWidth(110), }}>{item.productArticle}</TableCell>
                                            <TableCell sx={{ ...saleTableNameCellStyle, width: "40%", verticalAlign: "middle", py: 1 }}>
                                                <TextField
                                                    id={`product-name-${index}`}
                                                    aria-label="Produktname"
                                                    variant="standard"
                                                    multiline
                                                    fullWidth
                                                    minRows={1}
                                                    value={item.productName}
                                                    disabled={false}
                                                    onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                                                    slotProps={{ input: { disableUnderline: true, }, }}
                                                    sx={saleTableNameInputStyle}
                                                />
                                            </TableCell>

                                            <TableCell sx={{ ...saleTableCellStyle, ...fixedCellWidth(75), }}>
                                                <CompactNumberCell
                                                    value={item.quantity}
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
                                                            ...actionIconButtonStyle,
                                                            "&:hover": {
                                                                color: colors.danger,
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

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "flex-end",
                                justifyContent: "space-between",
                                gap: 3,
                                mt: 3,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 2,
                                }}
                            >
                                <Button
                                    onClick={onClose}
                                    sx={cancelButtonStyle}
                                    disabled={loading}
                                >
                                    Abbrechen
                                </Button>

                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    sx={primaryButtonStyle}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        "Speichern"
                                    )}
                                </Button>
                            </Box>

                            <Box sx={{ minWidth: 260, textAlign: 'right' }}>
                                <Typography>Netto: {subtotal.toFixed(2)} €</Typography>
                                <Typography>MWSt: {taxSum.toFixed(2)} €</Typography>
                                <Typography variant="h6">Gesamtbetrag: {total.toFixed(2)} €</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* фильтрация и выбор товаров */}

                {/* фильтрация и выбор товаров */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography sx={formSaleSectionTitleStyle}>
                            Artikel zum Warenkorb hinzufügen
                        </Typography>

                        {/* Kategorie + Suche */}
                        <Grid
                            container
                            spacing={2}
                            alignItems="center"
                            sx={{ mt: 1, mb: 2 }}
                        >
                            {/* Kategorie */}
                            <Grid item xs={4}>
                                <Autocomplete
                                    fullWidth
                                    options={[...categories].sort(
                                        (a, b) => a.name.localeCompare(b.name)
                                    )}
                                    getOptionLabel={(option) => option.name}
                                    onChange={(_, newCategory) => {
                                        setSelectedCategory(newCategory?.id ?? null);
                                    }}
                                    value={
                                        categories.find(
                                            (c) => c.id === selectedCategory
                                        ) || null
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
                                    placeholder="Produktname, Artikel, Lieferanten-Artikel suchen..."
                                    aria-label="Produkt suchen"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
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

                        {/* Tabelle */}
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

                                    <Typography
                                        variant="caption"
                                        sx={{ ml: 1 }}
                                    >
                                        Produkte werden geladen…
                                    </Typography>
                                </Box>
                            )}

                            {!productsPickLoading &&
                                pickProducts.length === 0 &&
                                (searchTerm.length >= 2 ||
                                    selectedCategory !== null) && (
                                    <Box
                                        sx={{
                                            p: 1,
                                            textAlign: "center",
                                            color: "text.secondary",
                                        }}
                                    >
                                        <Typography variant="caption">
                                            Keine Produkte gefunden
                                        </Typography>
                                    </Box>
                                )}

                            <Table
                                size="small"
                                stickyHeader
                                sx={tableStyle}
                            >
                                <StyledTableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: "40%" }}>
                                            Artikelname
                                        </TableCell>

                                        <TableCell sx={fixedCellWidth(140)}>
                                            Artikel
                                        </TableCell>

                                        <TableCell sx={{ width: "30%" }}>
                                            Lieferanten-Artikel
                                        </TableCell>

                                        <TableCell sx={fixedCellWidth(100)}>
                                            Preis
                                        </TableCell>
                                    </TableRow>
                                </StyledTableHead>

                                <TableBody>
                                    {pickProducts.map((product) => (
                                        <TableRow
                                            key={product.id}
                                            sx={tableRowHoverStyle}
                                            onDoubleClick={() =>
                                                handleAddProductToCart(product)
                                            }
                                        >
                                            <TableCell sx={saleTableCellStyle}>
                                                {product.name}
                                            </TableCell>

                                            <TableCell sx={saleTableCellStyle}>
                                                {product.article}
                                            </TableCell>

                                            <TableCell sx={saleTableCellStyle}>
                                                {product.vendorArticle ?? ""}
                                            </TableCell>

                                            <TableCell
                                                sx={saleTableRightCellStyle}
                                            >
                                                {Number(
                                                    product.sellingPrice ?? 0
                                                ).toLocaleString("de-DE", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {!productsPickLoading &&
                                        pickProducts.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    align="center"
                                                >
                                                    Keine Produkte gefunden
                                                </TableCell>
                                            </TableRow>
                                        )}
                                </TableBody>
                            </Table>
                        </Box>
                    </Paper>
                </Grid>
            </Grid >
            {showCreateCustomer && (
                <CreateCustomer
                    mode="customer"
                    onClose={() => setShowCreateCustomer(false)}
                    onSubmitSuccess={(createdCustomer) => {
                        setShowCreateCustomer(false);
                        // Добавим нового поставщика
                        // обновляем pick list
                        dispatch(getCustomersPickListWithCustomerNumber());
                        // выбираем его
                        setNewSale(prev => ({
                            ...prev,
                            customerId: createdCustomer.id,
                        }));
                    }}
                />
            )}
        </Dialog >
    );
}



