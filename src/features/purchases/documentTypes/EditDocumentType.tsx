import { useEffect, useState } from "react";

import { Button, TextField } from "@mui/material";

import { TypeOfDocument } from "../types";

import { useAppDispatch } from "../../../redux/hooks";

import { updateDocumentType } from "../typeOfDocumentSlice";

import { showSuccessToast } from "../../../utils/toast";
import { getApiErrorMessage } from "../../../utils/errors/handleApiError";

import { isBackendValidationErrors } from "../../../utils/validation/validation";
import { translateValidationMessage } from "../../../utils/validation/validationMessages";

import DraggableDialog from "../../../components/DraggableDialog";
import DialogTitleText from "../../../components/DialogTitleText";

import { primaryButtonStyle } from "../../../styles/buttonStyles";

interface EditTypeProps {
  open: boolean;
  onClose: () => void;
  type: TypeOfDocument | null;
}

export default function EditDocumentType({
  open,
  onClose,
  type,
}: EditTypeProps) {
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(type?.name ?? "");
      setError("");
    }
  }, [open, type]);

  const handleClose = () => {
    if (loading) return;

    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (loading || !type) return;

    const trimmedName = name.trim();

    // Проверка обязательного поля
    if (!trimmedName) {
      setError("Bitte das Feld ausfüllen.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await dispatch(
        updateDocumentType({
          id: type.id,
          updatedTypeOfDocument: {
            name: trimmedName,
          },
        }),
      ).unwrap();

      showSuccessToast(
        "Erfolg",
        "Der Dokumenttyp wurde erfolgreich aktualisiert.",
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
          "Fehler bei der Aktualisierung des Dokumenttyps.",
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
      title={<DialogTitleText>Dokumenttyp bearbeiten</DialogTitleText>}
      actions={
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !type}
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
        label="Name"
        name="name"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setError("");
        }}
        error={Boolean(error)}
        helperText={error}
        disabled={loading || !type}
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
