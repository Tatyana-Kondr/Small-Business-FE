import { Box, Container, Paper, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { getProductCategories, selectProductCategories } from "../productCategoriesSlice";
import { useEffect, useState } from "react";
import CreateProductCategory from "./CreateProductCategory";
import EditProductCategory from "./EditProductCategory";
import { ProductCategory } from "../types";
import DeleteProductCategory from "./DeleteProductCategory";

const StyledTableHead = styled(TableHead)(({
    backgroundColor: "#1a3d6d",
    "& th": {
        color: "white",
        fontWeight: "bold",
        borderRight: "1px solid #ddd",
    },
}));
const StyledTableRow = styled(TableRow)({
    "&:hover": {
        backgroundColor: "#f5f5f5", // Подсветка строки при наведении
        cursor: "pointer",
    },
});

export default function ProductCategoryList() {
    const dispatch = useAppDispatch();
    const productCategories = useAppSelector(selectProductCategories);
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);  // Хранение выбранной категории

    useEffect(() => {
        dispatch(getProductCategories());
    }, [dispatch]);

    return (
        <Container>
            {/* Верхняя панель */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ textAlign:"left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd"}}>PRODUKTKATEGORIEN</Typography>
                <CreateProductCategory />
            </Box>

            {/* Таблица */}
            <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                <Table>
                    <StyledTableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>ArtName</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </StyledTableHead>
                    <TableBody>
                        {productCategories.length > 0 ? (
                            productCategories.map((category) => (
                                <StyledTableRow key={category.id}>
                                    <TableCell style={{ padding: "6px 12px", borderRight: "1px solid #ddd", borderLeft: "1px solid #ddd" }}>{category.id}</TableCell>
                                    <TableCell sx={{ width: "400px", padding: "6px 12px", borderRight: "1px solid #ddd" }}>{category.name}</TableCell>
                                    <TableCell sx={{ width: "100px", padding: "6px 12px", borderRight: "1px solid #ddd" }}>{category.artName}</TableCell>
                                    <TableCell sx={{ width: "200px", padding: "6px", borderRight: "1px solid #ddd" }}>
                                        <Box display="flex" justifyContent="space-between">
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                onClick={() => setSelectedCategory(category)}
                                                sx={{ minWidth: "100px", "&:hover": { borderColor: "#00acc1" } }}
                                            >
                                                Bearbeiten
                                            </Button>

                                            <Box sx={{ minWidth: "80px" }}>
                                                <DeleteProductCategory
                                                    categoryId={category.id}
                                                    categoryName={category.name}
                                                />
                                            </Box>
                                        </Box>
                                    </TableCell>

                                </StyledTableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">Keine Kategorien vorhanden</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Модальное окно редактирования */}
            {selectedCategory && (
                <EditProductCategory
                    category={selectedCategory}
                    onClose={() => {
                        setSelectedCategory(null);
                        dispatch(getProductCategories()); // Обновляем список после закрытия
                    }}
                />
            )}
        </Container>
    );
}
