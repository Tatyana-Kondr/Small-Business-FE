import { Box, Paper, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button, Container } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { useEffect, useState } from "react";
import KeyboardDoubleArrowLeftOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftOutlined';
import { useNavigate } from "react-router-dom";
import { getPaymentProcesses, selectPaymentProcesses } from "../../paymentProcessesSlice";
import { PaymentProcess } from "../../types";
import DeletePaymentProcess from "./DeletePaymentProcess";
import { CreatePaymentProcess } from "./CreatePaymentProcess";
import EditPaymentProcess from "./EditPaymentProcess";


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
    backgroundColor: "#ffffff",
    "&:hover": {
        backgroundColor: "#f5f5f5", // Подсветка строки при наведении
        cursor: "pointer",
    },
});

export default function PaymentProcessesList() {
    const dispatch = useAppDispatch();
    const paymentProcesses = useAppSelector(selectPaymentProcesses);
    const [selectedPaymentProcess, setSelectedPaymentProcess] = useState<PaymentProcess | null>(null);
    const navigate = useNavigate();
    const [openModal, setOpenModal] = useState(false);
    const [editOpen, setEditOpen] = useState(false);



    useEffect(() => {
        dispatch(getPaymentProcesses());
    }, [dispatch]);

    const handleEdit = (process: PaymentProcess) => {
        setSelectedPaymentProcess(process);
        setEditOpen(true);
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
                    <KeyboardDoubleArrowLeftOutlinedIcon fontSize="large" /> ZURÜCK
                </Button>

            {/* Верхняя панель */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography  sx={{ textAlign:"left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd"}}>ZALUNGSVORGÄNGE</Typography>
                
                
                <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
                    Neuen Vogang anlegen
                </Button>
            </Box>

            {/* Таблица */}
            <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                <Table>
                    <StyledTableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </StyledTableHead>
                    <TableBody>
                        {paymentProcesses.length > 0 ? (
                            paymentProcesses.map((process) => (
                                <StyledTableRow key={process.id}>
                                    <TableCell style={{ padding: "6px 12px", borderRight: "1px solid #ddd", borderLeft: "1px solid #ddd" }}>{process.id}</TableCell>
                                    <TableCell sx={{ width: "400px", padding: "6px 12px", borderRight: "1px solid #ddd" }}>{process.processName}</TableCell>
                                    <TableCell sx={{ width: "200px", padding: "6px", borderRight: "1px solid #ddd" }}>
                                        <Box display="flex" justifyContent="space-between" gap={1}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleEdit(process)}
                                                sx={{ minWidth: "100px", "&:hover": { borderColor: "#00acc1" } }}
                                            >
                                                Bearbeiten
                                            </Button>

                                            <Box sx={{ minWidth: "80px" }}>
                                                <DeletePaymentProcess
                                                    processId={process.id}
                                                    processName={process.processName}
                                                />
                                            </Box>
                                        </Box>
                                    </TableCell>

                                </StyledTableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">Keine Zahlungsvorgänge vorhanden</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <CreatePaymentProcess open={openModal} onClose={() => setOpenModal(false)} />

            <EditPaymentProcess
                open={editOpen}
                onClose={() => setEditOpen(false)}
                process={selectedPaymentProcess}
            />
        </Container>
    );
}
