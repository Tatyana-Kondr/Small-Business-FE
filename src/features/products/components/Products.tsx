import { useEffect, useState } from "react"
import {
    Container, Typography, MenuItem, Select, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Box, Pagination,
    Button
} from "@mui/material"
import { useAppDispatch, useAppSelector } from "../../../redux/hooks"
import { getProducts, selectProducts, addProduct } from "../productsSlice"
import { styled } from "@mui/material/styles"
import { useNavigate } from "react-router-dom"
import CreateProduct from "./CreateProduct"
import { NewProductDto } from "../types" // Убедитесь, что импортируете тип NewProductDto


// Стили для заголовков таблицы
const StyledTableHead = styled(TableHead)({
    backgroundColor: "#1a3d6d",
    "& th": {
        color: "white",
        fontWeight: "bold",
        borderRight: "1px solid #ddd",
    },
})

// Функция для окрашивания чисел
const formatNumber = (value: number) => (
    <span style={{ color: value < 0 ? "red" : "inherit" }}>{value}</span>
)

export default function Products() {
    const dispatch = useAppDispatch()
    const products = useAppSelector(selectProducts)
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(5)
    const [openCreateProductModal, setOpenCreateProductModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(getProducts({ page, size: pageSize }))
    }, [dispatch, page, pageSize])

    // Открытие модального окна
    const handleOpenCreateProductModal = () => {
        setOpenCreateProductModal(true);
    };

    // Закрытие модального окна
    const handleCloseCreateProductModal = () => {
        setOpenCreateProductModal(false);
    };

    // Обработчик добавления нового продукта
    const handleCreateProduct = (newProduct: NewProductDto) => {
        // Логика добавления нового продукта с использованием dispatch
        dispatch(addProduct(newProduct)); // Отправляем новый продукт в слайс
        handleCloseCreateProductModal(); // Закрываем модальное окно
    };

    return (
        <Container>
            {/* Верхняя панель */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Waren</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate("/product-categories")}
                >
                    Produktkategorien
                </Button>
                <Select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                >
                    <MenuItem value={15}>15 товаров</MenuItem>
                    <MenuItem value={20}>20 товаров</MenuItem>
                </Select>
                <Button variant="contained" color="primary" onClick={handleOpenCreateProductModal}>
                    Добавить продукт
                </Button>
            </Box>

            {/* Таблица */}
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
                            <TableCell>Gewicht</TableCell>
                            <TableCell>Abmessungen</TableCell>
                            <TableCell>Kategorie</TableCell>
                            <TableCell>Дата создания</TableCell>
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
                                    <TableCell sx={{ borderRight: "1px solid #ddd", padding: "6px 12px" }}>{product.weight ? formatNumber(product.weight) + " kg" : ""}</TableCell>
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
                                <TableCell colSpan={11} align="center">Нет доступных продуктов</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Пагинация */}
            <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                    count={15} // Количество страниц (должно приходить с API)
                    page={page + 1}
                    onChange={(_, value) => setPage(value - 1)}
                    color="primary"
                    
                />
            </Box>
            <CreateProduct
                open={openCreateProductModal}
                handleClose={handleCloseCreateProductModal}
                handleCreateProduct={handleCreateProduct}
            />
            
        </Container>
    )
}
