import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useAppDispatch } from "../../../redux/hooks";
import { fetchDeleteProductCategory } from "../api";
import { getProductCategories } from "../productCategoriesSlice";

interface DeleteCategoryProps {
  categoryId: number;
  categoryName: string;
}

export default function DeleteProductCategory({ categoryId, categoryName }: DeleteCategoryProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetchDeleteProductCategory(categoryId);
      dispatch(getProductCategories());  // Обновляем список после удаления
      handleClose();
    } catch (error) {
      alert("Ошибка при удалении категории");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outlined" color="error" size="small" onClick={handleOpen}>
        Удалить
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Удаление категории</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить категорию <strong>{categoryName}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Отмена</Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>
            {loading ? "Удаление..." : "Удалить"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
