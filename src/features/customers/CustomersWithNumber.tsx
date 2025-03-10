import { useEffect, useState } from "react"
import { 
    Container, Typography, MenuItem, Select, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, Box, Pagination 
} from "@mui/material"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { styled } from "@mui/material/styles"
import { getCustomersWithCustomerNumber, selectCustomersWithCustomerNumber } from "./customersSlice"

// Стили для заголовков таблицы
const StyledTableHead = styled(TableHead)({
  backgroundColor: "#1a3d6d",
  "& th": {
    color: "white",
    fontWeight: "bold",
    borderRight: "1px solid #ddd",
  },
})


export default function CustomersWithNumber() {
    const dispatch = useAppDispatch()
    const customers = useAppSelector(selectCustomersWithCustomerNumber)
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(10)

    useEffect(() => {
        dispatch(getCustomersWithCustomerNumber({ page, size: pageSize }))
    }, [dispatch, page, pageSize])

    return (
        <Container>
            {/* Верхняя панель */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Kunden</Typography>
                <Select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                >
                    <MenuItem value={5}>5 товаров</MenuItem>
                    <MenuItem value={10}>10 товаров</MenuItem>
                    <MenuItem value={20}>20 товаров</MenuItem>
                </Select>
            </Box>

            {/* Таблица */}
            <TableContainer component={Paper}>
                <Table>
                    <StyledTableHead>
                        <TableRow>
                            <TableCell style={{ display: "none" }}>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>KundenNr</TableCell>
                            <TableCell>Adresse</TableCell>
                            <TableCell>Telefon</TableCell>
                            <TableCell>EMail</TableCell>
                            <TableCell>Webseite</TableCell>
                        </TableRow>
                    </StyledTableHead>
                    <TableBody>
                        {customers.length > 0 ? (
                            customers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell style={{ display: "none", padding: "6px 12px" }}>{customer.id}</TableCell>
                                    <TableCell sx={{ width: "500px", padding: "6px 12px", borderRight: "1px solid #ddd" }}>{customer.name}</TableCell>
                                    <TableCell sx={{  padding: "6px 12px", borderRight: "1px solid #ddd" }}>{customer.customerNumber}</TableCell>
                                    <TableCell sx={{ width: "800px", padding: "6px 12px", borderRight: "1px solid #ddd" }}>
                                    {customer.address 
                                        ? `${customer.address.country}, ${customer.address.postalCode} ${customer.address.city} ${customer.address.street}  ${customer.address.building}`: ""}
                                    </TableCell>
                                    <TableCell sx={{  padding: "6px 12px", borderRight: "1px solid #ddd" }}>{customer.phone}</TableCell>
                                    <TableCell sx={{  padding: "6px 12px", borderRight: "1px solid #ddd" }}>{customer.email}</TableCell>
                                    <TableCell sx={{  padding: "6px 12px", borderRight: "1px solid #ddd" }}>{customer.website}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={11} align="center">Keine Lieferanten gefunden</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Пагинация */}
            <Box display="flex" justifyContent="center" mt={2}>
                <Pagination 
                    count={5} // Количество страниц (должно приходить с API)
                    page={page + 1} 
                    onChange={(_, value) => setPage(value - 1)} 
                    color="primary"
                />
            </Box>
        </Container>
    )
}
