import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  DialogTitle,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { showSuccessToast } from "../../../utils/toast";
import { handleApiError } from "../../../utils/handleApiError";
import { NewTermOfPaymentDto } from "../types";
import { addTermOfPayment, getTermsOfPayment } from "../termOfPaymentSlice";


interface CreateTermModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateTermOfPayment: React.FC<CreateTermModalProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.paymentTerms.loading);

  const initialFormState: NewTermOfPaymentDto = {
    name: "",
  };

  const [formData, setFormData] = useState<NewTermOfPaymentDto>(initialFormState);
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
      await dispatch(addTermOfPayment(formData)).unwrap();
      dispatch(getTermsOfPayment());
      showSuccessToast("Erfolg", "Die Zahlungsbedingung wurde erfolgreich erstellt.");
      handleClose();
    } catch (err) {
      handleApiError(err, "Fehler beim Erstellen einer Zahlungsbedingung:");
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
      <DialogTitle sx={{ textAlign: "left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd" }}>Neue Zahlungsbedingung anlegen</DialogTitle>
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
          inputProps={{ 'aria-label': 'Name der Zahlungsbedingung' }}
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