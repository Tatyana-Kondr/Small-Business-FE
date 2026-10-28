import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Button,
  CircularProgress,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import {
  getProductCategories,
  selectLoading,
  selectProductCategories,
} from "../../productCategoriesSlice";
import { useEffect, useState } from "react";
import CreateProductCategory from "./CreateProductCategory";
import EditProductCategory from "./EditProductCategory";
import { ProductCategory } from "../../types";
import DeleteProductCategory from "./DeleteProductCategory";
import PageTitle from "../../../../components/PageTitle";
import { compactPageToolbarStyle } from "../../../../styles/formStyles";
import {
  cellStyle,
  centerCellStyle,
  compactTableContainerStyle,
  compactTableStyle,
  fixedCellWidth,
  leftBorderCellStyle,
  StyledTableHead,
  tableRowHoverStyle,
} from "../../../../styles/tableStyles";
import {
  outlinedButtonStyle,
  primaryButtonStyle,
} from "../../../../styles/buttonStyles";

export default function ProductCategoryList() {
  const dispatch = useAppDispatch();
  const productCategories = useAppSelector(selectProductCategories);
  const loading = useAppSelector(selectLoading);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | null>(null);

  useEffect(() => {
    dispatch(getProductCategories());
  }, [dispatch]);

  const tableWidth = 900;

  return (
    <Container>
      <Box sx={compactPageToolbarStyle(tableWidth)}>
        <PageTitle>PRODUKTKATEGORIEN</PageTitle>
        <Box />

        <Button
          variant="contained"
          sx={primaryButtonStyle}
          onClick={() => setCreateOpen(true)}
        >
          Kategorie hinzufügen
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={compactTableContainerStyle(tableWidth)}
      >
        <Table sx={compactTableStyle(tableWidth)}>
          <StyledTableHead>
            <TableRow>
              <TableCell sx={fixedCellWidth(80)}>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell sx={fixedCellWidth(150)}>ArtName</TableCell>
              <TableCell sx={fixedCellWidth(250)}>Aktionen</TableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : productCategories.length > 0 ? (
              productCategories.map((category) => (
                <TableRow key={category.id} sx={tableRowHoverStyle}>
                  <TableCell
                    sx={{
                      ...centerCellStyle,
                      ...leftBorderCellStyle,
                      ...fixedCellWidth(80),
                    }}
                  >
                    {category.id}
                  </TableCell>

                  <TableCell sx={cellStyle}>{category.name}</TableCell>

                  <TableCell sx={{ ...cellStyle, ...fixedCellWidth(150) }}>
                    {category.artName}
                  </TableCell>

                  <TableCell sx={{ ...cellStyle, ...fixedCellWidth(250) }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
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

                      <Box>
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

      <CreateProductCategory
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      <EditProductCategory
  open={Boolean(selectedCategory)}
  category={selectedCategory}
  onClose={() => setSelectedCategory(null)}
/>
    </Container>
  );
}
