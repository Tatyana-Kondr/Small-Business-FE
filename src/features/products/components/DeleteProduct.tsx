import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { deleteProduct } from "../productsSlice";
import { useAppDispatch } from "../../../redux/hooks";
import { showSuccessToast } from "../../../utils/toast";
import { handleApiError } from "../../../utils/handleApiError";

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
      <Button
        variant="outlined"
        color="error"
        size="small"
        onClick={handleOpen}
        sx={{
          "&:hover": {
            borderColor: "#d32f2f",
            backgroundColor: "#fddede",
          },
        }}
      >
        Produkt löschen
      </Button>


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
