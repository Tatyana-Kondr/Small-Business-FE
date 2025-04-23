import {
    Box,
    Container,
    Pagination,
    Paper,
    styled,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
  } from "@mui/material";
  import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
  import {
    getPurchases,
    selectPurchases,
    selectTotalPages,
  } from "../purchasesSlice";
  import { useEffect, useState } from "react";
  import React from "react";
  
  // Стили для заголовков таблицы
  const StyledTableHead = styled(TableHead)({
    backgroundColor: "#1a3d6d",
    "& th": {
      color: "white",
      fontWeight: "bold",
      borderRight: "1px solid #ddd",
    },
  });
  
  // Стили для ячеек таблицы
  const StyledTableCell = styled(TableCell)({
    borderRight: "1px solid #ddd",
    padding: "6px 12px",
    borderBottom: "1px solid #ddd", // Разделители по горизонтали
    fontSize: "14px", // Размер шрифта
    color: "#333", // Цвет текста
  });
  
  // Стили для заголовков подтаблицы
  const StyledSubTableHead = styled(TableHead)({
    backgroundColor: "#62B1D0",
    "& th": {
      color: "white",
      fontWeight: "bold",
      borderRight: "1px solid #ddd",
    },
  });
  
  // Стили для подтаблицы
  const StyledSubTableRow = styled(TableRow)({
    backgroundColor: "#fff", // Легкий фон для подтаблицы
  });

  
  
  export default function Purchases() {
    const dispatch = useAppDispatch();
    const purchases = useAppSelector(selectPurchases);
    const totalPages = useAppSelector(selectTotalPages);
    const [page, setPage] = useState(0);
    const [searchTerm] = useState("");
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  
    useEffect(() => {
      dispatch(getPurchases({ page, searchTerm }));
    }, [dispatch, page, searchTerm]);
  
    const handlePageChange = (_: any, value: number) => {
      setPage(value - 1);
    };
  
    const handleRowClick = (id: number) => {
      setExpandedRowId((prev) => (prev === id ? null : id));
    };
  
    return (
      <Container>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            padding: "10px 0",
          }}
        ></Box>
  
        {/* Основная таблица */}
        <Box sx={{ height: "580px" }}>
          <TableContainer component={Paper}>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <TableCell style={{ display: "none" }}>ID</TableCell>
                  <TableCell>Lieferant</TableCell>
                  <TableCell>Datum</TableCell>
                  <TableCell>Betrag</TableCell>
                  <TableCell>Dokument</TableCell>
                  <TableCell>Dokumentennummer</TableCell>
                  <TableCell>PaymentStatus</TableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {purchases.length > 0 ? (
                  purchases.map((purchase) => (
                    <React.Fragment key={purchase.id}>
                      {/* Основная строка */}
                      <TableRow onClick={() => handleRowClick(purchase.id)} sx={{ cursor: "pointer" }}>
                        <StyledTableCell style={{ display: "none" }}>{purchase.id}</StyledTableCell>
                        <StyledTableCell sx={{ width: "300px" }}>{purchase.vendorName}</StyledTableCell>
                        <StyledTableCell sx={{ width: "200px" }}>{purchase.purchasingDate}</StyledTableCell>
                        <StyledTableCell align="right">{purchase.total} €</StyledTableCell>
                        <StyledTableCell>{purchase.document}</StyledTableCell>
                        <StyledTableCell>{purchase.documentNumber}</StyledTableCell>
                        <StyledTableCell>{purchase.paymentStatus}</StyledTableCell>
                      </TableRow>
  
                      {/* Подтаблица, отображается, если строка раскрыта */}
                      {expandedRowId === purchase.id && (
                        
                        <StyledSubTableRow>
                          <TableCell colSpan={7} sx={{ paddingTop: "3" }}>
                            {/* Разворачиваем таблицу на всю ширину */}
                            <Table sx={{ minWidth: "100%" }}>
                              <StyledSubTableHead>
                                <TableRow>
                                  <StyledTableCell>Artikelname</StyledTableCell>
                                  <StyledTableCell>Artikel</StyledTableCell>
                                  <StyledTableCell>Menge</StyledTableCell>
                                  <StyledTableCell>Einzelpreis</StyledTableCell>
                                  <StyledTableCell>Netto</StyledTableCell>
                                  <StyledTableCell>Mwst %</StyledTableCell>
                                  <StyledTableCell>MWst</StyledTableCell>
                                  <StyledTableCell>Brutto</StyledTableCell>
                                </TableRow>
                              </StyledSubTableHead>
                              <TableBody>
                                {purchase.purchaseItems.map((item) => (
                                  <TableRow key={item.id}>
                                    <StyledTableCell sx={{width: "300px", borderRight: "1px solid #ddd"}}>{item.productName}</StyledTableCell>
                                    <StyledTableCell sx={{width: "150px"}}>{item.productArticle}</StyledTableCell>
                                    <StyledTableCell >{item.quantity}</StyledTableCell>
                                    <StyledTableCell>{item.unitPrice} €</StyledTableCell>
                                    <StyledTableCell>{item.totalPrice} €</StyledTableCell>
                                    <StyledTableCell>{item.taxPercentage}%</StyledTableCell>
                                    <StyledTableCell>{item.taxAmount} €</StyledTableCell>
                                    <StyledTableCell>{item.totalAmount} €</StyledTableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableCell>
                        </StyledSubTableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Keine Bestellungen gefunden
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
            count={totalPages}
            page={page + 1}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Container>
    );
  }
  