import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  MenuItem,
  Alert,
  Typography,
  Grid,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  FormHelperText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { addPayment, selectError, selectLoading } from "../paymentsSlice";
import {
  NewPaymentDto,
  PaymentMethod,
  PaymentPrefillDto,
  PaymentProcess,
} from "../types";
import {
  fetchAllPaymentMethods,
  fetchAllPaymentProcesses,
  fetchPrefillDataForPurchase,
  fetchPrefillDataForSale,
} from "../api";
import {
  getCustomersPickList,
  selectCustomersPickList,
  selectLoadingPick,
} from "../../customers/customersSlice";
import CreateCustomer from "../../customers/components/CreateCustomer";
import { handleApiError } from "../../../utils/errors/handleApiError";
import { showSuccessToast } from "../../../utils/toast";
import {
  getDocumentTypes,
  selectTypeOfDocuments,
} from "../../purchases/typeOfDocumentSlice";
import {
  backendErrorsToFormErrors,
  clearFieldError,
  FormErrors,
  hasErrors,
  isBackendValidationErrors,
  validateRequiredFields,
} from "../../../utils/validation/validation";
import {
  addButtonStyle,
  primaryButtonStyle,
} from "../../../styles/buttonStyles";
import DraggableDialog from "../../../components/DraggableDialog";
import DialogTitleText from "../../../components/DialogTitleText";
import { PaymentType } from "../../../constants/enums";
import { colors } from "../../../styles/colors";
import { formatNumber } from "../../../utils/formatNumber";

interface CreatePaymentProps {
  onClose: () => void;
  prefillType?: "sale" | "purchase";
  prefillId?: number;
  typeOfOperation?: string;
}

const TYPE_MAP: Record<string, PaymentType> = {
  EINKAUF: "AUSGABE",
  KUNDENERSTATTUNG: "AUSGABE",
  LIEFERANT_RABATT: "EINNAHME",
  VERKAUF: "EINNAHME",
};

const getCustomerMode = (
  typeOfOperation?: string,
  prefillType?: "sale" | "purchase",
): "customer" | "vendor" => {
  if (typeOfOperation) {
    switch (typeOfOperation) {
      case "VERKAUF":
      case "KUNDENERSTATTUNG":
        return "customer";

      case "EINKAUF":
      case "LIEFERANT_RABATT":
        return "vendor";
    }
  }

  if (prefillType === "sale") {
    return "customer";
  }

  if (prefillType === "purchase") {
    return "vendor";
  }

  return "customer";
};

export default function CreatePayment({
  onClose,
  prefillType,
  prefillId,
  typeOfOperation,
}: CreatePaymentProps) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectLoading);
  const documentTypes = useAppSelector(selectTypeOfDocuments);
  const error = useAppSelector(selectError);

  const customersPick = useAppSelector(selectCustomersPickList);
  const customersPickLoading = useAppSelector(selectLoadingPick);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);

  const [prefillData, setPrefillData] = useState<PaymentPrefillDto | null>(
    null,
  );
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentProcesses, setPaymentProcesses] = useState<PaymentProcess[]>(
    [],
  );
  const [loadingPrefill, setLoadingPrefill] = useState(true);
  const [saving, setSaving] = useState(false);
  const isBusy = loading || saving;

  const [partnerMode] = useState<"customer" | "vendor">("customer");
  const [errors, setErrors] = useState<FormErrors<NewPaymentDto>>({});
  const [form, setForm] = useState<NewPaymentDto>({
    paymentDate: dayjs().format("YYYY-MM-DD"),
    customerId: 0,
    customerName: "",
    amount: 0,
    saleId: 0,
    purchaseId: 0,
    documentId: 0,
    documentName: "",
    documentNumber: "",
    type:
      (typeOfOperation ? TYPE_MAP[typeOfOperation] : undefined) ??
      (prefillType === "sale" ? "EINNAHME" : "AUSGABE"),
    paymentMethodId: 0,
    paymentProcessId: 0,
  });

  const amountLabel =
    form.saleId !== 0 || form.purchaseId !== 0 ? "Offener Betrag" : "Betrag";

  useEffect(() => {
    dispatch(getDocumentTypes());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getCustomersPickList())
      .unwrap()
      .catch((err) =>
        handleApiError(err, "Fehler beim Laden von Geschäftspartnern."),
      );
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
          documentId: prefill?.documentId ?? 0,
          documentName: prefill?.documentName ?? "",
          documentNumber: prefill?.documentNumber ?? "",
          paymentMethodId: 0,
          paymentProcessId: 0,
        }));
      } catch (err) {
        handleApiError(err, "Fehler beim Laden der Zahlungsdaten.");
      } finally {
        setLoadingPrefill(false);
      }
    }

    loadData();
  }, [prefillId, prefillType, typeOfOperation]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: [
        "amount",
        "customerId",
        "saleId",
        "purchaseId",
        "paymentMethodId",
        "paymentProcessId",
        "documentId",
      ].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleCreateNewCustomer = () => {
    setShowCreateCustomer(true);
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

    const { saleId, purchaseId, ...rest } = form;

    const payload = {
      ...rest,
      amount,
      ...(saleId ? { saleId } : {}),
      ...(purchaseId ? { purchaseId } : {}),
    };

    setSaving(true);
    try {
      await dispatch(addPayment(payload)).unwrap();

      showSuccessToast("Erfolg", "Die Zahlung wurde erfolgreich erstellt.");

      onClose();
    } catch (err) {
      if (isBackendValidationErrors(err)) {
        setErrors(backendErrorsToFormErrors<NewPaymentDto>(err.errors));
        return;
      } else {
        handleApiError(err, "Fehler beim Hinzufügen der Zahlung.");
      }
    } finally {
      setSaving(false);
    }
  };

  const customerMode =
    typeOfOperation || prefillType
      ? getCustomerMode(typeOfOperation, prefillType)
      : partnerMode;

  if (loadingPrefill) {
    return (
      <DraggableDialog
        open
        onClose={onClose}
        dialogWidth={800}
        title={<DialogTitleText>NEUE ZAHLUNG</DialogTitleText>}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 4,
          }}
        >
          <CircularProgress />
        </Box>
      </DraggableDialog>
    );
  }

  return (
    <DraggableDialog
      open
      onClose={isBusy ? undefined : onClose}
      dialogWidth={800}
      title={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <DialogTitleText>NEUE ZAHLUNG</DialogTitleText>

          {!typeOfOperation && (
            <FormControl
              size="small"
              sx={{
                width: 180,
                mr: 1,
              }}
            >
              <Select
                value={form.type}
                disabled={loading}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    type: e.target.value as PaymentType,
                  }))
                }
              >
                <MenuItem value="EINNAHME">Einnahme</MenuItem>
                <MenuItem value="AUSGABE">Ausgabe</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      }
      actions={
        <Button
          type="submit"
          form="create-payment-form"
          variant="contained"
          sx={primaryButtonStyle}
          disabled={isBusy}
        >
          {loading ? "Speichern..." : "Speichern"}
        </Button>
      }
    >
      <Box
        id="create-payment-form"
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          pt: 6,
          px: 3,
        }}
      >
        <Grid container spacing={3}>
          {/* Geschäftspartner + Neu + Zahlungsdatum */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={typeOfOperation ? 9 : 7}>
              {!typeOfOperation && !prefillType ? (
                <Autocomplete
                  fullWidth
                  loading={customersPickLoading}
                  options={[...customersPick].sort((a, b) =>
                    a.name.localeCompare(b.name),
                  )}
                  getOptionLabel={(option) =>
                    option.customerNumber
                      ? `${option.name} (${option.customerNumber})`
                      : option.name
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
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
                      disabled={loading}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {customersPickLoading ? (
                              <CircularProgress size={18} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              ) : (
                <TextField
                  fullWidth
                  label="Geschäftspartner"
                  value={form.customerName}
                  disabled
                />
              )}
            </Grid>

            {!typeOfOperation && !prefillType && (
              <Grid
                item
                xs={2}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleCreateNewCustomer}
                  startIcon={<AddIcon />}
                  sx={addButtonStyle}
                  disabled={loading}
                >
                  Neu
                </Button>
              </Grid>
            )}

            <Grid item xs={3}>
              <TextField
                fullWidth
                id="paymentDate"
                label="Zahlungsdatum"
                name="paymentDate"
                type="date"
                value={form.paymentDate}
                onChange={(e) => {
                  handleChange(e);

                  setErrors((prev) => clearFieldError(prev, "paymentDate"));
                }}
                InputLabelProps={{ shrink: true }}
                error={Boolean(errors.paymentDate)}
                helperText={errors.paymentDate}
                disabled={loading}
              />
            </Grid>
          </Grid>
          {/* Dokument + Dokumentnummer */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              {!typeOfOperation ? (
                <FormControl
                  fullWidth
                  error={Boolean(errors.documentId)}
                  disabled={loading}
                >
                  <InputLabel id="payment-document-label">Dokument</InputLabel>

                  <Select
                    labelId="payment-document-label"
                    id="payment-document"
                    label="Dokument"
                    value={form.documentId || ""}
                    onChange={(e: SelectChangeEvent<number>) => {
                      const selectedId = Number(e.target.value);

                      setForm((prev) => ({
                        ...prev,
                        documentId: selectedId,
                      }));

                      setErrors((prev) => clearFieldError(prev, "documentId"));
                    }}
                  >
                    <MenuItem value="">Bitte wählen</MenuItem>

                    {documentTypes.map((doc) => (
                      <MenuItem key={doc.id} value={doc.id}>
                        {doc.name}
                      </MenuItem>
                    ))}
                  </Select>

                  {errors.documentId && (
                    <FormHelperText>{errors.documentId}</FormHelperText>
                  )}
                </FormControl>
              ) : (
                <TextField
                  fullWidth
                  label="Dokument"
                  value={form.documentName || ""}
                  disabled
                />
              )}
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                id="documentNumber"
                label="Dokumentnummer"
                name="documentNumber"
                value={form.documentNumber}
                onChange={(e) => {
                  handleChange(e);

                  setErrors((prev) => clearFieldError(prev, "documentNumber"));
                }}
                error={Boolean(errors.documentNumber)}
                helperText={errors.documentNumber}
                disabled={loading}
              />
            </Grid>
          </Grid>
          {/* Betrag + Zahlungsinformationen */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                id="amount"
                label={amountLabel}
                name="amount"
                type="number"
                value={form.amount}
                onChange={(e) => {
                  handleChange(e);

                  setErrors((prev) => clearFieldError(prev, "amount"));
                }}
                error={Boolean(errors.amount)}
                helperText={errors.amount}
                disabled={loading}
                inputProps={{
                  step: 0.01,
                }}
              />
            </Grid>

            <Grid item xs={8}>
              {prefillData && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1,
                    minHeight: 56,
                    pr: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Gesamtbetrag: {formatNumber(prefillData.amount)} €
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    |
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Bezahlt: {formatNumber(prefillData.alreadyPaid)} €
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    |
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        prefillData.amountLeft > 0
                          ? colors.danger
                          : "text.secondary",
                      fontWeight: prefillData.amountLeft > 0 ? 600 : 400,
                    }}
                  >
                    Offen: {formatNumber(prefillData.amountLeft)} €
                  </Typography>

                  {prefillData.overpayment > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "success.main",
                        fontWeight: 600,
                      }}
                    >
                      | Überzahlung: {formatNumber(prefillData.overpayment)} €
                    </Typography>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
          {/* Zahlungsmethode + Zahlungsart */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                id="paymentMethod"
                select
                label="Zahlungsmethode"
                name="paymentMethodId"
                value={form.paymentMethodId || ""}
                onChange={(e) => {
                  handleChange(e);

                  setErrors((prev) => clearFieldError(prev, "paymentMethodId"));
                }}
                error={Boolean(errors.paymentMethodId)}
                helperText={errors.paymentMethodId}
                disabled={loading}
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

            <Grid item xs={6}>
              <TextField
                fullWidth
                id="paymentProcess"
                select
                label="Zahlungsart"
                name="paymentProcessId"
                value={form.paymentProcessId || ""}
                onChange={(e) => {
                  handleChange(e);

                  setErrors((prev) =>
                    clearFieldError(prev, "paymentProcessId"),
                  );
                }}
                error={Boolean(errors.paymentProcessId)}
                helperText={errors.paymentProcessId}
                disabled={loading}
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
          {/* Backend-Fehler */}
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
        </Grid>

        {/* Neuer Geschäftspartner */}
        {showCreateCustomer && (
          <CreateCustomer
            mode={customerMode}
            onClose={() => setShowCreateCustomer(false)}
            onSubmitSuccess={(createdCustomer) => {
              setShowCreateCustomer(false);

              dispatch(getCustomersPickList());

              setForm((prev) => ({
                ...prev,
                customerId: createdCustomer.id,
                customerName: createdCustomer.name,
              }));

              setErrors((prev) => clearFieldError(prev, "customerId"));
            }}
          />
        )}
      </Box>
    </DraggableDialog>
  );
}
