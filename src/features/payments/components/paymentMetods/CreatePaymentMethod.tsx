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
import { NewPaymentMethodDto } from "../../types";
import { paymentMethodsSlice } from "../../paymentMethodsSlice";
import { handleApiError } from "../../../../utils/handleApiError";
import { showSuccessToast } from "../../../../utils/toast";



interface CreatePaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreatePaymentMethod: React.FC<CreatePaymentMethodModalProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.paymentMethods.loading);

  const initialFormState: NewPaymentMethodDto = {
    provider: "",
    maskedNumber: "",
    details: "",
    active: true,
  };

  const [formData, setFormData] = useState<NewPaymentMethodDto>(initialFormState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      // Подготовка данных: удаляем необязательные поля, если они пустые
      const payload: NewPaymentMethodDto = {
        provider: formData.provider.trim(),
        active: formData.active,
      };

      if (formData.maskedNumber?.trim()) {
        payload.maskedNumber = formData.maskedNumber.trim();
      }

      if (formData.details?.trim()) {
        payload.details = formData.details.trim();
      }

      await dispatch(paymentMethodsSlice.actions.addPaymentMethod(payload)).unwrap();
      await dispatch(paymentMethodsSlice.actions.getPaymentMethods());
      showSuccessToast("Erfolg", "Die Zahlungsmethode wurde erfolgreich erstellt.");
      handleClose(); // Закрыть и очистить форму
    } catch (error) {
      handleApiError(error, "Fehler beim Erstellen einer Zahlungsmethode:");
    }
  };

  const handleClose = () => {
    onClose();
    setFormData(initialFormState); // Очистка формы
  };

  useEffect(() => {
    if (!open) {
      setFormData(initialFormState); // Очистка при закрытии
    }
  }, [open]);

  return (
  <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" aria-labelledby="create-payment-method-title">
    <DialogTitle
      id="create-payment-method-title"
      sx={{
        textAlign: "left",
        fontWeight: "bold",
        textDecoration: "underline",
        color: "#0277bd"
      }}
    >
      Neuen Zahlungsmethode anlegen
    </DialogTitle>

    <DialogContent>
      <TextField
        autoFocus
        margin="normal"
        fullWidth
        id="provider"
        label="Provider *"
        name="provider"
        required
        value={formData.provider}
        onChange={handleChange}
        inputProps={{ 'aria-label': 'Zahlungsanbieter' }}
      />

      <TextField
        margin="normal"
        fullWidth
        id="maskedNumber"
        label="Masked Number"
        name="maskedNumber"
        required
        value={formData.maskedNumber}
        onChange={handleChange}
        inputProps={{ 'aria-label': 'Maskierte Nummer der Zahlungsmethode' }}
      />

      <TextField
        margin="normal"
        fullWidth
        id="details"
        label="Details"
        name="details"
        value={formData.details}
        onChange={handleChange}
        inputProps={{ 'aria-label': 'Zusätzliche Details zur Zahlungsmethode' }}
      />
    </DialogContent>

    <DialogActions>
      <Button onClick={handleClose} disabled={loading}>Abbrechen</Button>
      <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
        Speichern
      </Button>
    </DialogActions>
  </Dialog>
);
};