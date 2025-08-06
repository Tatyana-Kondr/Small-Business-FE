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
} from "@mui/material";
import { ArrowBackIos } from "@mui/icons-material";
import HomeIcon from "@mui/icons-material/Home";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import Flag from "react-world-flags"; // Для отображения флагов
import { countries } from "../../../utils/countries"; // Список стран

export default function CustomerWithNumberCard() {
    const dispatch = useAppDispatch();
    const customer = useAppSelector(selectCustomer);
    const { customerId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        customerNumber: "",
        address: {
            postalCode: "",
            country: "DE", // Значение по умолчанию для страны
            city: "",
            street: "",
            building: "",
        },
        phone: "",
        email: "",
        website: "",
    });

    useEffect(() => {
        if (customerId) {
            dispatch(getCustomer(Number(customerId)));
        }
    }, [dispatch, customerId]);

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name,
                customerNumber: customer.customerNumber || "",
                address: customer.address || {
                    postalCode: "",
                    country: "DE", // Значение по умолчанию для страны
                    city: "",
                    street: "",
                    building: "",
                },
                phone: customer.phone || "",
                email: customer.email || "",
                website: customer.website || "",
            });
        }
    }, [customer]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddressChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            address: {
                ...prev.address,
                [name]: value,
            },
        }));
    };


    const handleSubmit = () => {
        if (customerId) {
            dispatch(
                editCustomer({
                    id: Number(customerId),
                    newCustomerDto: {
                        name: formData.name,
                        customerNumber: formData.customerNumber || null,
                        addressDto: formData.address,
                        phone: formData.phone || null,
                        email: formData.email || null,
                        website: formData.website || null,
                    },
                })
            ).then(() => {
                navigate("/kunden");
            });
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    if (!customer) {
        return (
            <Container>
                <Box mt={4}>
                    <Typography variant="h6">Lieferant nicht gefunden</Typography>
                    <Button variant="contained" color="primary" onClick={handleGoBack} sx={{ mt: 2 }}>
                        Go Back
                    </Button>
                </Box>
            </Container>
        )
    }


    return (
        <Container>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" mb={3} sx={{ textAlign: "left", fontWeight: "bold", textDecoration: "underline", color: "#0277bd" }}>
                    Kundeninformation
                </Typography>

                <Grid container spacing={2} mt={1}>
                    <Grid item xs={12} md={9}>
                        <TextField
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            label="Kundennummer"
                            name="customerNumber"
                            value={formData.customerNumber}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3} mt={1}>
                    {/* Левая колонка — Адрес */}
                    <Grid item xs={12} md={6}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <HomeIcon sx={{ mr: 1, color: "#00acc1" }} />
                            <Typography sx={{ color: "#00acc1", fontWeight: "bold" }}>Adresse</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    label="Postleitzahl"
                                    name="postalCode"
                                    value={formData.address.postalCode}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="country-label">Land</InputLabel>
                                    <Select
                                        labelId="country-label"
                                        name="country"
                                        value={formData.address.country}
                                        onChange={handleAddressChange}
                                    >
                                        {countries.map((country) => (
                                            <MenuItem key={country.code} value={country.code}>
                                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                                    <Flag
                                                        code={country.code}
                                                        style={{
                                                            width: 24,
                                                            height: 16,
                                                            marginRight: 8,
                                                        }}
                                                    />
                                                    {country.name} ({country.code})
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <TextField
                            label="Stadt"
                            name="city"
                            value={formData.address.city}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Strasse"
                            name="street"
                            value={formData.address.street}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Hausnummer"
                            name="building"
                            value={formData.address.building}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                    </Grid>

                    {/* Правая колонка — Контакты и номер */}
                    <Grid item xs={12} md={6}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <ContactPhoneIcon sx={{ mr: 1, color: "#00acc1" }} />
                            <Typography sx={{ color: "#00acc1", fontWeight: "bold" }}>Kontaktdaten</Typography>
                        </Box>
                        <TextField
                            label="Telefonnummer"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="E-Mail"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Website"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                    </Grid>
                </Grid>

                <Box mt={3} display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
                    <Button variant="outlined" color="primary" startIcon={<ArrowBackIos />} onClick={handleGoBack} sx={{ "&:hover": { borderColor: "#00acc1" } }}>
                        Zurückgehen
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ width: 200 }}>
                        Speichern
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}