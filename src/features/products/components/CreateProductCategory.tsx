import { useState } from "react";
import { Box, Button, Modal, TextField, Typography, CircularProgress } from "@mui/material";
import { useAppDispatch } from "../../../redux/hooks";
import { fetchAddProductCategory } from "../api";
import { getProductCategories } from "../productCategoriesSlice";

export default function CreateProductCategory() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [artName, setArtName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setName("");
    setArtName("");
    setError("");
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !artName.trim()) {
      setError("Заполните все поля");
      return;
    }

    setLoading(true);

    try {
      await fetchAddProductCategory({ name, artName });
      dispatch(getProductCategories()); // Обновляем список категорий
      handleClose();
    } catch (error) {
      setError("Ошибка при добавлении категории");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Добавить категорию
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
            borderRadius: 2
          }}
        >
          <Typography variant="h6" mb={2}>Новая категория</Typography>

          <TextField
            label="Название категории"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="dense"
          />
          <TextField
            label="Артикул"
            fullWidth
            value={artName}
            onChange={(e) => setArtName(e.target.value)}
            margin="dense"
          />
          {error && <Typography color="error" mt={1}>{error}</Typography>}

          <Box mt={2} display="flex" justifyContent="space-between">
            <Button onClick={handleClose} color="secondary">Отмена</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Добавить"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
