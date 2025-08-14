import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useAppDispatch } from "../../../redux/hooks";
import { showSuccessToast } from "../../../utils/toast";
import { handleApiError } from "../../../utils/handleApiError";
import { deletePurchase } from "../purchasesSlice";

interface DeletePurchaseProps {
  purchaseId: number;
  vendorName: string;
  purchasingDate: string;
  onSuccessDelete?: () => void;
  trigger?: React.ReactNode;
}

export default function DeletePurchase({
  purchaseId,
  vendorName,
  purchasingDate,
  onSuccessDelete,
  trigger,
}: DeletePurchaseProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await dispatch(deletePurchase(purchaseId)).unwrap();
      showSuccessToast("Erfolg", `Die Bestellung wurde erfolgreich gelöscht.`);
      handleClose();
      onSuccessDelete?.();
    } catch (error: any) {
      handleApiError(error, "Fehler beim Löschen der Bestellung.");
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
            Wollen Sie die Bestellung Nr <strong>{purchaseId}</strong> von <strong>{vendorName}</strong> vom{" "}
            <strong>
              {new Date(purchasingDate).toLocaleDateString("de-DE", {
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
