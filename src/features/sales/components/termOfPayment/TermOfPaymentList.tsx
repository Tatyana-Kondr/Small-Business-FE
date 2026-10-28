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
  getTermsOfPayment,
  selectTermsOfPayment,
} from "../../termOfPaymentSlice";

import { TermOfPayment } from "../../types";

import DeleteTermOfPayment from "./DeleteTermOfPayment";
import { CreateTermOfPayment } from "./CreateTermOfPayment";
import EditTermOfPayment from "./EditTermOfPayment";

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

export default function TermOfPaymentList() {
  const dispatch = useAppDispatch();

  const terms = useAppSelector(selectTermsOfPayment);

  const [selectedTerm, setSelectedTerm] = useState<TermOfPayment | null>(null);

  const [openModal, setOpenModal] = useState(false);

  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    dispatch(getTermsOfPayment());
  }, [dispatch]);

  const handleEdit = (term: TermOfPayment) => {
    setSelectedTerm(term);
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
          Neue Zahlungsbedingung anlegen
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
            {terms.length > 0 ? (
              terms.map((term) => (
                <TableRow key={term.id} sx={tableRowHoverStyle}>
                  <TableCell
                    sx={{
                      ...centerCellStyle,
                      ...leftBorderCellStyle,
                      ...fixedCellWidth(80),
                    }}
                  >
                    {term.id}
                  </TableCell>

                  <TableCell sx={cellStyle}>{term.name}</TableCell>

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
                        onClick={() => handleEdit(term)}
                        sx={{
                          ...outlinedButtonStyle,
                          minWidth: 110,
                        }}
                      >
                        Bearbeiten
                      </Button>

                      <Box>
                        <DeleteTermOfPayment
                          termId={term.id}
                          name={term.name}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={cellStyle}>
                  Keine Zahlungsbedingungen vorhanden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CreateTermOfPayment
        open={openModal}
        onClose={() => setOpenModal(false)}
      />

      <EditTermOfPayment
        open={editOpen}
        onClose={() => setEditOpen(false)}
        term={selectedTerm}
      />
    </Container>
  );
}
