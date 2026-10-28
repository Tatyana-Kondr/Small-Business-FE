
import { useEffect, useState } from "react";
import {
  Button,
  FormControlLabel,
  Switch,
  TextField,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { NewPaymentMethodDto } from "../../types";
import {
  addPaymentMethod,
  selectLoading,
} from "../../paymentMethodsSlice";
import { showSuccessToast } from "../../../../utils/toast";
import { getApiErrorMessage } from "../../../../utils/errors/handleApiError";
import { isBackendValidationErrors } from "../../../../utils/validation/validation";
import { translateValidationMessage } from "../../../../utils/validation/validationMessages";
import DraggableDialog from "../../../../components/DraggableDialog";
import DialogTitleText from "../../../../components/DialogTitleText";
import { primaryButtonStyle } from "../../../../styles/buttonStyles";

interface CreatePaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
}

const initialFormState: NewPaymentMethodDto = {
  provider: "",
  maskedNumber: "",
  details: "",
  active: true,
};

type PaymentMethodErrors = {
  provider: string;
  maskedNumber: string;
  details: string;
};

const initialErrors: PaymentMethodErrors = {
  provider: "",
  maskedNumber: "",
  details: "",
};

export function CreatePaymentMethod({ open, onClose,}: CreatePaymentMethodModalProps) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectLoading);

  const [formData, setFormData] = useState<NewPaymentMethodDto>(initialFormState);
  const [errors, setErrors] = useState<PaymentMethodErrors>(initialErrors);

  useEffect(() => {
    if (!open) {
      setFormData(initialFormState);
      setErrors(initialErrors);
    }
  }, [open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      provider:
        name === "provider" || name === "maskedNumber"
          ? ""
          : prev.provider,
      ...(name === "maskedNumber" ? { maskedNumber: "" } : {}),
      ...(name === "details" ? { details: "" } : {}),
    }));
  };

  const handleClose = () => {
    if (loading) return;

    setErrors(initialErrors);
    onClose();
  };

  const handleSubmit = async () => {
    if (loading) return;

    const provider = formData.provider.trim();
    const maskedNumber = formData.maskedNumber?.trim() ?? "";
    const details = formData.details?.trim() ?? "";

    // Проверка обязательного поля
    if (!provider) {
      setErrors({
        ...initialErrors,
        provider: "Bitte das Feld ausfüllen.",
      });
      return;
    }

    setErrors(initialErrors);

    const payload: NewPaymentMethodDto = {
      provider,
      maskedNumber,
      details,
      active: formData.active,
    };

    try {
      await dispatch(addPaymentMethod(payload)).unwrap();

      showSuccessToast(
        "Erfolg",
        "Die Zahlungsmethode wurde erfolgreich erstellt.",
      );

      handleClose();
    } catch (error) {
      // Ошибки Bean Validation от Backend
      if (isBackendValidationErrors(error)) {
        const backendErrors: PaymentMethodErrors = {
          ...initialErrors,
        };

        error.errors.forEach((validationError) => {
          const { field, message } = validationError;

          if (
            field === "provider" ||
            field === "maskedNumber" ||
            field === "details"
          ) {
            backendErrors[field] = translateValidationMessage(message);
          }
        });

        if (Object.values(backendErrors).some(Boolean)) {
          setErrors(backendErrors);
          return;
        }
      }

      // Ошибки бизнес-логики от Backend
      setErrors({
        ...initialErrors,
        provider: getApiErrorMessage(
          error,
          "Fehler beim Erstellen der Zahlungsmethode.",
        ),
      });
    }
  };

  return (
    <DraggableDialog
      open={open}
      onClose={loading ? undefined : handleClose}
      dialogWidth={520}
      title={
        <DialogTitleText>
          Neue Zahlungsmethode
        </DialogTitleText>
      }
      actions={
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={primaryButtonStyle}
        >
          {loading ? "Speichern..." : "Speichern"}
        </Button>
      }
    >
      <TextField
        id="provider"
        autoFocus
        fullWidth
        required
        label="Provider"
        name="provider"
        value={formData.provider}
        onChange={handleChange}
        error={Boolean(errors.provider)}
        helperText={errors.provider}
        disabled={loading}
        sx={{ mt: 3 }}
      />

      <TextField
        id="maskedNumber"
        fullWidth
        label="Masked Number"
        name="maskedNumber"
        value={formData.maskedNumber ?? ""}
        onChange={handleChange}
        error={Boolean(errors.maskedNumber)}
        helperText={errors.maskedNumber}
        disabled={loading}
        sx={{ mt: 2 }}
      />

      <TextField
        id="details"
        fullWidth
        label="Details"
        name="details"
        value={formData.details ?? ""}
        onChange={handleChange}
        error={Boolean(errors.details)}
        helperText={errors.details}
        disabled={loading}
        sx={{ mt: 2 }}
      />

      <FormControlLabel
        sx={{ mt: 2 }}
        control={
          <Switch
            name="active"
            checked={formData.active}
            onChange={handleChange}
            disabled={loading}
          />
        }
        label="Aktiv"
      />
    </DraggableDialog>
  );
}
