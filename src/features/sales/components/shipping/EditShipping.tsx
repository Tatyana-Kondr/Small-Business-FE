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
import { showSuccessToast } from "../../../../utils/toast";
import { handleApiError } from "../../../../utils/handleApiError";
import { Shipping } from "../../types";
import { getShippings, updateShipping } from "../../shippingsSlice";

interface EditShippingProps {
  open: boolean;
  onClose: () => void;
  shipping: Shipping | null;
}

export default function EditShipping({ open, onClose, shipping }: EditShippingProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // При изменении обновляем локальный стейт
  useEffect(() => {
    setName(shipping?.name ?? "");
    setError("");
  }, [shipping]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Bitte das Feld ausfüllen");
      return;
    }
    if (!shipping) {
      setError("Ungültiger Vessandart");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await dispatch(updateShipping({ id: shipping.id, updatedShipping: { name: name } })).unwrap();
      await dispatch(getShippings());
      showSuccessToast("Erfolg", "Der Versandart wurde erfolgreich aktualisiert.");
      onClose();
    } catch (err) {
      handleApiError(err, "Fehler bei der Aktualisierung des Versandarts");
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
      <DialogTitle sx={{ textAlign:"left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd"}}>Versandart bearbeiten</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="normal"
          label="Versandart"
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