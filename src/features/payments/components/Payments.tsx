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
import { ClearIcon } from "@mui/x-date-pickers";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getAllPurchaseIds, getAllSaleIds, getPayments, getPaymentsByFilter, searchPayments, selectPayments, selectTotalPages } from "../paymentsSlice";
import DeletePayment from "./DeletePayment";
import EditPayment from "./EditPayment";
import { Payment } from "../types";
import { getDocumentTypes, selectTypeOfDocuments } from "../../purchases/typeOfDocumentSlice";
import { TypeOfDocument } from "../../purchases/types";

const StyledTableHead = styled(TableHead)({
    backgroundColor: "#014D69",
    "& th": {
        color: "white",
        fontWeight: "bold",
        borderRight: "1px solid #ddd",
        textAlign: "center"
    },
});

type PaymentFilters = {
    documentId: string;
    documentNumber: string;
    saleId: number | "";
    purchaseId: number | "";
    startDate: string;
    endDate: string;
};

function convertFiltersToParams(f: PaymentFilters) {
    const params: Record<string, any> = {};

    if (f.documentId && f.documentId !== "") params.documentId = Number(f.documentId);
    if (f.documentNumber) params.documentNumber = f.documentNumber;
    if (f.startDate) params.startDate = f.startDate;
    if (f.endDate) params.endDate = f.endDate;
    if (f.saleId !== "" && f.saleId != null) params.saleId = f.saleId;
    if (f.purchaseId !== "" && f.purchaseId != null) params.purchaseId = f.purchaseId;

    return params;
}

export default function Payments() {
    const dispatch = useAppDispatch();
    const payments = useAppSelector(selectPayments);
    const totalPages = useAppSelector(selectTotalPages);
    const documentTypes = useAppSelector(selectTypeOfDocuments);
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [, setOpenRows] = useState<{ [key: string]: boolean }>({});
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [saleOptions, setSaleOptions] = useState<number[]>([]);
    const [purchaseOptions, setPurchaseOptions] = useState<number[]>([]);

    const [filters, setFilters] = useState<PaymentFilters>({
        documentId: "",
        documentNumber: "",
        saleId: "",
        purchaseId: "",
        startDate: "",
        endDate: "",
    });

    useEffect(() => {
        dispatch(getDocumentTypes());
    }, [dispatch]);

    useEffect(() => {
        if (filtersVisible) {
            dispatch(getAllSaleIds()).then((res: any) => {
                setSaleOptions(res.payload || []);
            });
            dispatch(getAllPurchaseIds()).then((res: any) => {
                setPurchaseOptions(res.payload || []);
            });
        }
    }, [filtersVisible, dispatch]);

    const debouncedSearch = useCallback(
        debounce((searchTerm: string) => {
            const hasFilters =
                filters.documentId ||
                filters.documentNumber ||
                filters.saleId ||
                filters.purchaseId ||
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
            filters.saleId ||
            filters.purchaseId ||
            filters.documentId;

        if (hasFilters) {
            dispatch(getPaymentsByFilter({ page, size: 15, ...convertFiltersToParams(filters), searchQuery: searchTerm, }));
        } else if (searchTerm) {
            dispatch(searchPayments({ page, size: 15, query: searchTerm, })
            );
        } else {
            dispatch(getPayments({ page, size: 15 }));
        }
    }, [dispatch, page, searchTerm, filters]);

    const handlePageChange = (_: any, value: number) => {
        setPage(value - 1);
    };

    const handleFilterChange = (field: string, value: string | number) => {
        setFilters((prev) => ({
            ...prev,
            [field]: (field === "saleId" || field === "purchaseId")
                ? (value === "" ? "" : Number(value))
                : value,
        }));
        setPage(0);
    };

    const handleClearFilters = () => {
        setFilters({
            documentId: "",
            documentNumber: "",
            saleId: "",
            purchaseId: "",
            startDate: "",
            endDate: "",
        });
        setPage(0);
    };

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
            filters.saleId ||
            filters.purchaseId ||
            filters.documentId;

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
                        sx={{ "&:hover": { borderColor: "#00acc1" } }}
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
                            <InputLabel id="filter-document-label">Dokumenttyp</InputLabel>
                            <Select
                                labelId="filter-document-label"
                                id="document-type-select"
                                value={filters.documentId || ""}
                                onChange={(e: SelectChangeEvent<string>) =>
                                    handleFilterChange("documentId", e.target.value)
                                }
                                label="Dokumenttyp"
                                aria-label="Dokumenttyp"
                            >
                                <MenuItem value="">ALLE</MenuItem>
                                {documentTypes.map((doc: TypeOfDocument) => (
                                    <MenuItem key={doc.id} value={doc.id.toString()}>
                                        {doc.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>


                        {/* Sale ID */}
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel id="filter-sale-id-label">Sale ID</InputLabel>
                            <Select
                                labelId="filter-sale-id-label"
                                id="filter-sale-id"
                                value={filters.saleId}
                                onChange={(e) => handleFilterChange("saleId", e.target.value)}
                            >
                                <MenuItem value="">ALL</MenuItem>
                                {saleOptions.map((sale) => (
                                    <MenuItem key={sale} value={sale}>
                                        {sale}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>


                        {/* Purchase ID */}
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel id="filter-purchase-id-label">Purchase ID</InputLabel>
                            <Select
                                labelId="filter-purchase-id-label"
                                id="filter-purchase-id"
                                value={filters.purchaseId}
                                onChange={(e) => handleFilterChange("purchaseId", e.target.value)}
                            >
                                <MenuItem value="">ALL</MenuItem>
                                {purchaseOptions.map((purchase) => (
                                    <MenuItem key={purchase} value={purchase}>
                                        {purchase}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button onClick={handleClearFilters} variant="outlined" sx={{ "&:hover": { borderColor: "#00acc1" } }}>
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
                                <TableCell >Dokumenttyp</TableCell>
                                <TableCell >Referenz</TableCell>
                                <TableCell >Auftrag Nr</TableCell>
                                <TableCell >Bestellung Nr</TableCell>
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
                                            <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{payment.document.name}</TableCell>
                                            <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{payment.documentNumber}</TableCell>
                                            <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px", textAlign: "center" }}>{payment.saleId}</TableCell>
                                            <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px", textAlign: "center" }}>{payment.purchaseId}</TableCell>
                                            <TableCell sx={{ padding: "2px 12px" }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Tooltip title="Bearbeiten" arrow placement="right-start">
                                                        <IconButton
                                                            onClick={(e) => { e.stopPropagation(); setSelectedPayment(payment) }}
                                                            sx={{
                                                                width: 32,
                                                                height: 32,
                                                                fontSize: "small",
                                                                transition: "transform 0.2s ease-in-out",
                                                                "&:hover": {
                                                                    color: "#bdbdbd",
                                                                    transform: "scale(1.2)",
                                                                    backgroundColor: "transparent",
                                                                },
                                                            }}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <DeletePayment
                                                        paymentId={payment.id}
                                                        customerName={payment.customerName}
                                                        amount={payment.amount}
                                                        paymentDate={payment.paymentDate}
                                                        onSuccessDelete={() => { }}
                                                        trigger={
                                                            <Tooltip title="Löschen" arrow placement="right-start">
                                                                <IconButton
                                                                    sx={{
                                                                        width: 32,
                                                                        height: 32,
                                                                        fontSize: "small",
                                                                        transition: "transform 0.2s ease-in-out",
                                                                        "&:hover": {
                                                                            color: "#bdbdbd",
                                                                            transform: "scale(1.2)",
                                                                            backgroundColor: "transparent",
                                                                        },
                                                                    }}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        }
                                                    />
                                                </Box>
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
            {selectedPayment && (
                <EditPayment
                    payment={selectedPayment}
                    onClose={() => setSelectedPayment(null)}
                />
            )}
            {/* Пагинация */}
            <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>
        </Container >

    );
}

