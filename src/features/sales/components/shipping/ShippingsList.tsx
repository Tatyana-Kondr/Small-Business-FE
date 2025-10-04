import { Box, Button, Container, Paper, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { getShippings, selectShippings } from "../../shippingsSlice";
import { useEffect, useState } from "react";
import { Shipping } from "../../types";
import DeleteShipping from "./DeleteShipping";
import { CreateShipping } from "./CreateShipping";
import EditShipping from "./EditShipping";

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

export default function ShippingsList() {
    const dispatch = useAppDispatch();
    const shippings = useAppSelector(selectShippings);
    const [selectedShipping, setSelectedShipping] = useState<Shipping | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {
        dispatch(getShippings());
    }, [dispatch]);

    const handleEdit = (shipping: Shipping) => {
        setSelectedShipping(shipping);
        setEditOpen(true);
    };

    return (
       <Container>
            {/* Верхняя панель */}
            <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>                            
                <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
                    Neuen Versandart anlegen
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
                        {shippings.length > 0 ? (
                            shippings.map((shipping) => (
                                <StyledTableRow key={shipping.id}>
                                    <TableCell style={{ padding: "6px 12px", borderRight: "1px solid #ddd", borderLeft: "1px solid #ddd" }}>{shipping.id}</TableCell>
                                    <TableCell sx={{ width: "400px", padding: "6px 12px", borderRight: "1px solid #ddd" }}>{shipping.name}</TableCell>
                                    <TableCell sx={{ width: "200px", padding: "6px", borderRight: "1px solid #ddd" }}>
                                        <Box display="flex" justifyContent="space-between" gap={1}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleEdit(shipping)}
                                                sx={{ minWidth: "100px", "&:hover": { borderColor: "#00acc1" } }}
                                            >
                                                Bearbeiten
                                            </Button>

                                            <Box sx={{ minWidth: "80px" }}>
                                                <DeleteShipping
                                                    shippingId={shipping.id}
                                                    name={shipping.name}
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
            <CreateShipping open={openModal} onClose={() => setOpenModal(false)} />

            <EditShipping
                open={editOpen}
                onClose={() => setEditOpen(false)}
                shipping={selectedShipping}
            />
        </Container>
    );
}
