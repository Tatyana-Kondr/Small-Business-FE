import { useState } from "react";
import { Box, Button, Modal, TextField, CircularProgress } from "@mui/material";
import { useAppDispatch } from "../../../../redux/hooks";
import { fetchAddProductCategory } from "../../api";
import { getProductCategories } from "../../productCategoriesSlice";
import { showSuccessToast } from "../../../../utils/toast";
import { handleApiError } from "../../../../utils/handleApiError";
import { cancelButtonStyle, primaryButtonStyle } from "../../../../styles/buttonStyles";
import PageTitle from "../../../../components/PageTitle";
import { NewProductCategoryDto } from "../../types";
import { backendErrorsToFormErrors, clearFieldError, FormErrors, hasErrors, isBackendValidationErrors, validateRequiredFields } from "../../../../utils/validation/validation";
import { HttpError } from "../../../../utils/handleFetchError";


export default function CreateProductCategory() {
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [artName, setArtName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors<NewProductCategoryDto>>({});

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setName("");
    setArtName("");
    setErrors({});
    setLoading(false);
  };

  const handleSubmit = async () => {
    const dto: NewProductCategoryDto = {
      name: name.trim(),
      artName: artName.trim(),
    };

    const validationErrors = validateRequiredFields(dto, [
      "name",
      "artName",
    ]);

    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    setLoading(true);

    try {
      await fetchAddProductCategory(dto);
      await dispatch(getProductCategories()).unwrap();

      showSuccessToast("Erfolg", "Kategorie erfolgreich hinzugefügt!");
      handleClose();
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

      if (error instanceof HttpError && error.status === 409) {
        if (error.message === "Category already exists") {
          setErrors((prev) => ({
            ...prev,
            name: "Kategorie existiert bereits.",
          }));
          return;
        }

        if (error.message === "Category article name already exists") {
          setErrors((prev) => ({
            ...prev,
            artName: "ArtName existiert bereits.",
          }));
          return;
        }
      }

      handleApiError(error, "Fehler beim Hinzufügen der Kategorie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="contained" sx={primaryButtonStyle} onClick={handleOpen}>
        Kategorie hinzufügen
      </Button>

      <Modal open={open} onClose={handleClose}>
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
            <PageTitle>Neue Kategorie</PageTitle>
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
            <Button
              onClick={handleClose}
              disabled={loading}
              sx={cancelButtonStyle}
            >
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
    </>
  );
}