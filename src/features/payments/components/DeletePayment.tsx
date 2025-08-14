import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useAppDispatch } from "../../../redux/hooks";
import { showSuccessToast } from "../../../utils/toast";
import { deletePayment } from "../paymentsSlice";
import { handleApiError } from "../../../utils/handleApiError";

interface DeletePaymentProps {
  paymentId: number;
  customerName: string;
  amount: number;
  paymentDate: string;
  onSuccessDelete?: () => void;
  trigger?: React.ReactNode;
}

export default function DeletePayment({
  paymentId,
  customerName,
  amount,
  paymentDate,
  onSuccessDelete,
  trigger,
}: DeletePaymentProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await dispatch(deletePayment(paymentId)).unwrap();
      showSuccessToast("Erfolg", `Die Zahlung wurde erfolgreich gelöscht.`);
      handleClose();
      onSuccessDelete?.();
    } catch (error: any) {
      handleApiError(error, "Fehler beim Löschen der Zahlung.");
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
            Wollen Sie die Zahlung <strong>{customerName}</strong> vom{" "}
            <strong>
              {new Date(paymentDate).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </strong>{" "}
            in Betrag von <strong>{amount}</strong> Euro wirklich löschen?
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
