import { useEffect, useState } from "react";

import { Button, Checkbox, FormControlLabel, TextField } from "@mui/material";

import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";

import { NewTaxRateDto } from "../../types";

import { addTaxRate, selectTaxRatesLoading } from "../../taxRatesSlice";

import { showSuccessToast } from "../../../../utils/toast";

import { getApiErrorMessage } from "../../../../utils/errors/handleApiError";

import DraggableDialog from "../../../../components/DraggableDialog";
import DialogTitleText from "../../../../components/DialogTitleText";

import { primaryButtonStyle } from "../../../../styles/buttonStyles";
import { isBackendValidationErrors } from "../../../../utils/validation/validation";
import { translateValidationMessage } from "../../../../utils/validation/validationMessages";

interface CreateTaxRateProps {
  open: boolean;
  onClose: () => void;
}

const initialFormState: NewTaxRateDto = {
  value: 0,
  active: true,
  defaultRate: false,
};

export function CreateTaxRate({ open, onClose }: CreateTaxRateProps) {
  const dispatch = useAppDispatch();

  const loading = useAppSelector(selectTaxRatesLoading);

  const [formData, setFormData] = useState<NewTaxRateDto>(initialFormState);

  const [valueInput, setValueInput] = useState("");

  const [error, setError] = useState("");

  const resetForm = () => {
    setFormData({ ...initialFormState });
    setValueInput("");
    setError("");
  };

  const handleClose = () => {
    if (loading) return;

    resetForm();
    onClose();
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const handleSubmit = async () => {
  if (loading) return;

  const normalizedValue = valueInput.trim().replace(",", ".");

  // Проверка обязательного поля
  if (!normalizedValue) {
    setError("Bitte einen Steuersatz eingeben.");
    return;
  }

  // Проверка корректности числового ввода
   if (!/^-?\d+(?:\.\d+)?$/.test(normalizedValue)) {
    setError("Bitte eine gültige Zahl eingeben.");
    return;
  }

  const value = Number(normalizedValue);

  if (!Number.isFinite(value)) {
    setError("Bitte eine gültige Zahl eingeben.");
    return;
  }

  try {
    await dispatch(
      addTaxRate({
        value,
        active: formData.defaultRate || formData.active,
        defaultRate: formData.defaultRate,
      })
    ).unwrap();

    showSuccessToast(
      "Erfolg",
      "Der Steuersatz wurde erfolgreich erstellt."
    );

    handleClose();
  } catch (error) {
    // Ошибки Bean Validation от Backend
    if (isBackendValidationErrors(error)) {
      const valueError = error.errors.find(
        (validationError) => validationError.field === "value"
      );

      if (valueError) {
        setError(translateValidationMessage(valueError.message));
        return;
      }
    }

    // Ошибки бизнес-логики от Backend
    setError(
      getApiErrorMessage(
        error,
        "Fehler beim Erstellen des Steuersatzes."
      )
    );
  }
};

  return (
    <DraggableDialog
      open={open}
      onClose={loading ? undefined : handleClose}
      dialogWidth={450}
      title={<DialogTitleText>Neuen Steuersatz</DialogTitleText>}
      actions={
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={primaryButtonStyle}
        >
          Speichern
        </Button>
      }
    >
      <TextField
        autoFocus
        fullWidth
        type="text"
        label="Steuersatz %"
        required
        value={valueInput}
        onChange={(event) => {
          setValueInput(event.target.value);

          if (error) {
            setError("");
          }
        }}
        error={Boolean(error)}
        helperText={error}
        disabled={loading}
        sx={{ mt: 3 }}
        inputProps={{
          inputMode: "decimal",
        }}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.active}
            onChange={(event) => {
              setFormData((prev) => ({
                ...prev,
                active: event.target.checked,
              }));
            }}
            disabled={loading || formData.defaultRate}
          />
        }
        label="Aktiv"
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.defaultRate}
            onChange={(event) => {
              const checked = event.target.checked;

              setFormData((prev) => ({
                ...prev,
                defaultRate: checked,
                active: checked ? true : prev.active,
              }));
            }}
            disabled={loading}
          />
        }
        label="Standard"
      />
    </DraggableDialog>
  );
}
