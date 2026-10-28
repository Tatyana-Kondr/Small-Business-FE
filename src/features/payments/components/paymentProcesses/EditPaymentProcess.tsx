import { useEffect, useState } from "react";

import { Button, TextField } from "@mui/material";

import { useAppDispatch } from "../../../../redux/hooks";

import { PaymentProcess } from "../../types";
import { updatePaymentProcess } from "../../paymentProcessesSlice";

import { showSuccessToast } from "../../../../utils/toast";
import { getApiErrorMessage } from "../../../../utils/errors/handleApiError";

import { isBackendValidationErrors } from "../../../../utils/validation/validation";
import { translateValidationMessage } from "../../../../utils/validation/validationMessages";

import DraggableDialog from "../../../../components/DraggableDialog";
import DialogTitleText from "../../../../components/DialogTitleText";

import { primaryButtonStyle } from "../../../../styles/buttonStyles";

interface EditPaymentProcessProps {
  open: boolean;
  onClose: () => void;
  process: PaymentProcess | null;
}

export default function EditPaymentProcess({
  open,
  onClose,
  process,
}: EditPaymentProcessProps) {
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(process?.processName ?? "");
      setError("");
    }
  }, [open, process]);

  const handleClose = () => {
    if (loading) return;

    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (loading || !process) return;

    const processName = name.trim();

    // Проверка обязательного поля
    if (!processName) {
      setError("Bitte das Feld ausfüllen.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await dispatch(
        updatePaymentProcess({
          id: process.id,
          updatedPaymentProcess: {
            processName,
          },
        }),
      ).unwrap();

      showSuccessToast(
        "Erfolg",
        "Der Zahlungsvorgang wurde erfolgreich aktualisiert.",
      );

      onClose();
    } catch (error) {
      // Ошибки Bean Validation от Backend
      if (isBackendValidationErrors(error)) {
        const nameError = error.errors.find(
          (validationError) => validationError.field === "processName",
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
          "Beim Aktualisieren des Zahlungsvorgangs ist ein Fehler aufgetreten.",
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
      title={<DialogTitleText>Zahlungsvorgang bearbeiten</DialogTitleText>}
      actions={
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !process}
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
        label="Vorgang"
        name="processName"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setError("");
        }}
        error={Boolean(error)}
        helperText={error}
        disabled={loading || !process}
        sx={{ mt: 3 }}
      />
    </DraggableDialog>
  );
}
