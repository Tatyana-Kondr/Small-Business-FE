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
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  getPurchases,
  getPurchasesByFilter,
  searchPurchases,
  selectPurchases,
  selectPurchasesVersion,
  selectTotalPages,
} from "../purchasesSlice";
import { useEffect, useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { PaymentStatuses } from "../../../constants/enums";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PaymentsIcon from "@mui/icons-material/Payments";
import CreatePayment from "../../payments/components/CreatePayment";
import DeletePurchase from "./DeletePurchase";
import { selectUser } from "../../auth/authSlice";
import {
  getDocumentTypes,
  selectTypeOfDocuments,
} from "../typeOfDocumentSlice";
import { TypeOfDocument } from "../types";
import SearchBox from "../../../components/ui/SearchBox";
import {
  actionCellStyle,
  actionIconButtonStyle,
  cellStyle,
  centerCellStyle,
  fixedCellWidth,
  hoverExpandCellStyle,
  leftBorderCellStyle,
  rightCellStyle,
  StyledSubTableHead,
  StyledTableHead,
  tableActionSlotStyle,
  tableActionsStyle,
  tableContainerStyle,
  tableRowHoverStyle,
  tableStyle,
} from "../../../styles/tableStyles";
import HoverExpandText from "../../../components/ui/HoverExpandText";
import { colors } from "../../../styles/colors";
import { formatNumber } from "../../../utils/formatNumber";
import SortableHeader from "../../../components/ui/SortableHeader";
import {
  filterOptionsStyle,
  filterPanelRowStyle,
  filterPanelStyle,
  listPageStyle,
  listPaginationStyle,
  listTableAreaStyle,
  pageToolbarStyle,
} from "../../../styles/formStyles";
import { getAdaptivePageSize } from "../../../utils/getAdaptivePageSize";
import FilterToggleButton from "../../../components/ui/FilterToggleButton";
import ClearFiltersButton from "../../../components/ui/ClearFiltersButton";
import DateRangeFilter from "../../../components/ui/DateRangeFilter";

export default function Purchases() {
  const dispatch = useAppDispatch();
  const purchases = useAppSelector(selectPurchases);
  const totalPages = useAppSelector(selectTotalPages);
  const purchasesVersion = useAppSelector(selectPurchasesVersion);
  const currentUser = useAppSelector(selectUser);
  const documentTypes = useAppSelector(selectTypeOfDocuments);
  const isAdmin = currentUser?.role === "ADMIN";
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
    "purchasingDate,DESC",
    "id,DESC",
  ]);

  const [filters, setFilters] = useState({
    documentId: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    dispatch(getDocumentTypes());
  }, [dispatch]);

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
      filters.documentId;

    if (hasFilters) {
      dispatch(
        getPurchasesByFilter({
          page,
          size: pageSize,
          ...convertFiltersToParams(filters),
          searchQuery: debouncedSearchTerm,
          sort,
        }),
      );
    } else if (debouncedSearchTerm) {
      dispatch(
        searchPurchases({
          page,
          size: pageSize,
          query: debouncedSearchTerm,
          sort,
        }),
      );
    } else {
      dispatch(getPurchases({ page, size: pageSize, sort }));
    }
  }, [dispatch, page, pageSize, debouncedSearchTerm, filters, sort, purchasesVersion,]);

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
              {/* Dokumenttyp */}
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel id="document-type-label">Dokumenttyp</InputLabel>

                <Select
                  labelId="document-type-label"
                  id="document-type-select"
                  value={filters.documentId || ""}
                  onChange={(e: SelectChangeEvent) =>
                    handleFilterChange("documentId", e.target.value)
                  }
                  label="Dokumenttyp"
                >
                  <MenuItem value="">ALLE</MenuItem>

                  {documentTypes.map((doc: TypeOfDocument) => (
                    <MenuItem key={doc.id} value={doc.id.toString()}>
                      {doc.name}
                    </MenuItem>
                  ))}
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
                  onChange={(e: SelectChangeEvent) =>
                    handleFilterChange("paymentStatus", e.target.value)
                  }
                  label="Zahlungsstatus"
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

      {/* Table */}
      <Box sx={listTableAreaStyle}>
        <TableContainer
          component={Paper}
          sx={{ ...tableContainerStyle, mt: 1 }}
        >
          <Table sx={tableStyle}>
            <StyledTableHead>
              <TableRow>
                {/* ID */}
                <TableCell sx={fixedCellWidth(90)}>
                  <SortableHeader
                    title="DokNr"
                    field="id"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                {/* Customer */}
                <TableCell sx={{ minWidth: 300 }}>
                  <SortableHeader
                    title="Lieferant"
                    field="vendorName"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                {/* Date */}
                <TableCell sx={fixedCellWidth(130)}>
                  <SortableHeader
                    title="Datum"
                    field="purchasingDate"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                {/* Amount */}
                <TableCell sx={fixedCellWidth(140)}>
                  <SortableHeader
                    title="Betrag"
                    field="total"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={fixedCellWidth(150)}>Dokument</TableCell>
                <TableCell sx={fixedCellWidth(150)}>Dokument-Nr</TableCell>
                <TableCell sx={fixedCellWidth(150)}>Zahlungsstatus</TableCell>

                {isAdmin && (
                  <TableCell sx={fixedCellWidth(150)}>Aktionen</TableCell>
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
                      sx={tableRowHoverStyle}
                    >
                      <TableCell
                        sx={{
                          ...cellStyle,
                          ...leftBorderCellStyle,
                          ...fixedCellWidth(90),
                        }}
                      >
                        {purchase.id}
                      </TableCell>

                      <TableCell sx={{ ...hoverExpandCellStyle }}>
                        <HoverExpandText
                          text={purchase.vendorName ?? ""}
                          hoverBgColor={colors.tableHover}
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          ...cellStyle,
                          ...fixedCellWidth(130),
                        }}
                      >
                        {purchase.purchasingDate
                          ? new Date(
                              purchase.purchasingDate,
                            ).toLocaleDateString("de-DE", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : ""}
                      </TableCell>

                      <TableCell
                        sx={{
                          ...rightCellStyle,
                          ...fixedCellWidth(140),
                        }}
                      >
                        {formatNumber(purchase.total)} €
                      </TableCell>

                      <TableCell
                        sx={{
                          ...cellStyle,
                          ...fixedCellWidth(150),
                        }}
                      >
                        {purchase.document?.name ?? ""}
                      </TableCell>

                      <TableCell
                        sx={{
                          ...cellStyle,
                          ...fixedCellWidth(150),
                        }}
                      >
                        {purchase.documentNumber}
                      </TableCell>

                      <TableCell
                        sx={{
                          ...cellStyle,
                          ...fixedCellWidth(150),
                        }}
                      >
                        {purchase.paymentStatus}
                      </TableCell>

                      {/* Action */}
                      {isAdmin && (
                        <TableCell
                          sx={{
                            ...actionCellStyle,
                            ...fixedCellWidth(150),
                          }}
                        >
                          {/* Edit */}
                          <Box sx={tableActionsStyle}>
                            <Box sx={tableActionSlotStyle}>
                              <Tooltip title="Bearbeiten" arrow>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/purchases/${purchase.id}`);
                                  }}
                                  sx={actionIconButtonStyle}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>

                            {/* Delete */}
                            <Box sx={tableActionSlotStyle}>
                              <DeletePurchase
                                purchaseId={purchase.id}
                                vendorName={purchase.vendorName}
                                purchasingDate={purchase.purchasingDate}
                                trigger={
                                  <Tooltip title="Löschen" arrow>
                                    <IconButton
                                      size="small"
                                      sx={actionIconButtonStyle}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                }
                              />
                            </Box>

                            {/* Pay */}
                            <Box sx={tableActionSlotStyle}>
                              {purchase.paymentStatus !== "BEZAHLT" && (
                                <Tooltip title="Bezahlen" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenPaymentDialogId(purchase.id);
                                      setSelectedOperationType(purchase.type);
                                    }}
                                    sx={actionIconButtonStyle}
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

                    {/* SubTable */}
                    {openRows[purchase.id] && (
                      <TableRow>
                        <TableCell
                          colSpan={isAdmin ? 8 : 7}
                          sx={{ paddingBottom: 0, paddingTop: 0 }}
                        >
                          <Collapse
                            in={openRows[purchase.id]}
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
                                  {purchase.purchaseItems?.map(
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
                                          {formatNumber(item.unitPrice)} €
                                        </TableCell>

                                        <TableCell sx={rightCellStyle}>
                                          {formatNumber(item.totalPrice)} €
                                        </TableCell>

                                        <TableCell sx={rightCellStyle}>
                                          {formatNumber(item.taxAmount)} €
                                        </TableCell>

                                        <TableCell sx={rightCellStyle}>
                                          {formatNumber(item.totalAmount)} €
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
    documentId: filters.documentId ? Number(filters.documentId) : undefined,
    paymentStatus: filters.paymentStatus || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  };
};
