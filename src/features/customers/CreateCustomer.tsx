import { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import { useAppDispatch } from "../../redux/hooks";
import { addCustomer } from "./customersSlice";
import { useNavigate } from "react-router-dom";
import { countries } from "../../utils/countries";
import Flag from "react-world-flags";
import { ArrowBackIos } from "@mui/icons-material";

export default function CreateCustomer() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    website: "",
  });

  const validate = () => {
    const newErrors: typeof errors = { email: "", phone: "", website: "" };

    if (formData.email && !/^[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+$/.test(formData.email)) {
      newErrors.email = "Falsche Email";
    }

    if (formData.phone && !/^\+?[0-9]{1,3}[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/.test(formData.phone)) {
      newErrors.phone = "Falsche Telefonnummer";
    }

    if (formData.website && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-./?%&=]*)?$/.test(formData.website)) {
      newErrors.website = "Falsche Website-Adresse";
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((e) => !e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Очистить ошибку при вводе
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const newCustomerDto = {
      name: formData.name,
      customerNumber: formData.customerNumber || null,
      addressDto: {
        country: formData.countryCode, // Отправляем countryCode (например "DE")
        city: formData.city,
        street: formData.street,
        building: formData.building,
        postalCode: formData.postalCode,
      },
      phone: formData.phone || null,
      email: formData.email || null,
      website: formData.website || null,
    };

    try {
      await dispatch(addCustomer({ newCustomerDto })).unwrap();
      navigate(-1);
    } catch (error) {
      console.error("Fehler beim Erstellen:", error);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom  sx={{ fontWeight: "bold", color: "#01579b", marginBottom: 3}}>
          Neuer Kunde/Lieferant anlegen
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Kundennummer"
                name="customerNumber"
                value={formData.customerNumber}
                onChange={handleChange}
                placeholder="(optional)"
                helperText={"ausschließlich für Kunden"}
              />
            </Grid>
          </Grid>

          {/* Adresse */}
          <Box mt={5} mb={2}>
            <Divider />
            <Box display="flex" alignItems="center" mt={2} mb={1}>
              <HomeIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="h6">Adresse</Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            {[
              { label: "Postleitzahl", name: "postalCode", required: true },
              { label: "Land", name: "countryCode", required: true },
              { label: "Stadt", name: "city", required: true },
              { label: "Strasse", name: "street", required: true },
              { label: "Hausnummer", name: "building", required: true },
            ].map((field) => (
              <Grid item xs={12} md={6} key={field.name}>
                {field.name === "countryCode" ? (
                  <FormControl fullWidth required>
                    <InputLabel id="country-label">Country</InputLabel>
                    <Select
                      labelId="country-label"
                      id="country"
                      name={field.name}
                      value={formData.countryCode} // по умолчанию будет "DE"
                      onChange={(e) =>
                        setFormData({ ...formData, countryCode: e.target.value })
                      }
                      label="Land"
                    >
                      {countries.map((country) => (
                        <MenuItem key={country.code} value={country.code}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Flag code={country.code} style={{ width: 24, height: 16, marginRight: 8 }} />
                            {country.name} ({country.code}) {/* Отображаем флаг, название и код страны */}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    label={field.label}
                    name={field.name}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleChange}
                    required={field.required}
                  />
                )}
              </Grid>
            ))}
          </Grid>

          {/* Kontaktdaten */}
          <Box mt={5} mb={2}>
            <Divider />
            <Box display="flex" alignItems="center" mt={2} mb={1}>
              <ContactPhoneIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="h6">Kontaktdaten</Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefonnummer"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(optional)"
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="(optional)"
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="(optional)"
                error={!!errors.website}
                helperText={errors.website}
              />
            </Grid>
          </Grid>

          <Box mt={5} display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Button variant="outlined" color="secondary" startIcon={<ArrowBackIos />} onClick={handleCancel}>
              Zurückgehen
            </Button>
            <Button variant="contained" color="primary" type="submit">
              Speichern
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
