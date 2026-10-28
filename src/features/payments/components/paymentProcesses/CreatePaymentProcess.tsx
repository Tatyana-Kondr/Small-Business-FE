import { useEffect, useState } from "react";

import { Button, TextField } from "@mui/material";

import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";

import { NewPaymentProcessDto } from "../../types";

import { addPaymentProcess, selectLoading } from "../../paymentProcessesSlice";

import { showSuccessToast } from "../../../../utils/toast";
import { getApiErrorMessage } from "../../../../utils/errors/handleApiError";

import { isBackendValidationErrors } from "../../../../utils/validation/validation";
import { translateValidationMessage } from "../../../../utils/validation/validationMessages";

import DraggableDialog from "../../../../components/DraggableDialog";
import DialogTitleText from "../../../../components/DialogTitleText";

import { primaryButtonStyle } from "../../../../styles/buttonStyles";

interface CreatePaymentProcessModalProps {
  open: boolean;
  onClose: () => void;
}

const initialFormState: NewPaymentProcessDto = {
  processName: "",
};

export function CreatePaymentProcess({
  open,
  onClose,
}: CreatePaymentProcessModalProps) {
  const dispatch = useAppDispatch();

  const loading = useAppSelector(selectLoading);

  const [formData, setFormData] =
    useState<NewPaymentProcessDto>(initialFormState);

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

    const processName = formData.processName.trim();

    // Проверка обязательного поля
    if (!processName) {
      setError("Bitte das Feld ausfüllen.");
      return;
    }

    setError("");

    try {
      await dispatch(addPaymentProcess({ processName })).unwrap();

      showSuccessToast(
        "Erfolg",
        "Der Zahlungsvorgang wurde erfolgreich erstellt.",
      );

      handleClose();
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
          "Fehler beim Erstellen des Zahlungsvorgangs.",
        ),
      );
    }
  };

  return (
    <DraggableDialog
      open={open}
      onClose={loading ? undefined : handleClose}
      dialogWidth={480}
      title={<DialogTitleText>Neuen Zahlungsvorgang anlegen</DialogTitleText>}
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
        id="processName"
        autoFocus
        fullWidth
        required
        label="Name"
        name="processName"
        value={formData.processName}
        onChange={handleChange}
        error={Boolean(error)}
        helperText={error}
        disabled={loading}
        sx={{ mt: 3 }}
      />
    </DraggableDialog>
  );
}
