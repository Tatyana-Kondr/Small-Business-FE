import { useEffect, useState } from "react";

import { Button, Checkbox, FormControlLabel, TextField } from "@mui/material";

import { useAppDispatch } from "../../../../redux/hooks";

import { TaxRate } from "../../types";
import { updateTaxRate } from "../../taxRatesSlice";

import { showSuccessToast } from "../../../../utils/toast";
import { getApiErrorMessage } from "../../../../utils/errors/handleApiError";

import { isBackendValidationErrors } from "../../../../utils/validation/validation";

import { translateValidationMessage } from "../../../../utils/validation/validationMessages";

import DraggableDialog from "../../../../components/DraggableDialog";
import DialogTitleText from "../../../../components/DialogTitleText";

import {
  cancelButtonStyle,
  primaryButtonStyle,
} from "../../../../styles/buttonStyles";

interface EditTaxRateProps {
  open: boolean;
  onClose: () => void;
  taxRate: TaxRate | null;
}

export default function EditTaxRate({
  open,
  onClose,
  taxRate,
}: EditTaxRateProps) {
  const dispatch = useAppDispatch();

  const [valueInput, setValueInput] = useState("");
  const [active, setActive] = useState(true);
  const [defaultRate, setDefaultRate] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Текущая ставка уже является стандартной
  const isCurrentDefault = taxRate?.defaultRate ?? false;

  useEffect(() => {
    if (open && taxRate) {
      setValueInput(String(taxRate.value).replace(".", ","));
      setActive(taxRate.active || taxRate.defaultRate);
      setDefaultRate(taxRate.defaultRate);
    } else {
      setValueInput("");
      setActive(true);
      setDefaultRate(false);
    }

    setError("");
  }, [open, taxRate]);

  const handleClose = () => {
    if (loading) return;

    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (loading || !taxRate) return;

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

    setLoading(true);
    setError("");

    try {
      await dispatch(
        updateTaxRate({
          id: taxRate.id,
          updatedTaxRate: {
            value,
            active: isCurrentDefault || defaultRate || active,
            defaultRate: isCurrentDefault || defaultRate,
          },
        }),
      ).unwrap();

      showSuccessToast(
        "Erfolg",
        "Der Steuersatz wurde erfolgreich aktualisiert.",
      );

      onClose();
    } catch (error) {
      // Ошибки Bean Validation от Backend
      if (isBackendValidationErrors(error)) {
        const valueError = error.errors.find(
          (validationError) => validationError.field === "value",
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
          "Fehler bei der Aktualisierung des Steuersatzes.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DraggableDialog
      open={open}
      onClose={loading ? undefined : handleClose}
      dialogWidth={500}
      title={<DialogTitleText>Steuersatz bearbeiten</DialogTitleText>}
      actions={
        <>
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={loading}
            sx={cancelButtonStyle}
          >
            Abbrechen
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !taxRate}
            sx={primaryButtonStyle}
          >
            {loading ? "Speichern..." : "Speichern"}
          </Button>
        </>
      }
    >
      <TextField
        autoFocus
        fullWidth
        margin="normal"
        type="text"
        label="Steuersatz %"
        value={valueInput}
        onChange={(event) => {
          setValueInput(event.target.value);
          setError("");
        }}
        error={Boolean(error)}
        helperText={error}
        disabled={loading}
        inputProps={{
          inputMode: "decimal",
        }}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={active}
            onChange={(event) => {
              setActive(event.target.checked);
            }}
            disabled={loading || isCurrentDefault || defaultRate}
          />
        }
        label="Aktiv"
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={defaultRate}
            onChange={(event) => {
              const checked = event.target.checked;

              setDefaultRate(checked);

              if (checked) {
                setActive(true);
              }
            }}
            disabled={loading || isCurrentDefault}
          />
        }
        label="Standard"
      />
    </DraggableDialog>
  );
}
