import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  TextField,
  Button,
  Autocomplete,
  MenuItem,
  Grid,
  Alert,
} from "@mui/material";

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";

import {
  NewPaymentDto,
  Payment,
  PaymentMethod,
  PaymentProcess,
} from "../types";

import { updatePayment } from "../paymentsSlice";
import { showSuccessToast } from "../../../utils/toast";
import { handleApiError } from "../../../utils/errors/handleApiError";

import {
  backendErrorsToFormErrors,
  clearFieldError,
  FormErrors,
  hasErrors,
  isBackendValidationErrors,
  validateRequiredFields,
} from "../../../utils/validation/validation";

import {
  getCustomersPickList,
  selectCustomersPickList,
  selectLoadingPick,
} from "../../customers/customersSlice";

import { getPaymentMethods } from "../paymentMethodsSlice";
import { getPaymentProcesses } from "../paymentProcessesSlice";

import {
  getDocumentTypes,
  selectTypeOfDocuments,
} from "../../purchases/typeOfDocumentSlice";

import DraggableDialog from "../../../components/DraggableDialog";
import DialogTitleText from "../../../components/DialogTitleText";
import { primaryButtonStyle } from "../../../styles/buttonStyles";

interface EditPaymentProps {
  payment: Payment;
  onClose: () => void;
}

export default function EditPayment({ payment, onClose }: EditPaymentProps) {
  const dispatch = useAppDispatch();

  const loading = useAppSelector((state) => state.payments.loading);

  const customersPick = useAppSelector(selectCustomersPickList);
  const customersPickLoading = useAppSelector(selectLoadingPick);
  const documentTypes = useAppSelector(selectTypeOfDocuments);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [paymentProcesses, setPaymentProcesses] = useState<PaymentProcess[]>(
    [],
  );

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState<FormErrors<NewPaymentDto>>({});

  const [form, setForm] = useState<NewPaymentDto>({
    paymentDate: payment.paymentDate.substring(0, 10),
    customerId: payment.customerId,
    customerName: payment.customerName,
    type: payment.type,
    amount: payment.amount,
    documentId: payment.document.id,
    documentName: payment.document.name,
    documentNumber: payment.documentNumber,
    paymentMethodId: payment.paymentMethodId,
    paymentProcessId: payment.paymentProcessId,
    saleId: payment.saleId || undefined,
    purchaseId: payment.purchaseId || undefined,
  });

  const isLocked = Boolean(payment.saleId || payment.purchaseId);
  const isBusy = loading || saving;

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);

      try {
        const [, methods, processes] = await Promise.all([
          dispatch(getCustomersPickList()).unwrap(),
          dispatch(getPaymentMethods()).unwrap(),
          dispatch(getPaymentProcesses()).unwrap(),
          dispatch(getDocumentTypes()).unwrap(),
        ]);

        setPaymentMethods(methods);
        setPaymentProcesses(processes);
      } catch (err) {
        handleApiError(err, "Fehler beim Laden der Daten.");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: [
        "amount",
        "customerId",
        "paymentMethodId",
        "paymentProcessId",
        "saleId",
        "purchaseId",
        "documentId",
      ].includes(name)
        ? Number(value)
        : value,
    }));

    setErrors((prev) => clearFieldError(prev, name as keyof NewPaymentDto));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBusy) return;

    const validationErrors = validateRequiredFields(form, [
      "paymentDate",
      "customerId",
      "documentId",
      "documentNumber",
      "paymentMethodId",
      "paymentProcessId",
    ]);

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      validationErrors.amount = "Betrag muss größer als 0 sein.";
    }

    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    const payload: NewPaymentDto = {
      ...form,
      amount,
      saleId: payment.saleId || undefined,
      purchaseId: payment.purchaseId || undefined,
      ...(isLocked
        ? {
            customerId: payment.customerId,
            customerName: payment.customerName,
            type: payment.type,
            documentId: payment.document.id,
            documentName: payment.document.name,
            documentNumber: payment.documentNumber,
          }
        : {}),
    };

    setSaving(true);

    try {
      await dispatch(
        updatePayment({
          id: payment.id,
          updatePaymentDto: payload,
        }),
      ).unwrap();

      showSuccessToast("Erfolg", "Die Zahlung wurde erfolgreich aktualisiert.");

      onClose();
    } catch (err) {
      if (isBackendValidationErrors(err)) {
        setErrors(backendErrorsToFormErrors<NewPaymentDto>(err.errors));
      } else {
        handleApiError(err, "Fehler beim Aktualisieren der Zahlung.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <DraggableDialog
      open
      onClose={isBusy ? undefined : onClose}
      dialogWidth={800}
      title={<DialogTitleText>ZAHLUNG NR. {payment.id}</DialogTitleText>}
      actions={
        <Button
          type="submit"
          form="edit-payment-form"
          variant="contained"
          sx={primaryButtonStyle}
          disabled={isBusy || loadingData}
        >
          {isBusy ? "Aktualisieren..." : "Aktualisieren"}
        </Button>
      }
    >
      {loadingData ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 4,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box
          id="edit-payment-form"
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: "100%",
            pt: 3,
            px: 3,
          }}
        >
          <Grid container spacing={2}>
            {isLocked && (
              <Grid item xs={12}>
                <Alert severity="info">
                  {payment.saleId
                    ? `Auftrag Nr. ${payment.saleId}`
                    : `Bestellung Nr. ${payment.purchaseId}`}
                  {" — "}
                  Geschäftspartner, Zahlungstyp und Dokument können nicht
                  geändert werden.
                </Alert>
              </Grid>
            )}

            {/* Geschäftspartner */}
            <Grid item xs={8}>
              <Autocomplete
                fullWidth
                loading={customersPickLoading}
                disabled={isLocked || isBusy}
                options={[...customersPick].sort((a, b) =>
                  a.name.localeCompare(b.name),
                )}
                getOptionLabel={(option) =>
                  option.customerNumber
                    ? `${option.name} (${option.customerNumber})`
                    : option.name
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, value) => {
                  setForm((prev) => ({
                    ...prev,
                    customerId: value?.id ?? 0,
                    customerName: value?.name ?? "",
                  }));

                  setErrors((prev) => clearFieldError(prev, "customerId"));
                }}
                value={
                  customersPick.find(
                    (customer) => customer.id === form.customerId,
                  ) || null
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Geschäftspartner"
                    error={Boolean(errors.customerId)}
                    helperText={errors.customerId}
                  />
                )}
              />
            </Grid>

            {/* Zahlungsdatum */}
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Zahlungsdatum"
                name="paymentDate"
                type="date"
                value={form.paymentDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={Boolean(errors.paymentDate)}
                helperText={errors.paymentDate}
                disabled={isBusy}
              />
            </Grid>

            {/* Typ */}
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Typ"
                name="type"
                value={form.type}
                onChange={handleChange}
                disabled={isLocked || isBusy}
              >
                <MenuItem value="EINNAHME">Einnahme</MenuItem>
                <MenuItem value="AUSGABE">Ausgabe</MenuItem>
              </TextField>
            </Grid>

            {/* Betrag */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Betrag"
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
                error={Boolean(errors.amount)}
                helperText={errors.amount}
                disabled={isBusy}
                inputProps={{
                  min: 0.01,
                  step: 0.01,
                }}
              />
            </Grid>

            {/* Dokument */}
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Dokument"
                name="documentId"
                value={form.documentId || ""}
                onChange={handleChange}
                error={Boolean(errors.documentId)}
                helperText={errors.documentId}
                disabled={isLocked || isBusy}
              >
                {documentTypes.map((doc) => (
                  <MenuItem key={doc.id} value={doc.id}>
                    {doc.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Dokumentnummer */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Dokumentnummer"
                name="documentNumber"
                value={form.documentNumber}
                onChange={handleChange}
                error={Boolean(errors.documentNumber)}
                helperText={errors.documentNumber}
                disabled={isLocked || isBusy}
              />
            </Grid>

            {/* Zahlungsmethode */}
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Zahlungsmethode"
                name="paymentMethodId"
                value={form.paymentMethodId || ""}
                onChange={handleChange}
                error={Boolean(errors.paymentMethodId)}
                helperText={errors.paymentMethodId}
                disabled={isBusy}
              >
                <MenuItem value="" disabled>
                  Bitte wählen
                </MenuItem>

                {paymentMethods.map((method) => (
                  <MenuItem key={method.id} value={method.id}>
                    {method.provider} - {method.maskedNumber}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Zahlungsart */}
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Zahlungsart"
                name="paymentProcessId"
                value={form.paymentProcessId || ""}
                onChange={handleChange}
                error={Boolean(errors.paymentProcessId)}
                helperText={errors.paymentProcessId}
                disabled={isBusy}
              >
                <MenuItem value="" disabled>
                  Bitte wählen
                </MenuItem>

                {paymentProcesses.map((process) => (
                  <MenuItem key={process.id} value={process.id}>
                    {process.processName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>
      )}
    </DraggableDialog>
  );
}
