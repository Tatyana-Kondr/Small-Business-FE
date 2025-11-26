import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  DialogActions,
} from "@mui/material";
import { useAppDispatch } from "../../../redux/hooks";
import { showSuccessToast } from "../../../utils/toast";
import { handleApiError } from "../../../utils/handleApiError";
import { TermOfPayment } from "../types";
import { getTermsOfPayment, updateTermOfPayment } from "../termOfPaymentSlice";



interface EditTermProps {
  open: boolean;
  onClose: () => void;
  term: TermOfPayment | null;
}

export default function EditTermOfPayment({ open, onClose, term }: EditTermProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // При изменении обновляем локальный стейт
  useEffect(() => {
    setName(term?.name ?? "");
    setError("");
  }, [term]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Bitte das Feld ausfüllen");
      return;
    }
    if (!term) {
      setError("Ungültige Zahlungsbedingung.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await dispatch(updateTermOfPayment({ id: term.id, updatedTermOfPayment: { name: name } })).unwrap();
      await dispatch(getTermsOfPayment());
      showSuccessToast("Erfolg", "Die Zahlungsbedingung wurde erfolgreich aktualisiert.");
      onClose();
    } catch (err) {
      handleApiError(err, "Beim Aktualisieren der Zahlungsbedingung ist ein Fehler aufgetreten.");
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
      <DialogTitle sx={{ textAlign:"left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd"}}>Zahlungsbedingung bearbeiten</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="normal"
          label="Zahlungsbedingung"
          name="name"
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