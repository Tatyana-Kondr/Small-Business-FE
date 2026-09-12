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
  TextField,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";

import {
  getAllPurchaseIds,
  getAllSaleIds,
  getPayments,
  getPaymentsByFilter,
  searchPayments,
  selectPayments,
  selectPaymentsVersion,
  selectTotalPages,
} from "../paymentsSlice";

import DeletePayment from "./DeletePayment";
import EditPayment from "./EditPayment";
import { Payment } from "../types";

import {
  getDocumentTypes,
  selectTypeOfDocuments,
} from "../../purchases/typeOfDocumentSlice";
import { TypeOfDocument } from "../../purchases/types";

import SearchBox from "../../../components/ui/SearchBox";
import FilterToggleButton from "../../../components/ui/FilterToggleButton";
import ClearFiltersButton from "../../../components/ui/ClearFiltersButton";
import DateRangeFilter from "../../../components/ui/DateRangeFilter";
import HoverExpandText from "../../../components/ui/HoverExpandText";

import {
  filterOptionsStyle,
  filterPanelRowStyle,
  filterPanelStyle,
  listPageStyle,
  listPaginationStyle,
  listTableAreaStyle,
  pageToolbarStyle,
} from "../../../styles/formStyles";

import {
  actionCellStyle,
  actionIconButtonStyle,
  cellStyle,
  centerCellStyle,
  fixedCellWidth,
  hoverExpandCellStyle,
  leftBorderCellStyle,
  rightCellStyle,
  StyledTableHead,
  tableActionSlotStyle,
  tableActionsStyle,
  tableContainerStyle,
  tableRowHoverStyle,
  tableStyle,
} from "../../../styles/tableStyles";

import { colors } from "../../../styles/colors";
import { formatNumber } from "../../../utils/formatNumber";
import { getAdaptivePageSize } from "../../../utils/getAdaptivePageSize";
import SortableHeader from "../../../components/ui/SortableHeader";

type PaymentFilters = {
  documentId: string;
  documentNumber: string;
  saleId: number | "";
  purchaseId: number | "";
  startDate: string;
  endDate: string;
};

function convertFiltersToParams(filters: PaymentFilters) {
  return {
    documentId:
      filters.documentId !== "" ? Number(filters.documentId) : undefined,

    documentNumber: filters.documentNumber || undefined,

    saleId: filters.saleId !== "" ? filters.saleId : undefined,

    purchaseId: filters.purchaseId !== "" ? filters.purchaseId : undefined,

    startDate: filters.startDate || undefined,

    endDate: filters.endDate || undefined,
  };
}

export default function Payments() {
  const dispatch = useAppDispatch();

  const payments = useAppSelector(selectPayments);
  const totalPages = useAppSelector(selectTotalPages);
  const paymentsVersion = useAppSelector(selectPaymentsVersion);
  const documentTypes = useAppSelector(selectTypeOfDocuments);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(getAdaptivePageSize);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [filtersVisible, setFiltersVisible] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const [saleOptions, setSaleOptions] = useState<number[]>([]);
  const [purchaseOptions, setPurchaseOptions] = useState<number[]>([]);

  const [sort, setSort] = useState<string[]>(["paymentDate,DESC", "id,DESC"]);

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
    if (!filtersVisible) {
      return;
    }

    dispatch(getAllSaleIds()).then((res: any) => {
      setSaleOptions(res.payload ?? []);
    });

    dispatch(getAllPurchaseIds()).then((res: any) => {
      setPurchaseOptions(res.payload ?? []);
    });
  }, [dispatch, filtersVisible]);

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
          size: pageSize,
          sort,
          ...convertFiltersToParams(filters),
          searchQuery: debouncedSearchTerm,
        }),
      );
    } else if (debouncedSearchTerm) {
      dispatch(
        searchPayments({
          page,
          size: pageSize,
          sort,
          query: debouncedSearchTerm,
        }),
      );
    } else {
      dispatch(
        getPayments({
          page,
          size: pageSize,
          sort,
        }),
      );
    }
  }, [
    dispatch,
    page,
    pageSize,
    debouncedSearchTerm,
    filters,
    sort,
    paymentsVersion,
  ]);

  const handlePageChange = (_: unknown, value: number) => {
    setPage(value - 1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setPage(0);
  };

  const handleFilterChange = (
    field: keyof PaymentFilters,
    value: string | number,
  ) => {
    setFilters((prev) => ({
      ...prev,

      [field]:
        field === "saleId" || field === "purchaseId"
          ? value === ""
            ? ""
            : Number(value)
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

  const handleSort = (field: string, direction: "ASC" | "DESC") => {
    const newSort = [`${field},${direction}`];

    if (field !== "paymentDate") {
      newSort.push("paymentDate,DESC");
    }

    if (field !== "id") {
      newSort.push("id,DESC");
    }

    setSort(newSort);
    setPage(0);
  };

  return (
    <Box sx={listPageStyle}>
      {/* Верхняя панель */}
      <Box sx={{ ...pageToolbarStyle, mt: 1 }}>
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

      {/* Фильтры */}
      <Collapse in={filtersVisible}>
        <Paper elevation={0} sx={filterPanelStyle}>
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
              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel id="payment-document-type-label">
                  Dokumenttyp
                </InputLabel>

                <Select
                  labelId="payment-document-type-label"
                  value={filters.documentId}
                  label="Dokumenttyp"
                  onChange={(event: SelectChangeEvent<string>) =>
                    handleFilterChange("documentId", event.target.value)
                  }
                >
                  <MenuItem value="">ALLE</MenuItem>

                  {documentTypes.map((doc: TypeOfDocument) => (
                    <MenuItem key={doc.id} value={doc.id.toString()}>
                      {doc.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Referenz */}
              <TextField
                label="Referenz"
                size="small"
                value={filters.documentNumber}
                onChange={(e) =>
                  handleFilterChange("documentNumber", e.target.value)
                }
                sx={{ width: 180 }}
              />

              {/* Sale ID */}
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="payment-sale-id-label">Auftrag Nr.</InputLabel>

                <Select
                  labelId="payment-sale-id-label"
                  value={filters.saleId}
                  label="Auftrag Nr."
                  onChange={(event) =>
                    handleFilterChange("saleId", event.target.value)
                  }
                >
                  <MenuItem value="">ALLE</MenuItem>

                  {saleOptions.map((saleId) => (
                    <MenuItem key={saleId} value={saleId}>
                      {saleId}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Purchase ID */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="payment-purchase-id-label">
                  Bestellung Nr.
                </InputLabel>

                <Select
                  labelId="payment-purchase-id-label"
                  value={filters.purchaseId}
                  label="Bestellung Nr."
                  onChange={(event) =>
                    handleFilterChange("purchaseId", event.target.value)
                  }
                >
                  <MenuItem value="">ALLE</MenuItem>

                  {purchaseOptions.map((purchaseId) => (
                    <MenuItem key={purchaseId} value={purchaseId}>
                      {purchaseId}
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
          sx={{
            ...tableContainerStyle,
            mt: 1,
          }}
        >
          <Table sx={tableStyle}>
            <StyledTableHead>
              <TableRow>
                <TableCell sx={fixedCellWidth(90)}>
                  <SortableHeader
                    title="ID"
                    field="id"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={{ minWidth: 260 }}>
                  <SortableHeader
                    title="Geschäftspartner"
                    field="customerName"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={fixedCellWidth(130)}>
                  <SortableHeader
                    title="Datum"
                    field="paymentDate"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={fixedCellWidth(140)}>
                  <SortableHeader
                    title="Betrag"
                    field="amount"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={fixedCellWidth(150)}>
                  <SortableHeader
                    title="Dokumenttyp"
                    field="documentName"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={fixedCellWidth(160)}>
                  <SortableHeader
                    title="Referenz"
                    field="documentNumber"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={fixedCellWidth(130)}>
                  <SortableHeader
                    title="Auftrag Nr."
                    field="saleId"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={fixedCellWidth(140)}>
                  <SortableHeader
                    title="Bestellung Nr."
                    field="purchaseId"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={fixedCellWidth(130)}>
                  Aktionen
                </TableCell>
              </TableRow>
            </StyledTableHead>

            <TableBody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <TableRow key={payment.id} sx={tableRowHoverStyle}>
                    {/* ID */}
                    <TableCell
                      sx={{
                        ...leftBorderCellStyle,
                        ...cellStyle,
                        ...fixedCellWidth(90),
                      }}
                    >
                      {payment.id}
                    </TableCell>

                    {/* Geschäftspartner */}
                    <TableCell sx={hoverExpandCellStyle}>
                      <HoverExpandText
                        text={payment.customerName ?? ""}
                        hoverBgColor={colors.tableHover}
                      />
                    </TableCell>

                    {/* Datum */}
                    <TableCell
                      sx={{
                        ...cellStyle,
                        ...fixedCellWidth(130),
                      }}
                    >
                      {payment.paymentDate
                        ? new Date(payment.paymentDate).toLocaleDateString(
                            "de-DE",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            },
                          )
                        : ""}
                    </TableCell>

                    {/* Betrag */}
                    <TableCell
                      sx={{
                        ...rightCellStyle,
                        ...fixedCellWidth(140),
                      }}
                    >
                      {formatNumber(payment.amount)} €
                    </TableCell>

                    {/* Dokumenttyp */}
                    <TableCell
                      sx={{
                        ...cellStyle,
                        ...fixedCellWidth(150),
                      }}
                    >
                      {payment.document?.name ?? "—"}
                    </TableCell>

                    {/* Referenz */}
                    <TableCell
                      sx={{
                        ...cellStyle,
                        ...fixedCellWidth(160),
                      }}
                    >
                      {payment.documentNumber ?? "—"}
                    </TableCell>

                    {/* Auftrag */}
                    <TableCell
                      sx={{
                        ...centerCellStyle,
                        ...fixedCellWidth(130),
                      }}
                    >
                      {payment.saleId ?? "—"}
                    </TableCell>

                    {/* Bestellung */}
                    <TableCell
                      sx={{
                        ...centerCellStyle,
                        ...fixedCellWidth(140),
                      }}
                    >
                      {payment.purchaseId ?? "—"}
                    </TableCell>

                    {/* Aktionen */}
                    <TableCell
                      sx={{
                        ...actionCellStyle,
                        ...fixedCellWidth(130),
                      }}
                    >
                      <Box sx={tableActionsStyle}>
                        <Box sx={tableActionSlotStyle}>
                          <Tooltip title="Bearbeiten" arrow>
                            <IconButton
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedPayment(payment);
                              }}
                              sx={actionIconButtonStyle}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>

                        <Box sx={tableActionSlotStyle}>
                          <DeletePayment
                            paymentId={payment.id}
                            customerName={payment.customerName}
                            amount={payment.amount}
                            paymentDate={payment.paymentDate}
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
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Keine Zahlungen gefunden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Edit */}
      {selectedPayment && (
        <EditPayment
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}

      {/* Pagination */}
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
