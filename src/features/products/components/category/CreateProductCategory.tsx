import { useState } from "react";
import { Box, Button, Modal, TextField, Typography, CircularProgress } from "@mui/material";
import { useAppDispatch } from "../../../../redux/hooks";
import { fetchAddProductCategory } from "../../api";
import { getProductCategories } from "../../productCategoriesSlice";


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
      setError("Bitte alle Felder ausfüllen");
      return;
    }

    setLoading(true);

    try {
      await fetchAddProductCategory({ name, artName });
      dispatch(getProductCategories()); 
      handleClose();
    } catch (error) {
      setError("Fehler beim Hinzufügen der Kategorie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen}>
      Kategorie hinzufügen
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
          <Typography variant="h6" sx={{ textAlign:"left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd"}} mb={2}>Neue Kategorie</Typography>

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
            <Button onClick={handleClose} >Abbrechen</Button>
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
    </>
  );
}
