import { useEffect, useState } from "react";

import { Button, Checkbox, FormControlLabel, TextField } from "@mui/material";

import { useAppDispatch } from "../../../../redux/hooks";

import { NewPaymentMethodDto, PaymentMethod } from "../../types";
import { updatePaymentMethod } from "../../paymentMethodsSlice";

import { showSuccessToast } from "../../../../utils/toast";
import { getApiErrorMessage } from "../../../../utils/errors/handleApiError";

import { isBackendValidationErrors } from "../../../../utils/validation/validation";
import { translateValidationMessage } from "../../../../utils/validation/validationMessages";

import DraggableDialog from "../../../../components/DraggableDialog";
import DialogTitleText from "../../../../components/DialogTitleText";

import { primaryButtonStyle } from "../../../../styles/buttonStyles";

interface EditPaymentMethodProps {
  open: boolean;
  onClose: () => void;
  method: PaymentMethod | null;
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

export default function EditPaymentMethod({
  open,
  onClose,
  method,
}: EditPaymentMethodProps) {
  const dispatch = useAppDispatch();

  const [formData, setFormData] =
    useState<NewPaymentMethodDto>(initialFormState);

  const [errors, setErrors] = useState<PaymentMethodErrors>(initialErrors);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        provider: method?.provider ?? "",
        maskedNumber: method?.maskedNumber ?? "",
        details: method?.details ?? "",
        active: method?.active ?? true,
      });

      setErrors(initialErrors);
    }
  }, [open, method]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      ...(name === "provider" || name === "maskedNumber"
        ? { provider: "" }
        : {}),
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
    if (loading || !method) return;

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

    const payload: NewPaymentMethodDto = {
      provider,
      maskedNumber,
      details,
      active: formData.active,
    };

    setLoading(true);
    setErrors(initialErrors);

    try {
      await dispatch(
        updatePaymentMethod({
          id: method.id,
          updatedPaymentMethod: payload,
        }),
      ).unwrap();

      showSuccessToast(
        "Erfolg",
        "Die Zahlungsmethode wurde erfolgreich aktualisiert.",
      );

      onClose();
    } catch (error) {
      // Ошибки Bean Validation от Backend
      if (isBackendValidationErrors(error)) {
        const backendErrors: PaymentMethodErrors = {
          ...initialErrors,
        };

        error.errors.forEach(({ field, message }) => {
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
          "Beim Aktualisieren der Zahlungsmethode ist ein Fehler aufgetreten.",
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DraggableDialog
      open={open}
      onClose={loading ? undefined : handleClose}
      dialogWidth={500}
      title={<DialogTitleText>Zahlungsmethode bearbeiten</DialogTitleText>}
      actions={
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !method}
          sx={primaryButtonStyle}
        >
          {loading ? "Speichern..." : "Speichern"}
        </Button>
      }
    >
      <TextField
        autoFocus
        fullWidth
        required
        label="Anbieter"
        name="provider"
        value={formData.provider}
        onChange={handleChange}
        error={Boolean(errors.provider)}
        helperText={errors.provider}
        disabled={loading || !method}
        sx={{ mt: 3 }}
      />

      <TextField
        fullWidth
        label="Karte/Kontonummer"
        name="maskedNumber"
        value={formData.maskedNumber ?? ""}
        onChange={handleChange}
        error={Boolean(errors.maskedNumber)}
        helperText={errors.maskedNumber}
        disabled={loading || !method}
        sx={{ mt: 2 }}
      />

      <TextField
        fullWidth
        label="Einzelheiten"
        name="details"
        value={formData.details ?? ""}
        onChange={handleChange}
        error={Boolean(errors.details)}
        helperText={errors.details}
        disabled={loading || !method}
        sx={{ mt: 2 }}
      />

      <FormControlLabel
        sx={{ mt: 2 }}
        control={
          <Checkbox
            checked={formData.active}
            onChange={handleChange}
            name="active"
            disabled={loading || !method}
          />
        }
        label="Aktiv"
      />
    </DraggableDialog>
  );
}
