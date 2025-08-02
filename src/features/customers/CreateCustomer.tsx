import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import { useAppDispatch } from "../../redux/hooks";
import { addCustomer } from "./customersSlice";
import { countries } from "../../utils/countries";
import Flag from "react-world-flags";
import { Customer } from "./types";


type CreateCustomerProps = {
  onClose: () => void;
  onSubmitSuccess: (customer: Customer) => void;
};

export default function CreateCustomer({ onClose, onSubmitSuccess }: CreateCustomerProps) {
  const dispatch = useAppDispatch();

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
    const newErrors = { email: "", phone: "", website: "" };

    if (formData.email && !/^[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+$/.test(formData.email)) {
      newErrors.email = "Falsche Email";
    }
    if (formData.phone && !/^\+?[0-9\s.-]{6,}$/.test(formData.phone)) {
      newErrors.phone = "Falsche Telefonnummer";
    }
    if (formData.website && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-./?%&=]*)?$/.test(formData.website)) {
      newErrors.website = "Falsche Website-Adresse";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => !e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newCustomerDto = {
      name: formData.name,
      customerNumber: formData.customerNumber || null,
      addressDto: {
        country: formData.countryCode,
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
      const createdCustomer = await dispatch(addCustomer({ newCustomerDto })).unwrap();
      onSubmitSuccess(createdCustomer);
      onClose();
    } catch (error) {
      console.error("Fehler beim Erstellen:", error);
      alert("Der Kunde/Lieferant konnte nicht erstellt werden.");
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", textDecoration: "underline", color: "#0277bd" }}>
        Neuer Kunde/Lieferant anlegen
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                id="name"
                fullWidth
                required
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="customerNumber"
                fullWidth
                label="Kundennummer"
                name="customerNumber"
                value={formData.customerNumber}
                onChange={handleChange}
                placeholder="(optional)"
                helperText="ausschließlich für Kunden"
              />
            </Grid>
          </Grid>

          {/* Adresse */}
          <Box mt={5} mb={2}>
            <Divider />
            <Box display="flex" alignItems="center" mt={2} mb={1}>
              <HomeIcon sx={{ mr: 1, color: "#00acc1" }} />
              <Typography variant="h6" sx={{ color: "#00acc1" }}>Adresse</Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            {[
              { id: "postalCode", label: "Postleitzahl", name: "postalCode" },
              { id: "countryCode", label: "Land", name: "countryCode" },
              { id: "city", label: "Stadt", name: "city" },
              { id: "street", label: "Strasse", name: "street" },
              { id: "building", label: "Hausnummer", name: "building" },
            ].map((field) => (
              <Grid item xs={12} md={6} key={field.name}>
                {field.name === "countryCode" ? (
                  <FormControl fullWidth required>
                    <InputLabel id="country-label" htmlFor="countryCode">Land</InputLabel>
                    <Select
                      id="countryCode"
                      labelId="country-label"
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                      label="Land"
                    >
                      {countries.map((country) => (
                        <MenuItem key={country.code} value={country.code}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Flag code={country.code} style={{ width: 24, height: 16, marginRight: 8 }} />
                            {country.name} ({country.code})
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    id={field.id}
                    fullWidth
                    required
                    label={field.label}
                    name={field.name}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleChange}
                  />
                )}
              </Grid>
            ))}
          </Grid>

          {/* Kontaktdaten */}
          <Box mt={5} mb={2}>
            <Divider />
            <Box display="flex" alignItems="center" mt={2} mb={1}>
              <ContactPhoneIcon sx={{ mr: 1, color: "#00acc1" }} />
              <Typography variant="h6" sx={{ color: "#00acc1" }}>Kontaktdaten</Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            {[
              { id: "phone", label: "Telefonnummer", name: "phone", error: errors.phone },
              { id: "email", label: "Email", name: "email", error: errors.email },
              { id: "website", label: "Website", name: "website", error: errors.website },
            ].map((field) => (
              <Grid item xs={12} md={6} key={field.name}>
                <TextField
                  id={field.id}
                  fullWidth
                  label={field.label}
                  name={field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  placeholder="(optional)"
                  error={!!field.error}
                  helperText={field.error}
                />
              </Grid>
            ))}
          </Grid>

          <Box mt={5}>
            <Grid container spacing={2} justifyContent="flex-end">
              <Grid item>
                <Button onClick={onClose} sx={{ "&:hover": { borderColor: "#00acc1" } }}>
                  Abbrechen
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" color="primary" type="submit">
                  Speichern
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}