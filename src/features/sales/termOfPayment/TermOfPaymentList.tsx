import { Box, Button, Container, Paper, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import DeleteDocumentType from "./DeleteTermOfPayment";
import { getTermsOfPayment, selectTermsOfPayment } from "../termOfPaymentSlice";
import { TermOfPayment } from "../types";
import { CreateTermOfPayment } from "./CreateTermOfPayment";
import EditTermOfPayment from "./EditTermOfPayment";


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

export default function TermOfPaymentList() {
    const dispatch = useAppDispatch();
    const types = useAppSelector(selectTermsOfPayment);
    const [selectedTerm, setSelectedTerm] = useState<TermOfPayment | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {
        dispatch(getTermsOfPayment());
    }, [dispatch]);

    const handleEdit = (type: TermOfPayment) => {
        setSelectedTerm(type);
        setEditOpen(true);
    };

    return (
       <Container>
            {/* Верхняя панель */}
            <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>                            
                <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
                    Neue Zahlungsbedingung anlegen
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
                        {types.length > 0 ? (
                            types.map((term) => (
                                <StyledTableRow key={term.id}>
                                    <TableCell style={{ padding: "6px 12px", borderRight: "1px solid #ddd", borderLeft: "1px solid #ddd" }}>{term.id}</TableCell>
                                    <TableCell sx={{ width: "400px", padding: "6px 12px", borderRight: "1px solid #ddd" }}>{term.name}</TableCell>
                                    <TableCell sx={{ width: "200px", padding: "6px", borderRight: "1px solid #ddd" }}>
                                        <Box display="flex" justifyContent="space-between" gap={1}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleEdit(term)}
                                                sx={{ minWidth: "100px", "&:hover": { borderColor: "#00acc1" } }}
                                            >
                                                Bearbeiten
                                            </Button>

                                            <Box sx={{ minWidth: "80px" }}>
                                                <DeleteDocumentType
                                                    termId={term.id}
                                                    name={term.name}
                                                />
                                            </Box>
                                        </Box>
                                    </TableCell>

                                </StyledTableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">Keine Zahlungsbedingungen vorhanden</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <CreateTermOfPayment open={openModal} onClose={() => setOpenModal(false)} />

            <EditTermOfPayment
                open={editOpen}
                onClose={() => setEditOpen(false)}
                term={selectedTerm}
            />
        </Container>
    );
}
