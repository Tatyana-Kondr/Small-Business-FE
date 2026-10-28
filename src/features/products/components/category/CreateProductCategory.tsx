
import { useEffect, useState } from "react";

import { Button, TextField } from "@mui/material";

import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";

import { NewProductCategoryDto } from "../../types";

import {
  addProductCategory,
  selectLoading,
} from "../../productCategoriesSlice";

import { showSuccessToast } from "../../../../utils/toast";
import { getApiErrorMessage } from "../../../../utils/errors/handleApiError";

import { isBackendValidationErrors } from "../../../../utils/validation/validation";
import { translateValidationMessage } from "../../../../utils/validation/validationMessages";

import { NAME_REGEX } from "../../../../utils/regex";

import DraggableDialog from "../../../../components/DraggableDialog";
import DialogTitleText from "../../../../components/DialogTitleText";

import { primaryButtonStyle } from "../../../../styles/buttonStyles";

interface CreateProductCategoryProps {
  open: boolean;
  onClose: () => void;
}

const initialFormState: NewProductCategoryDto = {
  name: "",
  artName: "",
};

type FieldErrors = Partial<Record<keyof NewProductCategoryDto, string>>;

export function CreateProductCategory({
  open,
  onClose,
}: CreateProductCategoryProps) {
  const dispatch = useAppDispatch();

  const loading = useAppSelector(selectLoading);

  const [formData, setFormData] =
    useState<NewProductCategoryDto>(initialFormState);

  const [errors, setErrors] = useState<FieldErrors>({});

  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setFormData(initialFormState);
      setErrors({});
      setError("");
    }
  }, [open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setError("");
  };

  const handleClose = () => {
    if (loading) return;

    setErrors({});
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (loading) return;

    const dto: NewProductCategoryDto = {
      name: formData.name.trim().toUpperCase(),
      artName: formData.artName.trim().toUpperCase(),
    };

    const validationErrors: FieldErrors = {};

    // Name
    if (!dto.name) {
      validationErrors.name = "Bitte das Feld ausfüllen.";
    } else if (dto.name.length < 3 || dto.name.length > 50) {
      validationErrors.name =
        "Die Eingabe muss zwischen 3 und 50 Zeichen lang sein.";
    } else if (!NAME_REGEX.test(dto.name)) {
      validationErrors.name = "Ungültige Zeichen sind nicht erlaubt.";
    }

    // ArtName
    if (!dto.artName) {
      validationErrors.artName = "Bitte das Feld ausfüllen.";
    } else if (dto.artName.length < 2 || dto.artName.length > 6) {
      validationErrors.artName =
        "Die Eingabe muss zwischen 2 und 6 Zeichen lang sein.";
    } else if (!NAME_REGEX.test(dto.artName)) {
      validationErrors.artName = "Ungültige Zeichen sind nicht erlaubt.";
    }

    setErrors(validationErrors);
    setError("");

    if (Object.values(validationErrors).some(Boolean)) {
      return;
    }

    try {
      await dispatch(addProductCategory(dto)).unwrap();

      showSuccessToast(
        "Erfolg",
        "Die Produktkategorie wurde erfolgreich erstellt.",
      );

      handleClose();
    } catch (err) {
      // Bean Validation от Backend
      if (isBackendValidationErrors(err)) {
        const backendErrors: FieldErrors = {};

        err.errors.forEach((validationError) => {
          if (
            validationError.field === "name" ||
            validationError.field === "artName"
          ) {
            backendErrors[validationError.field] =
              translateValidationMessage(validationError.message);
          }
        });

        if (Object.values(backendErrors).some(Boolean)) {
          setErrors(backendErrors);
          return;
        }
      }

      // Ошибки бизнес-логики, включая 409 Conflict
      setError(
        getApiErrorMessage(
          err,
          "Fehler beim Erstellen der Produktkategorie.",
        ),
      );
    }
  };

  return (
    <DraggableDialog
      open={open}
      onClose={loading ? undefined : handleClose}
      dialogWidth={520}
      title={<DialogTitleText>Neue Produktkategorie</DialogTitleText>}
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
        error={Boolean(errors.name)}
        helperText={errors.name}
        disabled={loading}
        inputProps={{ maxLength: 50 }}
        sx={{ mt: 3 }}
      />

      <TextField
        id="artName"
        fullWidth
        required
        label="ArtName"
        name="artName"
        value={formData.artName}
        onChange={handleChange}
        error={Boolean(errors.artName)}
        helperText={errors.artName}
        disabled={loading}
        inputProps={{ maxLength: 6 }}
        sx={{ mt: 2 }}
      />

      {error && (
        <TextField
          fullWidth
          multiline
          value={error}
          error
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
          sx={{ mt: 2 }}
        />
      )}
    </DraggableDialog>
  );
}

export default CreateProductCategory;
