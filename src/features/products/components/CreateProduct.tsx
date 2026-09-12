import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Dialog,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { NewProductDto } from "../types";
import { handleApiError } from "../../../utils/handleApiError";
import { showSuccessToast } from "../../../utils/toast";
import { getUnits, selectUnits } from "../unitsOfMeasurementSlice";
import {
  getProductCategories,
  selectProductCategories,
} from "../productCategoriesSlice";
import {
  cancelButtonStyle,
  primaryButtonStyle,
} from "../../../styles/buttonStyles";
import {
  backendErrorsToFormErrors,
  clearFieldError,
  FormErrors,
  hasErrors,
  isBackendValidationErrors,
  validateRequiredFields,
} from "../../../utils/validation/validation";
import { HttpError } from "../../../utils/handleFetchError";
import {
  formActionsRightStyle,
  formBoxStyle,
  formGridStyle,
} from "../../../styles/formStyles";
import PageTitle from "../../../components/PageTitle";
import { fetchAddProduct } from "../api";
import { invalidateProducts } from "../productsSlice";

type CreateProductProps = {
  onClose: () => void;
};

export default function CreateProduct({ onClose }: CreateProductProps) {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectProductCategories);
  const units = useAppSelector(selectUnits);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors<NewProductDto>>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const [newProduct, setNewProduct] = useState<NewProductDto>({
    name: "",
    vendorArticle: "",
    purchasingPrice: 0,
    markupPercentage: 20,
    sellingPrice: 0,
    productCategory: { id: 0, name: "", artName: "" },
    unitOfMeasurementId: 0,
    unitOfMeasurement: { id: 0, name: "" },
    storageLocation: "",
  });

  useEffect(() => {
    dispatch(getProductCategories());
    dispatch(getUnits());
  }, [dispatch]);

  const resetForm = () => {
    setNewProduct({
      name: "",
      vendorArticle: "",
      purchasingPrice: 0,
      markupPercentage: 20,
      sellingPrice: 0,
      productCategory: { id: 0, name: "", artName: "" },
      unitOfMeasurementId: 0,
      unitOfMeasurement: { id: 0, name: "" },
      storageLocation: "",
    });

    setSelectedCategoryId(null);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => clearFieldError(prev, name as keyof NewProductDto));
  };

  const handleCategoryChange = (e: SelectChangeEvent<number>) => {
    const categoryId = Number(e.target.value);
    const category = categories.find((cat) => cat.id === categoryId);

    setSelectedCategoryId(categoryId);

    if (category) {
      setNewProduct((prev) => ({
        ...prev,
        productCategory: category,
      }));
    }

    setErrors((prev) => clearFieldError(prev, "productCategory"));
  };

  const handleUnitChange = (e: SelectChangeEvent<number>) => {
    const unitId = Number(e.target.value);
    const unit = units.find((u) => u.id === unitId);

    if (unit) {
      setNewProduct((prev) => ({
        ...prev,
        unitOfMeasurementId: unit.id,
        unitOfMeasurement: unit,
      }));
    }

    setErrors((prev) => clearFieldError(prev, "unitOfMeasurementId"));
  };

  const calculateSellingPrice = (
    purchasingPrice: number,
    markupPercentage: number,
  ) => {
    return +(purchasingPrice * (1 + markupPercentage / 100)).toFixed(2);
  };

  const calculateMarkupPercentage = (
    purchasingPrice: number,
    sellingPrice: number,
  ) => {
    if (purchasingPrice === 0) return 0;
    return +((sellingPrice / purchasingPrice - 1) * 100).toFixed(2);
  };

  const handlePurchasingPriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const purchasingPrice = parseFloat(e.target.value) || 0;

    setNewProduct((prev) => ({
      ...prev,
      purchasingPrice,
      sellingPrice: calculateSellingPrice(
        purchasingPrice,
        prev.markupPercentage,
      ),
    }));
  };

  const handleMarkupPercentageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const markupPercentage = parseFloat(e.target.value) || 0;

    setNewProduct((prev) => ({
      ...prev,
      markupPercentage,
      sellingPrice: calculateSellingPrice(
        prev.purchasingPrice,
        markupPercentage,
      ),
    }));
  };

  const handleSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sellingPrice = parseFloat(e.target.value) || 0;

    setNewProduct((prev) => ({
      ...prev,
      sellingPrice,
      markupPercentage: calculateMarkupPercentage(
        prev.purchasingPrice,
        sellingPrice,
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateRequiredFields(newProduct, [
      "name",
      "productCategory",
      "unitOfMeasurementId",
    ]);

    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    setLoading(true);

    try {
      const dtoToSend: NewProductDto = {
        ...newProduct,
        name: newProduct.name.trim(),
        vendorArticle: newProduct.vendorArticle?.trim() ?? "",
        storageLocation: newProduct.storageLocation?.trim() ?? "",
        unitOfMeasurementId: newProduct.unitOfMeasurement?.id,
      };

      const createdProduct = await fetchAddProduct(dtoToSend);

      dispatch(invalidateProducts());

      showSuccessToast(
        "Erfolg",
        `${createdProduct.name} wurde erfolgreich erstellt.`,
      );

      resetForm();
      onClose();
    } catch (error) {
      if (error instanceof HttpError && isBackendValidationErrors(error.data)) {
        setErrors(backendErrorsToFormErrors<NewProductDto>(error.data.errors));
        return;
      }

      handleApiError(error, "Das Produkt konnte nicht erstellt werden.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={formBoxStyle}>
        <Box sx={{ mb: 1 }}>
          <PageTitle>Neues Produkt hinzufügen</PageTitle>
        </Box>

        <Box sx={formGridStyle}>
          <TextField
            label="Name"
            fullWidth
            name="name"
            value={newProduct.name}
            onChange={handleChange}
            error={Boolean(errors.name)}
            helperText={errors.name}
            disabled={loading}
          />

          <TextField
            label="Artikel des Lieferanten"
            fullWidth
            name="vendorArticle"
            value={newProduct.vendorArticle}
            onChange={handleChange}
            error={Boolean(errors.vendorArticle)}
            helperText={errors.vendorArticle}
            disabled={loading}
          />

          <TextField
            label="Kaufpreis"
            fullWidth
            name="purchasingPrice"
            type="number"
            value={String(newProduct.purchasingPrice)}
            onChange={handlePurchasingPriceChange}
            error={Boolean(errors.purchasingPrice)}
            helperText={errors.purchasingPrice}
            disabled={loading}
          />

          <TextField
            label="Aufschlag %"
            fullWidth
            name="markupPercentage"
            type="number"
            value={String(newProduct.markupPercentage)}
            onChange={handleMarkupPercentageChange}
            disabled={loading}
          />

          <TextField
            label="Verkaufspreis"
            fullWidth
            name="sellingPrice"
            type="number"
            value={String(newProduct.sellingPrice)}
            onChange={handleSellingPriceChange}
            error={Boolean(errors.sellingPrice)}
            helperText={errors.sellingPrice}
            disabled={loading}
          />

          <TextField
            label="Lagerplatz"
            fullWidth
            name="storageLocation"
            value={newProduct.storageLocation}
            onChange={handleChange}
            disabled={loading}
          />

          <FormControl fullWidth error={Boolean(errors.productCategory)}>
            <InputLabel>Kategorie</InputLabel>

            <Select
              value={selectedCategoryId ?? ""}
              onChange={handleCategoryChange}
              label="Kategorie"
              disabled={loading}
            >
              <MenuItem disabled value="">
                Kategorie wählen
              </MenuItem>

              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>

            {errors.productCategory && (
              <FormHelperText>{errors.productCategory}</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth error={Boolean(errors.unitOfMeasurementId)}>
            <InputLabel>Maßeinheit</InputLabel>

            <Select
              value={newProduct.unitOfMeasurementId || ""}
              onChange={handleUnitChange}
              label="Maßeinheit"
              disabled={loading}
            >
              <MenuItem disabled value="">
                Maßeinheit wählen
              </MenuItem>

              {units.map((unit) => (
                <MenuItem key={unit.id} value={unit.id}>
                  {unit.name}
                </MenuItem>
              ))}
            </Select>

            {errors.unitOfMeasurementId && (
              <FormHelperText>{errors.unitOfMeasurementId}</FormHelperText>
            )}
          </FormControl>
        </Box>

        <Box sx={formActionsRightStyle}>
          <Button onClick={onClose} sx={cancelButtonStyle} disabled={loading}>
            Abbrechen
          </Button>

          <Button
            onClick={handleSubmit}
            sx={primaryButtonStyle}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Speichern"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
