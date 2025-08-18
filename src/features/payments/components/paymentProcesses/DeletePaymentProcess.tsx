import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useAppDispatch } from "../../../../redux/hooks";
import { getPaymentMethods } from "../../paymentMethodsSlice";
import { deletePaymentProcess } from "../../paymentProcessesSlice";
import { showSuccessToast } from "../../../../utils/toast";
import { handleApiError } from "../../../../utils/handleApiError";


interface DeletePaymentProcessProps {
  processId: number;
  processName: string;
}

export default function DeletePaymentProcess({ processId, processName }: DeletePaymentProcessProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      dispatch(deletePaymentProcess(processId));
      dispatch(getPaymentMethods());
      showSuccessToast("Erfolg", "Die Zahlungsvorgang wurde erfolgreich gelöscht.");
      handleClose();
    } catch (error) {
      handleApiError(error, "Fehler beim Löschen der Zahlungsvorgang"); 
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
            Möchten Sie der Zahlungsvorgang{" "}
            <strong>{processName}</strong> wirklich löschen?
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