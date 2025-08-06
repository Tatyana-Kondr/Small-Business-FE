import { useState } from "react";
import { Box, Button, Modal, TextField, Typography, CircularProgress } from "@mui/material";
import { ProductCategory } from "../../types";
import { useAppDispatch } from "../../../../redux/hooks";
import { fetchEditProductCategory } from "../../api";
import { getProductCategories } from "../../productCategoriesSlice";


interface EditProductCategoryProps {
  category: ProductCategory;  // Передаём выбранную категорию
  onClose: () => void;  // Колбэк для закрытия модального окна
}

export default function EditProductCategory({ category, onClose }: EditProductCategoryProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(category.name);
  const [artName, setArtName] = useState(category.artName);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !artName.trim()) {
      setError("Заполните все поля");
      return;
    }

    setLoading(true);

    try {
      await fetchEditProductCategory({
        id: category.id,
        newProductCategoryDto: { name, artName }
      });
      dispatch(getProductCategories());  // Обновляем список категорий
      onClose();  
    } catch (error) {
      setError("Fehler bei der Aktualisierung der Kategorie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
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
          borderRadius: 2
        }}
      >
        <Typography variant="h6" sx={{ textAlign:"left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd"}} mb={2}>Kategorienaktualisierung</Typography>

        <TextField
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="dense"
        />
        <TextField
          label="ArtName"
          fullWidth
          value={artName}
          onChange={(e) => setArtName(e.target.value)}
          margin="dense"
        />
        {error && <Typography color="error" mt={1}>{error}</Typography>}

        <Box mt={2} display="flex" justifyContent="space-between">
          <Button onClick={onClose}>Abbrechen</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Speichern"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
