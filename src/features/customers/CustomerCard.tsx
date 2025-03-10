import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { getCustomer, selectCustomer, editCustomer } from "./customersSlice";
import { useEffect, useState } from "react";
import NoSuchPage from "../../components/NoSuchPage";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from "@mui/material";
import { string } from "yup";
import { selectUser } from "../auth/authSlice";

export default function CustomerCard() {
    const dispatch = useAppDispatch();
    const customer = useAppSelector(selectCustomer);
    const { customerId } = useParams();
    const currentUser = useAppSelector(selectUser);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    
    const [formData, setFormData] = useState({
        name: '',
        customerNumber: '',
        address: {
            postalCode: '',
            country: '',
            city: '',
            street: '',
            building: ''
        },
        phone: '',
        email: '',
        website: ''
    });

    useEffect(() => {
        console.log("Current user:", currentUser);
        console.log("CustomerId:", customerId);
        if (customerId) {
            dispatch(getCustomer(Number(customerId)));
        }
    }, [dispatch, customerId]);

    useEffect(() => {
        console.log("Customer loaded:", customer);
        if (customer) {
            setFormData({
                name: customer.name,
                customerNumber: customer.customerNumber,
                address: customer.address,
                phone: customer.phone,
                email: customer.email,
                website: customer.website
            });
        }
    }, [customer]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            address: {
                ...prevState.address,
                [name]: value
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customerId) {
            dispatch(editCustomer({ id: Number(customerId), newCustomerDto: formData }));
        }
        setIsModalOpen(false); 
    };

    if (!customer) {
        return <NoSuchPage />;
    }

    return (
        <div>
            <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)}>
                Изменить данные
            </Button>
            
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Изменить данные поставщика</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Название"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Номер клиента"
                            name="customerNumber"
                            value={formData.customerNumber}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <h3>Адрес</h3>
                        <TextField
                            label="Почтовый индекс"
                            name="postalCode"
                            value={formData.address.postalCode}
                            onChange={handleAddressChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Страна"
                            name="country"
                            value={formData.address.country}
                            onChange={handleAddressChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Город"
                            name="city"
                            value={formData.address.city}
                            onChange={handleAddressChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Улица"
                            name="street"
                            value={formData.address.street}
                            onChange={handleAddressChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Здание"
                            name="building"
                            value={formData.address.building}
                            onChange={handleAddressChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Телефон"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Электронная почта"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Вебсайт"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsModalOpen(false)} color="secondary">
                        Отмена
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
