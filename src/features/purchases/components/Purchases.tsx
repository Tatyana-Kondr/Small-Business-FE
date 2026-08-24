import {
  Box,
  Button,
  Collapse,
  debounce,
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
import { useNavigate } from "react-router-dom";;
import { PaymentStatuses } from "../../../constants/enums";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PaymentsIcon from '@mui/icons-material/Payments';
import CreatePayment from "../../payments/components/CreatePayment";
import DeletePurchase from "./DeletePurchase";
import { selectUser } from "../../auth/authSlice";
import { getDocumentTypes, selectTypeOfDocuments } from "../typeOfDocumentSlice";
import { TypeOfDocument } from "../types";
import SearchBox from "../../../components/ui/SearchBox";
import { outlinedButtonStyle } from "../../../styles/buttonStyles";
import { cellStyle, compactActionCellStyle, compactIconButtonStyle, compactTableCellStyle, compactTableRowStyle, fixedCellWidth, hoverExpandCellStyle, StyledSubTableHead, StyledTableHead, tableActionSlotStyle, tableActionsStyle, tableContainerStyle, tableStyle } from "../../../styles/tableStyles";
import HoverExpandText from "../../../components/ui/HoverExpandText";
import { colors } from "../../../styles/colors";
import { formatNumber } from "../../../utils/formatNumber";
import SortableHeader from "../../../components/ui/SortableHeader";
import { filterDateFieldsStyle, filterDateRangeStyle, filterDateRangeTitleStyle, filterOptionsStyle, filterPanelRowStyle, filterPanelStyle, pageToolbarStyle } from "../../../styles/formStyles";


export default function Purchases() {
  const dispatch = useAppDispatch();
  const purchases = useAppSelector(selectPurchases);
  const totalPages = useAppSelector(selectTotalPages);
  const currentUser = useAppSelector(selectUser);
  const documentTypes = useAppSelector(selectTypeOfDocuments);
  const isAdmin = currentUser?.role === "ADMIN";
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [openRows, setOpenRows] = useState<{ [key: string]: boolean }>({});
  const [openPaymentDialogId, setOpenPaymentDialogId] = useState<number | null>(null);
  const [selectedOperationType, setSelectedOperationType] = useState<string | null>(null);
  const [sort, setSort] = useState<string[]>(["purchasingDate,DESC", "id,DESC"]);

  const [filters, setFilters] = useState({
    documentId: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    dispatch(getDocumentTypes());
  }, [dispatch]);

  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      const hasFilters =
        filters.documentId ||
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
            sort
          })
        );
      } else {
        dispatch(
          searchPurchases({
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
      filters.documentId;

    if (hasFilters) {
      console.log("FILTER PARAMS:", convertFiltersToParams(filters));

      dispatch(
        getPurchasesByFilter({
          page,
          size: 15,
          ...convertFiltersToParams(filters),
          searchQuery: searchTerm,
          sort
        })
      );
    } else if (searchTerm) {
      dispatch(
        searchPurchases({
          page,
          size: 15,
          query: searchTerm,
          sort
        })
      );
    } else {
      dispatch(getPurchases({ page, size: 15, sort }));
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
      documentId: "",
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
      filters.documentId;

    if (hasFilters) {
      dispatch(
        getPurchasesByFilter({
          page: 0,
          size: 15,
          ...convertFiltersToParams(filters),
          searchQuery: "",
          sort
        })
      );
    } else {
      dispatch(getPurchases({ page: 0, size: 15, sort }));
    }
  };

  const toggleRow = (id: string | number) => {
    setOpenRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSort = (field: string, direction: "ASC" | "DESC") => {
    const newSort = [`${field},${direction}`];

    if (field !== "purchasingDate") {
      newSort.push("purchasingDate,DESC");
    }
    if (field !== "id") {
      newSort.push("id,DESC");
    }

    setSort(newSort);
    setPage(0);
  };

  return (
    <Box
      sx={{ p: 0, m: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", }}>
      {/* Верхняя панель */}
      <Box sx={pageToolbarStyle}>
        <Box display="flex" gap={2}>
          <SearchBox
            value={searchTerm}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
          />

          <Button variant="outlined" sx={outlinedButtonStyle} onClick={() => setFiltersVisible((prev) => !prev)}>
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
              {/* Dokumenttyp */}
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel id="document-type-label">
                  Dokumenttyp
                </InputLabel>

                <Select
                  labelId="document-type-label"
                  id="document-type-select"
                  value={filters.documentId || ""}
                  onChange={(e: SelectChangeEvent) => handleFilterChange("documentId", e.target.value)}
                  label="Dokumenttyp"
                >
                  <MenuItem value="">
                    ALLE
                  </MenuItem>

                  {documentTypes.map(
                    (doc: TypeOfDocument) => (
                      <MenuItem key={doc.id} value={doc.id.toString()}>
                        {doc.name}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>

              {/* Zahlungsstatus */}
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel id="payment-status-label">
                  Zahlungsstatus
                </InputLabel>

                <Select
                  labelId="payment-status-label"
                  id="payment-status-select"
                  value={filters.paymentStatus}
                  onChange={(e: SelectChangeEvent) => handleFilterChange("paymentStatus", e.target.value)}
                  label="Zahlungsstatus"
                >
                  <MenuItem value="">
                    ALLE
                  </MenuItem>

                  {PaymentStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                onClick={handleClearFilters}
                variant="outlined"
                sx={outlinedButtonStyle}
              >
                Filter zurücksetzen
              </Button>
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* Tabelle */}
      <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "auto", mb: 2, }}>
        <TableContainer
          component={Paper}
          sx={{ ...tableContainerStyle, mt: 1, minHeight: 580, }}
        >
          <Table sx={tableStyle}>
            <StyledTableHead>
              <TableRow>
                {/* ID */}
                <TableCell sx={fixedCellWidth(80)}>
                  <SortableHeader
                    title="DokNr"
                    field="id"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                {/* Lieferant */}
                <TableCell sx={{ width: "28%" }}>
                  <SortableHeader
                    title="Lieferant"
                    field="vendorName"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                {/* Datum */}
                <TableCell sx={fixedCellWidth(110)}>
                  <SortableHeader
                    title="Datum"
                    field="purchasingDate"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                {/* Betrag */}
                <TableCell sx={fixedCellWidth(120)}>
                  <SortableHeader
                    title="Betrag"
                    field="total"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={fixedCellWidth(140)}>Dokument</TableCell>
                <TableCell sx={fixedCellWidth(140)}>Dokument-Nr</TableCell>
                <TableCell sx={fixedCellWidth(140)}>Zahlungsstatus</TableCell>

                {isAdmin && (
                  <TableCell sx={fixedCellWidth(120)}>
                    Aktionen
                  </TableCell>
                )}
              </TableRow>
            </StyledTableHead>

            <TableBody>
              {purchases.length > 0 ? (
                purchases.map((purchase) => (
                  <React.Fragment key={purchase.id}>
                    {/* Основная строка */}
                    <TableRow
                      onClick={() => toggleRow(purchase.id)}
                      sx={compactTableRowStyle}
                    >
                      <TableCell sx={{ ...compactTableCellStyle, ...fixedCellWidth(80), }}>
                        {purchase.id}
                      </TableCell>

                      <TableCell sx={{  ...hoverExpandCellStyle, width: "28%", }}>
                        <HoverExpandText
                          text={ purchase.vendorName ?? "" }
                          maxWidth={300}
                          hoverBgColor={ colors.tableHover }
                        />
                      </TableCell>

                      <TableCell sx={{ ...compactTableCellStyle, ...fixedCellWidth(110), }}>
                        {purchase.purchasingDate ? new Date(
                            purchase.purchasingDate
                          ).toLocaleDateString(
                            "de-DE",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )
                          : ""}
                      </TableCell>

                      <TableCell sx={{ ...compactTableCellStyle, ...fixedCellWidth(120), textAlign: "right", }}>
                        {formatNumber(
                          purchase.total
                        )}{" "}
                        €
                      </TableCell>

                      <TableCell sx={{ ...compactTableCellStyle, ...fixedCellWidth(140), }}>
                        {purchase.document?.name ?? ""}
                      </TableCell>

                      <TableCell sx={{ ...compactTableCellStyle, ...fixedCellWidth(140), }}>
                        {purchase.documentNumber}
                      </TableCell>

                      <TableCell sx={{ ...compactTableCellStyle, ...fixedCellWidth(140), }}>
                        {purchase.paymentStatus}
                      </TableCell>

                      {/* Aktionen */}
                      {isAdmin && (
                        <TableCell sx={{ ...compactActionCellStyle, ...fixedCellWidth(120), }}>
                          <Box sx={tableActionsStyle}>
                            <Box sx={tableActionSlotStyle}>
                              <Tooltip title="Bearbeiten" arrow>
                                <IconButton
                                  size="small"
                                  onClick={(e) => { e.stopPropagation();
                                    navigate( `/purchases/${purchase.id}` );
                                  }}
                                  sx={ compactIconButtonStyle }
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>

                            {/* Löschen */}
                            <Box sx={tableActionSlotStyle}>
                              <DeletePurchase
                                purchaseId={ purchase.id }
                                vendorName={ purchase.vendorName }
                                purchasingDate={ purchase.purchasingDate }
                                onSuccessDelete={() => { }}
                                trigger={
                                  <Tooltip title="Löschen" arrow>
                                    <IconButton
                                      size="small"
                                      sx={ compactIconButtonStyle }>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                }
                              />
                            </Box>

                            <Box sx={tableActionSlotStyle}>
                              {purchase.paymentStatus !== "BEZAHLT" && (
                                  <Tooltip title="Bezahlen" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => { e.stopPropagation();
                                        setOpenPaymentDialogId( purchase.id );
                                        setSelectedOperationType( purchase.type );
                                      }}
                                      sx={ compactIconButtonStyle }
                                    >
                                      <PaymentsIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                            </Box>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>

                    {/* Подтаблица */}
                    {openRows[purchase.id] && (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 8 : 7} sx={{ paddingBottom: 0, paddingTop: 0, }}>
                          <Collapse in={openRows[purchase.id]} timeout="auto" unmountOnExit>
                            <Box margin={2}>
                              <Table size="small" sx={tableStyle}>
                                <StyledSubTableHead>
                                  <TableRow>
                                    <TableCell sx={fixedCellWidth(120)}>
                                      Artikel
                                    </TableCell>

                                    <TableCell sx={{ width: "30%", }}>
                                      Artikelname
                                    </TableCell>

                                    <TableCell sx={fixedCellWidth(80)}>
                                      Menge
                                    </TableCell>

                                    <TableCell sx={fixedCellWidth(100)}>
                                      Einzelpreis
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
                                  {purchase.purchaseItems?.map(( item: any, index: number ) => (
                                      <TableRow key={index}>
                                        <TableCell sx={{ ...cellStyle, borderLeft: `1px solid ${colors.border}`, }}>
                                          { item.productArticle }
                                        </TableCell>

                                        <TableCell sx={{ ...cellStyle, width: "30%", }}>
                                          <HoverExpandText
                                            text={ item.productName ?? ""}
                                            maxWidth={320}
                                            hoverBgColor={colors.tableHover}
                                          />
                                        </TableCell>

                                        <TableCell sx={{ ...cellStyle, textAlign: "center", }}>
                                          {item.quantity}
                                        </TableCell>

                                        <TableCell sx={{ ...cellStyle, textAlign: "right", }}>
                                          {formatNumber(item.unitPrice)}{" "} €
                                        </TableCell>

                                        <TableCell sx={{ ...cellStyle, textAlign: "right", }}>
                                          {formatNumber(item.totalPrice)}{" "} €
                                        </TableCell>

                                        <TableCell sx={{ ...cellStyle, textAlign: "right", }}>
                                          {formatNumber(item.taxAmount)}{" "} €
                                        </TableCell>

                                        <TableCell sx={{ ...cellStyle, textAlign: "right", }}>
                                          {formatNumber(item.totalAmount)}{" "} €
                                        </TableCell>
                                      </TableRow>
                                    )
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
                  <TableCell
                    colSpan={isAdmin ? 8 : 7}
                    align="center"
                  >
                    Keine Bestellungen gefunden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Zahlung */}
      {openPaymentDialogId !== null &&
        selectedOperationType && (
          <CreatePayment
            prefillType="purchase"
            prefillId={openPaymentDialogId}
            typeOfOperation={selectedOperationType}
            onClose={() => { setOpenPaymentDialogId(null); setSelectedOperationType(null); }}
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
    </Box>
  );
}

const convertFiltersToParams = (filters: any) => {
  return {
    documentId: filters.documentId ? Number(filters.documentId) : undefined,
    paymentStatus: filters.paymentStatus || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  };
};