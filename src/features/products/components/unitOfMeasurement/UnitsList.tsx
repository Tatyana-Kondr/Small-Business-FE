import {
  Box,
  Button,
  CircularProgress,
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
  getUnits,
  selectLoading,
  selectUnits,
} from "../../unitsOfMeasurementSlice";

import { UnitOfMeasurement } from "../../types";

import EditUnit from "./EditUnit";
import DeleteUnit from "./DeleteUnit";
import { CreateUnit } from "./CreateUnit";

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

export default function UnitsList() {
  const dispatch = useAppDispatch();

  const units = useAppSelector(selectUnits);
  const loading = useAppSelector(selectLoading);

  const [selectedUnit, setSelectedUnit] = useState<UnitOfMeasurement | null>(
    null,
  );
  const [openModal, setOpenModal] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    dispatch(getUnits());
  }, [dispatch]);

  const handleEdit = (unit: UnitOfMeasurement) => {
    setSelectedUnit(unit);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setSelectedUnit(null);
  };

  const tableWidth = 600;

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
          Neue Maßeinheit anlegen
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

              <TableCell>Name</TableCell>

              <TableCell sx={fixedCellWidth(250)}>Aktionen</TableCell>
            </TableRow>
          </StyledTableHead>

          <TableBody>
            {loading && units.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : units.length > 0 ? (
              units.map((unit) => (
                <TableRow key={unit.id} sx={tableRowHoverStyle}>
                  <TableCell
                    sx={{
                      ...centerCellStyle,
                      ...leftBorderCellStyle,
                      ...fixedCellWidth(80),
                    }}
                  >
                    {unit.id}
                  </TableCell>

                  <TableCell sx={cellStyle}>{unit.name}</TableCell>

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
                        onClick={() => handleEdit(unit)}
                        sx={{
                          ...outlinedButtonStyle,
                          minWidth: 110,
                        }}
                      >
                        Bearbeiten
                      </Button>

                      <DeleteUnit unitId={unit.id} name={unit.name} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={cellStyle}>
                  Keine Maßeinheiten vorhanden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CreateUnit open={openModal} onClose={() => setOpenModal(false)} />

      <EditUnit open={editOpen} onClose={handleCloseEdit} unit={selectedUnit} />
    </Container>
  );
}
