import { useCallback, useEffect, useState } from "react";
import {
  Container, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Box, Pagination,
  Button,
  TextField,
  IconButton
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { getProducts, selectProducts, selectTotalPages, addProduct } from "../productsSlice";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import CreateProduct from "./CreateProduct";
import { NewProductDto } from "../types";
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
  const [openCreateProductModal, setOpenCreateProductModal] = useState(false);
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

  const handleOpenCreateProductModal = () => setOpenCreateProductModal(true);
  const handleCloseCreateProductModal = () => setOpenCreateProductModal(false);

  const handleCreateProduct = (newProduct: NewProductDto) => {
    dispatch(addProduct(newProduct));
    handleCloseCreateProductModal();
  };

  return (
    <Container>
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
            label="Suche"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange} // Обработчик изменения поиска
            sx={{ width: 400, backgroundColor: "white" }}
          />
          <IconButton onClick={handleClearSearch}><ClearIcon /></IconButton>
        </Box>

        <Button variant="contained" onClick={() => navigate("/product-categories")}>
          Produktkategorien
        </Button>

        <Button variant="contained" onClick={handleOpenCreateProductModal}>
          Produkt hinzufügen
        </Button>
      </Box>

      {/* Таблица */}
      <Box sx={{ height: "580px" }}>
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
                <TableCell>Erstellungsdatum</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell style={{ display: "none", padding: "6px 12px" }}>{product.id}</TableCell>
                    <TableCell sx={{ width: "300px", padding: "6px 12px", borderRight: "1px solid #ddd" }}
                      onDoubleClick={() => navigate(`/product-card/${product.id}`)}>{product.name}</TableCell>
                    <TableCell sx={{ width: "200px", padding: "6px 12px", borderRight: "1px solid #ddd" }}
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
                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{new Date(product.createdDate).toLocaleDateString()}</TableCell>
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

      {/* Модальное окно для создания продукта */}
      <CreateProduct
        open={openCreateProductModal}
        handleClose={handleCloseCreateProductModal}
        handleCreateProduct={handleCreateProduct}
      />
    </Container>
  );
}
