import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useAppDispatch } from "../../../../redux/hooks";
import { showSuccessToast } from "../../../../utils/toast";
import { handleApiError } from "../../../../utils/handleApiError";
import { deleteShipping } from "../../shippingsSlice";


interface DeleteShippingProps {
  shippingId: number;
  name: string;
}

export default function DeleteShipping({ shippingId, name }: DeleteShippingProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      dispatch(deleteShipping(shippingId));
      showSuccessToast("Erfolg", "Die Versandart wurde erfolgreich gelöscht.");
      handleClose();
    } catch (error) {
      handleApiError(error, "Fehler beim Löschen der Versandart"); 
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
        Löschen
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ color: "error.main" }}>⚠️ Warnung</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Möchten Sie der Versandart{" "}
            <strong>{name}</strong> wirklich löschen?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Abbrechen
          </Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>
            {loading ? "Löschung..." : "Löschen"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}