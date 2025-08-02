import {
    Box,
    Button,
    Collapse,
    Container,
    debounce,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Pagination,
    Paper,
    Select,
    SelectChangeEvent,
    styled,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";

import { useCallback, useEffect, useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { ClearIcon } from "@mui/x-date-pickers";
import { TypesOfDocument } from "../../../constants/enums";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getPayments, getPaymentsByFilter, searchPayments, selectPayments, selectTotalPages } from "../paymentsSlice";
import { fetchDeletePayment } from "../api";


const StyledTableHead = styled(TableHead)({
    backgroundColor: "#014D69",
    "& th": {
        color: "white",
        fontWeight: "bold",
        borderRight: "1px solid #ddd",
    },
});


export default function Payments() {
    const dispatch = useAppDispatch();
    const payments = useAppSelector(selectPayments);
    const totalPages = useAppSelector(selectTotalPages);
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [, setOpenRows] = useState<{ [key: string]: boolean }>({});

    const [filters, setFilters] = useState({
        document: "",
        documentNumber: "",
        startDate: "",
        endDate: "",
    });

    const debouncedSearch = useCallback(
        debounce((searchTerm: string) => {
            const hasFilters =
                filters.document ||
                filters.documentNumber ||
                filters.startDate ||
                filters.endDate;

            if (hasFilters) {
                dispatch(
                    getPaymentsByFilter({
                        page,
                        size: 15,
                        ...convertFiltersToParams(filters),
                        searchQuery: searchTerm,
                    })
                );
            } else {
                dispatch(
                    searchPayments({
                        page,
                        size: 15,
                        query: searchTerm,
                    })
                );
            }
        }, 500),
        [page, dispatch, filters]
    );

    useEffect(() => {
        const hasFilters =
            filters.startDate ||
            filters.endDate ||
            filters.documentNumber ||
            filters.document;

        if (hasFilters) {
            dispatch(
                getPaymentsByFilter({
                    page,
                    size: 15,
                    ...convertFiltersToParams(filters),
                    searchQuery: searchTerm,
                })
            );
        } else if (searchTerm) {
            dispatch(
                searchPayments({
                    page,
                    size: 15,
                    query: searchTerm,
                })
            );
        } else {
            dispatch(getPayments({ page, size: 15 }));
        }
    }, [dispatch, page, searchTerm, filters]);

    const handlePageChange = (_: any, value: number) => {
        setPage(value - 1);
    };

    const handleFilterChange = (field: string, value: string) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
        setPage(0);
    };

    const handleClearFilters = () => {
        setFilters({
            document: "",
            documentNumber: "",
            startDate: "",
            endDate: "",
        });
        setPage(0);
    };

    const navigate = useNavigate();

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = event.target.value;
        setSearchTerm(newSearchTerm);
        debouncedSearch(newSearchTerm);
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setPage(0);

        const hasFilters =
            filters.startDate ||
            filters.endDate ||
            filters.documentNumber ||
            filters.document;

        if (hasFilters) {
            dispatch(
                getPaymentsByFilter({
                    page: 0,
                    size: 15,
                    ...convertFiltersToParams(filters),
                    searchQuery: "",
                })
            );
        } else {
            dispatch(getPayments({ page: 0, size: 15 }));
        }
    };

    const toggleRow = (id: string | number) => {
        setOpenRows((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleDeleteClick = async (id: number) => {
        if (window.confirm("Willst du diese Zahlung wirklich löschen?")) {
            try {
                await fetchDeletePayment(id);
                dispatch(getPayments({ page, size: 15 }));
            } catch (error) {
                console.error("Fehler beim Löschen der Zahlung:", error);
            }
        }
    };

    return (
        <Container>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ textAlign: "left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd" }}>ZAHLUNGEN</Typography>
            </Box>
            {/* Верхняя панель */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
                sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1000,
                    padding: "10px 0",
                }}
            >
                {/* Поиск */}
                <Box display="flex" gap={1}>
                    <TextField
                        id="search-input"
                        label="Suche"
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        sx={{ width: 400, backgroundColor: "white" }}
                    />
                    <IconButton
                        aria-label="Suche zurücksetzen"
                        onClick={handleClearSearch}>
                        <ClearIcon />
                    </IconButton>
                </Box>

                <Box display="flex" gap={1}>
                    <Button
                        variant="outlined"
                        onClick={() => setFiltersVisible((prev) => !prev)}
                    >
                        {filtersVisible ? "Filter ausblenden" : "Filter anzeigen"}
                    </Button>

                </Box>
            </Box>


            {/* Фильтры */}
            <Collapse in={filtersVisible}>
                <Paper
                    elevation={4}
                    sx={{
                        mb: 3,
                        p: 2,
                        paddingTop: 4,
                        borderRadius: 2,
                        border: "1px solid #ddd",
                        backgroundColor: "#ffffff",
                        transition: "all 0.3s ease",
                    }}
                >
                    <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                        {/* Дата от */}
                        <TextField
                            id="filter-start-date"
                            label="Von"
                            type="date"
                            size="small"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange("startDate", e.target.value)}
                            aria-label="Startdatum"
                            InputLabelProps={{ shrink: true }}
                        />
                        {/* Дата до */}
                        <TextField
                            id="filter-end-date"
                            label="Bis"
                            type="date"
                            size="small"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange("endDate", e.target.value)}
                            aria-label="Enddatum"
                            InputLabelProps={{ shrink: true }}
                        />
                        {/* Тип документа */}
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel id="filter-document-label">Typ des Dokuments</InputLabel>
                            <Select
                                labelId="filter-document-label"
                                id="filter-document"
                                value={filters.document}
                                onChange={(e: SelectChangeEvent) =>
                                    handleFilterChange("document", e.target.value)
                                }
                                label="Typ des Dokuments"
                                inputProps={{ 'aria-label': 'Typ des Dokuments auswählen' }}
                            >
                                <MenuItem value="">ALLE</MenuItem>
                                {TypesOfDocument.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>


                        <Button onClick={handleClearFilters} variant="outlined">
                            Filter zurücksetzen
                        </Button>
                    </Box>
                </Paper>
            </Collapse>

            {/* Таблица */}
            <Box sx={{ minHeight: "580px" }}>
                <TableContainer component={Paper} sx={{

                }}>
                    <Table >
                        <StyledTableHead>
                            <TableRow>
                                <TableCell >ID</TableCell>
                                <TableCell >Geschäftspartner</TableCell>
                                <TableCell >Datum</TableCell>
                                <TableCell >Betrag</TableCell>
                                <TableCell >Dokument</TableCell>
                                <TableCell >Referenz</TableCell>
                                <TableCell >Aktionen</TableCell>
                            </TableRow>
                        </StyledTableHead>

                        <TableBody>
                            {payments.length > 0 ? (
                                payments.map((payment) => (
                                    <React.Fragment key={payment.id}>
                                        <TableRow hover onClick={() => toggleRow(payment.id)} sx={{ cursor: 'pointer' }} >
                                            <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{payment.id}</TableCell>
                                            <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{payment.customerName}</TableCell>
                                            <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>
                                                {payment.paymentDate
                                                    ? new Date(payment.paymentDate).toLocaleDateString("de-DE", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                    })
                                                    : ""}
                                            </TableCell>
                                            <TableCell align="right" sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{payment.amount} €</TableCell>
                                            <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{payment.document}</TableCell>
                                            <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{payment.documentNumber}</TableCell>
                                            <TableCell>
                                                <Tooltip title="Bearbeiten" arrow>
                                                    <IconButton
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/payments/${payment.id}`) }}
                                                        sx={{ transition: 'transform 0.2s ease-in-out', "&:hover": { color: "#bdbdbd", transform: 'scale(1.2)', backgroundColor: "transparent" } }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Löschen" arrow>
                                                    <IconButton
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(payment.id) }}
                                                        sx={{ transition: 'transform 0.2s ease-in-out', "&:hover": { color: "#bdbdbd", transform: 'scale(1.2)', backgroundColor: "transparent" } }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        Keine Zahlungen gefunden
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Пагинация */}
            <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>
        </Container>
    );
}

const convertFiltersToParams = (filters: any) => {
    return {
        document: filters.document || undefined,
        documentNumber: filters.documentNumber || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
    };
};
