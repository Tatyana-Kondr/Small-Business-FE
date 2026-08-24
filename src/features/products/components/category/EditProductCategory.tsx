import { useState } from "react";
import { Box, Button, Modal, TextField, CircularProgress } from "@mui/material";
import { NewProductCategoryDto, ProductCategory } from "../../types";
import { useAppDispatch } from "../../../../redux/hooks";
import {  getProductCategories } from "../../productCategoriesSlice";
import { showSuccessToast } from "../../../../utils/toast";
import { handleApiError } from "../../../../utils/handleApiError";
import { backendErrorsToFormErrors, clearFieldError, FormErrors, hasErrors, isBackendValidationErrors, validateRequiredFields } from "../../../../utils/validation/validation";
import { cancelButtonStyle, primaryButtonStyle } from "../../../../styles/buttonStyles";
import PageTitle from "../../../../components/PageTitle";
import { HttpError } from "../../../../utils/handleFetchError";
import { fetchEditProductCategory } from "../../api";


interface EditProductCategoryProps {
  category: ProductCategory;
  onClose: () => void;
}

export default function EditProductCategory({
  category,
  onClose,
}: EditProductCategoryProps) {
  const dispatch = useAppDispatch();

  const [name, setName] = useState(category.name);
  const [artName, setArtName] = useState(category.artName);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors<NewProductCategoryDto>>({});

  const handleSubmit = async () => {
    const dto: NewProductCategoryDto = {
      name: name.trim(),
      artName: artName.trim(),
    };

    const validationErrors = validateRequiredFields(dto, ["name", "artName"]);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    setLoading(true);

    try {
      await fetchEditProductCategory({
        id: category.id,
        newProductCategoryDto: dto,
      });

      await dispatch(getProductCategories()).unwrap();

      showSuccessToast("Erfolg", "Kategorie wurde erfolgreich aktualisiert!");
      onClose();
    } catch (error) {
      if (
        error instanceof HttpError &&
        isBackendValidationErrors(error.data)
      ) {
        setErrors(
          backendErrorsToFormErrors<NewProductCategoryDto>(
            error.data.errors
          )
        );
        return;
      }

      handleApiError(error, "Fehler bei der Aktualisierung der Kategorie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Box sx={{ mb: 2 }}>
          <PageTitle>Kategorienaktualisierung</PageTitle>
        </Box>

        <TextField
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => clearFieldError(prev, "name"));
          }}
          margin="dense"
          error={Boolean(errors.name)}
          helperText={errors.name}
          disabled={loading}
        />

        <TextField
          label="ArtName"
          fullWidth
          value={artName}
          onChange={(e) => {
            setArtName(e.target.value);
            setErrors((prev) => clearFieldError(prev, "artName"));
          }}
          margin="dense"
          error={Boolean(errors.artName)}
          helperText={errors.artName}
          disabled={loading}
        />

        <Box mt={2} display="flex" justifyContent="space-between">
          <Button onClick={onClose} disabled={loading} sx={cancelButtonStyle}>
            Abbrechen
          </Button>

          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={primaryButtonStyle}
          >
            {loading ? <CircularProgress size={24} /> : "Speichern"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}