import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { useAppDispatch } from "../../../redux/hooks";
import { NewProductDto, ProductCategory } from "../types";
import { fetchProductCategories } from "../api";
import { addProduct } from "../productsSlice";
import { UnitOfMeasurement, unitOfMeasurements } from "../../../constants/unitOfMeasurements";


// Стили для модального окна
const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};


export default function CreateProduct({ open, handleClose }: any) {
  const dispatch = useAppDispatch(); 
  const [newProduct, setNewProduct] = useState<NewProductDto>({
    name: "",
    vendorArticle: "",
    purchasingPrice: 0,
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
    setNewProduct((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e: SelectChangeEvent<number>) => {
    const categoryId = Number(e.target.value); // Преобразуем значение в число
    setSelectedCategory(categoryId); // Устанавливаем в состояние
    setNewProduct((prevState) => ({
      ...prevState,
      productCategory: categories.find((category) => category.id === categoryId) || { id: 0, name: "", artName: "" },
    }));
  };

  const handleUnitChange = (e: SelectChangeEvent<string>) => {
    setNewProduct((prevState) => ({
      ...prevState,
      unitOfMeasurement: e.target.value as UnitOfMeasurement, 
    }));
  };

  const handleSubmit = async () => {
    try {
      await dispatch(addProduct(newProduct));

      // Очистка состояния после добавления
      setNewProduct({
        name: "",
        vendorArticle: "",
        purchasingPrice: 0,
        productCategory: { id: 0, name: "", artName: "" },
        unitOfMeasurement: "ST"
      });

      // Закрываем модальное окно
      handleClose();
    } catch (error) {
      console.error("Fehler beim Hinzufügen eines Produkts: ", error);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2">
        Ein neues Produkt hinzufügen
        </Typography>
        <TextField
          label="Name"
          fullWidth
          name="name"
          value={newProduct.name}
          onChange={handleChange}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Artikel des Lieferanten"
          fullWidth
          name="vendorArticle"
          value={newProduct.vendorArticle}
          onChange={handleChange}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Kaufpreis"
          fullWidth
          name="purchasingPrice"
          type="number"
          value={newProduct.purchasingPrice}
          onChange={handleChange}
          sx={{ marginBottom: 2 }}
        />
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel>Kategorie</InputLabel>
          <Select
            value={selectedCategory || ""}
            onChange={handleCategoryChange}
            label="Kategorie"
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
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
        <Box display="flex" justifyContent="flex-end">
          <Button variant="contained" onClick={handleClose} sx={{ marginRight: 2 }}>
            Abbrechen
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
          Hinzufügen
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
