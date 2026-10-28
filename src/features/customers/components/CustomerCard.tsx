import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { getCustomer, selectCustomer, editCustomer } from "../customersSlice";
import { useEffect, useState } from "react";
import {
  TextField,
  Typography,
  Paper,
  Button,
  Box,
  Grid,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormHelperText,
  Tooltip,
  IconButton,
  CircularProgress,
  ListItem,
  List,
  Alert,
  ListItemText,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import Flag from "react-world-flags"; // Для отображения флагов
import { countries } from "../../../utils/countries"; // Список стран
import { showErrorToast, showSuccessToast } from "../../../utils/toast";
import { handleApiError } from "../../../utils/errors/handleApiError";
import {
  CustomerSharedErrors,
  validateCustomerSharedFields,
} from "../../../utils/validation/customerValidation";
import { isBackendValidationErrors } from "../../../utils/validation/validation";
import { mapCustomerBackendErrors } from "../../../utils/validation/customerBackendErrors";
import PageTitle from "../../../components/PageTitle";
import { colors } from "../../../styles/colors";
import { Clear as ClearIcon } from "@mui/icons-material";
import { Customer } from "../types";
import { fetchPotentialCustomerDuplicates } from "../api";
import EllipsisInput from "../../../components/ui/EllipsisInput";

type CustomerCardErrors = CustomerSharedErrors & {
  name?: string;
  customerNumber?: string;
};

export default function CustomerCard() {
  const dispatch = useAppDispatch();
  const customer = useAppSelector(selectCustomer);
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<CustomerCardErrors>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [duplicates, setDuplicates] = useState<Customer[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [duplicateCheckError, setDuplicateCheckError] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    customerNumber: "",
    address: {
      postalCode: "",
      country: "DE",
      city: "",
      street: "",
      building: "",
    },
    phone: "",
    email: "",
    website: "",
  });

  useEffect(() => {
    let active = true;

    const loadCustomer = async () => {
      setLoading(true);
      setLoadError(false);

      const id = Number(customerId);

      if (!customerId || !Number.isSafeInteger(id) || id <= 0) {
        setLoadError(true);
        setLoading(false);
        return;
      }

      try {
        await dispatch(getCustomer(id)).unwrap();
      } catch (error) {
        if (active) {
          setLoadError(true);
          handleApiError(
            error,
            "Der Geschäftspartner konnte nicht geladen werden.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadCustomer();

    return () => {
      active = false;
    };
  }, [dispatch, customerId]);

  useEffect(() => {
    if (!customer || customer.id !== Number(customerId)) {
      return;
    }

    setFormData({
      name: customer.name ?? "",
      customerNumber: customer.customerNumber ?? "",
      address: {
        postalCode: customer.address?.postalCode ?? "",
        country: customer.address?.country ?? "DE",
        city: customer.address?.city ?? "",
        street: customer.address?.street ?? "",
        building: customer.address?.building ?? "",
      },
      phone: customer.phone ?? "",
      email: customer.email ?? "",
      website: customer.website ?? "",
    });

    setErrors({});
  }, [customer, customerId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    clearFieldError(name as keyof CustomerCardErrors);
    if (name === "name") {
      setShowDuplicates(true);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));

    clearFieldError(name as keyof CustomerCardErrors);
  };

  const handleCountryChange = (e: SelectChangeEvent<string>) => {
    const { value } = e.target;

    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        country: value,
      },
    }));

    clearFieldError("country");
  };

  const clearFieldError = (field: keyof CustomerCardErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;

      const updated = { ...prev };
      delete updated[field];

      return updated;
    });
  };

  const validate = (): CustomerCardErrors => {
    const newErrors: CustomerCardErrors = {};

    const name = formData.name.trim();
    const customerNumber = formData.customerNumber.trim();

    // Name — Pflichtfeld
    if (!name) {
      newErrors.name = "Bitte ausfüllen";
    } else if (name.length < 2 || name.length > 100) {
      newErrors.name = "Die Eingabe muss zwischen 2 und 100 Zeichen lang sein.";
    }

    // Kundennummer — optional
    if (customerNumber.length > 6) {
      newErrors.customerNumber =
        "Die Kundennummer darf maximal 6 Zeichen lang sein.";
    }

    // Adresse und Kontaktdaten
    return {
      ...newErrors,
      ...validateCustomerSharedFields({
        ...formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
      }),
    };
  };

  const isCorrectCustomer =
    customer !== null &&
    customer !== undefined &&
    customer.id === Number(customerId);

  useEffect(() => {
    const name = formData.name.trim();

    if (loading || !isCorrectCustomer || name.length < 2) {
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
        const result = await fetchPotentialCustomerDuplicates(
          name,
          Number(customerId),
        );

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
  }, [formData.name, customerId, loading, isCorrectCustomer]);

  const handleSubmit = async () => {
    if (!customerId || !isCorrectCustomer || saving) return;

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);

    try {
      await dispatch(
        editCustomer({
          id: Number(customerId),
          newCustomerDto: {
            name: formData.name.trim(),
            customerNumber: formData.customerNumber.trim() || null,
            addressDto: {
              postalCode: formData.address.postalCode.trim() || null,
              country: formData.address.country,
              city: formData.address.city.trim() || null,
              street: formData.address.street.trim() || null,
              building: formData.address.building.trim() || null,
            },
            phone: formData.phone.trim() || null,
            email: formData.email.trim() || null,
            website: formData.website.trim() || null,
          },
        }),
      ).unwrap();

      showSuccessToast(
        "Erfolg",
        "Der Geschäftspartner wurde erfolgreich aktualisiert.",
      );
      navigate(-1);
    } catch (error) {
      if (isBackendValidationErrors(error)) {
        const { fieldErrors, unmappedErrors } = mapCustomerBackendErrors(
          error.errors,
        );

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        }

        if (unmappedErrors.length > 0) {
          showErrorToast("Fehler", unmappedErrors.join("\n"));
        }

        if (Object.keys(fieldErrors).length > 0 || unmappedErrors.length > 0) {
          return;
        }
      }

      handleApiError(
        error,
        "Der Geschäftspartner konnte nicht aktualisiert werden.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading || loadError || !isCorrectCustomer) {
    return (
      <Container>
        <Box mt={4}>
          <Typography variant="h6">
            {loading
              ? "Geschäftspartner wird geladen..."
              : "Geschäftspartner konnte nicht geladen werden."}
          </Typography>

          <Button variant="outlined" onClick={handleGoBack} sx={{ mt: 2 }}>
            Zurück
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Paper elevation={3} sx={{ p: 3, position: "relative" }}>
        <PageTitle>Geschäftspartner</PageTitle>

        <Tooltip title="Schließen" arrow>
          <IconButton
            onClick={() => navigate(-1)}
            disabled={saving}
            aria-label="Schließen"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1,
              color: colors.iconGrey,

              transition:
                "color 0.2s ease-in-out, background-color 0.2s ease-in-out",

              "&:hover": {
                color: colors.grey,
                transform: "scale(1.1)",
              },
            }}
          >
            <ClearIcon />
          </IconButton>
        </Tooltip>

        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} md={9}>
            <EllipsisInput
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={Boolean(errors.name)}
              helperText={errors.name}
              disabled={saving}
              fullWidth
              required
              autoComplete="off"
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label="KundenNr."
              name="customerNumber"
              value={formData.customerNumber}
              onChange={handleInputChange}
              error={Boolean(errors.customerNumber)}
              helperText={errors.customerNumber}
              disabled={saving}
              fullWidth
              inputProps={{ maxLength: 6 }}
              autoComplete="off"
            />
          </Grid>

          {showDuplicates && !checkingDuplicates && duplicates.length > 0 && (
            <Grid item xs={12}>
              <Alert
                severity="warning"
                action={
                  <Button
                    size="small"
                    color="inherit"
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
                  {duplicates.map((existing) => (
                    <ListItem
                      key={existing.id}
                      secondaryAction={
                        <Button
                          size="small"
                          onClick={() =>
                            window.open(
                              `/customer/${existing.id}`,
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
                        primary={existing.name}
                        secondary={
                          [
                            existing.customerNumber
                              ? `KundenNr.: ${existing.customerNumber}`
                              : null,
                            existing.address?.street,
                            existing.address?.building,
                            existing.address?.postalCode,
                            existing.address?.city,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Keine Adresse angegeben"
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Alert>
            </Grid>
          )}

          {checkingDuplicates && (
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={16} />
                <Typography variant="caption">
                  Geschäftspartner werden geprüft...
                </Typography>
              </Box>
            </Grid>
          )}

          {duplicateCheckError && !checkingDuplicates && (
            <Grid item xs={12}>
              <Alert severity="info">
                Die Prüfung auf mögliche Duplikate ist derzeit nicht verfügbar.
              </Alert>
            </Grid>
          )}
        </Grid>

        {/* Adresse */}
        <Box mt={4} mb={2}>

          <Box display="flex" alignItems="center" mt={2} mb={1}>
            <HomeIcon sx={{ mr: 1, color: "#00acc1" }} />

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
          {/* Land */}
          <Grid item xs={12} md={1.5}>
            <FormControl
              fullWidth
              required
              error={Boolean(errors.country)}
              disabled={saving}
            >
              <InputLabel id="country-label">Land</InputLabel>

              <Select
                labelId="country-label"
                label="Land"
                name="country"
                value={formData.address.country}
                onChange={handleCountryChange}
              >
                {countries.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    <Box display="flex" alignItems="center">
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

              {errors.country && (
                <FormHelperText>{errors.country}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Postleitzahl */}
          <Grid item xs={12} md={1.5}>
            <TextField
              label="Postleitzahl"
              name="postalCode"
              value={formData.address.postalCode}
              onChange={handleAddressChange}
              error={Boolean(errors.postalCode)}
              helperText={errors.postalCode}
              disabled={saving}
              fullWidth
              inputProps={{ maxLength: 10 }}
            />
          </Grid>

          {/* Stadt */}
          <Grid item xs={12} md={3}>
            <EllipsisInput
              label="Stadt"
              name="city"
              value={formData.address.city}
              onChange={handleAddressChange}
              error={Boolean(errors.city)}
              helperText={errors.city}
              disabled={saving}
              fullWidth
              inputProps={{ maxLength: 50 }}
            />
          </Grid>

          {/* Straße */}
          <Grid item xs={12} md={4.8}>
            <EllipsisInput
              label="Straße"
              name="street"
              value={formData.address.street}
              onChange={handleAddressChange}
              error={Boolean(errors.street)}
              helperText={errors.street}
              disabled={saving}
              fullWidth
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          {/* Hausnummer */}
          <Grid item xs={12} md={1.2}>
            <TextField
              label="HausNr."
              name="building"
              value={formData.address.building}
              onChange={handleAddressChange}
              error={Boolean(errors.building)}
              helperText={errors.building}
              disabled={saving}
              fullWidth
              inputProps={{ maxLength: 6 }}
            />
          </Grid>
        </Grid>

        {/* Kontaktdaten */}
        <Box mt={4} mb={2}>

          <Box display="flex" alignItems="center" mt={2} mb={1}>
            <ContactPhoneIcon sx={{ mr: 1, color: "#00acc1" }} />

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
          {/* Telefonnummer */}
          <Grid item xs={12} md={3}>
            <TextField
              label="Telefonnummer"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              error={Boolean(errors.phone)}
              helperText={errors.phone}
              disabled={saving}
              fullWidth
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12} md={4.5}>
            <EllipsisInput
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={Boolean(errors.email)}
              helperText={errors.email}
              disabled={saving}
              fullWidth
            />
          </Grid>

          {/* Website */}
          <Grid item xs={12} md={4.5}>
            <EllipsisInput
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              error={Boolean(errors.website)}
              helperText={errors.website}
              disabled={saving}
              fullWidth
            />
          </Grid>
        </Grid>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            mt: 4,
            mb: 1,
          }}
        >
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
            sx={{ minWidth: 140 }}
          >
            {saving ? "Speichern..." : "Aktualisieren"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
