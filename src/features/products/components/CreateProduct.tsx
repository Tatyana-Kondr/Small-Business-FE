import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Dialog } from "@mui/material";
import { useAppDispatch } from "../../../redux/hooks";
import { NewProductDto, ProductCategory } from "../types";
import { fetchProductCategories } from "../api";
import { addProduct } from "../productsSlice";
import { UnitOfMeasurement, unitOfMeasurements } from "../../../constants/unitOfMeasurements";
import { handleApiError } from "../../../utils/handleApiError";
import { showSuccessToast } from "../../../utils/toast";


type CreateProductProps = {
  onClose: () => void;
};


export default function CreateProduct({ onClose }: CreateProductProps) {
  const dispatch = useAppDispatch();
  const [newProduct, setNewProduct] = useState<NewProductDto>({
    name: "",
    vendorArticle: "",
    purchasingPrice: 0,
    markupPercentage: 20,
    sellingPrice: 0,
    productCategory: { id: 0, name: "", artName: "" },
    unitOfMeasurement: "ST"
  });

  const [categories, setCategories] = useState<ProductCategory[]>([]); // Состояние для списка категорий
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    // Загружаем категории при монтировании компонента
    const loadCategories = async () => {
      try {
        const fetchedCategories = await fetchProductCategories();
        setCategories(fetchedCategories); // Обновляем состояние с категориями
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };

    loadCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e: SelectChangeEvent) => {
    const categoryId = Number(e.target.value);
    setSelectedCategory(categoryId);
    setNewProduct(prev => ({
      ...prev,
      productCategory: categories.find(cat => cat.id === categoryId) ?? { id: 0, name: '', artName: '' }
    }));
  };

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedCategory(categories[0].id);
      setNewProduct(prev => ({
        ...prev,
        productCategory: categories[0],
      }));
    }
  }, [categories]);

  const handleUnitChange = (e: SelectChangeEvent<string>) => {
    setNewProduct((prevState) => ({
      ...prevState,
      unitOfMeasurement: e.target.value as UnitOfMeasurement,
    }));
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

  try {
    const createdProduct = await dispatch(addProduct(newProduct)).unwrap();

    showSuccessToast("Erfolg", `${createdProduct.name} wurde erfolgreich erstellt.`);

    setNewProduct({
      name: "",
      vendorArticle: "",
      purchasingPrice: 0,
      markupPercentage: 20,
      sellingPrice: 0,
      productCategory: { id: 0, name: "", artName: "" },
      unitOfMeasurement: "ST",
    });

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
        <Typography variant="h6" sx={{ textAlign:"left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd"}} fontWeight={600} gutterBottom>
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
            value={selectedCategory !== null ? String(selectedCategory) : ""}
            onChange={handleCategoryChange}
            label="Kategorie"
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={String(category.id)}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Maßeinheit</InputLabel>
          <Select
            value={newProduct.unitOfMeasurement || ""}
            onChange={handleUnitChange}
            label="Maßeinheit"
          >
            {unitOfMeasurements.map((unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}
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
