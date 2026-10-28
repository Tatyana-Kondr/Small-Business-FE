import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";

import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";

import { getTaxRates, selectTaxRates } from "../../taxRatesSlice";
import { CreateTaxRate } from "./CreateTaxRate";
import { TaxRate } from "../../types";
import EditTaxRate from "./EditTaxRate";
import DeleteTaxRate from "./DeleteTaxRate";

import { compactPageToolbarStyle } from "../../../../styles/formStyles";
import {
  cellStyle,
  centerCellStyle,
  compactTableContainerStyle,
  compactTableStyle,
  fixedCellWidth,
  leftBorderCellStyle,
  StyledTableHead,
  tableRowHoverStyle,
} from "../../../../styles/tableStyles";

import {
  outlinedButtonStyle,
  primaryButtonStyle,
} from "../../../../styles/buttonStyles";

export default function TaxRatesList() {
  const dispatch = useAppDispatch();

  const taxRates = useAppSelector(selectTaxRates);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTaxRate, setSelectedTaxRate] = useState<TaxRate | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    dispatch(getTaxRates());
  }, [dispatch]);

  const handleEdit = (taxRate: TaxRate) => {
    setSelectedTaxRate(taxRate);
    setEditOpen(true);
  };

  const tableWidth = 700;

  return (
    <Container>
      <Box sx={compactPageToolbarStyle(tableWidth)}>
        <Button
          variant="contained"
          onClick={() => setOpenModal(true)}
          sx={{
            ...primaryButtonStyle,
            ml: "auto",
          }}
        >
          Neuen Steuersatz anlegen
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={compactTableContainerStyle(tableWidth)}
      >
        <Table sx={compactTableStyle(tableWidth)}>
          <StyledTableHead>
            <TableRow>
              <TableCell sx={fixedCellWidth(80)}>ID</TableCell>
              <TableCell sx={fixedCellWidth(120)}>Steuersatz</TableCell>
              <TableCell sx={fixedCellWidth(120)}>Aktiv</TableCell>
              <TableCell sx={fixedCellWidth(120)}>Standard</TableCell>
              <TableCell sx={fixedCellWidth(250)}>Aktionen</TableCell>
            </TableRow>
          </StyledTableHead>

          <TableBody>
            {taxRates.length > 0 ? (
              taxRates.map((taxRate) => (
                <TableRow key={taxRate.id} sx={tableRowHoverStyle}>
                  <TableCell
                    sx={{
                      ...centerCellStyle,
                      ...leftBorderCellStyle,
                      ...fixedCellWidth(80),
                    }}
                  >
                    {taxRate.id}
                  </TableCell>

                  <TableCell
                    sx={{ ...centerCellStyle, ...fixedCellWidth(120) }}
                  >
                    {taxRate.value} %
                  </TableCell>

                  <TableCell
                    sx={{
                      ...centerCellStyle,
                      ...fixedCellWidth(120),
                    }}
                  >
                    {taxRate.active ? "Ja" : "Nein"}
                  </TableCell>

                  <TableCell
                    sx={{
                      ...centerCellStyle,
                      ...fixedCellWidth(120),
                    }}
                  >
                    {taxRate.defaultRate ? "Ja" : "Nein"}
                  </TableCell>

                  <TableCell
                    sx={{
                      ...cellStyle,
                      ...fixedCellWidth(250),
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleEdit(taxRate)}
                        sx={{
                          ...outlinedButtonStyle,
                          minWidth: 110,
                        }}
                      >
                        Bearbeiten
                      </Button>

                      <DeleteTaxRate
                        taxRateId={taxRate.id}
                        value={taxRate.value}
                        defaultRate={taxRate.defaultRate}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={cellStyle}>
                  Keine Steuersätze vorhanden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CreateTaxRate open={openModal} onClose={() => setOpenModal(false)} />

      <EditTaxRate
        open={editOpen}
        onClose={() => setEditOpen(false)}
        taxRate={selectedTaxRate}
      />
    </Container>
  );
}
