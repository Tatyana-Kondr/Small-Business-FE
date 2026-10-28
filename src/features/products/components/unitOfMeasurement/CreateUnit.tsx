import { useEffect, useState } from "react";

import { Button, TextField } from "@mui/material";

import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";

import { NewUnitOfMeasurementDto } from "../../types";

import { addUnit, selectLoading } from "../../unitsOfMeasurementSlice";

import { showSuccessToast } from "../../../../utils/toast";

import { primaryButtonStyle } from "../../../../styles/buttonStyles";
import DraggableDialog from "../../../../components/DraggableDialog";
import DialogTitleText from "../../../../components/DialogTitleText";
import { isBackendValidationErrors } from "../../../../utils/validation/validation";
import { translateValidationMessage } from "../../../../utils/validation/validationMessages";
import { getApiErrorMessage } from "../../../../utils/errors/handleApiError";

interface CreateUnitModalProps {
  open: boolean;
  onClose: () => void;
}

const initialFormState: NewUnitOfMeasurementDto = {
  name: "",
};

export function CreateUnit({ open, onClose }: CreateUnitModalProps) {
  const dispatch = useAppDispatch();

  const loading = useAppSelector(selectLoading);

  const [formData, setFormData] =
    useState<NewUnitOfMeasurementDto>(initialFormState);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setFormData(initialFormState);
      setError("");
    }
  }, [open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleClose = () => {
    if (loading) return;

    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (loading) return;

    const name = formData.name.trim();

    // Проверка обязательного поля
    if (!name) {
      setError("Bitte das Feld ausfüllen.");
      return;
    }

    // Ограничение длины названия
    if (name.length > 20) {
      setError("Der Name der Maßeinheit darf maximal 20 Zeichen lang sein.");
      return;
    }

    setError("");

    try {
      await dispatch(addUnit({ name })).unwrap();

      showSuccessToast("Erfolg", "Die Maßeinheit wurde erfolgreich erstellt.");

      handleClose();
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
        getApiErrorMessage(error, "Fehler beim Erstellen der Maßeinheit."),
      );
    }
  };

  return (
    <DraggableDialog
      open={open}
      onClose={loading ? undefined : handleClose}
      dialogWidth={500}
      title={<DialogTitleText>Neue Maßeinheit</DialogTitleText>}
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
        id="name"
        autoFocus
        fullWidth
        required
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={Boolean(error)}
        helperText={error}
        disabled={loading}
        sx={{ mt: 3 }}
      />
    </DraggableDialog>
  );
}
