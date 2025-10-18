import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useAppDispatch } from "../../../redux/hooks";
import { showSuccessToast } from "../../../utils/toast";
import { handleApiError } from "../../../utils/handleApiError";
import { deleteProduction } from "../productionsSlice";

interface DeleteProductionProps {
  productionId: number;
  dateOfProduction: string;
  onSuccessDelete?: () => void;
  trigger?: React.ReactNode;
}

export default function DeleteProduction({
  productionId,
  dateOfProduction,
  onSuccessDelete,
  trigger,
}: DeleteProductionProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await dispatch(deleteProduction(productionId)).unwrap();
      showSuccessToast("Erfolg", `Die Hertellung wurde erfolgreich gelöscht.`);
      handleClose();
      onSuccessDelete?.();
    } catch (error: any) {
      handleApiError(error, "Fehler beim Löschen der Hertellung.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {trigger ? (
        <span
          onClick={(e) => {
            e.stopPropagation();
            handleOpen();
          }}
          style={{ cursor: "pointer", display: "inline-flex" }}
        >
          {trigger}
        </span>
      ) : (
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
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ color: "error.main", fontWeight: "bold" }}>
          ⚠️ WARNUNG!
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Wollen Sie die Hertellung Nr <strong>{productionId}</strong>  vom{" "}
            <strong>
              {new Date(dateOfProduction).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </strong>{" "}
            wirklich löschen?
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
