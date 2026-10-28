import { useEffect, useState } from "react";

import { Button, TextField } from "@mui/material";

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";

import { NewTypeOfDocumentDto } from "../types";

import { addDocumentType, selectLoading } from "../typeOfDocumentSlice";

import { showSuccessToast } from "../../../utils/toast";
import { getApiErrorMessage } from "../../../utils/errors/handleApiError";

import { isBackendValidationErrors } from "../../../utils/validation/validation";
import { translateValidationMessage } from "../../../utils/validation/validationMessages";

import DraggableDialog from "../../../components/DraggableDialog";
import DialogTitleText from "../../../components/DialogTitleText";

import { primaryButtonStyle } from "../../../styles/buttonStyles";

interface CreateTypeModalProps {
  open: boolean;
  onClose: () => void;
}

const initialFormState: NewTypeOfDocumentDto = {
  name: "",
};

export function CreateDocumentType({ open, onClose }: CreateTypeModalProps) {
  const dispatch = useAppDispatch();

  const loading = useAppSelector(selectLoading);

  const [formData, setFormData] =
    useState<NewTypeOfDocumentDto>(initialFormState);

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

    setError("");

    try {
      await dispatch(
        addDocumentType({
          name,
        }),
      ).unwrap();

      showSuccessToast("Erfolg", "Der Dokumenttyp wurde erfolgreich erstellt.");

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
        getApiErrorMessage(error, "Fehler beim Erstellen des Dokumenttyps."),
      );
    }
  };

  return (
    <DraggableDialog
      open={open}
      onClose={loading ? undefined : handleClose}
      dialogWidth={450}
      title={<DialogTitleText>Neuer Dokumenttyp</DialogTitleText>}
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
        slotProps={{
          htmlInput: {
            "aria-label": "Name des Dokumenttyps",
          },
        }}
      />
    </DraggableDialog>
  );
}
