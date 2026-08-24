import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Tooltip } from "@mui/material";
import { deleteProduct } from "../productsSlice";
import { useAppDispatch } from "../../../redux/hooks";
import { showSuccessToast } from "../../../utils/toast";
import { handleApiError } from "../../../utils/handleApiError";
import { colors } from "../../../styles/colors";
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';

interface DeleteProductProps {
  productId: number;
  productName: string;
  productArticle: string;
  onSuccessDelete?: () => void;
}

export default function DeleteProduct({ productId, productName, productArticle, onSuccessDelete }: DeleteProductProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await dispatch(deleteProduct(productId)).unwrap();
      handleClose();
      onSuccessDelete?.();
      showSuccessToast("Erfolg", "Produkt wurde erfolgreich gelöscht!");
    } catch (error: any) {
      handleApiError(error, "Fehler beim Löschen des Produkts.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip title="Produkt löschen" arrow>
        <IconButton
          onClick={handleOpen}
          sx={{
            color: colors.danger,
            fontSize: "large",

            "&:hover": {
              color: colors.dangerLight,
              //backgroundColor: "#fddede",
              transform: "scale(1.3)",
            },
          }}
        >
          <DeleteForeverOutlinedIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ color: "error.main", fontWeight: "bold" }}>⚠️ WARNUNG!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Wollen Sie der Produkt: <strong>{productName}</strong> Artikel: <strong>{productArticle}</strong> wirklich löschen?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Abbrechen</Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>
            {loading ? "Löschung..." : "Löschen"}
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
}
