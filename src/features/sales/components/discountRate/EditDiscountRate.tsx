import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
} from "@mui/material";

import { useAppDispatch } from "../../../../redux/hooks";

import { DiscountRate } from "../../types";
import { updateDiscountRate } from "../../discountRatesSlice";

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

interface EditDiscountRateProps {
  open: boolean;
  onClose: () => void;
  discountRate: DiscountRate | null;
}

export default function EditDiscountRate({
  open,
  onClose,
  discountRate,
}: EditDiscountRateProps) {
  const dispatch = useAppDispatch();

  const [valueInput, setValueInput] = useState("");
  const [active, setActive] = useState(true);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isZeroRate = discountRate?.value === 0;

  useEffect(() => {
    if (open) {
      setValueInput(
        discountRate ? String(discountRate.value).replace(".", ",") : "",
      );

      setActive(discountRate?.active ?? true);
      setError("");
    }
  }, [open, discountRate]);

  const handleClose = () => {
    if (loading) return;

    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (loading || !discountRate || isZeroRate) return;

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

    setLoading(true);
    setError("");

    try {
      await dispatch(
        updateDiscountRate({
          id: discountRate.id,
          updatedDiscountRate: {
            value,
            active,
          },
        }),
      ).unwrap();

      showSuccessToast(
        "Erfolg",
        "Der Rabattsatz wurde erfolgreich aktualisiert.",
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
          "Beim Aktualisieren des Rabattsatzes ist ein Fehler aufgetreten.",
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
      dialogWidth={450}
      title={<DialogTitleText>Rabattsatz bearbeiten</DialogTitleText>}
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
            disabled={loading || !discountRate || isZeroRate}
            sx={primaryButtonStyle}
          >
            {loading ? "Speichern..." : "Speichern"}
          </Button>
        </>
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
          helperText={
            error ||
            (isZeroRate ? "Der Rabattsatz 0 % kann nicht geändert werden." : "")
          }
          disabled={loading || isZeroRate}
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
              checked={isZeroRate ? true : active}
              onChange={(event) => {
                setActive(event.target.checked);
              }}
              disabled={loading || isZeroRate}
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
