import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useAppDispatch } from "../../../redux/hooks";
import { deleteCustomer, getCustomers, getCustomersWithCustomerNumber } from "../customersSlice";
import { showErrorToast, showSuccessToast } from "../../../utils/toast";

interface DeleteCustomerProps {
  customerId: number;
  customerName: string;
  onSuccessDelete?: () => void;
  trigger?: React.ReactNode;
}

export default function DeleteCustomer({
  customerId,
  customerName,
  onSuccessDelete,
  trigger,
}: DeleteCustomerProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await dispatch(deleteCustomer(customerId)).unwrap();
      await dispatch(getCustomers({ page: 0, size: 15 }));
      await dispatch(getCustomersWithCustomerNumber({ page: 0, size: 15 }));
      showSuccessToast("Erfolg", `${customerName} wurde erfolgreich gelöscht.`);
      handleClose();
      onSuccessDelete?.();
    } catch (error: any) {
      let message = "Fehler beim Löschen.";

      const raw = error?.message || "";

      if (raw.includes("409")) {
        message = `${customerName} kann nicht gelöscht werden, da es in anderen Einträgen verwendet wird.`;
      } else if (raw.includes("404")) {
        message = `${customerName} wurde nicht gefunden.`;
      }

      showErrorToast("Fehler beim Löschen", message);
    } finally {
      setLoading(false);
    }
  };

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
            Wollen Sie den <strong>{customerName}</strong> wirklich löschen?
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
