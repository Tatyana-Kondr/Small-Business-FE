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
import { UnitOfMeasurement } from "../../types";
import { getUnits, updateUnit } from "../../unitsOfMeasurementSlice";


interface EditUnitProps {
  open: boolean;
  onClose: () => void;
  unit: UnitOfMeasurement | null;
}

export default function EditUnit({ open, onClose, unit }: EditUnitProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // При изменении обновляем локальный стейт
  useEffect(() => {
    setName(unit?.name ?? "");
    setError("");
  }, [unit]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Bitte das Feld ausfüllen");
      return;
    }
    if (!unit) {
      setError("Ungültiger Maßeinheit");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await dispatch(updateUnit({ id: unit.id, updatedUnit: { name: name } })).unwrap();
      await dispatch(getUnits());
      showSuccessToast("Erfolg", "Der Maßeinheit wurde erfolgreich aktualisiert.");
      onClose();
    } catch (err) {
      handleApiError(err, "Fehler bei der Aktualisierung der Maßeinheit");
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
      <DialogTitle sx={{ textAlign:"left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd"}}>Maßeinheit bearbeiten</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="normal"
          label="Maßeinheit"
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