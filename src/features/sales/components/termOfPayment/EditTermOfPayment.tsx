import { useEffect, useState } from "react";

import { Button, TextField } from "@mui/material";

import { useAppDispatch } from "../../../../redux/hooks";

import { TermOfPayment } from "../../types";
import { updateTermOfPayment } from "../../termOfPaymentSlice";

import { showSuccessToast } from "../../../../utils/toast";
import { getApiErrorMessage } from "../../../../utils/errors/handleApiError";

import { isBackendValidationErrors } from "../../../../utils/validation/validation";
import { translateValidationMessage } from "../../../../utils/validation/validationMessages";

import DraggableDialog from "../../../../components/DraggableDialog";
import DialogTitleText from "../../../../components/DialogTitleText";

import { primaryButtonStyle } from "../../../../styles/buttonStyles";

interface EditTermProps {
  open: boolean;
  onClose: () => void;
  term: TermOfPayment | null;
}

export default function EditTermOfPayment({
  open,
  onClose,
  term,
}: EditTermProps) {
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(term?.name ?? "");
      setError("");
    }
  }, [open, term]);

  const handleClose = () => {
    if (loading) return;

    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (loading || !term) return;

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
        updateTermOfPayment({
          id: term.id,
          updatedTermOfPayment: {
            name: trimmedName,
          },
        }),
      ).unwrap();

      showSuccessToast(
        "Erfolg",
        "Die Zahlungsbedingung wurde erfolgreich aktualisiert.",
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
          "Beim Aktualisieren der Zahlungsbedingung ist ein Fehler aufgetreten.",
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
      title={<DialogTitleText>Zahlungsbedingung bearbeiten</DialogTitleText>}
      actions={
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !term}
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
        label="Zahlungsbedingung"
        name="name"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setError("");
        }}
        error={Boolean(error)}
        helperText={error}
        disabled={loading || !term}
        sx={{ mt: 3 }}
      />
    </DraggableDialog>
  );
}
