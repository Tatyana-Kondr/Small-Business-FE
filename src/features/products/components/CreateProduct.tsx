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
  FormHelperText,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { NewProductDto, Product, ProductPickDto } from "../types";
import { handleApiError } from "../../../utils/errors/handleApiError";
import { getUnits, selectUnits } from "../unitsOfMeasurementSlice";
import {
  getProductCategories,
  selectProductCategories,
} from "../productCategoriesSlice";
import { primaryButtonStyle } from "../../../styles/buttonStyles";
import {
  clearFieldError,
  FormErrors,
  hasErrors,
  isBackendValidationErrors,
  validateRequiredFields,
} from "../../../utils/validation/validation";
import {
  productFormColumnsStyle,
  productFormColumnStyle,
} from "../../../styles/formStyles";
import { fetchAddProduct, fetchSimilarProducts } from "../api";
import { invalidateProducts } from "../productsSlice";
import ProductDuplicateWarningDialog from "./ProductDuplicateWarningDialog";
import DraggableDialog from "../../../components/DraggableDialog";
import DialogTitleText from "../../../components/DialogTitleText";
import {
  validatePercentage,
  validatePrice,
} from "../../../utils/validation/numberValidation";
import { translateValidationMessage } from "../../../utils/validation/validationMessages";
import { useNavigate } from "react-router-dom";
import EditGeneratedArticle from "./EditGeneratedArticle";

type CreateProductProps = {
  onClose: () => void;
};

export default function CreateProduct({ onClose }: CreateProductProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const categories = useAppSelector(selectProductCategories);
  const units = useAppSelector(selectUnits);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors<NewProductDto>>({});
  const [similarProducts, setSimilarProducts] = useState<ProductPickDto[]>([]);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);
  const [pendingProduct, setPendingProduct] = useState<NewProductDto | null>(
    null,
  );

  const [newProduct, setNewProduct] = useState<NewProductDto>({
    name: "",
    vendorArticle: "",
    purchasingPrice: null,
    markupPercentage: 20,
    sellingPrice: null,
    productCategoryId: 0,
    unitOfMeasurementId: 0,
    storageLocation: "",
  });

  useEffect(() => {
    dispatch(getProductCategories());
    dispatch(getUnits());
  }, [dispatch]);

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

    setNewProduct((prev) => ({
      ...prev,
      productCategoryId: categoryId,
    }));

    setErrors((prev) => clearFieldError(prev, "productCategoryId"));
  };

  const handleUnitChange = (e: SelectChangeEvent<number>) => {
    const unitId = Number(e.target.value);

    setNewProduct((prev) => ({
      ...prev,
      unitOfMeasurementId: unitId,
    }));

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
    const value = e.target.value;

    const purchasingPrice = value === "" ? null : Number(value);

    setNewProduct((prev) => ({
      ...prev,
      purchasingPrice,
      sellingPrice:
        purchasingPrice === null || prev.markupPercentage === null
          ? null
          : calculateSellingPrice(purchasingPrice, prev.markupPercentage),
    }));

    setErrors((prev) => {
      let updated = clearFieldError(prev, "purchasingPrice");
      updated = clearFieldError(updated, "sellingPrice");
      return updated;
    });
  };

  const handleMarkupPercentageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;

    const markupPercentage = value === "" ? null : Number(value);

    setNewProduct((prev) => ({
      ...prev,
      markupPercentage,
      sellingPrice:
        markupPercentage === null || prev.purchasingPrice === null
          ? null
          : calculateSellingPrice(prev.purchasingPrice, markupPercentage),
    }));

    setErrors((prev) => {
      let updated = clearFieldError(prev, "markupPercentage");
      updated = clearFieldError(updated, "sellingPrice");
      return updated;
    });
  };

  const handleSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    const sellingPrice = value === "" ? null : Number(value);

    setNewProduct((prev) => ({
      ...prev,
      sellingPrice,
      markupPercentage:
        sellingPrice === null ||
        prev.purchasingPrice === null ||
        prev.purchasingPrice === 0
          ? null
          : calculateMarkupPercentage(prev.purchasingPrice, sellingPrice),
    }));

    setErrors((prev) => {
      let updated = clearFieldError(prev, "sellingPrice");
      updated = clearFieldError(updated, "markupPercentage");
      return updated;
    });
  };

  const applyBackendValidationErrors = (error: unknown): boolean => {
    if (!isBackendValidationErrors(error)) {
      return false;
    }

    const formErrors: FormErrors<NewProductDto> = {};

    error.errors.forEach((validationError) => {
      const field = validationError.field as keyof NewProductDto;

      formErrors[field] = translateValidationMessage(validationError.message);
    });

    setErrors(formErrors);

    return true;
  };

  const validateProduct = (): FormErrors<NewProductDto> => {
    const validationErrors = validateRequiredFields(newProduct, [
      "name",
      "productCategoryId",
      "unitOfMeasurementId",
    ]);

    if (newProduct.purchasingPrice !== null) {
      const purchasingPriceError = validatePrice(newProduct.purchasingPrice);

      if (purchasingPriceError) {
        validationErrors.purchasingPrice = purchasingPriceError;
      }
    }

    if (newProduct.sellingPrice !== null) {
      const sellingPriceError = validatePrice(newProduct.sellingPrice);

      if (sellingPriceError) {
        validationErrors.sellingPrice = sellingPriceError;
      }
    }

    if (newProduct.markupPercentage !== null) {
      const markupError = validatePercentage(newProduct.markupPercentage);

      if (markupError) {
        validationErrors.markupPercentage = markupError;
      }
    }

    return validationErrors;
  };

  const createProduct = async (dto: NewProductDto) => {
    try {
      setLoading(true);

      const product = await fetchAddProduct(dto);

      dispatch(invalidateProducts());

      setDuplicateDialogOpen(false);
      setSimilarProducts([]);
      setPendingProduct(null);

      setCreatedProduct(product);
    } catch (error) {
      if (applyBackendValidationErrors(error)) {
        setDuplicateDialogOpen(false);
        setSimilarProducts([]);
        setPendingProduct(null);
        return;
      }

      handleApiError(error, "Das Produkt konnte nicht erstellt werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseArticleDialog = () => {
    if (!createdProduct) return;

    const productId = createdProduct.id;

    setCreatedProduct(null);
    onClose();

    navigate(`/product-card/${productId}`);
  };

  const handleSubmit = async () => {
    if (loading) {
      return;
    }

    const validationErrors = validateProduct();

    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    const dtoToSend: NewProductDto = {
      ...newProduct,
      name: newProduct.name.trim(),
      vendorArticle: newProduct.vendorArticle.trim(),
      storageLocation: newProduct.storageLocation?.trim() ?? "",
    };

    try {
      setLoading(true);

      const similar = await fetchSimilarProducts(
        dtoToSend.name,
        dtoToSend.vendorArticle,
      );

      if (similar.length > 0) {
        setSimilarProducts(similar);
        setPendingProduct(dtoToSend);
        setDuplicateDialogOpen(true);
        return;
      }

      await createProduct(dtoToSend);
    } catch (error) {
      handleApiError(error, "Das Produkt konnte nicht geprüft werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDuplicateDialog = () => {
    if (loading) return;

    setDuplicateDialogOpen(false);
    setSimilarProducts([]);
    setPendingProduct(null);
  };

  const handleCreateAnyway = async () => {
    if (!pendingProduct) return;

    await createProduct(pendingProduct);
  };

  return (
    <>
      <DraggableDialog
        open={!createdProduct}
        onClose={loading ? undefined : onClose}
        dialogWidth={900}
        maxWidth={false}
        scroll="paper"
        title={
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <DialogTitleText>Neues Produkt hinzufügen</DialogTitleText>
          </Box>
        }
        actions={
          <>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={primaryButtonStyle}
              disabled={loading}
            >
              {loading ? "Speichern..." : "Speichern"}
            </Button>
          </>
        }
      >
        <Box sx={{ mt: 3 }}>
          <TextField
            label="Name"
            fullWidth
            name="name"
            value={newProduct.name}
            error={Boolean(errors.name)}
            helperText={errors.name}
            disabled={loading}
            sx={{ mb: 2 }}
            onChange={handleChange}
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

          <Box sx={{ ...productFormColumnsStyle, mt: 2 }}>
            <Box sx={productFormColumnStyle}>
              <TextField
                label="Kaufpreis"
                fullWidth
                name="purchasingPrice"
                type="number"
                value={newProduct.purchasingPrice ?? ""}
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
                value={newProduct.markupPercentage ?? ""}
                onChange={handleMarkupPercentageChange}
                error={Boolean(errors.markupPercentage)}
                helperText={errors.markupPercentage}
                disabled={loading}
              />

              <TextField
                label="Verkaufspreis"
                fullWidth
                name="sellingPrice"
                type="number"
                value={newProduct.sellingPrice ?? ""}
                onChange={handleSellingPriceChange}
                error={Boolean(errors.sellingPrice)}
                helperText={errors.sellingPrice}
                disabled={loading}
              />
            </Box>

            <Box sx={productFormColumnStyle}>
              <TextField
                label="Lagerplatz"
                fullWidth
                name="storageLocation"
                value={newProduct.storageLocation}
                onChange={handleChange}
                disabled={loading}
              />

              <FormControl fullWidth error={Boolean(errors.productCategoryId)}>
                <InputLabel>Kategorie</InputLabel>

                <Select
                  value={newProduct.productCategoryId || ""}
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

                {errors.productCategoryId && (
                  <FormHelperText>{errors.productCategoryId}</FormHelperText>
                )}
              </FormControl>

              <FormControl
                fullWidth
                error={Boolean(errors.unitOfMeasurementId)}
              >
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
          </Box>
        </Box>
      </DraggableDialog>

      <ProductDuplicateWarningDialog
        open={duplicateDialogOpen}
        products={similarProducts}
        categories={categories}
        confirmText="Trotzdem erstellen"
        message={
          "Es wurden Produkte mit demselben Namen oder derselben Lieferanten-Artikelnummer gefunden.\nBitte prüfen Sie, ob das Produkt bereits vorhanden ist."
        }
        loading={loading}
        onCancel={handleCloseDuplicateDialog}
        onConfirm={handleCreateAnyway}
      />

      {createdProduct && (
        <EditGeneratedArticle
          open
          productId={createdProduct.id}
          productName={createdProduct.name}
          generatedArticle={createdProduct.article}
          onClose={handleCloseArticleDialog}
        />
      )}
    </>
  );
}
