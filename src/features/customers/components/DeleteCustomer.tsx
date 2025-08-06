import { useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from "@mui/material";
import { useAppDispatch } from "../../../redux/hooks";
import { deleteCustomer, getCustomers } from "../customersSlice";

interface DeleteCustomerProps {
  customerId: number;
  customerName: string;
  onSuccessDelete?: () => void;
  trigger?: React.ReactNode;
}

export default function DeleteCustomer({ customerId, customerName, onSuccessDelete, trigger }: DeleteCustomerProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);


  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await dispatch(deleteCustomer(customerId)).unwrap();
      await dispatch(getCustomers({ page: 0, size: 15 }));
      handleClose();
      onSuccessDelete?.();
    } catch (error: any) {
      const message = error?.message || "Unbekannter Fehler beim Löschen.";
      setErrorMessage(message);
      setShowError(true);
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
        <DialogTitle sx={{ color: "error.main", fontWeight: "bold" }}>⚠️ WARNUNG!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Wollen Sie den <strong>{customerName}</strong>  wirklich löschen?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Abbrechen</Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>
            {loading ? "Löschung..." : "Löschen"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={showError}
        autoHideDuration={5000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowError(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

    </>
  );
}
