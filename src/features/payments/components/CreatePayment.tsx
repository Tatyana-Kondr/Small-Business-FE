import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Alert,
  Typography,
  Grid,
  Autocomplete,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { addPayment, getPayments, selectError, selectLoading } from "../paymentsSlice";
import { NewPaymentDto, PaymentMethod, PaymentPrefillDto, PaymentProcess } from "../types";
import { fetchAllPaymentMethods, fetchAllPaymentProcesses, fetchPrefillDataForPurchase, fetchPrefillDataForSale } from "../api";
import { updatePurchasePaymentStatus } from "../../purchases/purchasesSlice";
import { updateSalePaymentStatus } from "../../sales/salesSlice";
import { TypesOfDocument } from "../../../constants/enums";
import { getCustomers } from "../../customers/customersSlice";
import { Customer } from "../../customers/types";
import CreateCustomer from "../../customers/CreateCustomer";


interface CreatePaymentProps {
  onClose: () => void;
  prefillType?: "sale" | "purchase";
  prefillId?: number;
  typeOfOperation?: string;
}

const TYPE_MAP: Record<string, "EINNAHME" | "AUSGABE"> = {
  EINKAUF: "AUSGABE",
  KUNDENERSTATTUNG: "AUSGABE",
  LIEFERANT_RABATT: "EINNAHME",
  VERKAUF: "EINNAHME",
};

export default function CreatePayment({
  onClose,
  prefillType,
  prefillId,
  typeOfOperation,
}: CreatePaymentProps) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);

  const [prefillData, setPrefillData] = useState<PaymentPrefillDto | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentProcesses, setPaymentProcesses] = useState<PaymentProcess[]>([]);
  const [loadingPrefill, setLoadingPrefill] = useState(true);

  const [form, setForm] = useState<NewPaymentDto>({
    paymentDate: new Date().toISOString().substring(0, 10),
    customerId: 0,
    customerName: "",
    amount: 0,
    saleId: 0,
    purchaseId: 0,
    document: "",
    documentNumber: "",
    type: typeOfOperation ? TYPE_MAP[typeOfOperation] : "AUSGABE",
    paymentMethodId: 0,
    paymentProcessId: 0,
  });

  const amountLabel = form.saleId !== 0 || form.purchaseId !== 0 ? "Offener Betrag" : "Betrag";
  const dokNumberLabel = form.saleId !== 0 || form.purchaseId !== 0 ? "Dokumentnummer" : "Referenz";

  useEffect(() => {
    dispatch(getCustomers({ page: 0, size: 100 }))
      .unwrap()
      .then((data) => setCustomers(data.content))
      .catch((err) => console.error("Fehler beim Laden von Kunden", err));
  }, [dispatch]);


  useEffect(() => {
    async function loadData() {
      setLoadingPrefill(true);
      try {
        const [methods, processes] = await Promise.all([
          fetchAllPaymentMethods(),
          fetchAllPaymentProcesses(),
        ]);

        let prefill: PaymentPrefillDto | null = null;

        if (prefillType && prefillId !== undefined) {
          prefill =
            prefillType === "sale"
              ? await fetchPrefillDataForSale(prefillId)
              : await fetchPrefillDataForPurchase(prefillId);
        }

        setPrefillData(prefill);
        setPaymentMethods(methods);
        setPaymentProcesses(processes);

        setForm((prev) => ({
          ...prev,
          customerId: prefill?.customerId ?? 0,
          customerName: prefill?.customerName ?? "",
          amount: prefill?.amountLeft ?? 0,
          saleId: prefill?.saleId ?? 0,
          purchaseId: prefill?.purchaseId ?? 0,
          document: prefill?.document ?? "",
          documentNumber: prefill?.documentNumber ?? "",
          paymentMethodId: methods[0]?.id || 0,
          paymentProcessId: processes[0]?.id || 0,
        }));
      } catch (err) {
        console.error("Failed to load payment form data", err);
      } finally {
        setLoadingPrefill(false);
      }
    }

    loadData();
  }, [prefillId, prefillType, typeOfOperation]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["amount", "customerId", "saleId", "purchaseId", "paymentMethodId", "paymentProcessId"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleCreateNewCustomer = () => {
    setShowCreateCustomer(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Формируем объект, исключая saleId или purchaseId, если они 0
    const { saleId, purchaseId, ...rest } = form;
    const payload = {
      ...rest,
      ...(saleId !== 0 ? { saleId } : {}),
      ...(purchaseId !== 0 ? { purchaseId } : {}),
    };

    try {
      await dispatch(addPayment(payload)).unwrap();

      if (prefillType === "purchase" && form.purchaseId) {
        await dispatch(updatePurchasePaymentStatus(form.purchaseId));
      }
      if (prefillType === "sale" && form.saleId) {
        await dispatch(updateSalePaymentStatus(form.saleId));
      }

      await dispatch(getPayments({ page: 0, size: 15 }));

      onClose();
    } catch (err) {
      console.error("Error when adding payment", err);
    }
  };


  if (loadingPrefill) {
    return (
      <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: "left", fontWeight: "bold", textDecoration: 'underline', color: "#0277bd" }}>Zahlung</DialogTitle>
        <DialogContent sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="zahlung-dialog-title">
      <DialogTitle
        id="zahlung-dialog-title"
        sx={{
          textAlign: "left",
          fontWeight: "bold",
          textDecoration: "underline",
          color: "#0277bd"
        }}
      >
        Zahlung
      </DialogTitle>
      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
        >
          {!typeOfOperation && (
            <TextField
              id="type"
              select
              label="Typ"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              inputProps={{ 'aria-label': 'Zahlungstyp auswählen' }}
            >
              <MenuItem value="EINNAHME">Einnahme</MenuItem>
              <MenuItem value="AUSGABE">Ausgabe</MenuItem>
            </TextField>
          )}

          <TextField
            id="paymentDate"
            label="Zahlungsdatum"
            name="paymentDate"
            type="date"
            value={form.paymentDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
            inputProps={{ 'aria-label': 'Zahlungsdatum' }}
          />


          {/* Geschäftspartner Autocomplete */}
          {!typeOfOperation && (
            <Grid container spacing={2}>
              <Grid item xs={10}>
                <Autocomplete
                  fullWidth
                  options={[...customers].sort((a, b) => a.name.localeCompare(b.name))}
                  getOptionLabel={(option) => option.name}
                  onChange={(_, value) => {
                    setForm((prev) => ({
                      ...prev,
                      customerId: value?.id ?? 0,
                      customerName: value?.name ?? "",
                    }));
                  }}
                  value={customers.find((c) => c.id === form.customerId) || null}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Geschäftspartner"
                      required
                      inputProps={{
                        ...params.inputProps,
                        'aria-label': 'Geschäftspartner auswählen',
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleCreateNewCustomer}
                  startIcon={<AddIcon />}
                  sx={{ height: "100%", "&:hover": { borderColor: "#00acc1" } }}
                  aria-label="Neuen Geschäftspartner hinzufügen"
                >
                  Neu
                </Button>
              </Grid>
            </Grid>
          )}

          {typeOfOperation && (
            <TextField
              id="customerName"
              label="Geschäftspartner"
              name="customerName"
              value={form.customerName}
              disabled
              inputProps={{ 'aria-label': 'Name des Geschäftspartners (nicht bearbeitbar)' }}
            />
          )}

          <TextField
            id="amount"
            label={amountLabel}
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            required
            inputProps={{ 'aria-label': 'Betrag eingeben', min: 0, step: 0.01 }}
          />

          {prefillData && (
            <Typography variant="caption" sx={{ ml: 1, color: "error.main" }}>
              Gesamtbetrag: {prefillData.amount.toFixed(2)} €,&nbsp;
              Bezahlt: {(prefillData.amount - prefillData.amountLeft).toFixed(2)} €
            </Typography>
          )}

          {!typeOfOperation ? (
            <TextField
              id="document"
              select
              label="Dokumenttyp"
              name="document"
              value={form.document}
              onChange={handleChange}
              required
              inputProps={{ 'aria-label': 'Dokumenttyp auswählen' }}
            >
              {TypesOfDocument.map((doc) => (
                <MenuItem key={doc} value={doc}>
                  {doc}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              id="document"
              label={dokNumberLabel}
              name="document"
              value={form.document}
              onChange={handleChange}
              inputProps={{ 'aria-label': 'Dokumentname eingeben' }}
            />
          )}

          <TextField
            id="documentNumber"
            label="Dokumentnummer"
            name="documentNumber"
            value={form.documentNumber}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'Dokumentnummer eingeben' }}
          />

          <TextField
            id="paymentMethod"
            select
            label="Zahlungsmethode"
            name="paymentMethodId"
            value={form.paymentMethodId}
            onChange={handleChange}
            required
            inputProps={{ 'aria-label': 'Zahlungsmethode auswählen' }}
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
            required
            inputProps={{ 'aria-label': 'Zahlungsart auswählen' }}
          >
            {paymentProcesses.map((process) => (
              <MenuItem key={process.id} value={process.id}>
                {process.processName}
              </MenuItem>
            ))}
          </TextField>

          {error && <Alert severity="error">{error}</Alert>}

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={onClose} disabled={loading}>
              Abbrechen
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Speichern..." : "Speichern"}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
      {showCreateCustomer && (
        <CreateCustomer
          onClose={() => setShowCreateCustomer(false)}
          onSubmitSuccess={(createdCustomer) => {
            setShowCreateCustomer(false);
            setCustomers(prev => [...prev, createdCustomer]);
            setForm(prev => ({
              ...prev,
              customerId: createdCustomer.id,
            }));
          }}
        />
      )}
    </Dialog>
  );
};