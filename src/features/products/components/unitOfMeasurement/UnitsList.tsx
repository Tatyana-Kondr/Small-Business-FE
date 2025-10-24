import { Box, Button, Container, Paper, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { useEffect, useState } from "react";
import { getUnits, selectUnits } from "../../unitsOfMeasurementSlice";
import { UnitOfMeasurement } from "../../types";
import EditUnit from "./EditUnit";
import DeleteUnit from "./DeleteUnit";
import { CreateUnit } from "./CreateUnit";


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

export default function UnitsList() {
    const dispatch = useAppDispatch();
    const units = useAppSelector(selectUnits);
    const [selectedUnit, setSelectedUnit] = useState<UnitOfMeasurement | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {
        dispatch(getUnits());
    }, [dispatch]);

    const handleEdit = (unit: UnitOfMeasurement) => {
        setSelectedUnit(unit);
        setEditOpen(true);
    };

    return (
       <Container>
            {/* Верхняя панель */}
            <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>                            
                <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
                    Neue Maßeinheit anlegen
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
                        {units.length > 0 ? (
                            units.map((unit) => (
                                <StyledTableRow key={unit.id}>
                                    <TableCell style={{ padding: "6px 12px", borderRight: "1px solid #ddd", borderLeft: "1px solid #ddd" }}>{unit.id}</TableCell>
                                    <TableCell sx={{ width: "400px", padding: "6px 12px", borderRight: "1px solid #ddd" }}>{unit.name}</TableCell>
                                    <TableCell sx={{ width: "200px", padding: "6px", borderRight: "1px solid #ddd" }}>
                                        <Box display="flex" justifyContent="space-between" gap={1}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleEdit(unit)}
                                                sx={{ minWidth: "100px", "&:hover": { borderColor: "#00acc1" } }}
                                            >
                                                Bearbeiten
                                            </Button>

                                            <Box sx={{ minWidth: "80px" }}>
                                                <DeleteUnit
                                                    unitId={unit.id}
                                                    name={unit.name}
                                                />
                                            </Box>
                                        </Box>
                                    </TableCell>

                                </StyledTableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">Keine Maßeinheiten vorhanden</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <CreateUnit open={openModal} onClose={() => setOpenModal(false)} />

            <EditUnit
                open={editOpen}
                onClose={() => setEditOpen(false)}
                unit={selectedUnit}
            />
        </Container>
    );
}
