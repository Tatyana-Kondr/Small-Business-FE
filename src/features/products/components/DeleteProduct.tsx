import { useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from "@mui/material";
import { deleteProduct, getProducts } from "../productsSlice";
import { useAppDispatch } from "../../../redux/hooks";

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
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);


  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await dispatch(deleteProduct(productId)).unwrap();
      await dispatch(getProducts({ page: 0 })); 
      handleClose();
      onSuccessDelete?.();
    } catch (error: any) {
      const message = error?.message || "Unbekannter Fehler beim Löschen.";
      setErrorMessage(message);
      setShowError(true);
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
      <Snackbar
        open={showError}
        autoHideDuration={5000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowError(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

    </>
  );
}
