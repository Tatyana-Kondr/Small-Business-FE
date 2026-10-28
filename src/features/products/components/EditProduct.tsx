import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { editProduct, selectProduct } from "../productsSlice";
import { ProductPickDto, UpdateProductDto } from "../types";
import {
  getProductCategories,
  selectProductCategories,
} from "../productCategoriesSlice";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  Typography,
  FormHelperText,
} from "@mui/material";
import { showSuccessToast } from "../../../utils/toast";
import { getUnits, selectUnits } from "../unitsOfMeasurementSlice";
import { primaryButtonStyle } from "../../../styles/buttonStyles";
import {
  productDetailsRowStyle,
  productDimensionsGridStyle,
  productEditSectionStyle,
  productEditThreeColumnsStyle,
  productMainRowStyle,
} from "../../../styles/formStyles";
import { sectionTitleStyle } from "../../../styles/typographyStyles";
import {
  clearFieldError,
  FormErrors,
  hasErrors,
  isBackendValidationErrors,
  validateLength,
  validateMaxLength,
  validateRequiredFields,
} from "../../../utils/validation/validation";
import {
  validateDimension,
  validatePrice,
  validateWeight,
} from "../../../utils/validation/numberValidation";
import { translateValidationMessage } from "../../../utils/validation/validationMessages";
import { handleApiError } from "../../../utils/errors/handleApiError";
import ProductDuplicateWarningDialog from "./ProductDuplicateWarningDialog";
import { fetchSimilarProductsForUpdate } from "../api";
import DialogTitleText from "../../../components/DialogTitleText";
import DraggableDialog from "../../../components/DraggableDialog";

type EditProductErrors = FormErrors<UpdateProductDto> & {
  width?: string;
  height?: string;
  length?: string;
  diameter?: string;
};

interface EditProductProps {
  productId: number;
  closeModal: () => void;
  onSaveSuccess: () => void;
}

export default function EditProduct({
  productId,
  closeModal,
  onSaveSuccess,
}: EditProductProps) {
  const dispatch = useAppDispatch();
  const selectedProduct = useAppSelector(selectProduct);
  const categories = useAppSelector(selectProductCategories);
  const units = useAppSelector(selectUnits);

  const [productData, setProductData] = useState<UpdateProductDto | null>(null);

  const [errors, setErrors] = useState<EditProductErrors>({});
  const [loading, setLoading] = useState(false);

  const [duplicateProducts, setDuplicateProducts] = useState<ProductPickDto[]>(
    [],
  );
  const [duplicateWarningOpen, setDuplicateWarningOpen] = useState(false);
  const [pendingDto, setPendingDto] = useState<UpdateProductDto | null>(null);

  useEffect(() => {
    if (selectedProduct) {
      console.log("Selected Product:", selectedProduct);
      setProductData({
        name: selectedProduct.name,
        article: selectedProduct.article,
        vendorArticle: selectedProduct.vendorArticle ?? "",
        purchasingPrice: selectedProduct.purchasingPrice ?? null,
        markupPercentage: selectedProduct.markupPercentage ?? null,
        sellingPrice: selectedProduct.sellingPrice ?? null,
        unitOfMeasurementId: selectedProduct.unitOfMeasurement?.id ?? 0,
        weight: selectedProduct.weight ?? undefined,
        newDimensions: {
          height: selectedProduct.newDimensions?.height,
          length: selectedProduct.newDimensions?.length,
          width: selectedProduct.newDimensions?.width,
          diameter: selectedProduct.newDimensions?.diameter,
        },
        productCategoryId: selectedProduct.productCategory?.id ?? 0,
        description: selectedProduct.description ?? "",
        customsNumber: selectedProduct.customsNumber ?? "",
        storageLocation: selectedProduct.storageLocation ?? "",
      });
    }
  }, [selectedProduct]);

  useEffect(() => {
    dispatch(getProductCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getUnits());
  }, [dispatch]);

  if (!productData) return <p>Loading...</p>;
  if (!categories.length) return <p>Loading categories...</p>;
  if (!units.length) return <p>Loading units of measurement...</p>;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProductData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleDimensionsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const numericValue = value === "" ? undefined : Number(value);

    setProductData((prev) =>
      prev
        ? {
            ...prev,
            newDimensions: { ...prev.newDimensions, [name]: numericValue },
          }
        : prev,
    );

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleCategoryChange = (e: SelectChangeEvent<number>) => {
    const categoryId = Number(e.target.value);

    setProductData((prev) =>
      prev ? { ...prev, productCategoryId: categoryId } : prev,
    );

    setErrors((prev) => clearFieldError(prev, "productCategoryId"));
  };

  const handleUnitChange = (e: SelectChangeEvent<number>) => {
    const unitId = Number(e.target.value);

    setProductData((prev) =>
      prev ? { ...prev, unitOfMeasurementId: unitId } : prev,
    );

    setErrors((prev) => clearFieldError(prev, "unitOfMeasurementId"));
  };

  const handleWeightChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = e.target.value;
    const weight = value === "" ? undefined : Number(value);
    setProductData((prev) => (prev ? { ...prev, weight } : prev));
    setErrors((prev) => clearFieldError(prev, "weight"));
  };

  // Пересчет Verkaufspreis по Kaufpreis и Aufschlag
  const calculateSellingPrice = (
    purchasingPrice: number,
    markupPercentage: number,
  ) => {
    return +(purchasingPrice * (1 + markupPercentage / 100)).toFixed(2);
  };

  // Пересчет Aufschlag по Kaufpreis и Verkaufspreis
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

    setProductData((prev) =>
      prev
        ? {
            ...prev,
            purchasingPrice,
            sellingPrice:
              purchasingPrice === null || prev.markupPercentage === null
                ? null
                : calculateSellingPrice(purchasingPrice, prev.markupPercentage),
          }
        : prev,
    );

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

    setProductData((prev) =>
      prev
        ? {
            ...prev,
            markupPercentage,
            sellingPrice:
              markupPercentage === null || prev.purchasingPrice === null
                ? null
                : calculateSellingPrice(prev.purchasingPrice, markupPercentage),
          }
        : prev,
    );

    setErrors((prev) => {
      let updated = clearFieldError(prev, "markupPercentage");
      updated = clearFieldError(updated, "sellingPrice");
      return updated;
    });
  };

  const handleSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sellingPrice = value === "" ? null : Number(value);

    setProductData((prev) =>
      prev
        ? {
            ...prev,
            sellingPrice,
            markupPercentage:
              sellingPrice === null ||
              prev.purchasingPrice === null ||
              prev.purchasingPrice === 0
                ? null
                : calculateMarkupPercentage(prev.purchasingPrice, sellingPrice),
          }
        : prev,
    );

    setErrors((prev) => {
      let updated = clearFieldError(prev, "sellingPrice");
      updated = clearFieldError(updated, "markupPercentage");
      return updated;
    });
  };

  const validateProduct = (): EditProductErrors => {
    if (!productData) return {};

    const validationErrors: EditProductErrors = validateRequiredFields(
      productData,
      ["name", "article", "productCategoryId", "unitOfMeasurementId"],
    );

    if (productData.purchasingPrice !== null) {
      const error = validatePrice(productData.purchasingPrice);

      if (error) {
        validationErrors.purchasingPrice = error;
      }
    }

    if (productData.sellingPrice !== null) {
      const error = validatePrice(productData.sellingPrice);

      if (error) {
        validationErrors.sellingPrice = error;
      }
    }

    if (productData.markupPercentage !== null) {
      const error = validatePrice(productData.markupPercentage);

      if (error) {
        validationErrors.markupPercentage = error;
      }
    }

    if (productData.weight !== undefined) {
      const error = validateWeight(productData.weight);

      if (error) {
        validationErrors.weight = error;
      }
    }

    if (productData.newDimensions?.width !== undefined) {
      const error = validateDimension(productData.newDimensions.width);

      if (error) {
        validationErrors.width = error;
      }
    }

    if (productData.newDimensions?.length !== undefined) {
      const error = validateDimension(productData.newDimensions.length);

      if (error) {
        validationErrors.length = error;
      }
    }

    if (productData.newDimensions?.height !== undefined) {
      const error = validateDimension(productData.newDimensions.height);

      if (error) {
        validationErrors.height = error;
      }
    }

    if (productData.newDimensions?.diameter !== undefined) {
      const error = validateDimension(productData.newDimensions.diameter);

      if (error) {
        validationErrors.diameter = error;
      }
    }

    const nameError = validateLength(productData.name.trim(), 3, 150);
    if (nameError) {
      validationErrors.name = nameError;
    }

    const articleError = validateMaxLength(productData.article, 30);
    if (articleError) {
      validationErrors.article = articleError;
    }

    const vendorArticleError = validateMaxLength(productData.vendorArticle, 30);
    if (vendorArticleError) {
      validationErrors.vendorArticle = vendorArticleError;
    }

    const descriptionError = validateMaxLength(productData.description, 1024);
    if (descriptionError) {
      validationErrors.description = descriptionError;
    }

    const customsNumberError = validateMaxLength(productData.customsNumber, 20);
    if (customsNumberError) {
      validationErrors.customsNumber = customsNumberError;
    }

    const storageLocationError = validateMaxLength(
      productData.storageLocation,
      30,
    );
    if (storageLocationError) {
      validationErrors.storageLocation = storageLocationError;
    }

    return validationErrors;
  };

  const applyBackendValidationErrors = (error: unknown): boolean => {
    if (!isBackendValidationErrors(error)) return false;

    const formErrors: EditProductErrors = {};

    error.errors.forEach((validationError) => {
      const message = translateValidationMessage(validationError.message);

      switch (validationError.field) {
        case "newDimensions.width":
          formErrors.width = message;
          break;

        case "newDimensions.height":
          formErrors.height = message;
          break;

        case "newDimensions.length":
          formErrors.length = message;
          break;

        case "newDimensions.diameter":
          formErrors.diameter = message;
          break;

        default: {
          const field = validationError.field as keyof UpdateProductDto;

          formErrors[field] = message;
        }
      }
    });

    setErrors(formErrors);
    return true;
  };

  const saveProduct = async (dto: UpdateProductDto) => {
    try {
      setLoading(true);

      await dispatch(
        editProduct({
          id: productId,
          updateProductDto: dto,
        }),
      ).unwrap();

      showSuccessToast("Erfolg", "Das Produkt wurde erfolgreich aktualisiert!");
      onSaveSuccess();
    } catch (error) {
      if (applyBackendValidationErrors(error)) {
        return;
      }

      handleApiError(error, "Das Produkt konnte nicht aktualisiert werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!productData || loading) return;

    const validationErrors = validateProduct();
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    const dtoToSend: UpdateProductDto = {
      ...productData,
      name: productData.name.trim(),
      article: productData.article.trim(),
      vendorArticle: productData.vendorArticle?.trim() ?? "",
      description: productData.description?.trim() ?? "",
      customsNumber: productData.customsNumber?.trim() ?? "",
      storageLocation: productData.storageLocation?.trim() ?? "",
    };

    const originalName = selectedProduct?.name?.trim() ?? "";
    const originalArticle = selectedProduct?.article?.trim() ?? "";
    const originalVendorArticle = selectedProduct?.vendorArticle?.trim() ?? "";

    const changedName =
      dtoToSend.name !== originalName ? dtoToSend.name : undefined;

    const changedArticle =
      dtoToSend.article !== originalArticle ? dtoToSend.article : undefined;

    const changedVendorArticle =
      dtoToSend.vendorArticle !== originalVendorArticle
        ? dtoToSend.vendorArticle
        : undefined;

    const shouldCheckDuplicates =
      changedName !== undefined ||
      changedArticle !== undefined ||
      changedVendorArticle !== undefined;

    if (shouldCheckDuplicates) {
      try {
        setLoading(true);

        const duplicates = await fetchSimilarProductsForUpdate(
          productId,
          changedName,
          changedArticle,
          changedVendorArticle,
        );

        if (duplicates.length > 0) {
          setDuplicateProducts(duplicates);
          setPendingDto(dtoToSend);
          setDuplicateWarningOpen(true);
          return;
        }
      } catch (error) {
        handleApiError(
          error,
          "Ähnliche Produkte konnten nicht überprüft werden.",
        );
        return;
      } finally {
        setLoading(false);
      }
    }

    await saveProduct(dtoToSend);
  };

  const handleDuplicateCancel = () => {
    setDuplicateWarningOpen(false);
    setDuplicateProducts([]);
    setPendingDto(null);
  };

  const handleDuplicateConfirm = async () => {
  if (!pendingDto || loading) return;

    const dto = pendingDto;

    setDuplicateWarningOpen(false);
    setDuplicateProducts([]);
    setPendingDto(null);

    await saveProduct(dto);
  };

  return (
    <>
      <DraggableDialog
        open={!duplicateWarningOpen}
        onClose={loading ? undefined : closeModal}
        dialogWidth={1100}
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
            <DialogTitleText>Produkt bearbeiten</DialogTitleText>
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: 2,
            pb: 1,
          }}
        >
          <Box sx={productMainRowStyle}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={productData.name}
              onChange={(e) => {
                handleChange(e);
                setErrors((prev) => clearFieldError(prev, "name"));
              }}
              error={Boolean(errors.name)}
              helperText={errors.name}
            />

            <FormControl fullWidth error={Boolean(errors.productCategoryId)}>
              <InputLabel id="category-label">Kategorie</InputLabel>

              <Select
                labelId="category-label"
                value={productData.productCategoryId || ""}
                onChange={handleCategoryChange}
                label="Kategorie"
              >
                <MenuItem disabled value="">
                  Wählen Sie eine Kategorie
                </MenuItem>

                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>

              <FormHelperText>{errors.productCategoryId}</FormHelperText>
            </FormControl>
          </Box>

          <Box sx={productDetailsRowStyle}>
            <TextField
              fullWidth
              label="Artikel"
              name="article"
              value={productData.article}
              onChange={(e) => {
                handleChange(e);
                setErrors((prev) => clearFieldError(prev, "article"));
              }}
              error={Boolean(errors.article)}
              helperText={errors.article}
            />

            <TextField
              fullWidth
              label="Artikel des Lieferanten"
              name="vendorArticle"
              value={productData.vendorArticle ?? ""}
              onChange={(e) => {
                handleChange(e);
                setErrors((prev) => clearFieldError(prev, "vendorArticle"));
              }}
              error={Boolean(errors.vendorArticle)}
              helperText={errors.vendorArticle}
            />

            <TextField
              fullWidth
              label="Lagerplatz"
              name="storageLocation"
              value={productData.storageLocation ?? ""}
              onChange={(e) => {
                handleChange(e);
                setErrors((prev) => clearFieldError(prev, "storageLocation"));
              }}
              error={Boolean(errors.storageLocation)}
              helperText={errors.storageLocation}
            />

            <TextField
              fullWidth
              label="Zolltarifnummer"
              name="customsNumber"
              value={productData.customsNumber ?? ""}
              onChange={(e) => {
                handleChange(e);
                setErrors((prev) => clearFieldError(prev, "customsNumber"));
              }}
              error={Boolean(errors.customsNumber)}
              helperText={errors.customsNumber}
            />
          </Box>

          {/* DREI SPALTEN */}
          <Box sx={productEditThreeColumnsStyle}>
            {/* PREISE */}
            <Box sx={productEditSectionStyle}>
              <Typography sx={sectionTitleStyle}>Preise</Typography>

              <TextField
                fullWidth
                label="Kaufpreis"
                name="purchasingPrice"
                type="number"
                value={productData.purchasingPrice ?? ""}
                onChange={handlePurchasingPriceChange}
                error={Boolean(errors.purchasingPrice)}
                helperText={errors.purchasingPrice}
              />

              <TextField
                fullWidth
                label="Aufschlag %"
                name="markupPercentage"
                type="number"
                value={productData.markupPercentage ?? ""}
                onChange={handleMarkupPercentageChange}
                error={Boolean(errors.markupPercentage)}
                helperText={errors.markupPercentage}
              />

              <TextField
                fullWidth
                label="Verkaufspreis"
                name="sellingPrice"
                type="number"
                value={productData.sellingPrice ?? ""}
                onChange={handleSellingPriceChange}
                error={Boolean(errors.sellingPrice)}
                helperText={errors.sellingPrice}
              />
            </Box>

            {/* MASSE & GEWICHT */}
            <Box sx={productEditSectionStyle}>
              <Typography sx={sectionTitleStyle}>Maße &amp; Gewicht</Typography>
              <Box sx={productDimensionsGridStyle}>
                <FormControl
                  fullWidth
                  error={Boolean(errors.unitOfMeasurementId)}
                >
                  <InputLabel id="unit-label">Maßeinheit</InputLabel>

                  <Select
                    labelId="unit-label"
                    value={productData.unitOfMeasurementId || ""}
                    onChange={handleUnitChange}
                    label="Maßeinheit"
                  >
                    <MenuItem disabled value="">
                      Wählen Sie eine Maßeinheit
                    </MenuItem>

                    {units.map((unit) => (
                      <MenuItem key={unit.id} value={unit.id}>
                        {unit.name}
                      </MenuItem>
                    ))}
                  </Select>

                  <FormHelperText>{errors.unitOfMeasurementId}</FormHelperText>
                </FormControl>

                <TextField
                  fullWidth
                  label="Gewicht (kg)"
                  name="weight"
                  type="number"
                  value={productData.weight ?? ""}
                  onChange={handleWeightChange}
                  error={Boolean(errors.weight)}
                  helperText={errors.weight}
                  inputProps={{
                    step: "0.001",
                    min: "0",
                  }}
                />

                {/* ABMESSUNGEN: 2 x 2 */}

                <TextField
                  fullWidth
                  label="Breite (mm)"
                  name="width"
                  type="number"
                  value={productData.newDimensions?.width ?? ""}
                  onChange={handleDimensionsChange}
                  error={Boolean(errors.width)}
                  helperText={errors.width}
                  inputProps={{
                    step: "0.01",
                    min: "0",
                  }}
                />

                <TextField
                  fullWidth
                  label="Länge (mm)"
                  name="length"
                  type="number"
                  value={productData.newDimensions?.length ?? ""}
                  onChange={handleDimensionsChange}
                  error={Boolean(errors.length)}
                  helperText={errors.length}
                  inputProps={{
                    step: "0.01",
                    min: "0",
                  }}
                />

                <TextField
                  fullWidth
                  label="Höhe (mm)"
                  name="height"
                  type="number"
                  value={productData.newDimensions?.height ?? ""}
                  onChange={handleDimensionsChange}
                  error={Boolean(errors.height)}
                  helperText={errors.height}
                  inputProps={{
                    step: "0.01",
                    min: "0",
                  }}
                />

                <TextField
                  fullWidth
                  label="Durchmesser (mm)"
                  name="diameter"
                  type="number"
                  value={productData.newDimensions?.diameter ?? ""}
                  onChange={handleDimensionsChange}
                  error={Boolean(errors.diameter)}
                  helperText={errors.diameter}
                  inputProps={{
                    step: "0.01",
                    min: "0",
                  }}
                />
              </Box>
            </Box>

            {/* 3. BESCHREIBUNG */}
            <Box sx={productEditSectionStyle}>
              <Typography sx={{ ...sectionTitleStyle }}>
                Beschreibung
              </Typography>

              <TextField
                fullWidth
                multiline
                minRows={6}
                name="description"
                value={productData.description ?? ""}
                onChange={(e) => {
                  handleChange(e);
                  setErrors((prev) => clearFieldError(prev, "description"));
                }}
                error={Boolean(errors.description)}
                helperText={errors.description}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    alignItems: "flex-start",
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      </DraggableDialog>

      <ProductDuplicateWarningDialog
        open={duplicateWarningOpen}
        products={duplicateProducts}
        categories={categories}
        message={
          "Es wurden ähnliche Produkte gefunden.\nBitte prüfen Sie, ob das Produkt bereits vorhanden ist."
        }
        confirmText="Trotzdem speichern"
        loading={loading}
        onCancel={handleDuplicateCancel}
        onConfirm={handleDuplicateConfirm}
      />
    </>
  );
}
