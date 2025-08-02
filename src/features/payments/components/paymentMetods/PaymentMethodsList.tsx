import { Box, Container, Paper, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button, Checkbox } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { useEffect, useState } from "react";
import KeyboardDoubleArrowLeftOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftOutlined';
import { useNavigate } from "react-router-dom";
import { getPaymentMethods, selectPaymentMethods, updatePaymentMethod } from "../../paymentMethodsSlice";
import { NewPaymentMethodDto, PaymentMethod } from "../../types";
import DeletePaymentMethod from "./DeletePaymentMethod";
import EditPaymentMethod from "./EditPaymentMethod";
import { CreatePaymentMethod } from "./CreatePaymentMethod";

const StyledTableHead = styled(TableHead)(({
    backgroundColor: "#1a3d6d",
    "& th": {
        color: "white",
        fontWeight: "bold",
        borderRight: "1px solid #ddd",
        textAlign: "center"
    },
}));
const StyledTableRow = styled(TableRow)({
    "&:hover": {
        backgroundColor: "#f5f5f5", // Подсветка строки при наведении
        cursor: "pointer",
    },
});

export default function PaymentMethodsList() {
    const dispatch = useAppDispatch();
    const paymentMethods = useAppSelector(selectPaymentMethods);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
    const navigate = useNavigate();
    const [openModal, setOpenModal] = useState(false);
    const [editOpen, setEditOpen] = useState(false);



    useEffect(() => {
        dispatch(getPaymentMethods());
    }, [dispatch]);

    const handleEdit = (method: PaymentMethod) => {
        setSelectedPaymentMethod(method);
        setEditOpen(true);
    };

    const handleToggleActive = async (method: PaymentMethod) => {
        const updatedMethod: NewPaymentMethodDto = {
            provider: method.provider,
            maskedNumber: method.maskedNumber,
            details: method.details,
            active: !method.active,
        };

        try {
            await dispatch(updatePaymentMethod({ id: method.id, updatedPaymentMethod: updatedMethod })).unwrap();
            dispatch(getPaymentMethods()); // Обновим список после успешного изменения
        } catch (error) {
            console.error("Fehler beim Umschalten des Status", error);
            alert("Fehler beim Aktualisieren des Status");
        }
    };


    const handleGoBack = () => {
        navigate(-1)
    }

    return (
        <Container>
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
                    }}
                >
                    <KeyboardDoubleArrowLeftOutlinedIcon fontSize="large" /> 
                    ZURÜCK
                </Button>
            {/* Верхняя панель */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography sx={{ textAlign: "left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd" }}>ZAHLUNGSMETHODEN</Typography>
                <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
                    Neuen Zahlungsmethode anlegen
                </Button>
            </Box>

            {/* Таблица */}
            <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                <Table>
                    <StyledTableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Anbieter</TableCell>
                            <TableCell>Karte/Konto-nummer</TableCell>
                            <TableCell>Einzelheiten</TableCell>
                            <TableCell>Aktiv</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </StyledTableHead>
                    <TableBody>
                        {paymentMethods.length > 0 ? (
                            paymentMethods.map((method) => (
                                <StyledTableRow key={method.id}>
                                    <TableCell style={{ padding: "6px 12px", borderRight: "1px solid #ddd", borderLeft: "1px solid #ddd" }}>{method.id}</TableCell>
                                    <TableCell sx={{ width: "400px", padding: "6px 12px", borderRight: "1px solid #ddd" }}>{method.provider}</TableCell>
                                    <TableCell sx={{ width: "100px", padding: "6px 12px", borderRight: "1px solid #ddd" }}>{method.maskedNumber}</TableCell>
                                    <TableCell sx={{ width: "100px", padding: "6px 12px", borderRight: "1px solid #ddd" }}>{method.details}</TableCell>
                                    <TableCell sx={{ textAlign: "center", borderRight: "1px solid #ddd" }}>
                                        <Checkbox
                                            checked={method.active}
                                            onChange={() => handleToggleActive(method)}
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ width: "200px", padding: "6px", borderRight: "1px solid #ddd" }}>
                                        <Box display="flex" justifyContent="space-between" gap={1}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleEdit(method)}
                                                sx={{ minWidth: "100px", "&:hover": { borderColor: "#00acc1" } }}
                                            >
                                                Bearbeiten
                                            </Button>

                                            <Box sx={{ minWidth: "80px" }}>
                                                <DeletePaymentMethod
                                                    methodId={method.id}
                                                    methodProvider={method.provider}
                                                />
                                            </Box>
                                        </Box>
                                    </TableCell>

                                </StyledTableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">Keine Zahlungsmethoden vorhanden</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <CreatePaymentMethod open={openModal} onClose={() => setOpenModal(false)} />

            <EditPaymentMethod
                open={editOpen}
                onClose={() => setEditOpen(false)}
                method={selectedPaymentMethod}
            />
        </Container>
    );
}
