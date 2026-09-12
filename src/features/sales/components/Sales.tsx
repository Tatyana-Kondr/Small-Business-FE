import {
  Box,
  Collapse,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  getSales,
  getSalesByFilter,
  searchSales,
  selectSales,
  selectSalesVersion,
  selectTotalPages,
} from "../salesSlice";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PaymentStatuses } from "../../../constants/enums";
import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PaymentsIcon from "@mui/icons-material/Payments";
import CreatePayment from "../../payments/components/CreatePayment";
import DeleteSale from "./DeleteSale";
import { selectUser } from "../../auth/authSlice";
import axios from "axios";
import { ACCESS_TOKEN_KEY } from "../../../utils/token";
import { showErrorToast } from "../../../utils/toast";
import HoverExpandText from "../../../components/ui/HoverExpandText";
import {
  actionCellStyle,
  actionIconButtonStyle,
  cellStyle,
  centerCellStyle,
  fixedCellWidth,
  hoverExpandCellStyle,
  leftBorderCellStyle,
  pdfActionsStyle,
  pdfTextButtonStyle,
  rightCellStyle,
  StyledSubTableHead,
  StyledTableHead,
  tableActionSlotStyle,
  tableActionsStyle,
  tableContainerStyle,
  tableRowHoverStyle,
  tableStyle,
} from "../../../styles/tableStyles";
import { colors } from "../../../styles/colors";
import SearchBox from "../../../components/ui/SearchBox";
import {
  filterOptionsStyle,
  filterPanelRowStyle,
  filterPanelStyle,
  listPageStyle,
  listPaginationStyle,
  listTableAreaStyle,
  pageToolbarStyle,
} from "../../../styles/formStyles";
import SortableHeader from "../../../components/ui/SortableHeader";
import { formatNumber } from "../../../utils/formatNumber";
import { getAdaptivePageSize } from "../../../utils/getAdaptivePageSize";
import ClearFiltersButton from "../../../components/ui/ClearFiltersButton";
import FilterToggleButton from "../../../components/ui/FilterToggleButton";
import DateRangeFilter from "../../../components/ui/DateRangeFilter";

export default function Sales() {
  const dispatch = useAppDispatch();
  const sales = useAppSelector(selectSales);
  const currentUser = useAppSelector(selectUser);
  const isAdmin = currentUser?.role === "ADMIN";
  const totalPages = useAppSelector(selectTotalPages);
  const salesVersion = useAppSelector(selectSalesVersion);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(getAdaptivePageSize);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [openRows, setOpenRows] = useState<{ [key: string]: boolean }>({});
  const [openPaymentDialogId, setOpenPaymentDialogId] = useState<number | null>(
    null,
  );
  const [selectedOperationType, setSelectedOperationType] = useState<
    string | null
  >(null);
  const [sort, setSort] = useState<string[]>([
    "salesDate,DESC",
    "invoiceNumber,DESC",
  ]);

  const [filters, setFilters] = useState({
    invoiceNumber: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const handleResize = () => {
      const newPageSize = getAdaptivePageSize();

      setPageSize((prev) => {
        if (prev === newPageSize) {
          return prev;
        }

        setPage(0);

        return newPageSize;
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchTerm]);

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
          size: pageSize,
          ...convertFiltersToParams(filters),
          searchQuery: debouncedSearchTerm,
          sort,
        }),
      );
    } else if (debouncedSearchTerm) {
      dispatch(
        searchSales({
          page,
          size: pageSize,
          query: debouncedSearchTerm,
          sort,
        }),
      );
    } else {
      dispatch(
        getSales({
          page,
          size: pageSize,
          sort,
        }),
      );
    }
  }, [dispatch, page, pageSize, debouncedSearchTerm, filters, sort, salesVersion,]);

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
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setPage(0);
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
      alert(
        "Fehlender Authentifizierungstoken. Bitte melden Sie sich erneut an.",
      );
      return;
    }

    const year = sale.invoiceNumber.substring(2, 6);
    const url = `${import.meta.env.VITE_API_URL}/api/sales/invoices/${year}/${sale.invoiceNumber}.pdf`;

    try {
      const res = await axios.get<Blob>(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
        validateStatus: () => true,
      });

      if (res.status === 404) {
        showErrorToast(
          "Rechnung nicht gefunden",
          "Die Rechnung ist nicht im Ordner vorhanden.",
        );
        return;
      }

      if (res.status !== 200) {
        showErrorToast("Fehler beim Laden", `Serverfehler (${res.status}).`);
        return;
      }

      const pdfBlob = new Blob([res.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      window.open(pdfUrl, "_blank");
    } catch (err) {
      console.error("Fehler beim Laden der Rechnung:", err);
      showErrorToast("Fehler", "Die Rechnung konnte nicht geladen werden.");
    }
  };

  const openDeliveryBill = async (e: React.MouseEvent, sale: any) => {
    e.stopPropagation();

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      alert(
        "Fehlender Authentifizierungstoken. Bitte melden Sie sich erneut an.",
      );
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
          "Der Lieferschein ist nicht im Ordner vorhanden.",
        );
        return;
      }

      if (res.status !== 200) {
        showErrorToast("Fehler beim Laden", `Serverfehler (${res.status}).`);
        return;
      }

      const pdfBlob = new Blob([res.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
    } catch (err) {
      console.error("Fehler beim Laden des Lieferscheins:", err);
      showErrorToast("Fehler", "Der Lieferschein konnte nicht geladen werden.");
    }
  };

  const handleSort = (field: string, direction: "ASC" | "DESC") => {
    const newSort = [`${field},${direction}`];

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
    <Box sx={listPageStyle}>
      <Box sx={pageToolbarStyle}>
        <Box display="flex" gap={2}>
          <SearchBox
            value={searchTerm}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
          />

          <FilterToggleButton
            visible={filtersVisible}
            onClick={() => setFiltersVisible((prev) => !prev)}
          />
        </Box>
      </Box>

      {/* Filters */}
      <Collapse in={filtersVisible}>
        <Paper elevation={4} sx={filterPanelStyle}>
          <Box sx={filterPanelRowStyle}>
            <DateRangeFilter
              startDate={filters.startDate}
              endDate={filters.endDate}
              onStartDateChange={(value) =>
                handleFilterChange("startDate", value)
              }
              onEndDateChange={(value) => handleFilterChange("endDate", value)}
            />

            <Box sx={filterOptionsStyle}>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="payment-status-label">
                  Zahlungsstatus
                </InputLabel>
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

              <ClearFiltersButton onClick={handleClearFilters} />
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* Table  */}
      <Box sx={listTableAreaStyle}>
        <TableContainer
          component={Paper}
          sx={{ ...tableContainerStyle, mt: 1 }}
        >
          <Table sx={tableStyle}>
            <StyledTableHead>
              <TableRow>
                <TableCell sx={fixedCellWidth(90)}>
                  <SortableHeader
                    title="DokNr"
                    field="id"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={{ minWidth: 280 }}>
                  <SortableHeader
                    title="Kunde"
                    field="customerName"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={fixedCellWidth(130)}>
                  <SortableHeader
                    title="Datum"
                    field="salesDate"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={fixedCellWidth(140)}>
                  <SortableHeader
                    title="Betrag"
                    field="totalAmount"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={fixedCellWidth(160)}>
                  <SortableHeader
                    title="Rechnung-Nr"
                    field="invoiceNumber"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={fixedCellWidth(150)}>Zahlungsstatus</TableCell>

                <TableCell sx={fixedCellWidth(100)}>PDF</TableCell>

                <TableCell sx={fixedCellWidth(150)}>Aktionen</TableCell>
              </TableRow>
            </StyledTableHead>

            <TableBody>
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <React.Fragment key={sale.id}>
                    <TableRow
                      onClick={() => toggleRow(sale.id)}
                      sx={tableRowHoverStyle}
                    >
                      <TableCell
                        sx={{
                          ...cellStyle,
                          ...leftBorderCellStyle,
                          ...fixedCellWidth(90),
                        }}
                      >
                        {sale.id}
                      </TableCell>

                      <TableCell sx={{ ...hoverExpandCellStyle }}>
                        <HoverExpandText
                          text={sale.customerName ?? ""}
                          hoverBgColor={colors.tableHover}
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          ...cellStyle,
                          ...fixedCellWidth(130),
                        }}
                      >
                        {sale.salesDate
                          ? new Date(sale.salesDate).toLocaleDateString(
                              "de-DE",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              },
                            )
                          : ""}
                      </TableCell>

                      <TableCell
                        sx={{
                          ...rightCellStyle,
                          ...fixedCellWidth(140),
                        }}
                      >
                        {formatNumber(sale.totalAmount)} €
                      </TableCell>

                      <TableCell
                        sx={{
                          ...centerCellStyle,
                          ...fixedCellWidth(160),
                        }}
                      >
                        {sale.invoiceNumber}
                      </TableCell>

                      <TableCell
                        sx={{
                          ...centerCellStyle,
                          ...fixedCellWidth(150),
                        }}
                      >
                        {sale.paymentStatus}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...actionCellStyle,
                          ...fixedCellWidth(100),
                        }}
                      >
                        <Box sx={pdfActionsStyle}>
                          <Tooltip title="Rechnung" arrow>
                            <IconButton
                              onClick={(e) => openInvoice(e, sale)}
                              sx={actionIconButtonStyle}
                            >
                              <Typography
                                variant="button"
                                sx={pdfTextButtonStyle}
                              >
                                RE
                              </Typography>
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Lieferschein" arrow>
                            <IconButton
                              onClick={(e) => openDeliveryBill(e, sale)}
                              sx={actionIconButtonStyle}
                            >
                              <Typography
                                variant="button"
                                sx={pdfTextButtonStyle}
                              >
                                LF
                              </Typography>
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>

                      <TableCell
                        sx={{
                          ...actionCellStyle,
                          ...fixedCellWidth(150),
                        }}
                      >
                        <Box sx={tableActionsStyle}>
                          <Box sx={tableActionSlotStyle}>
                            <Tooltip title="Bearbeiten" arrow>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/sales/${sale.id}`);
                                }}
                                sx={actionIconButtonStyle}
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
                                trigger={
                                  <Tooltip title="Löschen" arrow>
                                    <IconButton sx={actionIconButtonStyle}>
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
                                    setSelectedOperationType(
                                      sale.typeOfOperation,
                                    );
                                  }}
                                  sx={actionIconButtonStyle}
                                >
                                  <PaymentsIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>

                    {/* SubTable */}
                    {openRows[sale.id] && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          sx={{ paddingBottom: 0, paddingTop: 0 }}
                        >
                          <Collapse
                            in={openRows[sale.id]}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box margin={2}>
                              <Table size="small" sx={tableStyle}>
                                <StyledSubTableHead>
                                  <TableRow>
                                    <TableCell sx={fixedCellWidth(120)}>
                                      Artikel
                                    </TableCell>

                                    <TableCell sx={{ width: "40%" }}>
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
                                  {sale.saleItems?.map(
                                    (item: any, index: number) => (
                                      <TableRow
                                        key={index}
                                        sx={tableRowHoverStyle}
                                      >
                                        <TableCell
                                          sx={{
                                            ...cellStyle,
                                            ...leftBorderCellStyle,
                                          }}
                                        >
                                          {item.productArticle}
                                        </TableCell>

                                        <TableCell sx={hoverExpandCellStyle}>
                                          <HoverExpandText
                                            text={item.productName ?? ""}
                                            hoverBgColor={colors.tableHover}
                                          />
                                        </TableCell>

                                        <TableCell sx={centerCellStyle}>
                                          {item.quantity}
                                        </TableCell>

                                        <TableCell sx={rightCellStyle}>
                                          {item.unitPrice} €
                                        </TableCell>

                                        <TableCell sx={centerCellStyle}>
                                          {item.discount} %
                                        </TableCell>

                                        <TableCell sx={rightCellStyle}>
                                          {item.totalPrice} €
                                        </TableCell>

                                        <TableCell sx={rightCellStyle}>
                                          {item.taxAmount} €
                                        </TableCell>

                                        <TableCell sx={rightCellStyle}>
                                          {item.totalAmount} €
                                        </TableCell>
                                      </TableRow>
                                    ),
                                  )}
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
                  <TableCell colSpan={8} align="center">
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

      <Box sx={listPaginationStyle}>
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
