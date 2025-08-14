import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  DialogActions,
} from "@mui/material";
import { useAppDispatch } from "../../../../redux/hooks";
import { PaymentProcess } from "../../types";
import { getPaymentProcesses, updatePaymentProcess } from "../../paymentProcessesSlice";
import { showSuccessToast } from "../../../../utils/toast";
import { handleApiError } from "../../../../utils/handleApiError";

interface EditPaymentProcessProps {
  open: boolean;
  onClose: () => void;
  process: PaymentProcess | null;
}

export default function EditPaymentProcess({ open, onClose, process }: EditPaymentProcessProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // При изменении процесса обновляем локальный стейт
  useEffect(() => {
    setName(process?.processName ?? "");
    setError("");
  }, [process]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Bitte das Feld ausfüllen");
      return;
    }
    if (!process) {
      setError("Ungültiger Zahlungsvorgang");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await dispatch(updatePaymentProcess({ id: process.id, updatedPaymentProcess: { processName: name } })).unwrap();
      await dispatch(getPaymentProcesses());
      showSuccessToast("Erfolg", "Die Zahlungsvorgang wurde erfolgreich aktualisiert.");
      onClose();
    } catch (err) {
      handleApiError(err, "Fehler bei der Aktualisierung des Zahlungsvorgangs");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
    setName("");
    setError("");
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <DialogTitle sx={{ textAlign:"left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd"}}>Zahlungsvorgang bearbeiten</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="normal"
          label="Vorgang"
          name="processName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!error}
          helperText={error}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary" disabled={loading}>
          Abbrechen
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}