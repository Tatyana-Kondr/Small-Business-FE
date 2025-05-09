import { useEffect, useState } from "react"
import {
    Container, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Box, Pagination,
    Button
} from "@mui/material"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { styled } from "@mui/material/styles"
import { getCustomersWithCustomerNumber, selectCurrentPage, selectCustomersWithCustomerNumber, selectTotalPages } from "./customersSlice"
import { useNavigate } from "react-router-dom"

// Стили для заголовков таблицы
const StyledTableHead = styled(TableHead)({
    backgroundColor: "#1a3d6d",
    "& th": {
        color: "white",
        fontWeight: "bold",
        borderRight: "1px solid #ddd",
    },
});

// Стили для строки таблицы с эффектом наведения
const StyledTableRow = styled(TableRow)({
    "&:hover": {
        backgroundColor: "#f5f5f5", // Подсветка строки при наведении
        cursor: "pointer",
    },
});


export default function CustomersWithNumber() {
    const dispatch = useAppDispatch()
    const customers = useAppSelector(selectCustomersWithCustomerNumber)
    const totalPages = useAppSelector(selectTotalPages); // Получаем количество страниц
    const currentPage = useAppSelector(selectCurrentPage); // Получаем текущую страницу
    const [page, setPage] = useState(currentPage); // Состояние для текущей страницы
    const [pageSize] = useState(15); // Количество элементов на странице
    const navigate = useNavigate(); // Для навигации по роутам

    useEffect(() => {
        dispatch(getCustomersWithCustomerNumber({ page, size: pageSize }))
    }, [dispatch, page, pageSize])

    const handleRowDoubleClick = (customerId: number) => {
        navigate(`/kunde/${customerId}`);
    };

    const handlePaginationChange = (_: unknown, newPage: number) => {
        setPage(newPage - 1); // Обновляем страницу
    };

    return (
        <Container>
            {/* Верхняя панель */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} sx={{
                position: "sticky", // Сделаем панель фиксированной
                top: 0, // Закрепим сверху
                zIndex: 1000, // Повышаем приоритет на случай, если другие элементы будут сверху
                padding: "10px 0", // Отступы
            }}>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#0776A0" }}>Kunden</Typography>

                <Box display="flex" gap={2}>
                    {/* Кнопка для создания нового клиента */}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate("/create-customer")}
                    >
                        Neuen Kunden anlegen
                    </Button>
                </Box>
            </Box>

            {/* Таблица */}
            <Box sx={{ height: "550px" }}>
                <TableContainer component={Paper}>
                    <Table>
                        <StyledTableHead>
                            <TableRow>
                                <TableCell style={{ display: "none" }}>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Kundennummer</TableCell>
                                <TableCell>Adresse</TableCell>
                                <TableCell>Telefon</TableCell>
                                <TableCell>E-Mail</TableCell>
                                <TableCell>Webseite</TableCell>
                            </TableRow>
                        </StyledTableHead>
                        <TableBody>
                            {customers.length > 0 ? (
                                customers.map((customer) => (
                                    <StyledTableRow
                                        key={customer.id}
                                        onDoubleClick={() => handleRowDoubleClick(customer.id)}
                                    >
                                        <TableCell style={{ display: "none", padding: "6px 12px" }}>{customer.id}</TableCell>
                                        <TableCell sx={{ width: "500px", padding: "6px 12px", borderRight: "1px solid #ddd" }}>
                                            {customer.name}
                                        </TableCell>
                                        <TableCell sx={{ padding: "6px 12px", borderRight: "1px solid #ddd" }}>{customer.customerNumber}</TableCell>
                                        <TableCell sx={{ width: "800px", padding: "6px 12px", borderRight: "1px solid #ddd" }}>
                                            {customer.address
                                                ? `${customer.address.country}, ${customer.address.postalCode} ${customer.address.city} ${customer.address.street} ${customer.address.building}`
                                                : ""}
                                        </TableCell>
                                        <TableCell sx={{ padding: "6px 12px", borderRight: "1px solid #ddd" }}>{customer.phone}</TableCell>
                                        <TableCell sx={{ padding: "6px 12px", borderRight: "1px solid #ddd" }}>{customer.email}</TableCell>
                                        <TableCell sx={{ padding: "6px 12px", borderRight: "1px solid #ddd" }}>{customer.website}</TableCell>
                                    </StyledTableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={11} align="center">
                                        Keine Kunden gefunden
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Пагинация */}
            <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                    count={totalPages} // Количество страниц зависит от totalPages из состояния
                    page={page + 1} // Пагинация начинается с 1
                    onChange={handlePaginationChange} // Обработчик изменения страницы
                    color="primary"
                />
            </Box>
        </Container>
    );
}
