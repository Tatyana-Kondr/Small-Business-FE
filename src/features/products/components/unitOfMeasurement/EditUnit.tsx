import { useEffect, useState } from "react";

import { Button, TextField } from "@mui/material";

import { useAppDispatch } from "../../../../redux/hooks";

import { UnitOfMeasurement } from "../../types";
import { updateUnit } from "../../unitsOfMeasurementSlice";

import { showSuccessToast } from "../../../../utils/toast";
import { getApiErrorMessage } from "../../../../utils/errors/handleApiError";

import { isBackendValidationErrors } from "../../../../utils/validation/validation";
import { translateValidationMessage } from "../../../../utils/validation/validationMessages";

import DraggableDialog from "../../../../components/DraggableDialog";
import DialogTitleText from "../../../../components/DialogTitleText";

import { primaryButtonStyle } from "../../../../styles/buttonStyles";

interface EditUnitProps {
  open: boolean;
  onClose: () => void;
  unit: UnitOfMeasurement | null;
}

export default function EditUnit({ open, onClose, unit }: EditUnitProps) {
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(unit?.name ?? "");
      setError("");
    }
  }, [open, unit]);

  const handleClose = () => {
    if (loading) return;

    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (loading || !unit) return;

    const trimmedName = name.trim();

    // Проверка обязательного поля
    if (!trimmedName) {
      setError("Bitte das Feld ausfüllen.");
      return;
    }

    // Проверка максимальной длины
    if (trimmedName.length > 20) {
      setError("Der Name der Maßeinheit darf maximal 20 Zeichen lang sein.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await dispatch(
        updateUnit({
          id: unit.id,
          updatedUnit: {
            name: trimmedName,
          },
        }),
      ).unwrap();

      showSuccessToast(
        "Erfolg",
        "Die Maßeinheit wurde erfolgreich aktualisiert.",
      );

      onClose();
    } catch (error) {
      // Ошибки Bean Validation от Backend
      if (isBackendValidationErrors(error)) {
        const nameError = error.errors.find(
          (validationError) => validationError.field === "name",
        );

        if (nameError) {
          setError(translateValidationMessage(nameError.message));
          return;
        }
      }

      // Ошибки бизнес-логики от Backend
      setError(
        getApiErrorMessage(
          error,
          "Beim Aktualisieren der Maßeinheit ist ein Fehler aufgetreten.",
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
      title={<DialogTitleText>Maßeinheit bearbeiten</DialogTitleText>}
      actions={
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !unit}
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
        label="Maßeinheit"
        name="name"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setError("");
        }}
        error={Boolean(error)}
        helperText={error}
        disabled={loading || !unit}
        sx={{ mt: 3 }}
      />
    </DraggableDialog>
  );
}
