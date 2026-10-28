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

import { getShippings, selectShippings } from "../../shippingsSlice";

import { Shipping } from "../../types";

import DeleteShipping from "./DeleteShipping";
import { CreateShipping } from "./CreateShipping";
import EditShipping from "./EditShipping";

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

export default function ShippingsList() {
  const dispatch = useAppDispatch();

  const shippings = useAppSelector(selectShippings);

  const [selectedShipping, setSelectedShipping] = useState<Shipping | null>(
    null,
  );

  const [openModal, setOpenModal] = useState(false);

  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    dispatch(getShippings());
  }, [dispatch]);

  const handleEdit = (shipping: Shipping) => {
    setSelectedShipping(shipping);
    setEditOpen(true);
  };

  const tableWidth = 800;

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
          Neue Versandart anlegen
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
            {shippings.length > 0 ? (
              shippings.map((shipping) => (
                <TableRow key={shipping.id} sx={tableRowHoverStyle}>
                  <TableCell
                    sx={{
                      ...centerCellStyle,
                      ...leftBorderCellStyle,
                      ...fixedCellWidth(80),
                    }}
                  >
                    {shipping.id}
                  </TableCell>

                  <TableCell sx={cellStyle}>{shipping.name}</TableCell>

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
                        onClick={() => handleEdit(shipping)}
                        sx={{
                          ...outlinedButtonStyle,
                          minWidth: 110,
                        }}
                      >
                        Bearbeiten
                      </Button>

                      <DeleteShipping
                        shippingId={shipping.id}
                        name={shipping.name}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={cellStyle}>
                  Keine Versandarten vorhanden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CreateShipping open={openModal} onClose={() => setOpenModal(false)} />

      <EditShipping
        open={editOpen}
        onClose={() => setEditOpen(false)}
        shipping={selectedShipping}
      />
    </Container>
  );
}
