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
import {
  getPurchases,
  getPurchasesByFilter,
  searchPurchases,
  selectPurchases,
  selectTotalPages,
} from "../purchasesSlice";
import { useCallback, useEffect, useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { ClearIcon } from "@mui/x-date-pickers";
import { PaymentStatuses, TypesOfDocument } from "../../../constants/enums";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PaymentsIcon from '@mui/icons-material/Payments';
import CreatePayment from "../../payments/components/CreatePayment";
import DeletePurchase from "./DeletePurchase";
import { selectUser } from "../../auth/authSlice";


const StyledTableHead = styled(TableHead)({
  backgroundColor: "#1a3d6d",
  "& th": {
    color: "white",
    fontWeight: "bold",
    borderRight: "1px solid #ddd",
    textAlign: "center"
  },
});
const StyledSubTableHead = styled(TableHead)({
  backgroundColor: "#70ABBF",
  "& th": {
    color: "white",
    fontWeight: "bold",
    borderRight: "1px solid #ddd",
    textAlign: "center"
  },
});

export default function Purchases() {
  const dispatch = useAppDispatch();
  const purchases = useAppSelector(selectPurchases);
  const totalPages = useAppSelector(selectTotalPages);
  const currentUser = useAppSelector(selectUser);
  const isAdmin = currentUser?.role === "ADMIN"; 
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [openRows, setOpenRows] = useState<{ [key: string]: boolean }>({});
  const [openPaymentDialogId, setOpenPaymentDialogId] = useState<number | null>(null);
  const [selectedOperationType, setSelectedOperationType] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    document: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
  });

  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      const hasFilters =
        filters.document ||
        filters.paymentStatus ||
        filters.startDate ||
        filters.endDate;

      if (hasFilters) {
        dispatch(
          getPurchasesByFilter({
            page,
            size: 15,
            ...convertFiltersToParams(filters),
            searchQuery: searchTerm,
          })
        );
      } else {
        dispatch(
          searchPurchases({
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
      filters.paymentStatus ||
      filters.document;

    if (hasFilters) {
      dispatch(
        getPurchasesByFilter({
          page,
          size: 15,
          ...convertFiltersToParams(filters),
          searchQuery: searchTerm,
        })
      );
    } else if (searchTerm) {
      dispatch(
        searchPurchases({
          page,
          size: 15,
          query: searchTerm,
        })
      );
    } else {
      dispatch(getPurchases({ page, size: 15 }));
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
      paymentStatus: "",
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
      filters.paymentStatus ||
      filters.document;

    if (hasFilters) {
      dispatch(
        getPurchasesByFilter({
          page: 0,
          size: 15,
          ...convertFiltersToParams(filters),
          searchQuery: "",
        })
      );
    } else {
      dispatch(getPurchases({ page: 0, size: 15 }));
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
        <Typography variant="h6" sx={{ textAlign: "left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd" }}>BESTELLUNGEN</Typography>
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
            backgroundColor: "#f9f9f9",
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
              InputLabelProps={{ shrink: true }}
              aria-label="Startdatum"
            />

            {/* Дата до */}
            <TextField
              id="filter-end-date"
              label="Bis"
              type="date"
              size="small"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
              aria-label="Enddatum"
            />

            {/* Тип документа */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="document-type-label">Dokuments</InputLabel>
              <Select
                labelId="document-type-label"
                id="document-type-select"
                value={filters.document}
                onChange={(e: SelectChangeEvent) =>
                  handleFilterChange("document", e.target.value)
                }
                label="Dokuments"
                aria-label="Typ des Dokuments"
              >
                <MenuItem value="">ALLE</MenuItem>
                {TypesOfDocument.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Zahlungsstatus */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="payment-status-label">Zahlungsstatus</InputLabel>
              <Select
                labelId="payment-status-label"
                id="payment-status-select"
                value={filters.paymentStatus}
                onChange={(e: SelectChangeEvent) =>
                  handleFilterChange("paymentStatus", e.target.value)
                }
                label="Zahlungsstatus"
                aria-label="Zahlungsstatus"
              >
                <MenuItem value="">ALLE</MenuItem>
                {PaymentStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
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
                <TableCell >Lieferant</TableCell>
                <TableCell >Datum</TableCell>
                <TableCell >Betrag</TableCell>
                <TableCell >Dokument</TableCell>
                <TableCell >Dokument-Nr</TableCell>
                <TableCell >Zahlungsstatus</TableCell>
                 {isAdmin && <TableCell>Aktionen</TableCell>} 
              </TableRow>
            </StyledTableHead>

            <TableBody>
              {purchases.length > 0 ? (
                purchases.map((purchase) => (
                  <React.Fragment key={purchase.id}>
                    <TableRow hover onClick={() => toggleRow(purchase.id)} sx={{ cursor: 'pointer' }} >
                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{purchase.id}</TableCell>
                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{purchase.vendorName}</TableCell>
                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>
                        {purchase.purchasingDate
                          ? new Date(purchase.purchasingDate).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                          : ""}
                      </TableCell>
                      <TableCell align="right" sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{purchase.total} €</TableCell>
                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{purchase.document}</TableCell>
                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{purchase.documentNumber}</TableCell>
                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{purchase.paymentStatus}</TableCell>
                       {isAdmin && (
                      <TableCell sx={{ padding: "2px 12px" }}>
                        <Box display="flex" sx={{ padding: "2px 12px" }} gap={1} >
                          <Tooltip title="Bearbeiten" arrow>
                            <IconButton onClick={(e) => { e.stopPropagation(); navigate(`/purchases/${purchase.id}`); }} sx={{  p: 0.5, transition: 'transform 0.2s ease-in-out', "&:hover": { color: "#bdbdbd", transform: 'scale(1.2)', backgroundColor: "transparent" } }}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <DeletePurchase
                            purchaseId={purchase.id}
                            vendorName={purchase.vendorName}
                            purchasingDate={purchase.purchasingDate}
                            onSuccessDelete={() => { }}
                            trigger={
                              <Tooltip title="Löschen" arrow>
                                <IconButton
                                  sx={{
                                     p: 0.5,
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
                          {purchase.paymentStatus !== "BEZAHLT" && (
                            <Tooltip title="Bezahlen" arrow>
                              <IconButton onClick={(e) => {
                                e.stopPropagation();
                                setOpenPaymentDialogId(purchase.id);
                                setSelectedOperationType(purchase.type);
                              }}
                                sx={{  p: 0.5, transition: 'transform 0.2s ease-in-out', "&:hover": { color: "#bdbdbd", transform: 'scale(1.2)', backgroundColor: "transparent" } }}>
                                <PaymentsIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      )}

                    </TableRow>
                    {/* Подтаблица */}
                    {openRows[purchase.id] && (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                          <Collapse in={openRows[purchase.id]} timeout="auto" unmountOnExit>
                            <Box margin={2}>
                              <Table size="small" sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                                <StyledSubTableHead>
                                  <TableRow>
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>Artikel</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>Artikelname</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>Menge</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>Einzelpreis</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>Netto</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>MWSt</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>Gesamt</TableCell>
                                  </TableRow>
                                </StyledSubTableHead>
                                <TableBody>
                                  {purchase.purchaseItems?.map((item: any, index: number) => (
                                    <TableRow key={index}>
                                      <TableCell sx={{ borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd", padding: "6px 12px" }}>{item.productArticle}</TableCell>
                                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{item.productName}</TableCell>
                                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{item.quantity}</TableCell>
                                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{item.unitPrice} €</TableCell>
                                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{item.totalPrice} €</TableCell>
                                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{item.taxAmount} €</TableCell>
                                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{item.totalAmount} €</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} align="center">
                    Keine Bestellungen gefunden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {openPaymentDialogId !== null && selectedOperationType && (
        <CreatePayment
          prefillType="purchase"
          prefillId={openPaymentDialogId}
          typeOfOperation={selectedOperationType}
          onClose={() => {
            setOpenPaymentDialogId(null);
            setSelectedOperationType(null);
          }}
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
    </Container>
  );
}

const convertFiltersToParams = (filters: any) => {
  return {
    document: filters.document || undefined,
    paymentStatus: filters.paymentStatus || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  };
};
