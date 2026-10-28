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
  getPaymentProcesses,
  selectPaymentProcesses,
} from "../../paymentProcessesSlice";

import { PaymentProcess } from "../../types";

import DeletePaymentProcess from "./DeletePaymentProcess";
import { CreatePaymentProcess } from "./CreatePaymentProcess";
import EditPaymentProcess from "./EditPaymentProcess";

import PageTitle from "../../../../components/PageTitle";

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

export default function PaymentProcessesList() {
  const dispatch = useAppDispatch();

  const paymentProcesses = useAppSelector(selectPaymentProcesses);

  const [selectedPaymentProcess, setSelectedPaymentProcess] =
    useState<PaymentProcess | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    dispatch(getPaymentProcesses());
  }, [dispatch]);

  const handleEdit = (process: PaymentProcess) => {
    setSelectedPaymentProcess(process);
    setEditOpen(true);
  };

  const tableWidth = 700;

  return (
    <Container>
      <Box sx={compactPageToolbarStyle(tableWidth)}>
        <PageTitle>ZAHLUNGSVORGÄNGE</PageTitle>

        <Button
          variant="contained"
          onClick={() => setOpenModal(true)}
          sx={primaryButtonStyle}
        >
          Neuen Vorgang anlegen
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
            {paymentProcesses.length > 0 ? (
              paymentProcesses.map((process) => (
                <TableRow key={process.id} sx={tableRowHoverStyle}>
                  <TableCell
                    sx={{
                      ...centerCellStyle,
                      ...leftBorderCellStyle,
                      ...fixedCellWidth(80),
                    }}
                  >
                    {process.id}
                  </TableCell>

                  <TableCell sx={cellStyle}>{process.processName}</TableCell>

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
                        onClick={() => handleEdit(process)}
                        sx={{
                          ...outlinedButtonStyle,
                          minWidth: 110,
                        }}
                      >
                        Bearbeiten
                      </Button>

                      <Box>
                        <DeletePaymentProcess
                          processId={process.id}
                          processName={process.processName}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={cellStyle}>
                  Keine Zahlungsvorgänge vorhanden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CreatePaymentProcess
        open={openModal}
        onClose={() => setOpenModal(false)}
      />

      <EditPaymentProcess
        open={editOpen}
        onClose={() => setEditOpen(false)}
        process={selectedPaymentProcess}
      />
    </Container>
  );
}
