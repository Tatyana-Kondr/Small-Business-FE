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
                <Typography variant="h4">Waren</Typography>
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
                            <TableCell sx={{ borderRight: "1px solid #ddd" }}>ID</TableCell>
                            <TableCell sx={{ borderRight: "1px solid #ddd" }}>Name</TableCell>
                            <TableCell sx={{ borderRight: "1px solid #ddd" }}>Artikel</TableCell>
                            <TableCell sx={{ borderRight: "1px solid #ddd" }}>Artikel des Lieferant</TableCell>
                            <TableCell sx={{ borderRight: "1px solid #ddd" }}>Anschaffungspreis</TableCell>
                            <TableCell sx={{ borderRight: "1px solid #ddd" }}>Verkaufspreis</TableCell>
                            <TableCell sx={{ borderRight: "1px solid #ddd" }}>Maßeinheit</TableCell>
                            <TableCell sx={{ borderRight: "1px solid #ddd" }}>Gewicht</TableCell>
                            <TableCell sx={{ borderRight: "1px solid #ddd" }}>Abmessungen</TableCell>
                            <TableCell sx={{ borderRight: "1px solid #ddd" }}>Kategorie</TableCell>
                            <TableCell sx={{ borderRight: "1px solid #ddd" }}>Дата создания</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.length > 0 ? (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell sx={{ borderRight: "1px solid #ddd" }}>{product.id}</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd" }}>{product.name}</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd" }}>{product.article}</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd" }}>{product.vendorArticle}</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd" }}>{product.purchasingPrice} €</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd" }}>{product.sellingPrice} €</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd" }}>{product.unitOfMeasurement}</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd" }}>{product.weight ? `${product.weight} кг`: ""} </TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd" }}>
                                      {product.newDimensions ? `${product.newDimensions.height} * ${product.newDimensions.length} * ${product.newDimensions.width} м`: ""}
                                    </TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd" }}>{product.productCategory?.name}</TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd" }}>{new Date(product.createdDate).toLocaleDateString()}</TableCell>
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