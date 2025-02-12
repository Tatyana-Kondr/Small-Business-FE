import { useEffect, useState } from "react"
import { 
    Container, Typography, MenuItem, Select, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, Box, Pagination 
} from "@mui/material"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { getProducts, selectProducts } from "./productsSlice"

export default function Products() {
    const dispatch = useAppDispatch()
    const products = useAppSelector(selectProducts)
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(5)

    useEffect(() => {
        dispatch(getProducts({ page, size: pageSize }))
    }, [dispatch, page, pageSize])

    return (
        <Container>
            {/* Верхняя панель с заголовком и селектом */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4">Список продуктов</Typography>
                <Select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                >
                    <MenuItem value={5}>5 товаров</MenuItem>
                    <MenuItem value={10}>10 товаров</MenuItem>
                    <MenuItem value={20}>20 товаров</MenuItem>
                </Select>
            </Box>

            {/* Таблица с продуктами */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Название</TableCell>
                            <TableCell>Артикул</TableCell>
                            <TableCell>Цена закупки</TableCell>
                            <TableCell>Цена продажи</TableCell>
                            <TableCell>Вес</TableCell>
                            <TableCell>Размеры</TableCell>
                            <TableCell>Категория</TableCell>
                            <TableCell>Дата создания</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.length > 0 ? (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>{product.id}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.article}</TableCell>
                                    <TableCell>{product.purchasingPrice} €</TableCell>
                                    <TableCell>{product.sellingPrice} €</TableCell>
                                    <TableCell>{product.weight} кг</TableCell>
                                    <TableCell>
                                      {product.newDimensions ? `${product.newDimensions.height} * ${product.newDimensions.length} * ${product.newDimensions.width} м`: ""}
                                    </TableCell>
                                    <TableCell>{product.productCategory?.name}</TableCell>
                                    <TableCell>{new Date(product.createdDate).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} align="center">Нет доступных продуктов</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Пагинация */}
            <Box display="flex" justifyContent="center" mt={2}>
                <Pagination 
                    count={5} // Нужно передавать общее число страниц из API
                    page={page + 1} 
                    onChange={(_, value) => setPage(value - 1)} 
                    color="primary"
                />
            </Box>
        </Container>
    )
}