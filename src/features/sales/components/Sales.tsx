import { Box, Button, Collapse, Container, debounce, FormControl, IconButton, InputLabel, MenuItem, Pagination, Paper, Select, SelectChangeEvent, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { getSales, getSalesByFilter, searchSales, selectSales, selectTotalPages } from "../salesSlice";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClearIcon } from "@mui/x-date-pickers";
import { PaymentStatuses } from "../../../constants/enums";
import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PaymentsIcon from '@mui/icons-material/Payments';
import CreatePayment from "../../payments/components/CreatePayment";
import DeleteSale from "./DeleteSale";
import { selectUser } from "../../auth/authSlice";
import axios from "axios";
import { ACCESS_TOKEN_KEY } from "../../../utils/token";
import { showErrorToast } from "../../../utils/toast";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import EllipsisTooltip from "../../../components/ui/EllipsisTooltip";


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
  },
});

// Стили для полей в таблице
const cellStyle = {
  whiteSpace: "nowrap",  // запрещаем перенос строк
  overflow: "hidden",  // обрезаем всё, что не помещается
  textOverflow: "ellipsis",  // добавляем "..."
  maxWidth: 220,
};

export default function Sales() {
  const dispatch = useAppDispatch();
  const sales = useAppSelector(selectSales);
  const currentUser = useAppSelector(selectUser);
  const isAdmin = currentUser?.role === "ADMIN";
  const totalPages = useAppSelector(selectTotalPages);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [openRows, setOpenRows] = useState<{ [key: string]: boolean }>({});
  const [openPaymentDialogId, setOpenPaymentDialogId] = useState<number | null>(null);
  const [selectedOperationType, setSelectedOperationType] = useState<string | null>(null);
  const [sort, setSort] = useState<string[]>(["salesDate,DESC", "invoiceNumber,DESC"]);

  const [filters, setFilters] = useState({
    invoiceNumber: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
  });

  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      const hasFilters =
        filters.invoiceNumber ||
        filters.paymentStatus ||
        filters.startDate ||
        filters.endDate;

      if (hasFilters) {
        dispatch(
          getSalesByFilter({
            page,
            size: 15,
            ...convertFiltersToParams(filters),
            searchQuery: searchTerm,
            sort
          })
        );
      } else {
        dispatch(
          searchSales({
            page,
            size: 15,
            query: searchTerm,
            sort
          })
        );
      }
    }, 500),
    [page, dispatch, filters, sort]
  );

  useEffect(() => {
    const hasFilters =
      filters.startDate ||
      filters.endDate ||
      filters.paymentStatus ||
      filters.invoiceNumber;

    if (hasFilters) {
      dispatch(
        getSalesByFilter({
          page,
          size: 15,
          ...convertFiltersToParams(filters),
          searchQuery: searchTerm,
          sort
        })
      );
    } else if (searchTerm) {
      dispatch(
        searchSales({
          page,
          size: 15,
          query: searchTerm,
          sort
        })
      );
    } else {
      dispatch(getSales({ page, size: 15, sort }));
    }
  }, [dispatch, page, searchTerm, filters, sort]);

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
      invoiceNumber: "",
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
      filters.invoiceNumber;

    if (hasFilters) {
      dispatch(
        getSalesByFilter({
          page: 0,
          size: 15,
          ...convertFiltersToParams(filters),
          searchQuery: "",
          sort
        })
      );
    } else {
      dispatch(getSales({ page: 0, size: 15, sort }));
    }
  };

  const toggleRow = (id: string | number) => {
    setOpenRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const openInvoice = async (e: React.MouseEvent, sale: any) => {
    e.stopPropagation();

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      alert("Fehlender Authentifizierungstoken. Bitte melden Sie sich erneut an.");
      return;
    }

    const year = sale.invoiceNumber.substring(2, 6);
    const url = `${import.meta.env.VITE_API_URL}/api/sales/invoices/${year}/${sale.invoiceNumber}.pdf`;

    try {
      // axios с указанием типа Blob
      const res = await axios.get<Blob>(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
        validateStatus: () => true,
      });

      if (res.status === 404) {
        showErrorToast(
          "Rechnung nicht gefunden",
          "Die Rechnung ist nicht im Ordner vorhanden."
        );
        return;
      }

      if (res.status !== 200) {
        showErrorToast(
          "Fehler beim Laden",
          `Serverfehler (${res.status}).`
        );
        return;
      }

      // создаем объект Blob
      const pdfBlob = new Blob([res.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // открываем в новой вкладке
      window.open(pdfUrl, "_blank");
    } catch (err) {
      console.error("Fehler beim Laden der Rechnung:", err);
      showErrorToast(
        "Fehler",
        "Die Rechnung konnte nicht geladen werden."
      );
    }
  };

  //  Открытие Lieferschein (Delivery Bill PDF)
  const openDeliveryBill = async (e: React.MouseEvent, sale: any) => {
    e.stopPropagation();

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      alert("Fehlender Authentifizierungstoken. Bitte melden Sie sich erneut an.");
      return;
    }

    const year = sale.invoiceNumber.substring(2, 6);
    const url = `${import.meta.env.VITE_API_URL}/api/sales/delivery-bill/${year}/${sale.deliveryBill}.pdf`;

    try {
      const res = await axios.get<Blob>(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
        validateStatus: () => true,
      });

      if (res.status === 404) {
        showErrorToast(
          "Lieferschein nicht gefunden",
          "Der Lieferschein ist nicht im Ordner vorhanden."
        );
        return;
      }

      if (res.status !== 200) {
        showErrorToast(
          "Fehler beim Laden",
          `Serverfehler (${res.status}).`
        );
        return;
      }

      const pdfBlob = new Blob([res.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
    } catch (err) {
      console.error("Fehler beim Laden des Lieferscheins:", err);
      showErrorToast(
        "Fehler",
        "Der Lieferschein konnte nicht geladen werden."
      );
    }
  };

  const handleSort = (field: string, direction: "ASC" | "DESC") => {
    // Основная сортировка — выбранное поле
    const newSort = [`${field},${direction}`];

    // Если сортируем не по salesDate или invoiceNumber →
    // сохраняем их как вторичную сортировку
    if (field !== "salesDate") {
      newSort.push("salesDate,DESC");
    }
    if (field !== "invoiceNumber") {
      newSort.push("invoiceNumber,DESC");
    }

    setSort(newSort);
    setPage(0);
  };


  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ textAlign: "left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd" }}>AUFTRÄGE</Typography>
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
          <Box display="flex" flexWrap="wrap" justifyContent="space-between" gap={2} mb={2}>
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

            {/* PaymentStatus */}
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

                {/* ID */}
                <TableCell sx={{ userSelect: "none" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    ID
                    <Box display="flex" flexDirection="column" ml={0.5}>
                      <ArrowDropUpIcon
                        fontSize="small"
                        onClick={() => handleSort("id", "ASC")}
                        sx={{
                          cursor: "pointer",
                          color: sort[0] === "id,ASC" ? "#0277bd" : "#bdbdbd",
                          "&:hover": { color: "#0277bd" }
                        }}
                      />
                      <ArrowDropDownIcon
                        fontSize="small"
                        onClick={() => handleSort("id", "DESC")}
                        sx={{
                          cursor: "pointer",
                          color: sort[0] === "id,DESC" ? "#0277bd" : "#bdbdbd",
                          "&:hover": { color: "#0277bd" }
                        }}
                      />
                    </Box>
                  </Box>
                </TableCell>

                {/* Kunde */}
                <TableCell sx={{ userSelect: "none" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    Kunde
                    <Box display="flex" flexDirection="column" ml={0.5}>
                      <ArrowDropUpIcon
                        fontSize="small"
                        onClick={() => handleSort("customerName", "ASC")}
                        sx={{
                          cursor: "pointer",
                          color: sort[0] === "customerName,ASC" ? "#0277bd" : "#bdbdbd",
                          "&:hover": { color: "#0277bd" }
                        }}
                      />
                      <ArrowDropDownIcon
                        fontSize="small"
                        onClick={() => handleSort("customerName", "DESC")}
                        sx={{
                          cursor: "pointer",
                          color: sort[0] === "customerName,DESC" ? "#0277bd" : "#bdbdbd",
                          "&:hover": { color: "#0277bd" }
                        }}
                      />
                    </Box>
                  </Box>
                </TableCell>

                {/* Datum */}
                <TableCell sx={{ userSelect: "none" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    Datum
                    <Box display="flex" flexDirection="column" ml={0.5}>
                      <ArrowDropUpIcon
                        fontSize="small"
                        onClick={() => handleSort("salesDate", "ASC")}
                        sx={{
                          cursor: "pointer",
                          color: sort[0] === "salesDate,ASC" ? "#0277bd" : "#bdbdbd",
                          "&:hover": { color: "#0277bd" }
                        }}
                      />
                      <ArrowDropDownIcon
                        fontSize="small"
                        onClick={() => handleSort("salesDate", "DESC")}
                        sx={{
                          cursor: "pointer",
                          color: sort[0] === "salesDate,DESC" ? "#0277bd" : "#bdbdbd",
                          "&:hover": { color: "#0277bd" }
                        }}
                      />
                    </Box>
                  </Box>
                </TableCell>

                {/* Betrag */}
                <TableCell sx={{ userSelect: "none" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    Betrag
                    <Box display="flex" flexDirection="column" ml={0.5}>
                      <ArrowDropUpIcon
                        fontSize="small"
                        onClick={() => handleSort("totalAmount", "ASC")}
                        sx={{
                          cursor: "pointer",
                          color: sort[0] === "totalAmount,ASC" ? "#0277bd" : "#bdbdbd",
                          "&:hover": { color: "#0277bd" }
                        }}
                      />
                      <ArrowDropDownIcon
                        fontSize="small"
                        onClick={() => handleSort("totalAmount", "DESC")}
                        sx={{
                          cursor: "pointer",
                          color: sort[0] === "totalAmount,DESC" ? "#0277bd" : "#bdbdbd",
                          "&:hover": { color: "#0277bd" }
                        }}
                      />
                    </Box>
                  </Box>
                </TableCell>

                {/* Rechnung-Nr */}
                <TableCell sx={{ userSelect: "none" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    Rechnung-Nr
                    <Box display="flex" flexDirection="column" ml={0.5}>
                      <ArrowDropUpIcon
                        fontSize="small"
                        onClick={() => handleSort("invoiceNumber", "ASC")}
                        sx={{
                          cursor: "pointer",
                          color: sort[0] === "invoiceNumber,ASC" ? "#0277bd" : "#bdbdbd",
                          "&:hover": { color: "#0277bd" }
                        }}
                      />
                      <ArrowDropDownIcon
                        fontSize="small"
                        onClick={() => handleSort("invoiceNumber", "DESC")}
                        sx={{
                          cursor: "pointer",
                          color: sort[0] === "invoiceNumber,DESC" ? "#0277bd" : "#bdbdbd",
                          "&:hover": { color: "#0277bd" }
                        }}
                      />
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>Zahlungsstatus</TableCell>
                <TableCell>PDF</TableCell>
                <TableCell>Aktionen</TableCell>

              </TableRow>
            </StyledTableHead>

            <TableBody>
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <React.Fragment key={sale.id}>
                    <TableRow hover onClick={() => toggleRow(sale.id)} sx={{ cursor: 'pointer' }} >
                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{sale.id}</TableCell>
                      <TableCell sx={{ ...cellStyle, borderRight: "1px solid #ddd", padding: "6px 12px" }}>
                        <EllipsisTooltip text={sale.customerName ?? ""}>
                          {sale.customerName}
                        </EllipsisTooltip>
                      </TableCell>

                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>
                        {sale.salesDate
                          ? new Date(sale.salesDate).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                          : ""}
                      </TableCell>
                      <TableCell align="right" sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{sale.totalAmount} €</TableCell>
                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{sale.invoiceNumber}</TableCell>
                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{sale.paymentStatus}</TableCell>
                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>
                        <Tooltip title="Rechnung" arrow>
                          <IconButton onClick={(e) => openInvoice(e, sale)}>
                            <Typography variant="button"
                              sx={{ fontWeight: "bold", transition: 'transform 0.2s ease-in-out', "&:hover": { color: "#bdbdbd", transform: 'scale(1.2)', backgroundColor: "transparent" } }}>
                              RE
                            </Typography>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Lieferschein" arrow>
                          <IconButton onClick={(e) => openDeliveryBill(e, sale)}>
                            <Typography variant="button"
                              sx={{ fontWeight: "bold", transition: 'transform 0.2s ease-in-out', "&:hover": { color: "#bdbdbd", transform: 'scale(1.2)', backgroundColor: "transparent" } }}>
                              LF
                            </Typography>
                          </IconButton>
                        </Tooltip>
                      </TableCell>

                      <TableCell sx={{ padding: "2px 12px" }}>
                        <Box display="flex" sx={{ padding: "2px 12px" }} gap={1} >
                          <Tooltip title="Bearbeiten" arrow>
                            <IconButton onClick={(e) => { e.stopPropagation(); navigate(`/sales/${sale.id}`); }} sx={{ p: 0.5, transition: 'transform 0.2s ease-in-out', "&:hover": { color: "#bdbdbd", transform: 'scale(1.2)', backgroundColor: "transparent" } }}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          {isAdmin && (
                            <DeleteSale
                              saleId={sale.id}
                              customerName={sale.customerName}
                              salesDate={sale.salesDate}
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
                          )}

                          {sale.paymentStatus !== "BEZAHLT" && (
                            <Tooltip title="Bezahlen" arrow>
                              <IconButton onClick={(e) => {
                                e.stopPropagation();
                                setOpenPaymentDialogId(sale.id);
                                setSelectedOperationType(sale.typeOfOperation);
                              }}
                                sx={{ transition: 'transform 0.2s ease-in-out', "&:hover": { color: "#bdbdbd", transform: 'scale(1.2)', backgroundColor: "transparent" } }}>
                                <PaymentsIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                    {/* Подтаблица */}
                    {openRows[sale.id] && (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                          <Collapse in={openRows[sale.id]} timeout="auto" unmountOnExit>
                            <Box margin={2}>
                              <Table size="small" sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                                <StyledSubTableHead>
                                  <TableRow>
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>Artikel</TableCell>
                                    <TableCell sx={{ ...cellStyle, borderRight: "1px solid #ddd", padding: "6px 12px" }}>Artikelname</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>Menge</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>Einzelpreis</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>Rabatt</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>Netto</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>MWSt</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>Gesamt</TableCell>
                                  </TableRow>
                                </StyledSubTableHead>
                                <TableBody>
                                  {sale.saleItems?.map((item: any, index: number) => (
                                    <TableRow key={index}>
                                      <TableCell sx={{ borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd", padding: "6px 12px" }}>{item.productArticle}</TableCell>
                                      <TableCell sx={{ ...cellStyle, borderRight: "1px solid #ddd", padding: "6px 12px" }}>
                                        <EllipsisTooltip text={item.productName ?? ""}>
                                          {item.productName}
                                        </EllipsisTooltip>
                                      </TableCell>
                                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{item.quantity}</TableCell>
                                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{item.unitPrice} €</TableCell>
                                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{item.discount} %</TableCell>
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
                  <TableCell colSpan={7} align="center">
                    Keine Aufträge gefunden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {openPaymentDialogId !== null && selectedOperationType && (
        <CreatePayment
          prefillType="sale"
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
    invoiceNumber: filters.invoiceNumber || undefined,
    paymentStatus: filters.paymentStatus || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  };
};
