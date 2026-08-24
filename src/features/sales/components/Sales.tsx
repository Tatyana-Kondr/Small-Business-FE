import { Box, Button, Collapse, debounce, FormControl, IconButton, InputLabel, MenuItem, Pagination, Paper, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { getSales, getSalesByFilter, searchSales, selectSales, selectTotalPages } from "../salesSlice";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import EllipsisTooltip from "../../../components/ui/EllipsisTooltip";
import HoverExpandText from "../../../components/ui/HoverExpandText";
import { cellStyle, compactActionCellStyle, compactIconButtonStyle, compactTableCellStyle, compactTableRowStyle, fixedCellWidth, hoverExpandCellStyle, pdfActionsStyle, pdfTextButtonStyle, StyledSubTableHead, StyledTableHead, tableActionSlotStyle, tableActionsStyle, tableContainerStyle, tableStyle } from "../../../styles/tableStyles";
import { outlinedButtonStyle } from "../../../styles/buttonStyles";
import { colors } from "../../../styles/colors";
import SearchBox from "../../../components/ui/SearchBox";
import { filterDateFieldsStyle, filterDateRangeStyle, filterDateRangeTitleStyle, filterOptionsStyle, filterPanelRowStyle, filterPanelStyle, pageToolbarStyle } from "../../../styles/formStyles";
import SortableHeader from "../../../components/ui/SortableHeader";
import { formatNumber } from "../../../utils/formatNumber";


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
    <Box sx={{ p: 0, m: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", }}>

      {/* Верхняя панель */}
      <Box sx={pageToolbarStyle}>
        <Box display="flex" gap={2}>
          <SearchBox
            value={searchTerm}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
          />

          <Button
            variant="outlined"
            sx={outlinedButtonStyle}
            onClick={() => setFiltersVisible((prev) => !prev)}
          >
            {filtersVisible ? "Filter ausblenden" : "Filter anzeigen"}
          </Button>
        </Box>
      </Box>


      {/* Фильтры */}
      <Collapse in={filtersVisible}>
        <Paper elevation={4} sx={filterPanelStyle}>
          <Box sx={filterPanelRowStyle}>
            <Box sx={filterDateRangeStyle}>
              <Typography variant="caption" sx={filterDateRangeTitleStyle}>
                Zeitraum:
              </Typography>

              <Box sx={filterDateFieldsStyle}>
                <TextField
                  id="filter-start-date"
                  label="Von"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  id="filter-end-date"
                  label="Bis"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>

            <Box sx={filterOptionsStyle}>
              {/* PaymentStatus */}
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="payment-status-label">Zahlungsstatus</InputLabel>
                <Select
                  labelId="payment-status-label"
                  id="payment-status-select"
                  value={filters.paymentStatus}
                  onChange={(e: SelectChangeEvent) => handleFilterChange("paymentStatus", e.target.value)}
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

              <Button onClick={handleClearFilters} variant="outlined" sx={outlinedButtonStyle}>
                Filter zurücksetzen
              </Button>
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* Таблица */}
      <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "auto", mb: 2, }}>
        <TableContainer component={Paper} sx={{ ...tableContainerStyle, mt: 1, minHeight: 580, }}>
          <Table sx={tableStyle}>
            <StyledTableHead>
              <TableRow>
                <TableCell sx={fixedCellWidth(80)}>
                  <SortableHeader
                    title="DokNr"
                    field="id"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={{ width: "28%" }}>
                  <SortableHeader
                    title="Kunde"
                    field="customerName"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={fixedCellWidth(110)}>
                  <SortableHeader
                    title="Datum"
                    field="salesDate"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={fixedCellWidth(120)}>
                  <SortableHeader
                    title="Betrag"
                    field="totalAmount"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={fixedCellWidth(140)}>
                  <SortableHeader
                    title="Rechnung-Nr"
                    field="invoiceNumber"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={fixedCellWidth(140)}>
                  Zahlungsstatus
                </TableCell>

                <TableCell sx={fixedCellWidth(80)}>
                  PDF
                </TableCell>

                <TableCell sx={fixedCellWidth(120)}>
                  Aktionen
                </TableCell>
              </TableRow>
            </StyledTableHead>

            <TableBody>
              {sales.length > 0 ? (sales.map((sale) => (
                  <React.Fragment key={sale.id}>
                    <TableRow
                      onClick={() => toggleRow(sale.id)}
                      sx={compactTableRowStyle}
                    >
                      <TableCell sx={{ ...compactTableCellStyle, ...fixedCellWidth(80), }}>
                        {sale.id}
                      </TableCell>

                      <TableCell sx={{ ...hoverExpandCellStyle, width: "28%", }}>
                        <HoverExpandText text={sale.customerName ?? ""}  maxWidth={300} hoverBgColor={colors.tableHover} />
                      </TableCell>

                      <TableCell sx={{ ...compactTableCellStyle, ...fixedCellWidth(110), }}>
                        {sale.salesDate ? new Date(sale.salesDate).toLocaleDateString( "de-DE", { day: "2-digit", month: "2-digit", year: "numeric", } ) : ""}
                      </TableCell>

                      <TableCell sx={{ ...compactTableCellStyle, ...fixedCellWidth(120), textAlign: "right", }}>
                        {formatNumber(sale.totalAmount)} €
                      </TableCell>

                      <TableCell sx={{ ...compactTableCellStyle,  ...fixedCellWidth(140), }}>
                        {sale.invoiceNumber}
                      </TableCell>

                      <TableCell sx={{ ...compactTableCellStyle, ...fixedCellWidth(140), }}>
                        {sale.paymentStatus}
                      </TableCell>
                      <TableCell sx={{ ...compactActionCellStyle, ...fixedCellWidth(80), }}>
                        <Box sx={pdfActionsStyle}>
                          <Tooltip title="Rechnung" arrow>
                            <IconButton
                              onClick={(e) => openInvoice(e, sale)}
                              sx={compactIconButtonStyle}
                            >
                              <Typography variant="button" sx={pdfTextButtonStyle}>
                                RE
                              </Typography>
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Lieferschein" arrow>
                            <IconButton
                              onClick={(e) => openDeliveryBill(e, sale)}
                              sx={compactIconButtonStyle}
                            >
                              <Typography variant="button" sx={pdfTextButtonStyle}>
                                LF
                              </Typography>
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>

                      <TableCell
                        sx={{
                          ...compactActionCellStyle,
                          ...fixedCellWidth(120),
                        }}
                      >
                        <Box sx={tableActionsStyle}>
                          <Box sx={tableActionSlotStyle}>
                            <Tooltip title="Bearbeiten" arrow>
                              <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); navigate(`/sales/${sale.id}`); }}
                                sx={compactIconButtonStyle}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>

                          <Box sx={tableActionSlotStyle}>
                            {isAdmin && (
                              <DeleteSale
                                saleId={sale.id}
                                customerName={sale.customerName}
                                salesDate={sale.salesDate}
                                onSuccessDelete={() => { }}
                                trigger={
                                  <Tooltip title="Löschen" arrow>
                                    <IconButton sx={compactIconButtonStyle}>
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                }
                              />
                            )}
                          </Box>

                          <Box sx={tableActionSlotStyle}>
                            {sale.paymentStatus !== "BEZAHLT" && (
                              <Tooltip title="Bezahlen" arrow>
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenPaymentDialogId(sale.id);
                                    setSelectedOperationType(sale.typeOfOperation);
                                  }}
                                  sx={compactIconButtonStyle}
                                >
                                  <PaymentsIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>

                    {/* Подтаблица */}
                    {
                      openRows[sale.id] && (
                        <TableRow>
                          <TableCell colSpan={8} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                            <Collapse in={openRows[sale.id]} timeout="auto" unmountOnExit>
                              <Box margin={2}>
                                <Table size="small" sx={{ ...tableStyle, }}>
                                  <StyledSubTableHead>
                                    <TableRow>
                                      <TableCell sx={fixedCellWidth(120)}>
                                        Artikel
                                      </TableCell>

                                      <TableCell sx={{ width: "30%" }}>
                                        Artikelname
                                      </TableCell>

                                      <TableCell sx={fixedCellWidth(80)}>
                                        Menge
                                      </TableCell>

                                      <TableCell sx={fixedCellWidth(100)}>
                                        Einzelpreis
                                      </TableCell>

                                      <TableCell sx={fixedCellWidth(80)}>
                                        Rabatt
                                      </TableCell>

                                      <TableCell sx={fixedCellWidth(100)}>
                                        Netto
                                      </TableCell>

                                      <TableCell sx={fixedCellWidth(100)}>
                                        MWSt
                                      </TableCell>

                                      <TableCell sx={fixedCellWidth(110)}>
                                        Gesamt
                                      </TableCell>
                                    </TableRow>
                                  </StyledSubTableHead>
                                  <TableBody>
                                    {sale.saleItems?.map((item: any, index: number) => (
                                      <TableRow key={index}>
                                        <TableCell sx={{ ...cellStyle, borderLeft: "1px solid #ddd", }}>{item.productArticle}</TableCell>
                                        <TableCell sx={{ ...cellStyle, width: 320 }}>
                                          <EllipsisTooltip text={item.productName ?? ""} placement="right-start" />
                                        </TableCell>
                                        <TableCell sx={{ ...cellStyle, }}>{item.quantity}</TableCell>
                                        <TableCell sx={{ ...cellStyle, }}>{item.unitPrice} €</TableCell>
                                        <TableCell sx={{ ...cellStyle, }}>{item.discount} %</TableCell>
                                        <TableCell sx={{ ...cellStyle, }}>{item.totalPrice} €</TableCell>
                                        <TableCell sx={{ ...cellStyle, }}>{item.taxAmount} €</TableCell>
                                        <TableCell sx={{ ...cellStyle, }}>{item.totalAmount} €</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )
                    }
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Keine Aufträge gefunden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {
        openPaymentDialogId !== null && selectedOperationType && (
          <CreatePayment
            prefillType="sale"
            prefillId={openPaymentDialogId}
            typeOfOperation={selectedOperationType}
            onClose={() => { setOpenPaymentDialogId(null); setSelectedOperationType(null); }}
          />
        )
      }

      {/* Пагинация */}
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
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
