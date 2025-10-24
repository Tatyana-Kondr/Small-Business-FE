import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  DialogTitle,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { showSuccessToast } from "../../../../utils/toast";
import { handleApiError } from "../../../../utils/handleApiError";
import { NewUnitOfMeasurementDto } from "../../types";
import { addUnit, getUnits } from "../../unitsOfMeasurementSlice";

interface CreateUnitModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateUnit: React.FC<CreateUnitModalProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.units.loading);

  const initialFormState: NewUnitOfMeasurementDto = {
    name: "",
  };

  const [formData, setFormData] = useState<NewUnitOfMeasurementDto>(initialFormState);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError("Bitte das Feld ausfüllen");
      return;
    }

    try {
      await dispatch(addUnit(formData)).unwrap();
      dispatch(getUnits());
      showSuccessToast("Erfolg", "Maßeinheit wurde erfolgreich erstellt.");
      handleClose();
    } catch (err) {
      handleApiError(err, "Fehler beim Erstellen einer Maßeinheit:");
    }
  };

  const handleClose = () => {
    onClose();
    setFormData(initialFormState);
    setError("");
  };

  useEffect(() => {
    if (!open) {
      setFormData(initialFormState);
      setError("");
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ textAlign: "left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd" }}>Neuen Maßeinheit anlegen</DialogTitle>
      <DialogContent>
        <TextField
          id="name"
          autoFocus
          margin="normal"
          fullWidth
          label="Name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          error={!!error}
          helperText={error}
          inputProps={{ 'aria-label': 'Name der Maßeinheits' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Abbrechen
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
};