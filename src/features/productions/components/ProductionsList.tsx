import {
  Box,
  Collapse,
  IconButton,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { useEffect, useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { selectUser } from "../../auth/authSlice";
import {
  getProductions,
  getProductionsByFilter,
  searchProductions,
  selectProductions,
  selectProductionsVersion,
  selectTotalPages,
} from "../productionsSlice";
import DeleteProduction from "./DeleteProduction";
import {
  listPageStyle,
  listPaginationStyle,
  listTableAreaStyle,
  pageToolbarStyle,
} from "../../../styles/formStyles";
import SearchBox from "../../../components/ui/SearchBox";
import { colors } from "../../../styles/colors";
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
import SortableHeader from "../../../components/ui/SortableHeader";
import HoverExpandText from "../../../components/ui/HoverExpandText";
import { formatNumber } from "../../../utils/formatNumber";
import { getAdaptivePageSize } from "../../../utils/getAdaptivePageSize";
import ClearFiltersButton from "../../../components/ui/ClearFiltersButton";
import DateRangeFilter from "../../../components/ui/DateRangeFilter";

export default function ProductionsList() {
  const dispatch = useAppDispatch();
  const productions = useAppSelector(selectProductions);
  const totalPages = useAppSelector(selectTotalPages);
  const productionsVersion = useAppSelector(selectProductionsVersion);
  const currentUser = useAppSelector(selectUser);
  const isAdmin = currentUser?.role === "ADMIN";
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(getAdaptivePageSize);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [openRows, setOpenRows] = useState<{ [key: string]: boolean }>({});

  const [sort, setSort] = useState<string[]>([
    "dateOfProduction,DESC",
    "id,DESC",
  ]);

  const [filters, setFilters] = useState({
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
    const hasFilters = filters.startDate || filters.endDate;

    if (hasFilters) {
      dispatch(
        getProductionsByFilter({
          page,
          size: pageSize,
          ...convertFiltersToParams(filters),
          searchQuery: debouncedSearchTerm,
          sort,
        }),
      );
    } else if (debouncedSearchTerm) {
      dispatch(
        searchProductions({
          page,
          size: pageSize,
          query: debouncedSearchTerm,
          sort,
        }),
      );
    } else {
      dispatch(getProductions({ page, size: pageSize, sort }));
    }
  }, [
    dispatch,
    page,
    pageSize,
    debouncedSearchTerm,
    filters,
    sort,
    productionsVersion,
  ]);

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

  const handleClearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
    });
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

    if (field !== "dateOfProduction") {
      newSort.push("dateOfProduction,DESC");
    }
    if (field !== "id") {
      newSort.push("id,DESC");
    }

    setSort(newSort);
    setPage(0);
  };

  return (
    <Box sx={listPageStyle}>
      <Box sx={{ ...pageToolbarStyle, mt: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <SearchBox
            value={searchTerm}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
          />

          <DateRangeFilter
            startDate={filters.startDate}
            endDate={filters.endDate}
            onStartDateChange={(value) =>
              handleFilterChange("startDate", value)
            }
            onEndDateChange={(value) => handleFilterChange("endDate", value)}
          />

          <ClearFiltersButton onClick={handleClearFilters} />
        </Box>
      </Box>

      {/* Table */}
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

                <TableCell sx={fixedCellWidth(130)}>
                  <SortableHeader
                    title="Datum"
                    field="dateOfProduction"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>
                <TableCell sx={fixedCellWidth(150)}>
                  <SortableHeader
                    title="Artikel"
                    field="productArticle"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>
                <TableCell sx={{ width: "40%" }}>
                  <SortableHeader
                    title="Produktname"
                    field="productName"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>
                <TableCell sx={fixedCellWidth(150)}>
                  <SortableHeader
                    title="Betrag"
                    field="amount"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableCell>
                {isAdmin && (
                  <TableCell sx={fixedCellWidth(150)}>Aktionen</TableCell>
                )}
              </TableRow>
            </StyledTableHead>

            <TableBody>
              {productions.length > 0 ? (
                productions.map((production) => (
                  <React.Fragment key={production.id}>
                    <TableRow
                      onClick={() => toggleRow(production.id)}
                      sx={tableRowHoverStyle}
                    >
                      <TableCell
                        sx={{
                          ...leftBorderCellStyle,
                          ...cellStyle,
                          ...fixedCellWidth(90),
                        }}
                      >
                        {production.id}
                      </TableCell>

                      <TableCell
                        sx={{
                          ...cellStyle,
                          ...fixedCellWidth(130),
                        }}
                      >
                        {production.dateOfProduction
                          ? new Date(
                              production.dateOfProduction,
                            ).toLocaleDateString("de-DE", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : ""}
                      </TableCell>

                      <TableCell
                        sx={{
                          ...cellStyle,
                          ...fixedCellWidth(150),
                        }}
                      >
                        {production.productArticle}
                      </TableCell>

                      <TableCell sx={hoverExpandCellStyle}>
                        <HoverExpandText
                          text={production.productName ?? ""}
                          hoverBgColor={colors.tableHover}
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          ...rightCellStyle,
                          ...fixedCellWidth(150),
                        }}
                      >
                        {production.amount} €
                      </TableCell>
                      {isAdmin && (
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
                                    navigate(`/productions/${production.id}`);
                                  }}
                                  sx={actionIconButtonStyle}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            <Box sx={tableActionSlotStyle}>
                              <DeleteProduction
                                productionId={production.id}
                                dateOfProduction={production.dateOfProduction}
                                trigger={
                                  <Tooltip title="Löschen" arrow>
                                    <IconButton sx={actionIconButtonStyle}>
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                }
                              />
                            </Box>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>

                    {/* SubTable */}
                    {openRows[production.id] && (
                      <TableRow>
                        <TableCell
                          colSpan={isAdmin ? 6 : 5}
                          sx={{ paddingBottom: 0, paddingTop: 0 }}
                        >
                          <Collapse
                            in={openRows[production.id]}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box margin={2}>
                              <Table size="small" sx={tableStyle}>
                                <StyledSubTableHead>
                                  <TableRow>
                                    <TableCell sx={fixedCellWidth(150)}>
                                      Artikel
                                    </TableCell>

                                    <TableCell sx={{ width: "40%" }}>
                                      Artikelname
                                    </TableCell>

                                    <TableCell sx={fixedCellWidth(90)}>
                                      Menge
                                    </TableCell>

                                    <TableCell sx={fixedCellWidth(110)}>
                                      Einzelpreis
                                    </TableCell>
                                    <TableCell sx={fixedCellWidth(150)}>
                                      Gesamt
                                    </TableCell>
                                  </TableRow>
                                </StyledSubTableHead>
                                <TableBody>
                                  {production.productionItems?.map(
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
                                          {item.productArticle ?? "—"}
                                        </TableCell>

                                        <TableCell sx={hoverExpandCellStyle}>
                                          <HoverExpandText
                                            text={item.productName ?? "_"}
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
                  <TableCell colSpan={isAdmin ? 6 : 5} align="center">
                    Keine Herstellungen gefunden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Пагинация */}
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
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  };
};
