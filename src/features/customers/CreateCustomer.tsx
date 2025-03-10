import { useState } from "react";
import { Container, TextField, Button, Box, Typography } from "@mui/material";
import { useAppDispatch } from "../../redux/hooks";
import { addCustomer } from "./customersSlice";
import { useNavigate } from "react-router-dom";

export default function CreateCustomer() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    customerNumber: "", // Можно оставить пустым
    country: "",
    city: "",
    street: "",
    building: "",
    postalCode: "",
    phone: "",
    email: "",
    website: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCustomerDto = {
      name: formData.name,
      customerNumber: formData.customerNumber || null, 
      address: {
        country: formData.country,
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
      navigate("/customers"); // Перенаправление после успешного создания
    } catch (error) {
      console.error("Ошибка при создании клиента:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h5" mb={2}>Create New Customer</Typography>
      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} required />
        <TextField fullWidth label="Customer Number" name="customerNumber" value={formData.customerNumber} onChange={handleChange} placeholder="(optional)" />
        <TextField fullWidth label="Country" name="country" value={formData.country} onChange={handleChange} required />
        <TextField fullWidth label="City" name="city" value={formData.city} onChange={handleChange} required />
        <TextField fullWidth label="Street" name="street" value={formData.street} onChange={handleChange} required />
        <TextField fullWidth label="Building" name="building" value={formData.building} onChange={handleChange} required />
        <TextField fullWidth label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleChange} required />
        <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="(optional)" />
        <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} placeholder="(optional)" />
        <TextField fullWidth label="Website" name="website" value={formData.website} onChange={handleChange} placeholder="(optional)" />

        <Box mt={2}>
          <Button variant="contained" color="primary" type="submit">Create</Button>
        </Box>
      </form>
    </Container>
  );
}
