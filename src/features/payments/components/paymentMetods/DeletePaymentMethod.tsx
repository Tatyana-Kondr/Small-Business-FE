import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useAppDispatch } from "../../../../redux/hooks";
import { fetchDeletePaymentMethod } from "../../api";
import { getPaymentMethods } from "../../paymentMethodsSlice";
import { handleApiError } from "../../../../utils/handleApiError";
import { showSuccessToast } from "../../../../utils/toast";


interface DeletePaymentMethodProps {
  methodId: number;
  methodProvider: string;
}

export default function DeletePaymentMethod({ methodId, methodProvider }: DeletePaymentMethodProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetchDeletePaymentMethod(methodId);
      dispatch(getPaymentMethods());
      showSuccessToast("Erfolg", "Die Zahlungsmethode wurde erfolgreich gelöscht.");
      handleClose();
    } catch (error) {
      handleApiError(error,  "Fehler beim Löschen der Zahlungsmethode");
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
            Möchten Sie die Zahlungsmethode{" "}
            <strong>{methodProvider}</strong> wirklich löschen?
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