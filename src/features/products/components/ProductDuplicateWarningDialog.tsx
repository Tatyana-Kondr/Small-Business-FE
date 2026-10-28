import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";

import { ProductCategory, ProductPickDto } from "../types";

import { primaryButtonStyle } from "../../../styles/buttonStyles";

import {
  cellStyle,
  StyledTableHead,
  tableRowHoverStyle,
  tableStyle,
} from "../../../styles/tableStyles";
import { colors } from "../../../styles/colors";
import DraggableDialog from "../../../components/DraggableDialog";

type ProductDuplicateWarningDialogProps = {
  open: boolean;
  products: ProductPickDto[];
  categories: ProductCategory[];
  message: string;
  confirmText: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ProductDuplicateWarningDialog({
  open,
  products,
  categories,
  message,
  confirmText,
  loading = false,
  onCancel,
  onConfirm,
}: ProductDuplicateWarningDialogProps) {
  return (
    <DraggableDialog
      open={open}
      onClose={loading ? undefined : onCancel}
      dialogWidth={800}
      maxWidth={false}
      scroll="paper"
      title={
        <Typography
          variant="h6"
          sx={{ color: colors.danger, fontWeight: "bold", mb: 1 }}
        >
          ACHTUNG! Ähnliche Produkte gefunden
        </Typography>
      }
      actions={
        <>
          <Button
            variant="contained"
            onClick={onConfirm}
            sx={primaryButtonStyle}
            disabled={loading}
          >
            {loading ? "Speichern..." : confirmText}
          </Button>
        </>
      }
    >
      <Typography sx={{ mb: 2, whiteSpace: "pre-line" }}>{message}</Typography>

      <Box
        sx={{
          maxHeight: 300,
          overflowY: "auto",
          border: `1px solid ${colors.border}`,
        }}
      >
        <Table size="small" stickyHeader sx={tableStyle}>
          <StyledTableHead>
            <TableRow>
              <TableCell sx={{ width: "40%" }}>Name</TableCell>
              <TableCell sx={{ width: "20%" }}>Artikel</TableCell>
              <TableCell sx={{ width: "20%" }}>Lieferanten-Artikel</TableCell>
              <TableCell sx={{ width: "20%" }}>Kategorie</TableCell>
            </TableRow>
          </StyledTableHead>

          <TableBody>
            {products.map((product) => {
              const categoryName =
                categories.find(
                  (category) => category.id === product.categoryId,
                )?.name ?? "";

              return (
                <TableRow key={product.id} sx={tableRowHoverStyle}>
                  <TableCell sx={cellStyle}>{product.name}</TableCell>

                  <TableCell sx={cellStyle}>{product.article}</TableCell>

                  <TableCell sx={cellStyle}>
                    {product.vendorArticle ?? ""}
                  </TableCell>

                  <TableCell sx={cellStyle}>{categoryName}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </DraggableDialog>
  );
}
