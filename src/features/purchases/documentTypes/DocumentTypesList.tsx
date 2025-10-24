import { Box, Button, Container, Paper, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { getDocumentTypes, selectTypeOfDocuments } from "../typeOfDocumentSlice";
import { TypeOfDocument } from "../types";
import DeleteDocumentType from "./DeleteDocumentType";
import { CreateDocumentType } from "./CreateDocumentType";
import EditDocumentType from "./EditDocumentType";


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

export default function DocumentTypesList() {
    const dispatch = useAppDispatch();
    const types = useAppSelector(selectTypeOfDocuments);
    const [selectedType, setSelectedType] = useState<TypeOfDocument | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {
        dispatch(getDocumentTypes());
    }, [dispatch]);

    const handleEdit = (type: TypeOfDocument) => {
        setSelectedType(type);
        setEditOpen(true);
    };

    return (
       <Container>
            {/* Верхняя панель */}
            <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>                            
                <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
                    Neuen Dokumenttyp anlegen
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
                            types.map((type) => (
                                <StyledTableRow key={type.id}>
                                    <TableCell style={{ padding: "6px 12px", borderRight: "1px solid #ddd", borderLeft: "1px solid #ddd" }}>{type.id}</TableCell>
                                    <TableCell sx={{ width: "400px", padding: "6px 12px", borderRight: "1px solid #ddd" }}>{type.name}</TableCell>
                                    <TableCell sx={{ width: "200px", padding: "6px", borderRight: "1px solid #ddd" }}>
                                        <Box display="flex" justifyContent="space-between" gap={1}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleEdit(type)}
                                                sx={{ minWidth: "100px", "&:hover": { borderColor: "#00acc1" } }}
                                            >
                                                Bearbeiten
                                            </Button>

                                            <Box sx={{ minWidth: "80px" }}>
                                                <DeleteDocumentType
                                                    typeId={type.id}
                                                    name={type.name}
                                                />
                                            </Box>
                                        </Box>
                                    </TableCell>

                                </StyledTableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">Keine Dokumenttypen vorhanden</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <CreateDocumentType open={openModal} onClose={() => setOpenModal(false)} />

            <EditDocumentType
                open={editOpen}
                onClose={() => setEditOpen(false)}
                type={selectedType}
            />
        </Container>
    );
}
