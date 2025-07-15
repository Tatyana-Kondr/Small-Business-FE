import { Box, Button, Collapse, Container, debounce, FormControl, IconButton, InputLabel, MenuItem, Pagination, Paper, Select, SelectChangeEvent, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { getSales, getSalesByFilter, searchSales, selectSales, selectTotalPages } from "../salesSlice";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDeleteSale } from "../api";
import { ClearIcon } from "@mui/x-date-pickers";
import { PaymentStatuses } from "../../../constants/enums";
import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";


const StyledTableHead = styled(TableHead)({
  backgroundColor: "#1a3d6d",
  "& th": {
    color: "white",
    fontWeight: "bold",
    borderRight: "1px solid #ddd",
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

export default function Sales() {
  const dispatch = useAppDispatch();
  const sales = useAppSelector(selectSales);
  const totalPages = useAppSelector(selectTotalPages);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [openRows, setOpenRows] = useState<{ [key: string]: boolean }>({});

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
          })
        );
      } else {
        dispatch(
          searchSales({
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
      filters.invoiceNumber;

    if (hasFilters) {
      dispatch(
        getSalesByFilter({
          page,
          size: 15,
          ...convertFiltersToParams(filters),
          searchQuery: searchTerm,
        })
      );
    } else if (searchTerm) {
      dispatch(
        searchSales({
          page,
          size: 15,
          query: searchTerm,
        })
      );
    } else {
      dispatch(getSales({ page, size: 15 }));
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
      invoiceNumber: "",
      paymentStatus: "",
      startDate: "",
      endDate: "",
    });
    setPage(0);
  };

  const navigate = useNavigate();

  const handleOpenCreatePurchase = () => {
    navigate("/sales/create");
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
      filters.paymentStatus ||
      filters.invoiceNumber;

    if (hasFilters) {
      dispatch(
        getSalesByFilter({
          page: 0,
          size: 15,
          ...convertFiltersToParams(filters),
          searchQuery: "",
        })
      );
    } else {
      dispatch(getSales({ page: 0, size: 15 }));
    }
  };

  const toggleRow = (id: string | number) => {
    setOpenRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm("Willst du diese Auftrag wirklich löschen?")) {
      try {
        await fetchDeleteSale(id);
        dispatch(getSales({ page, size: 15 }));
      } catch (error) {
        console.error("Fehler beim Löschen der Auftrag:", error);
      }
    }
  };
  console.log("Sales:", sales);

  return (
    <Container>
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
            label="Suche"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: 400, backgroundColor: "white" }}
          />
          <IconButton onClick={handleClearSearch}>
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
          <Button variant="contained" onClick={handleOpenCreatePurchase}>
            Neu Aufttrag
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
              label="Von"
              type="date"
              size="small"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            {/* Дата до */}
            <TextField
              label="Bis"
              type="date"
              size="small"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            {/* PaymentStatus */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Zahlungsstatus</InputLabel>
              <Select
                value={filters.paymentStatus}
                onChange={(e: SelectChangeEvent) =>
                  handleFilterChange("paymentStatus", e.target.value)
                }
                label="PaymentStatus"
              >
                <MenuItem value="">ALLE</MenuItem>
                {PaymentStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
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
                <TableCell >Kunde</TableCell>
                <TableCell >Datum</TableCell>
                <TableCell >Betrag</TableCell>
                <TableCell >Rechnung-Nr</TableCell>
                <TableCell >Zahlungsstatus</TableCell>
                <TableCell >PDF</TableCell>
                <TableCell >Aktionen</TableCell>
              </TableRow>
            </StyledTableHead>

            <TableBody>
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <React.Fragment key={sale.id}>
                    <TableRow hover onClick={() => toggleRow(sale.id)} sx={{ cursor: 'pointer' }} >
                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{sale.id}</TableCell>
                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{sale.customerName}</TableCell>
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
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            const year = sale.invoiceNumber.split("-")[1];
                            const url = `${import.meta.env.VITE_API_URL}/invoices/${year}/${sale.invoiceNumber}.pdf`;
                            window.open(url, "_blank");
                          }}
                        >
                          <Typography variant="button" sx={{ fontWeight: "bold" }}>RE</Typography>
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            const year = sale.deliveryBill.split("-")[1];
                            const url = `${import.meta.env.VITE_API_URL}/delivery-bill/${year}/${sale.deliveryBill}.pdf`;
                            window.open(url, "_blank");
                          }}
                        >
                          <Typography variant="button" sx={{ fontWeight: "bold" }}>LF</Typography>
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={(e) => { e.stopPropagation(); navigate(`/sales/${sale.id}`) }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteClick(sale.id) }}>
                          <DeleteIcon />
                        </IconButton>
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
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>Artikelname</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>Menge</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>Einzelpreis</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>Netto</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>MWSt</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>Gesamt</TableCell>
                                  </TableRow>
                                </StyledSubTableHead>
                                <TableBody>
                                  {sale.saleItems?.map((item: any, index: number) => (
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
                  <TableCell colSpan={7} align="center">
                    Keine Aufträge gefunden
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
    invoiceNumber: filters.invoiceNumber || undefined,
    paymentStatus: filters.paymentStatus || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  };
};
