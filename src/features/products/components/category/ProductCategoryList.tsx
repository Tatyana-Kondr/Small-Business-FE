import { Box, Container, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Button } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { getProductCategories, selectProductCategories } from "../../productCategoriesSlice";
import { useEffect, useState } from "react";
import CreateProductCategory from "./CreateProductCategory";
import EditProductCategory from "./EditProductCategory";
import { ProductCategory } from "../../types";
import DeleteProductCategory from "./DeleteProductCategory";
import PageTitle from "../../../../components/PageTitle";
import { pageToolbarStyle } from "../../../../styles/formStyles";
import { cellStyle, fixedCellWidth, leftBorderCellStyle, StyledTableHead, tableContainerStyle, tableRowHoverStyle, tableStyle } from "../../../../styles/tableStyles";
import { outlinedButtonStyle } from "../../../../styles/buttonStyles";


export default function ProductCategoryList() {
    const dispatch = useAppDispatch();
    const productCategories = useAppSelector(selectProductCategories);
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);  // Хранение выбранной категории

    useEffect(() => {
        dispatch(getProductCategories());
    }, [dispatch]);

    return (
        <Container>
            <Box sx={pageToolbarStyle}>
                <PageTitle>PRODUKTKATEGORIEN</PageTitle>
                <Box />

                <CreateProductCategory />
            </Box>



            {/* Таблица */}
            <TableContainer component={Paper} sx={tableContainerStyle}>
                <Table sx={tableStyle}>
                    <StyledTableHead>
                        <TableRow>
                            <TableCell sx={fixedCellWidth(80)}>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell sx={fixedCellWidth(160)}>ArtName</TableCell>
                            <TableCell sx={fixedCellWidth(220)}>Aktionen</TableCell>
                        </TableRow>
                    </StyledTableHead>
                    <TableBody>
                        {productCategories.length > 0 ? (
                            productCategories.map((category) => (
                                <TableRow key={category.id} sx={tableRowHoverStyle}>
                                    <TableCell sx={{ ...cellStyle,  ...leftBorderCellStyle,  ...fixedCellWidth(80), }} >
                                        {category.id}
                                    </TableCell>

                                    <TableCell sx={cellStyle}>
                                        {category.name}
                                    </TableCell>

                                    <TableCell
                                        sx={{ ...cellStyle,  ...fixedCellWidth(160), }} >
                                        {category.artName}
                                    </TableCell>

                                    <TableCell
                                        sx={{ ...cellStyle, ...fixedCellWidth(220), }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" gap={1} >
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => setSelectedCategory(category)}
                                                sx={{
                                                    ...outlinedButtonStyle,
                                                    minWidth: 110,
                                                }}
                                            >
                                                Bearbeiten
                                            </Button>

                                            <Box sx={{ minWidth: 80 }}>
                                                <DeleteProductCategory
                                                    categoryId={category.id}
                                                    categoryName={category.name}
                                                />
                                            </Box>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    Keine Kategorien vorhanden
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {selectedCategory && (
                <EditProductCategory
                    category={selectedCategory}
                    onClose={() => {
                        setSelectedCategory(null);
                        dispatch(getProductCategories());
                    }}
                />
            )}
        </Container>
    );
}