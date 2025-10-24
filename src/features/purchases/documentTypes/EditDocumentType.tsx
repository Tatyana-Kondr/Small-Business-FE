import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  DialogActions,
} from "@mui/material";
import { TypeOfDocument } from "../types";
import { useAppDispatch } from "../../../redux/hooks";
import { getDocumentTypes, updateDocumentType } from "../typeOfDocumentSlice";
import { showSuccessToast } from "../../../utils/toast";
import { handleApiError } from "../../../utils/handleApiError";



interface EditTypeProps {
  open: boolean;
  onClose: () => void;
  type: TypeOfDocument | null;
}

export default function EditDocumentType({ open, onClose, type }: EditTypeProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // При изменении обновляем локальный стейт
  useEffect(() => {
    setName(type?.name ?? "");
    setError("");
  }, [type]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Bitte das Feld ausfüllen");
      return;
    }
    if (!type) {
      setError("Ungültiger Dokumenttyp");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await dispatch(updateDocumentType({ id: type.id, updatedTypeOfDocument: { name: name } })).unwrap();
      await dispatch(getDocumentTypes());
      showSuccessToast("Erfolg", "Der Dokumenttyp wurde erfolgreich aktualisiert.");
      onClose();
    } catch (err) {
      handleApiError(err, "Fehler bei der Aktualisierung der Dokumenttyp");
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
      <DialogTitle sx={{ textAlign:"left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd"}}>Dokumenttyp bearbeiten</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="normal"
          label="Dokumenttyp"
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