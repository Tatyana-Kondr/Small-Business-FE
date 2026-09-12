import { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";

import {
  getCustomersWithCustomerNumber,
  selectCustomersWithCustomerNumber,
  selectCustomersVersion,
  selectTotalPages,
  searchCustomersWithCustomerNumber,
} from "../customersSlice";

import DeleteCustomer from "./DeleteCustomer";
import HoverExpandText from "../../../components/ui/HoverExpandText";

import {
  listPageStyle,
  listPaginationStyle,
  listTableAreaStyle,
  pageToolbarStyle,
} from "../../../styles/formStyles";

import {
  actionCellStyle,
  actionIconButtonStyle,
  cellStyle,
  centerCellStyle,
  fixedCellWidth,
  hoverExpandCellStyle,
  leftBorderCellStyle,
  StyledTableHead,
  tableContainerStyle,
  tableRowHoverStyle,
  tableStyle,
} from "../../../styles/tableStyles";

import { colors } from "../../../styles/colors";
import { getAdaptivePageSize } from "../../../utils/getAdaptivePageSize";
import SearchBox from "../../../components/ui/SearchBox";
import PageTitle from "../../../components/PageTitle";

export default function CustomersWithNumber() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const customers = useAppSelector(selectCustomersWithCustomerNumber);
  const totalPages = useAppSelector(selectTotalPages);
  const customersVersion = useAppSelector(selectCustomersVersion);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(getAdaptivePageSize);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handleResize = () => {
      const newPageSize = getAdaptivePageSize();

      setPageSize((prev) => {
        if (prev === newPageSize) {
          return prev;
        }

        setPage(0);
        return newPageSize;
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      dispatch(
        searchCustomersWithCustomerNumber({
          page,
          size: pageSize,
          query: debouncedSearchTerm,
          sort: "name",
        }),
      );
    } else {
      dispatch(
        getCustomersWithCustomerNumber({
          page,
          size: pageSize,
          sort: "name",
        }),
      );
    }
  }, [dispatch, page, pageSize, debouncedSearchTerm, customersVersion]);
  const handleRowDoubleClick = (customerId: number) => {
    navigate(`/kunde/${customerId}`);
  };

  const handlePaginationChange = (_: unknown, newPage: number) => {
    setPage(newPage - 1);
  };

  return (
    <Box sx={listPageStyle}>
      <Box sx={{ ...pageToolbarStyle, mt: 1 }}>
        <PageTitle>KUNDEN</PageTitle>
        <SearchBox
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
          }}
          onClear={() => {
            setSearchTerm("");
            setPage(0);
          }}
          label="Kunde suchen"
        />
      </Box>

      {/* Таблица */}
      <Box sx={listTableAreaStyle}>
        <TableContainer
          component={Paper}
          sx={{
            ...tableContainerStyle,
            mt: 1,
          }}
        >
          <Table sx={tableStyle}>
            <StyledTableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 250 }}>Name</TableCell>

                <TableCell sx={fixedCellWidth(120)}>KundenNr</TableCell>

                <TableCell sx={{ minWidth: 350 }}>Adresse</TableCell>

                <TableCell sx={fixedCellWidth(160)}>Telefon</TableCell>

                <TableCell sx={fixedCellWidth(220)}>E-Mail</TableCell>

                <TableCell sx={fixedCellWidth(200)}>Webseite</TableCell>

                <TableCell sx={fixedCellWidth(50)} />
              </TableRow>
            </StyledTableHead>

            <TableBody>
              {customers.length > 0 ? (
                customers.map((customer) => {
                  const address = customer.address
                    ? [
                        customer.address.country,
                        customer.address.postalCode,
                        customer.address.city,
                        customer.address.street,
                        customer.address.building,
                      ]
                        .filter(Boolean)
                        .join(" ")
                    : "";

                  return (
                    <TableRow
                      key={customer.id}
                      sx={tableRowHoverStyle}
                      onDoubleClick={() => handleRowDoubleClick(customer.id)}
                    >
                      {/* Name */}
                      <TableCell
                        sx={{
                          ...leftBorderCellStyle,
                          ...hoverExpandCellStyle,
                        }}
                      >
                        <HoverExpandText
                          text={customer.name}
                          hoverBgColor={colors.tableHover}
                        />
                      </TableCell>

                      {/* KundenNr */}
                      <TableCell
                        sx={{
                          ...centerCellStyle,
                          ...fixedCellWidth(120),
                        }}
                      >
                        {customer.customerNumber ?? ""}
                      </TableCell>

                      {/* Adresse */}
                      <TableCell sx={hoverExpandCellStyle}>
                        <HoverExpandText
                          text={address}
                          hoverBgColor={colors.tableHover}
                        />
                      </TableCell>

                      {/* Telefon */}
                      <TableCell
                        sx={{
                          ...cellStyle,
                          ...fixedCellWidth(160),
                        }}
                      >
                        {customer.phone ?? ""}
                      </TableCell>

                      {/* E-Mail */}
                      <TableCell
                        sx={{
                          ...cellStyle,
                          ...fixedCellWidth(220),
                        }}
                      >
                        {customer.email ?? ""}
                      </TableCell>

                      {/* Webseite */}
                      <TableCell
                        sx={{
                          ...cellStyle,
                          ...fixedCellWidth(200),
                        }}
                      >
                        {customer.website ?? ""}
                      </TableCell>

                      {/* Aktionen */}
                      <TableCell
                        sx={{
                          ...actionCellStyle,
                          ...fixedCellWidth(50),
                        }}
                      >
                        <DeleteCustomer
                          customerId={customer.id}
                          customerName={customer.name}
                          trigger={
                            <Tooltip title="Löschen" arrow>
                              <IconButton
                                size="small"
                                onClick={(event) => event.stopPropagation()}
                                sx={actionIconButtonStyle}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Keine Kunden gefunden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Пагинация */}
      <Box sx={listPaginationStyle}>
        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={handlePaginationChange}
          color="primary"
        />
      </Box>
    </Box>
  );
}
