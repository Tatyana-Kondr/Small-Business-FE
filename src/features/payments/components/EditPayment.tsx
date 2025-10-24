import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  DialogActions,
  Autocomplete,
  MenuItem,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { NewPaymentDto, Payment, PaymentMethod, PaymentProcess } from "../types";
import { updatePayment } from "../paymentsSlice";
import { showSuccessToast } from "../../../utils/toast";
import { handleApiError } from "../../../utils/handleApiError";
import { Customer } from "../../customers/types";
import { getCustomers } from "../../customers/customersSlice";
import { getPaymentMethods } from "../paymentMethodsSlice";
import { getPaymentProcesses } from "../paymentProcessesSlice";
import KeyboardDoubleArrowLeftOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftOutlined';
import { getDocumentTypes } from "../../purchases/typeOfDocumentSlice";
import { TypeOfDocument } from "../../purchases/types";

interface EditPaymentProps {
  payment: Payment;
  onClose: () => void;
}

export default function EditPayment({ payment, onClose }: EditPaymentProps) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.payments.loading);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentProcesses, setPaymentProcesses] = useState<PaymentProcess[]>([]);
  const [documentTypes, setDocumentTypes] = useState<TypeOfDocument[]>([]);

  const [form, setForm] = useState<NewPaymentDto>({
    paymentDate: payment.paymentDate.substring(0, 10),
    customerId: payment.customerId,
    customerName: payment.customerName,
    type: payment.type,
    amount: payment.amount,
    documentId: payment.document.id,
    documentNumber: payment.documentNumber,
    paymentMethodId: payment.paymentMethodId,
    paymentProcessId: payment.paymentProcessId,
    saleId: payment.saleId || undefined,
    purchaseId: payment.purchaseId || undefined,
  });

  // Загружаем справочники
  useEffect(() => {
    const loadData = async () => {
      try {
        const [customerData, methodsData, processesData, docTypesData] = await Promise.all([
          dispatch(getCustomers({ page: 0, size: 100 })).unwrap(),
          dispatch(getPaymentMethods()).unwrap(),
          dispatch(getPaymentProcesses()).unwrap(),
          dispatch(getDocumentTypes()).unwrap(),
        ]);
        setCustomers(customerData.content);
        setPaymentMethods(methodsData);
        setPaymentProcesses(processesData);
        setDocumentTypes(docTypesData)
      } catch (err) {
        handleApiError(err, "Fehler beim Laden der Daten.");
      }
    };

    loadData();
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["amount", "customerId", "paymentMethodId", "paymentProcessId", "saleId", "purchaseId", "documentId"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(updatePayment({ id: payment.id, updatePaymentDto: form })).unwrap();
      showSuccessToast("Erfolg", "Zahlung erfolgreich aktualisiert.");
      onClose();
    } catch (err) {
      handleApiError(err, "Fehler beim Aktualisieren der Zahlung.");
    }
  };

  const isLocked = !!form.purchaseId || !!form.saleId;

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="zahlung-dialog-title">
      <DialogTitle
        id="zahlung-dialog-title"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          textAlign: "left",
          fontWeight: "bold",
          color: "#0277bd",
          m: "12px"
        }}
      >
        <span>Zahlung Nr. {payment?.id}</span>
        <span>
          {form.purchaseId
            ? `Bestellung Nr. ${form.purchaseId}`
            : form.saleId
              ? `Auftrag Nr. ${form.saleId}`
              : null}
        </span>
      </DialogTitle>
      <DialogContent>
        <form id="edit-payment-form" onSubmit={handleSubmit}>
          <TextField
            margin="dense"
            label="Zahlungsdatum"
            type="date"
            name="paymentDate"
            value={form.paymentDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <Autocomplete
            fullWidth
            options={[...customers].sort((a, b) => a.name.localeCompare(b.name))}
            getOptionLabel={(option) => option.name}
            onChange={(_, value) => {
              if (!isLocked) {
                setForm((prev) => ({
                  ...prev,
                  customerId: value?.id ?? 0,
                  customerName: value?.name ?? "",
                }));
              }
            }}
            value={customers.find((c) => c.id === form.customerId) || null}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Geschäftspartner"
                margin="dense"
                disabled={isLocked}
                inputProps={{
                  ...params.inputProps,
                  "aria-label": "Geschäftspartner auswählen",
                }}
              />
            )}
          />

          <TextField
            id="type"
            select
            label="Typ"
            name="type"
            value={form.type}
            onChange={handleChange}
            margin="dense"
            fullWidth
          >
            <MenuItem value="EINNAHME">Einnahme</MenuItem>
            <MenuItem value="AUSGABE">Ausgabe</MenuItem>
          </TextField>

          <TextField
            label="Betrag"
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            margin="dense"
            fullWidth
            required
          />

          <TextField
            id="documentType"
            select
            label="Dokumenttyp"
            name="documentId"
            value={form.documentId}
            onChange={handleChange}
            margin="dense"
            fullWidth
          >
            {documentTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Dokumentnummer"
            name="documentNumber"
            value={form.documentNumber}
            onChange={handleChange}
            margin="dense"
            fullWidth
            disabled={isLocked}
          />

          <TextField
            id="paymentMethod"
            select
            label="Zahlungsmethode"
            name="paymentMethodId"
            value={form.paymentMethodId}
            onChange={handleChange}
            margin="dense"
            fullWidth
          >
            {paymentMethods.map((method) => (
              <MenuItem key={method.id} value={method.id}>
                {method.provider} - {method.maskedNumber}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            id="paymentProcess"
            select
            label="Zahlungsart"
            name="paymentProcessId"
            value={form.paymentProcessId}
            onChange={handleChange}
            margin="dense"
            fullWidth
          >
            {paymentProcesses.map((process) => (
              <MenuItem key={process.id} value={process.id}>
                {process.processName}
              </MenuItem>
            ))}
          </TextField>
        </form>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", padding: "8px 24px", mb: "12px" }}>
        <Button
          onClick={onClose}
            disabled={loading}
          sx={{
            fontSize: 12,
            minWidth: 40,
            minHeight: 40,
            padding: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 1,
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor: "transparent", // фон не меняется при ховере
              "& .MuiSvgIcon-root": {
                color: "#00838f", // цвет иконки при наведении
              },
            },
            "& .MuiSvgIcon-root": {
              transition: "color 0.3s ease", // плавный переход цвета
            },
          }}>
          <KeyboardDoubleArrowLeftOutlinedIcon fontSize="large" />
          ZURÜCK
        </Button>
        <Button form="edit-payment-form" type="submit" variant="contained" disabled={loading}>
          {loading ? "Aktualisieren..." : "Aktualisieren"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
