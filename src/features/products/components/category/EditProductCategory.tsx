
import { useEffect, useState } from "react";

import { Button, TextField } from "@mui/material";

import { useAppDispatch } from "../../../../redux/hooks";

import { NewProductCategoryDto, ProductCategory } from "../../types";
import { editProductCategory } from "../../productCategoriesSlice";

import { showSuccessToast } from "../../../../utils/toast";
import { getApiErrorMessage } from "../../../../utils/errors/handleApiError";

import {
  backendErrorsToFormErrors,
  clearFieldError,
  FormErrors,
  hasErrors,
  isBackendValidationErrors,
  validateRequiredFields,
} from "../../../../utils/validation/validation";

import DraggableDialog from "../../../../components/DraggableDialog";
import DialogTitleText from "../../../../components/DialogTitleText";

import { primaryButtonStyle } from "../../../../styles/buttonStyles";

interface EditProductCategoryProps {
  open: boolean;
  onClose: () => void;
  category: ProductCategory | null;
}

export default function EditProductCategory({
  open,
  onClose,
  category,
}: EditProductCategoryProps) {
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [artName, setArtName] = useState("");
  const [errors, setErrors] = useState<FormErrors<NewProductCategoryDto>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(category?.name ?? "");
      setArtName(category?.artName ?? "");
      setErrors({});
      setError("");
    }
  }, [open, category]);

  const handleClose = () => {
    if (loading) return;

    setErrors({});
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (loading || !category) return;

    const dto: NewProductCategoryDto = {
      name: name.trim(),
      artName: artName.trim(),
    };

    // Проверка обязательных полей
    const validationErrors = validateRequiredFields(dto, [
      "name",
      "artName",
    ]);

    setErrors(validationErrors);
    setError("");

    if (hasErrors(validationErrors)) {
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        editProductCategory({
          id: category.id,
          newProductCategoryDto: dto,
        }),
      ).unwrap();

      showSuccessToast(
        "Erfolg",
        "Die Kategorie wurde erfolgreich aktualisiert.",
      );

      onClose();
    } catch (error) {
      // Ошибки Bean Validation от Backend
      if (isBackendValidationErrors(error)) {
        setErrors(
          backendErrorsToFormErrors<NewProductCategoryDto>(
            error.errors,
          ),
        );
        return;
      }

      // Ошибки бизнес-логики от Backend
      setError(
        getApiErrorMessage(
          error,
          "Beim Aktualisieren der Kategorie ist ein Fehler aufgetreten.",
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
      title={<DialogTitleText>Kategorie bearbeiten</DialogTitleText>}
      actions={
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !category}
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
          setErrors((prev) => clearFieldError(prev, "name"));
          setError("");
        }}
        error={Boolean(errors.name || error)}
        helperText={errors.name || error}
        disabled={loading || !category}
        sx={{ mt: 3 }}
      />

      <TextField
        fullWidth
        required
        label="ArtName"
        name="artName"
        value={artName}
        onChange={(event) => {
          setArtName(event.target.value);
          setErrors((prev) => clearFieldError(prev, "artName"));
          setError("");
        }}
        error={Boolean(errors.artName)}
        helperText={errors.artName}
        disabled={loading || !category}
        sx={{ mt: 2 }}
      />
    </DraggableDialog>
  );
}
