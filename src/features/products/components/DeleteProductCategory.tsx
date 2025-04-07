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
      alert("Fehler beim Löschen der Kategorie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outlined" color="error" size="small" onClick={handleOpen} sx={{
        "&:hover": {
          borderColor: "#d32f2f", // Темный красный цвет (или любой другой)
        },
      }}>
        Löschen
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle color="red"> Warnung! </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Wollen Sie die Kategorie <strong>{categoryName}</strong> wirklich löschen?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Abbrechen</Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>
            {loading ? "Löschung..." : "Löschen"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
