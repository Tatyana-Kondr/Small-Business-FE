import { useCallback, useEffect, useState } from "react";
import {
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Box, Pagination,
  TextField,
  IconButton
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { getProducts, selectProducts, selectTotalPages } from "../productsSlice";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import ClearIcon from "@mui/icons-material/Clear";
import debounce from "lodash.debounce";

// Стили для заголовков таблицы
const StyledTableHead = styled(TableHead)({
  backgroundColor: "#1a3d6d",
  "& th": {
    color: "white",
    fontWeight: "bold",
    borderRight: "1px solid #ddd",
  },
});

// Функция для окрашивания чисел
const formatNumber = (value: number) => (
  <span style={{ color: value < 0 ? "red" : "inherit" }}>{value}</span>
);

export default function Products() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const totalPages = useAppSelector(selectTotalPages);  // Получаем количество страниц
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Используем debounce для оптимизации запросов
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      dispatch(getProducts({ page, searchTerm })); // Делаем запрос с новым searchTerm
    }, 500), // Задержка в 500 мс
    []
  );

  useEffect(() => {
    dispatch(getProducts({ page, searchTerm }));
  }, [dispatch, page, searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm); // Обновляем строку поиска
    debouncedSearch(newSearchTerm); // Запускаем дебаунс для поиска
  };

  const handlePageChange = (_: any, value: number) => {
    setPage(value - 1); // Обновляем текущую страницу
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(0);
    dispatch(getProducts({ page: 0, size: 15 }));
  };

  return (
    <Box sx={{ p: 0, m: 0, width: "100%" }}>

      {/* Верхняя панель */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        sx={{
          position: "sticky", // Сделаем панель фиксированной
          top: 0, // Закрепим сверху
          zIndex: 1000, // Повышаем приоритет на случай, если другие элементы будут сверху
          padding: "10px 0", // Отступы
        }}
      >
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
            onClick={handleClearSearch}
          >
            <ClearIcon />
          </IconButton>
        </Box>

      </Box>

      {/* Таблица */}
      <Box sx={{ minHeight: "600px" }}>
        <TableContainer component={Paper}>
          <Table>
            <StyledTableHead>
              <TableRow>
                <TableCell style={{ display: "none" }}>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Artikel</TableCell>
                <TableCell>Artikel des Lieferanten</TableCell>
                <TableCell>EKpreis</TableCell>
                <TableCell>VKpreis</TableCell>
                <TableCell>Maßeinheit</TableCell>
                <TableCell align="center">Gewicht, kg</TableCell>
                <TableCell>Abmessungen</TableCell>
                <TableCell>Kategorie</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell style={{ display: "none", padding: "6px 12px" }}>{product.id}</TableCell>
                    <TableCell sx={{ minWidth: "300px", padding: "6px 12px", borderRight: "1px solid #ddd" }}
                      onDoubleClick={() => navigate(`/product-card/${product.id}`)}>{product.name}</TableCell>
                    <TableCell sx={{ padding: "6px 12px", borderRight: "1px solid #ddd" }}
                    >{product.article}</TableCell>
                    <TableCell sx={{ width: "200px", padding: "6px 12px", borderRight: "1px solid #ddd" }}>{product.vendorArticle}</TableCell>
                    <TableCell align="right" sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{formatNumber(product.purchasingPrice)} €</TableCell>
                    <TableCell align="right" sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{formatNumber(product.sellingPrice)} €</TableCell>
                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{product.unitOfMeasurement}</TableCell>
                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{product.weight ? formatNumber(product.weight) : ""} </TableCell>
                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>
                      {product.newDimensions
                        ? `${product.newDimensions.height} * ${product.newDimensions.length} * ${product.newDimensions.width} mm`
                        : ""}
                    </TableCell>
                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{product.productCategory?.name}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">Keine Produkte gefunden</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Пагинация */}
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={totalPages} // Используем количество страниц из состояния
          page={page + 1}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
}
