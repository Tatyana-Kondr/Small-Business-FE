import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
} from "@mui/material";

import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";

import {
  addDiscountRate,
  selectDiscountRatesLoading,
} from "../../discountRatesSlice";

import { showSuccessToast } from "../../../../utils/toast";
import { getApiErrorMessage } from "../../../../utils/errors/handleApiError";

import { isBackendValidationErrors } from "../../../../utils/validation/validation";
import { translateValidationMessage } from "../../../../utils/validation/validationMessages";

import { primaryButtonStyle } from "../../../../styles/buttonStyles";

import DraggableDialog from "../../../../components/DraggableDialog";
import DialogTitleText from "../../../../components/DialogTitleText";

interface CreateDiscountRateProps {
  open: boolean;
  onClose: () => void;
}

export function CreateDiscountRate({ open, onClose }: CreateDiscountRateProps) {
  const dispatch = useAppDispatch();

  const loading = useAppSelector(selectDiscountRatesLoading);

  const [valueInput, setValueInput] = useState("");
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setValueInput("");
      setActive(true);
      setError("");
    }
  }, [open]);

  const handleClose = () => {
    if (loading) return;

    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (loading) return;

    const normalizedValue = valueInput.trim().replace(",", ".");

    // Проверка обязательного поля
    if (!normalizedValue) {
      setError("Bitte einen Rabattsatz eingeben.");
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

    setError("");

    try {
      await dispatch(
        addDiscountRate({
          value,
          active,
        }),
      ).unwrap();

      showSuccessToast("Erfolg", "Der Rabattsatz wurde erfolgreich erstellt.");

      handleClose();
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
          "Beim Erstellen des Rabattsatzes ist ein Fehler aufgetreten.",
        ),
      );
    }
  };

  return (
    <DraggableDialog
      open={open}
      onClose={loading ? undefined : handleClose}
      dialogWidth={450}
      title={<DialogTitleText>Neuen Rabattsatz</DialogTitleText>}
      actions={
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={primaryButtonStyle}
        >
          {loading ? "Speichern..." : "Speichern"}
        </Button>
      }
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
          mt: 3,
        }}
      >
        <TextField
          autoFocus
          fullWidth
          required
          type="text"
          label="Rabattsatz (%)"
          value={valueInput}
          onChange={(event) => {
            setValueInput(event.target.value);
            setError("");
          }}
          error={Boolean(error)}
          helperText={error}
          disabled={loading}
          slotProps={{
            htmlInput: {
              inputMode: "decimal",
            },
          }}
          sx={{ flex: 1 }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={active}
              onChange={(event) => {
                setActive(event.target.checked);
              }}
              disabled={loading}
            />
          }
          label="Aktiv"
          sx={{
            m: 0,
            flexShrink: 0,
          }}
        />
      </Box>
    </DraggableDialog>
  );
}
