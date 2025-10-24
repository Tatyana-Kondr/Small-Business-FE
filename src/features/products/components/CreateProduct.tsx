import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Dialog } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { NewProductDto } from "../types";
import { addProduct } from "../productsSlice";
import { handleApiError } from "../../../utils/handleApiError";
import { showErrorToast, showSuccessToast } from "../../../utils/toast";
import { getUnits, selectUnits } from "../unitsOfMeasurementSlice";
import { getProductCategories, selectProductCategories } from "../productCategoriesSlice";


type CreateProductProps = {
  onClose: () => void;
};


export default function CreateProduct({ onClose }: CreateProductProps) {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectProductCategories);
  const units = useAppSelector(selectUnits);
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

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

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
  };

  const calculateSellingPrice = (purchasingPrice: number, markupPercentage: number) => {
    return +(purchasingPrice * (1 + markupPercentage / 100)).toFixed(2);
  };

  const calculateMarkupPercentage = (purchasingPrice: number, sellingPrice: number) => {
    if (purchasingPrice === 0) return 0;
    return +(((sellingPrice / purchasingPrice - 1) * 100).toFixed(2));
  };

  const handlePurchasingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const purchasingPrice = parseFloat(e.target.value) || 0;
    setNewProduct((prev) => ({
      ...prev,
      purchasingPrice,
      sellingPrice: calculateSellingPrice(purchasingPrice, prev.markupPercentage),
    }));
  };

  const handleMarkupPercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const markupPercentage = parseFloat(e.target.value) || 0;
    setNewProduct((prev) => ({
      ...prev,
      markupPercentage,
      sellingPrice: calculateSellingPrice(prev.purchasingPrice, markupPercentage),
    }));
  };

  const handleSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sellingPrice = parseFloat(e.target.value) || 0;
    setNewProduct((prev) => ({
      ...prev,
      sellingPrice,
      markupPercentage: calculateMarkupPercentage(prev.purchasingPrice, sellingPrice),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProduct.name.trim()) {
      showErrorToast("Fehler", "Bitte geben Sie einen Produktnamen ein.");
      return;
    }

    if (!newProduct.productCategory || newProduct.productCategory.id === 0) {
      showErrorToast("Fehler", "Bitte wählen Sie eine Kategorie aus.");
      return;
    }

    console.log("Selected unit ID:", newProduct.unitOfMeasurementId);
    if (!newProduct.unitOfMeasurementId || newProduct.unitOfMeasurementId === 0) {
      showErrorToast("Fehler", "Bitte wählen Sie eine Maßeinheit aus.");
      return;
    }

    try {
      const dtoToSend = {
        ...newProduct,
        unitOfMeasurementId: newProduct.unitOfMeasurement?.id, // Отправляем только ID
      };

      const createdProduct = await dispatch(addProduct(dtoToSend)).unwrap();

      showSuccessToast("Erfolg", `${createdProduct.name} wurde erfolgreich erstellt.`);
      // Сброс формы
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

      onClose();
    } catch (error) {
      handleApiError(error, "Das Produkt konnte nicht erstellt werden.");
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <Box
        sx={{
          bgcolor: "#fafafa",
          borderRadius: 2,
          p: 4,
          boxShadow: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ textAlign: "left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd" }} fontWeight={600} gutterBottom>
          Neues Produkt hinzufügen
        </Typography>

        <Box display="grid" gap={2}>
          <TextField
            label="Name"
            fullWidth
            name="name"
            value={newProduct.name}
            onChange={handleChange}
          />
          <TextField
            label="Artikel des Lieferanten"
            fullWidth
            name="vendorArticle"
            value={newProduct.vendorArticle}
            onChange={handleChange}
          />
          <TextField
            label="Kaufpreis"
            fullWidth
            name="purchasingPrice"
            type="number"
            value={String(newProduct.purchasingPrice)}
            onChange={handlePurchasingPriceChange}
          />
          <TextField
            label="Aufschlag %"
            fullWidth
            name="markupPercentage"
            type="number"
            value={String(newProduct.markupPercentage)}
            onChange={handleMarkupPercentageChange}
          />
          <TextField
            label="Verkaufspreis"
            fullWidth
            name="sellingPrice"
            type="number"
            value={String(newProduct.sellingPrice)}
            onChange={handleSellingPriceChange}
          />
          <TextField
            label="Lagerplatz"
            fullWidth
            name="storageLocation"
            value={newProduct.storageLocation}
            onChange={handleChange}
          />
        </Box>

        <FormControl fullWidth>
          <InputLabel>Kategorie</InputLabel>
          <Select
            value={selectedCategoryId ?? ""}
            onChange={handleCategoryChange}
            label="Kategorie"
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
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Maßeinheit</InputLabel>
          <Select
            value={newProduct.unitOfMeasurementId || ""}
            onChange={handleUnitChange}
            label="Maßeinheit"
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
        </FormControl>


        <Box display="flex" justifyContent="flex-end" gap={2} mt={1}>
          <Button onClick={onClose}>
            Abbrechen
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Speichern
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
