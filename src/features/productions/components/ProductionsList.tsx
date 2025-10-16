import {
  Box,
  Button,
  Collapse,
  Container,
  debounce,
  IconButton,
  Pagination,
  Paper,
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
import { useNavigate } from "react-router-dom";
import { ClearIcon } from "@mui/x-date-pickers";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { selectUser } from "../../auth/authSlice";
import { getProductions, getProductionsByFilter, searchProductions, selectProductions, selectTotalPages } from "../productionsSlice";
import DeleteProduction from "./DeleteProduction";
import { selectProducts } from "../../products/productsSlice";


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

export default function ProductionsList() {
  const dispatch = useAppDispatch();
  const productions = useAppSelector(selectProductions);
  const totalPages = useAppSelector(selectTotalPages);
  const currentUser = useAppSelector(selectUser);
  const isAdmin = currentUser?.role === "ADMIN";
  const products = useAppSelector(selectProducts);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [openRows, setOpenRows] = useState<{ [key: string]: boolean }>({});

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const getProductDetails = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    return product
      ? { article: product.article, name: product.name }
      : { article: "—", name: "—" };
  };

  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      const hasFilters = filters.startDate || filters.endDate;

      if (hasFilters) {
        dispatch(
          getProductionsByFilter({
            page,
            size: 15,
            ...convertFiltersToParams(filters),
            searchQuery: searchTerm,
          })
        );
      } else {
        dispatch(
          searchProductions({
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
    const hasFilters = filters.startDate || filters.endDate;

    if (hasFilters) {
      dispatch(
        getProductionsByFilter({
          page,
          size: 15,
          ...convertFiltersToParams(filters),
          searchQuery: searchTerm,
        })
      );
    } else if (searchTerm) {
      dispatch(
        searchProductions({
          page,
          size: 15,
          query: searchTerm,
        })
      );
    } else {
      dispatch(getProductions({ page, size: 15 }));
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

  const navigate = useNavigate();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    debouncedSearch(newSearchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(0);

    const hasFilters = filters.startDate || filters.endDate;

    if (hasFilters) {
      dispatch(
        getProductionsByFilter({
          page: 0,
          size: 15,
          ...convertFiltersToParams(filters),
          searchQuery: "",
        })
      );
    } else {
      dispatch(getProductions({ page: 0, size: 15 }));
    }
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


  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography
          variant="h6"
          sx={{
            textAlign: "left",
            fontWeight: "bold",
            textDecoration: "underline",
            color: "#0277bd",
          }}
        >
          HERSTELLUNGEN
        </Typography>
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
          <IconButton aria-label="Suche zurücksetzen" onClick={handleClearSearch}>
            <ClearIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Фильтры всегда видны */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
          <Button onClick={handleClearFilters} variant="outlined" sx={{ "&:hover": { borderColor: "#00acc1" } }}>
            Filter zurücksetzen
          </Button>
        </Box>

      </Box>

      {/* Таблица */}
      <Box sx={{ minHeight: "580px" }}>
        <TableContainer component={Paper}>
          <Table>
            <StyledTableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Datum</TableCell>
                <TableCell>Produkt</TableCell>
                <TableCell>Betrag</TableCell>
                {isAdmin && <TableCell>Aktionen</TableCell>}
              </TableRow>
            </StyledTableHead>

            <TableBody>
              {productions.length > 0 ? (
                productions.map((production) => (
                  <React.Fragment key={production.id}>
                    <TableRow
                      hover
                      onClick={() => toggleRow(production.id)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>
                        {production.id}
                      </TableCell>
                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>
                        {production.dateOfProduction
                          ? new Date(production.dateOfProduction).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                          : ""}
                      </TableCell>
                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>
                        {getProductDetails(production.productId).article} / {getProductDetails(production.productId).name}
                      </TableCell>
                      <TableCell align="right" sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>
                        {production.amount} €
                      </TableCell>
                      {isAdmin && (
                        <TableCell sx={{ padding: "2px 12px" }}>
                          <Box display="flex" sx={{ padding: "2px 12px" }} gap={1}>
                            <Tooltip title="Bearbeiten" arrow>
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/productions/${production.id}`);
                                }}
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
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <DeleteProduction
                              productionId={production.id}
                              dateOfProduction={production.dateOfProduction}
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
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>

                    {/* Подтаблица */}
                    {openRows[production.id] && (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                          <Collapse in={openRows[production.id]} timeout="auto" unmountOnExit>
                            <Box margin={2}>
                              <Table size="small" sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                                <StyledSubTableHead>
                                  <TableRow>
                                    <TableCell>Artikel</TableCell>
                                    <TableCell>Artikelname</TableCell>
                                    <TableCell>Menge</TableCell>
                                    <TableCell>Einzelpreis</TableCell>
                                    <TableCell>Gesamt</TableCell>
                                  </TableRow>
                                </StyledSubTableHead>
                                <TableBody>
                                  {production.productionItems?.map((item: any, index: number) => (
                                    <TableRow key={index}>
                                      <TableCell sx={{ borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd", padding: "6px 12px" }}>
                                        {item.product?.article ?? "—"}
                                      </TableCell>
                                      <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>
                                        {item.product?.name ?? "—"}
                                      </TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>{item.unitPrice} €</TableCell>
                                      <TableCell>{item.totalPrice} €</TableCell>
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
                    Keine Herstellungen gefunden
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
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  };
};