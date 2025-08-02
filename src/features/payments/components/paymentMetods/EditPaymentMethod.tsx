import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  FormControlLabel,
  DialogActions,
  Checkbox,
} from "@mui/material";
import { useAppDispatch } from "../../../../redux/hooks";
import { NewPaymentMethodDto, PaymentMethod } from "../../types";
import { paymentMethodsSlice } from "../../paymentMethodsSlice";


interface EditPaymentMethodProps {
  open: boolean;
  onClose: () => void;
  method: PaymentMethod | null;
}


export default function EditPaymentMethod({ open, onClose, method }: EditPaymentMethodProps) {
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<NewPaymentMethodDto>({
    provider: "",
    maskedNumber: "",
    details: "",
    active: true,
  });

  useEffect(() => {
    if (method) {
      setFormData({
        provider: method.provider,
        maskedNumber: method.maskedNumber || "",
        details: method.details || "",
        active: method.active,
      });
    }
  }, [method]);

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const target = e.target as HTMLInputElement;
  const { name, value, type } = target;
  const fieldValue = type === "checkbox" ? target.checked : value;

  setFormData((prev) => ({
    ...prev,
    [name]: fieldValue,
  }));
};


  const handleSave = async () => {
    if (!method) return;

    await dispatch(
      paymentMethodsSlice.actions.updatePaymentMethod({
        id: method.id,
        updatedPaymentMethod: formData,
      })
    );
    await dispatch(paymentMethodsSlice.actions.getPaymentMethods());
    onClose();
  };

  const handleCancel = () => {
    onClose();
    setFormData({
      provider: "",
      maskedNumber: "",
      details: "",
      active: true,
    });
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <DialogTitle sx={{ textAlign:"left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd"}}>Zahlungsmethode bearbeiten</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="normal"
          label="Anbieter"
          name="provider"
          value={formData.provider}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Karte/Konto-nummer"
          name="maskedNumber"
          value={formData.maskedNumber}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Einzelheiten"
          name="details"
          value={formData.details}
          onChange={handleChange}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.active}
              onChange={handleChange}
              name="active"
            />
          }
          label="Aktiv"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          Abbrechen
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
};