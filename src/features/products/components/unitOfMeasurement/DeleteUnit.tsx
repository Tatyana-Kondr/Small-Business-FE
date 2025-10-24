import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useAppDispatch } from "../../../../redux/hooks";
import { showSuccessToast } from "../../../../utils/toast";
import { handleApiError } from "../../../../utils/handleApiError";
import { deleteUnit } from "../../unitsOfMeasurementSlice";


interface DeleteUnitProps {
  unitId: number;
  name: string;
}

export default function DeleteUnit({ unitId, name }: DeleteUnitProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      dispatch(deleteUnit(unitId));
      showSuccessToast("Erfolg", "Die Maßeinheit wurde erfolgreich gelöscht.");
      handleClose();
    } catch (error) {
      handleApiError(error, "Fehler beim Löschen der Maßeinheit"); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        size="small"
        onClick={handleOpen}
        sx={{
          "&:hover": {
            borderColor: "#d32f2f",
            backgroundColor: "#fddede",
          },
        }}
      >
        Löschen
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ color: "error.main" }}>⚠️ Warnung</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Möchten Sie der Maßeinheit{" "}
            <strong>{name}</strong> wirklich löschen?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Abbrechen
          </Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>
            {loading ? "Löschung..." : "Löschen"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}