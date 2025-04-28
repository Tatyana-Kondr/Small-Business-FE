import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Grid, Typography, IconButton, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Иконка для закрытия окна
import { NewPurchaseDto, NewPurchaseItemDto } from '../types';

const typeOptions = ['EINKAUF', 'LIEFERANT_RABATT'] as const;
type PurchaseType = typeof typeOptions[number];

interface CreatePurchaseModalProps {
    open: boolean;
    handleClose: () => void;
    handleCreateProduct: (newPurchase: NewPurchaseDto) => void; // Обратите внимание на тип
}

const CreatePurchaseModal: React.FC<CreatePurchaseModalProps> = ({
    open,
    handleClose,
    handleCreateProduct,
}) => {
    const [newPurchase, setNewPurchase] = useState<Omit<NewPurchaseDto, 'paymentStatus'>>({
        vendorId: 0,
        purchasingDate: '',
        type: 'EINKAUF',
        document: '',
        documentNumber: '',
        subtotal: 0,
        taxSum: 0,
        total: 0,
        purchaseItems: [],
    });


    const [newItem, setNewItem] = useState<NewPurchaseItemDto>({
        productId: 0, // Мы будем использовать только id
        productName: '',
        purchaseId: 0,
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        taxPercentage: 0,
        taxAmount: 0,
        totalAmount: 0,
        position: 0,
    });

    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        const numericFields = [
            'quantity',
            'unitPrice',
            'totalPrice',
            'taxPercentage',
            'taxAmount',
            'totalAmount',
            'position',
            'productId',
        ];

        setNewItem((prev) => ({
            ...prev,
            [name]: numericFields.includes(name) ? +value : value,
        }));
    };

    const handleAddItem = () => {
        setNewPurchase((prev) => ({
            ...prev,
            purchaseItems: [...prev.purchaseItems, newItem], // Добавляем товар в список покупки
        }));
        setNewItem({
            productId: 0,
            productName: '',
            purchaseId: 0,
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0,
            taxPercentage: 0,
            taxAmount: 0,
            totalAmount: 0,
            position: 0,
        });
    };

    const handleDocumentChange = (event: SelectChangeEvent<string>) => {
        setNewPurchase({ ...newPurchase, document: event.target.value });
    };


    const formatDate = (dateString: string): string => {
        const [day, month, year] = dateString.split('.');
        return `${year}-${month}-${day}`;
    };

    const handleSubmit = () => {
        const formattedDate = formatDate(newPurchase.purchasingDate);

        const newPurchaseToSend: NewPurchaseDto = {
            ...newPurchase,
            purchasingDate: formattedDate,
            paymentStatus: 'NICHT_BEZAHLT',
        };

        handleCreateProduct(newPurchaseToSend);
        handleClose();
    };



    return (
        <Modal open={open} onClose={handleClose}>
            <Box
                sx={{
                    width: '80%',  // Увеличиваем ширину (например, 80% от экрана)
                    maxWidth: 900, // Максимальная ширина, чтобы окно не становилось слишком широким
                    backgroundColor: 'white',
                    margin: 'auto',
                    padding: 3,
                    borderRadius: 2,
                    boxShadow: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    maxHeight: '80vh', // Устанавливаем максимальную высоту окна (80% от высоты экрана)
                    overflowY: 'auto', // Добавляем прокрутку, если контент выходит за пределы окна
                }}
            >
                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        color: 'gray',
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <Typography variant="h6" sx={{ textAlign: 'center', mb: 3 }}>
                    Создание новой покупки
                </Typography>

                <TextField
                    label="ID поставщика"
                    name="vendorId"
                    value={newPurchase.vendorId}
                    onChange={(e) =>
                        setNewPurchase({ ...newPurchase, vendorId: +e.target.value })
                    }
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Дата покупки"
                    name="purchasingDate"
                    value={newPurchase.purchasingDate}
                    onChange={(e) =>
                        setNewPurchase({ ...newPurchase, purchasingDate: e.target.value })
                    }
                    fullWidth
                    sx={{ mb: 2 }}
                />
                {/* Выбор типа операции */}
                <FormControl fullWidth>
                    <InputLabel>Тип операции</InputLabel>
                    <Select
                        label="Тип операции"
                        value={newPurchase.type}
                        onChange={(event: SelectChangeEvent) => {
                            setNewPurchase((prev) => ({
                                ...prev,
                                type: event.target.value as PurchaseType,
                            }));
                        }}
                    >
                        {typeOptions.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Тип документа</InputLabel>
                    <Select
                        value={newPurchase.document}
                        onChange={handleDocumentChange}
                        label="Тип документа"
                    >
                        <MenuItem value="RECHNUNG">RECHNUNG</MenuItem>
                        <MenuItem value="BON">BON</MenuItem>
                        <MenuItem value="BESTELLUNG">BESTELLUNG</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    label="Номер документа"
                    name="documentNumber"
                    value={newPurchase.documentNumber}
                    onChange={(e) =>
                        setNewPurchase({ ...newPurchase, documentNumber: e.target.value })
                    }
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Сумма без налога"
                    name="subtotal"
                    value={newPurchase.subtotal}
                    onChange={(e) =>
                        setNewPurchase({ ...newPurchase, subtotal: +e.target.value })
                    }
                    type="number"
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Налог"
                    name="taxSum"
                    value={newPurchase.taxSum}
                    onChange={(e) =>
                        setNewPurchase({ ...newPurchase, taxSum: +e.target.value })
                    }
                    type="number"
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Итоговая сумма"
                    name="total"
                    value={newPurchase.total}
                    onChange={(e) =>
                        setNewPurchase({ ...newPurchase, total: +e.target.value })
                    }
                    type="number"
                    fullWidth
                    sx={{ mb: 2 }}
                />

                <Typography variant="h6" sx={{ textAlign: 'center', mb: 3 }}>
                    Добавление товара
                </Typography>

                <TextField
                    label="ID товара"
                    name="productId"
                    type="number"
                    value={newItem.productId}
                    onChange={handleItemChange}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                
                <TextField
                    label="Наименование товара"
                    name="productName"
                    value={newItem.productName}
                    onChange={handleItemChange}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Количество"
                    name="quantity"
                    value={newItem.quantity}
                    onChange={handleItemChange}
                    type="number"
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Цена за единицу"
                    name="unitPrice"
                    value={newItem.unitPrice}
                    onChange={handleItemChange}
                    type="number"
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <Button
                    variant="contained"
                    onClick={handleAddItem}
                    fullWidth
                    sx={{ mb: 2 }}
                >
                    Добавить товар
                </Button>

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={handleClose}
                            sx={{
                                borderColor: '#1976d2',
                                color: '#1976d2',
                                '&:hover': {
                                    borderColor: '#1565c0',
                                    color: '#1565c0',
                                },
                            }}
                        >
                            Отменить
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleSubmit}
                            sx={{
                                backgroundColor: '#1976d2',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#1565c0',
                                },
                            }}
                        >
                            Создать покупку
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Modal>
    );
};

export default CreatePurchaseModal;