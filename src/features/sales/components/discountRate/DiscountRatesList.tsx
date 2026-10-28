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

import {
  getDiscountRates,
  selectDiscountRates,
  selectDiscountRatesLoading,
} from "../../discountRatesSlice";
import { CreateDiscountRate } from "./CreateDiscountRate";
import DeleteDiscountRate from "./DeleteDiscountRate";

import { DiscountRate } from "../../types";

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

import EditDiscountRate from "./EditDiscountRate";

export default function DiscountRatesList() {
  const dispatch = useAppDispatch();

  const discountRates = useAppSelector(selectDiscountRates);
  const loading = useAppSelector(selectDiscountRatesLoading);

  const [openModal, setOpenModal] = useState(false);
  const [selectedDiscountRate, setSelectedDiscountRate] =
    useState<DiscountRate | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    dispatch(getDiscountRates());
  }, [dispatch]);

  const handleEdit = (discountRate: DiscountRate) => {
    setSelectedDiscountRate(discountRate);
    setEditOpen(true);
  };

  const tableWidth = 580;

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
          Neuen Rabattsatz anlegen
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
              <TableCell sx={fixedCellWidth(120)}>Rabattsatz</TableCell>
              <TableCell sx={fixedCellWidth(120)}>Aktiv</TableCell>
              <TableCell sx={fixedCellWidth(250)}>Aktionen</TableCell>
            </TableRow>
          </StyledTableHead>

          <TableBody>
            {discountRates.length > 0 ? (
              discountRates.map((discountRate) => (
                <TableRow key={discountRate.id} sx={tableRowHoverStyle}>
                  <TableCell
                    sx={{
                      ...centerCellStyle,
                      ...leftBorderCellStyle,
                      ...fixedCellWidth(80),
                    }}
                  >
                    {discountRate.id}
                  </TableCell>

                  <TableCell
                    sx={{ ...centerCellStyle, ...fixedCellWidth(120) }}
                  >
                    {discountRate.value.toLocaleString("de-DE", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    %
                  </TableCell>

                  <TableCell
                    sx={{
                      ...centerCellStyle,
                      ...fixedCellWidth(120),
                    }}
                  >
                    {discountRate.active ? "Ja" : "Nein"}
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
                        onClick={() => handleEdit(discountRate)}
                        sx={{
                          ...outlinedButtonStyle,
                          minWidth: 110,
                        }}
                      >
                        Bearbeiten
                      </Button>

                      <DeleteDiscountRate
                        discountRateId={discountRate.id}
                        value={discountRate.value}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={cellStyle}>
                  {loading ? "Laden..." : "Keine Rabattsätze vorhanden"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CreateDiscountRate
        open={openModal}
        onClose={() => setOpenModal(false)}
      />

      <EditDiscountRate
        open={editOpen}
        onClose={() => setEditOpen(false)}
        discountRate={selectedDiscountRate}
      />
    </Container>
  );
}
