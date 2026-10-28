import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  ListItem,
  List,
  ListItemText,
  Alert,
  CircularProgress,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";

import { addCustomer, selectLoading } from "../customersSlice";

import { Customer, NewCustomerDto } from "../types";

import { countries } from "../../../utils/countries";
import Flag from "react-world-flags";

import { showErrorToast, showSuccessToast } from "../../../utils/toast";
import { handleApiError } from "../../../utils/errors/handleApiError";

import DraggableDialog from "../../../components/DraggableDialog";
import DialogTitleText from "../../../components/DialogTitleText";

import { primaryButtonStyle } from "../../../styles/buttonStyles";

import {
  FormErrors,
  hasErrors,
  isBackendValidationErrors,
} from "../../../utils/validation/validation";

import { validateCustomerSharedFields } from "../../../utils/validation/customerValidation";
import { mapCustomerBackendErrors } from "../../../utils/validation/customerBackendErrors";
import { fetchPotentialCustomerDuplicates } from "../api";
import EllipsisInput from "../../../components/ui/EllipsisInput";

type CreateCustomerProps = {
  onClose: () => void;
  onSubmitSuccess: (customer: Customer) => void;
  mode: "customer" | "vendor";
};

type CustomerFormData = {
  name: string;
  customerNumber: string;
  countryCode: string;
  city: string;
  street: string;
  building: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
};

export default function CreateCustomer({
  onClose,
  onSubmitSuccess,
  mode,
}: CreateCustomerProps) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectLoading);

  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    customerNumber: "",
    countryCode: "DE",
    city: "",
    street: "",
    building: "",
    postalCode: "",
    phone: "",
    email: "",
    website: "",
  });

  const [errors, setErrors] = useState<FormErrors<CustomerFormData>>({});

  const [duplicates, setDuplicates] = useState<Customer[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [duplicateCheckError, setDuplicateCheckError] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(true);

  useEffect(() => {
    const name = formData.name.trim();

    if (name.length < 2) {
      setDuplicates([]);
      setCheckingDuplicates(false);
      setDuplicateCheckError(false);
      return;
    }

    let cancelled = false;

    setDuplicates([]);
    setCheckingDuplicates(true);
    setDuplicateCheckError(false);

    const timer = window.setTimeout(async () => {
      try {
        const result = await fetchPotentialCustomerDuplicates(name);

        if (!cancelled) {
          setDuplicates(result);
        }
      } catch {
        if (!cancelled) {
          setDuplicateCheckError(true);
        }
      } finally {
        if (!cancelled) {
          setCheckingDuplicates(false);
        }
      }
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [formData.name]);

  const clearError = (field: keyof CustomerFormData) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    clearError(name as keyof CustomerFormData);
    if (name === "name") {
      setShowDuplicates(true);
    }
  };

  const validate = (): FormErrors<CustomerFormData> => {
    const newErrors: FormErrors<CustomerFormData> = {};

    const name = formData.name.trim();
    const customerNumber = formData.customerNumber.trim();

    // Name
    if (!name) {
      newErrors.name = "Bitte ausfüllen";
    } else if (name.length < 2 || name.length > 200) {
      newErrors.name = "Die Eingabe muss zwischen 2 und 200 Zeichen lang sein.";
    }

    // Kundennummer — Pflichtfeld nur für Kunden
    if (mode === "customer") {
      if (!customerNumber) {
        newErrors.customerNumber = "Bitte ausfüllen";
      } else if (customerNumber.length > 6) {
        newErrors.customerNumber =
          "Die Kundennummer darf maximal 6 Zeichen lang sein.";
      }
    }

    const { country, ...otherErrors } = validateCustomerSharedFields({
      postalCode: formData.postalCode,
      country: formData.countryCode,
      city: formData.city,
      street: formData.street,
      building: formData.building,
      phone: formData.phone,
      email: formData.email,
      website: formData.website,
    });

    Object.assign(newErrors, otherErrors);

    if (country) {
      newErrors.countryCode = country;
    }

    return newErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validate();

    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    const newCustomerDto: NewCustomerDto = {
      name: formData.name.trim(),

      customerNumber:
        mode === "customer" ? formData.customerNumber.trim() || null : null,

      addressDto: {
        country: formData.countryCode,
        postalCode: formData.postalCode.trim() || null,
        city: formData.city.trim() || null,
        street: formData.street.trim() || null,
        building: formData.building.trim() || null,
      },

      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      website: formData.website.trim() || null,
    };

    try {
      const createdCustomer = await dispatch(
        addCustomer({ newCustomerDto }),
      ).unwrap();

      showSuccessToast(
        "Erfolg",
        `${createdCustomer.name} wurde erfolgreich erstellt.`,
      );

      onSubmitSuccess(createdCustomer);
      onClose();
    } catch (error) {
      if (isBackendValidationErrors(error)) {
        const { fieldErrors, unmappedErrors } = mapCustomerBackendErrors(
          error.errors,
        );

        const { country, ...otherErrors } = fieldErrors;

        const mappedErrors: FormErrors<CustomerFormData> = {
          ...otherErrors,
          ...(country ? { countryCode: country } : {}),
        };

        if (hasErrors(mappedErrors)) {
          setErrors(mappedErrors);
        }

        if (unmappedErrors.length > 0) {
          showErrorToast("Fehler", unmappedErrors.join("\n"));
        }

        if (hasErrors(mappedErrors) || unmappedErrors.length > 0) {
          return;
        }
      }

      handleApiError(
        error,
        "Der Kunde/Lieferant konnte nicht erstellt werden.",
      );
    }
  };

  return (
    <DraggableDialog
      open
      onClose={loading ? undefined : onClose}
      dialogWidth={1100}
      title={
        <DialogTitleText>
          {mode === "customer"
            ? "Neuen Kunden anlegen"
            : "Neuen Lieferanten anlegen"}
        </DialogTitleText>
      }
      actions={
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={primaryButtonStyle}
        >
          {loading ? "Speichern..." : "Speichern"}
        </Button>
      }
    >
      <Box component="form" onSubmit={handleSubmit} autoComplete="off">
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={mode === "customer" ? 9 : 12}>
            <EllipsisInput
              id="name"
              fullWidth
              required
              autoFocus
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={Boolean(errors.name)}
              helperText={errors.name}
              disabled={loading}
              inputProps={{ maxLength: 200 }}
              autoComplete="off"
            />
          </Grid>

          {mode === "customer" && (
            <Grid item xs={12} md={3}>
              <TextField
                id="customerNumber"
                fullWidth
                required
                label="KundenNr."
                name="customerNumber"
                value={formData.customerNumber}
                onChange={handleChange}
                error={Boolean(errors.customerNumber)}
                helperText={errors.customerNumber}
                disabled={loading}
                inputProps={{ maxLength: 6 }}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            {checkingDuplicates && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  Geschäftspartner werden geprüft...
                </Typography>
              </Box>
            )}

            {duplicateCheckError && !checkingDuplicates && (
              <Alert severity="info">
                Die Prüfung auf mögliche Duplikate ist derzeit nicht verfügbar.
              </Alert>
            )}

            {showDuplicates && !checkingDuplicates && duplicates.length > 0 && (
              <Alert
                severity="warning"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => setShowDuplicates(false)}
                  >
                    Ausblenden
                  </Button>
                }
              >
                <Typography variant="body2" fontWeight="bold">
                  Es wurden {duplicates.length} mögliche Übereinstimmung(en)
                  gefunden. Bitte prüfen Sie die vorhandenen Einträge.
                </Typography>

                <List dense disablePadding sx={{ mt: 1 }}>
                  {duplicates.map((customer) => (
                    <ListItem
                      key={customer.id}
                      disableGutters
                      secondaryAction={
                        <Button
                          size="small"
                          onClick={() =>
                            window.open(
                              `/customer/${customer.id}`,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                        >
                          Öffnen
                        </Button>
                      }
                      sx={{ pr: 10 }}
                    >
                      <ListItemText
                        primary={customer.name}
                        secondary={
                          [
                            customer.customerNumber
                              ? `KundenNr.: ${customer.customerNumber}`
                              : null,
                            customer.address?.street,
                            customer.address?.building,
                            customer.address?.postalCode,
                            customer.address?.city,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Keine Adresse angegeben"
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="caption">
                  Sie können den vorhandenen Geschäftspartner öffnen oder mit
                  der Neuanlage fortfahren.
                </Typography>
              </Alert>
            )}
          </Grid>
        </Grid>

        {/* Adresse */}
        <Box mt={4} mb={2}>
          <Box display="flex" alignItems="center" mt={2} mb={1}>
            <HomeIcon
              sx={{
                mr: 1,
                color: "#00acc1",
              }}
            />

            <Typography
              sx={{
                color: "#00acc1",
                fontWeight: "bold",
              }}
            >
              Adresse
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={1.5}>
            <FormControl
              fullWidth
              required
              error={Boolean(errors.countryCode)}
              disabled={loading}
            >
              <InputLabel id="country-label">Land</InputLabel>

              <Select
                id="countryCode"
                labelId="country-label"
                name="countryCode"
                value={formData.countryCode}
                label="Land"
                onChange={(event) => {
                  setFormData((prev) => ({
                    ...prev,
                    countryCode: event.target.value,
                  }));

                  clearError("countryCode");
                }}
              >
                {countries.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Flag
                        code={country.code}
                        style={{
                          width: 24,
                          height: 16,
                          marginRight: 8,
                        }}
                      />
                      ({country.code})
                    </Box>
                  </MenuItem>
                ))}
              </Select>

              {errors.countryCode && (
                <FormHelperText>{errors.countryCode}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={1.5}>
            <TextField
              id="postalCode"
              fullWidth
              label="Postleitzahl"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              error={Boolean(errors.postalCode)}
              helperText={errors.postalCode}
              disabled={loading}
              inputProps={{ maxLength: 10 }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <EllipsisInput
              id="city"
              fullWidth
              label="Stadt"
              name="city"
              value={formData.city}
              onChange={handleChange}
              error={Boolean(errors.city)}
              helperText={errors.city}
              disabled={loading}
              inputProps={{ maxLength: 50 }}
            />
          </Grid>

          <Grid item xs={12} md={4.8}>
            <EllipsisInput
              id="street"
              fullWidth
              label="Straße"
              name="street"
              value={formData.street}
              onChange={handleChange}
              error={Boolean(errors.street)}
              helperText={errors.street}
              disabled={loading}
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          <Grid item xs={12} md={1.2}>
            <TextField
              id="building"
              fullWidth
              label="HausNr"
              name="building"
              value={formData.building}
              onChange={handleChange}
              error={Boolean(errors.building)}
              helperText={errors.building}
              disabled={loading}
              inputProps={{ maxLength: 6 }}
            />
          </Grid>
        </Grid>

        {/* Kontaktdaten */}
        <Box mt={4} mb={2}>
          <Box display="flex" alignItems="center" mt={2} mb={1}>
            <ContactPhoneIcon
              sx={{
                mr: 1,
                color: "#00acc1",
              }}
            />

            <Typography
              sx={{
                color: "#00acc1",
                fontWeight: "bold",
              }}
            >
              Kontaktdaten
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              id="phone"
              fullWidth
              label="Telefonnummer"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(optional)"
              error={Boolean(errors.phone)}
              helperText={errors.phone}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={4.5}>
            <EllipsisInput
              id="email"
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="(optional)"
              error={Boolean(errors.email)}
              helperText={errors.email}
              disabled={loading}
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          <Grid item xs={12} md={4.5}>
            <EllipsisInput
              id="website"
              fullWidth
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="(optional)"
              error={Boolean(errors.website)}
              helperText={errors.website}
              disabled={loading}
              inputProps={{ maxLength: 255 }}
            />
          </Grid>
        </Grid>
      </Box>
    </DraggableDialog>
  );
}
