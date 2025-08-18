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
import { NewPaymentProcessDto } from "../../types";
import { addPaymentProcess, getPaymentProcesses } from "../../paymentProcessesSlice";
import { showSuccessToast } from "../../../../utils/toast";
import { handleApiError } from "../../../../utils/handleApiError";

interface CreatePaymentProcessModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreatePaymentProcess: React.FC<CreatePaymentProcessModalProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.paymentProcesses.loading);

  const initialFormState: NewPaymentProcessDto = {
    processName: "",
  };

  const [formData, setFormData] = useState<NewPaymentProcessDto>(initialFormState);
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
    if (!formData.processName.trim()) {
      setError("Bitte das Feld ausfüllen");
      return;
    }

    try {
      await dispatch(addPaymentProcess(formData)).unwrap();
      dispatch(getPaymentProcesses());
      showSuccessToast("Erfolg", "Zahlungsvorgang wurde erfolgreich erstellt.");
      handleClose();
    } catch (err) {
      handleApiError(err, "Fehler beim Erstellen eines Zahlungsvorgangs:");
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
      <DialogTitle sx={{ textAlign: "left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd" }}>Neuen Zahlungsvorgang anlegen</DialogTitle>
      <DialogContent>
        <TextField
          id="processName"
          autoFocus
          margin="normal"
          fullWidth
          label="Name"
          name="processName"
          required
          value={formData.processName}
          onChange={handleChange}
          error={!!error}
          helperText={error}
          inputProps={{ 'aria-label': 'Name des Zahlungsprozesses' }}
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