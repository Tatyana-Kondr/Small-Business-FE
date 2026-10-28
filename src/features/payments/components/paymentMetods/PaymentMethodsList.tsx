import {
  Box,
  Button,
  Checkbox,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";

import { useEffect, useState } from "react";

import {
  getPaymentMethods,
  selectPaymentMethods,
  updatePaymentMethod,
} from "../../paymentMethodsSlice";

import { NewPaymentMethodDto, PaymentMethod } from "../../types";

import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";

import DeletePaymentMethod from "./DeletePaymentMethod";
import EditPaymentMethod from "./EditPaymentMethod";
import { CreatePaymentMethod } from "./CreatePaymentMethod";

import { handleApiError } from "../../../../utils/errors/handleApiError";

import PageTitle from "../../../../components/PageTitle";

import { pageToolbarStyle } from "../../../../styles/formStyles";

import {
  cellStyle,
  centerCellStyle,
  fixedCellWidth,
  leftBorderCellStyle,
  StyledTableHead,
  tableContainerStyle,
  tableRowHoverStyle,
  tableStyle,
} from "../../../../styles/tableStyles";

import {
  outlinedButtonStyle,
  primaryButtonStyle,
} from "../../../../styles/buttonStyles";

export default function PaymentMethodsList() {
  const dispatch = useAppDispatch();

  const paymentMethods = useAppSelector(selectPaymentMethods);

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);

  const [openModal, setOpenModal] = useState(false);

  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    dispatch(getPaymentMethods())
      .unwrap()
      .catch((error) => {
        handleApiError(error, "Fehler beim Laden der Zahlungsmethoden");
      });
  }, [dispatch]);

  const handleEdit = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setEditOpen(true);
  };

  const handleToggleActive = async (method: PaymentMethod) => {
    const updatedMethod: NewPaymentMethodDto = {
      provider: method.provider,
      maskedNumber: method.maskedNumber ?? undefined,
      details: method.details ?? undefined,
      active: !method.active,
    };

    try {
      await dispatch(
        updatePaymentMethod({
          id: method.id,
          updatedPaymentMethod: updatedMethod,
        }),
      ).unwrap();
    } catch (error) {
      handleApiError(error, "Fehler beim Aktualisieren des Status");
    }
  };

  return (
    <Container>
      <Box sx={pageToolbarStyle}>
        <PageTitle>ZAHLUNGSMETHODEN</PageTitle>

        <Button
          variant="contained"
          onClick={() => setOpenModal(true)}
          sx={primaryButtonStyle}
        >
          Neuen Zahlungsmethode anlegen
        </Button>
      </Box>

      <TableContainer component={Paper} sx={tableContainerStyle}>
        <Table sx={tableStyle}>
          <StyledTableHead>
            <TableRow>
              <TableCell sx={fixedCellWidth(80)}>ID</TableCell>
              <TableCell>Anbieter</TableCell>
              <TableCell sx={fixedCellWidth(200)}>Karte/Konto-nummer</TableCell>
              <TableCell sx={fixedCellWidth(130)}>Einzelheiten</TableCell>
              <TableCell sx={fixedCellWidth(80)}>Aktiv</TableCell>
              <TableCell sx={fixedCellWidth(250)}>Aktionen</TableCell>
            </TableRow>
          </StyledTableHead>

          <TableBody>
            {paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <TableRow key={method.id} sx={tableRowHoverStyle}>
                  <TableCell
                    sx={{
                      ...centerCellStyle,
                      ...leftBorderCellStyle,
                      ...fixedCellWidth(80),
                    }}
                  >
                    {method.id}
                  </TableCell>

                  <TableCell sx={cellStyle}>{method.provider}</TableCell>

                  <TableCell
                    sx={{
                      ...cellStyle,
                      ...fixedCellWidth(180),
                    }}
                  >
                    {method.maskedNumber}
                  </TableCell>

                  <TableCell sx={cellStyle}>{method.details}</TableCell>

                  <TableCell
                    sx={{
                      ...cellStyle,
                      ...fixedCellWidth(80),
                      textAlign: "center",
                    }}
                  >
                    <Checkbox
                      checked={method.active}
                      onChange={() => handleToggleActive(method)}
                      color="primary"
                      size="small"
                      sx={{ p: 0 }}
                    />
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
                        onClick={() => handleEdit(method)}
                        sx={{
                          ...outlinedButtonStyle,
                          minWidth: 110,
                        }}
                      >
                        Bearbeiten
                      </Button>

                      <Box>
                        <DeletePaymentMethod
                          methodId={method.id}
                          methodProvider={method.provider}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={cellStyle}>
                  Keine Zahlungsmethoden vorhanden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CreatePaymentMethod
        open={openModal}
        onClose={() => setOpenModal(false)}
      />

      <EditPaymentMethod
        open={editOpen}
        onClose={() => setEditOpen(false)}
        method={selectedPaymentMethod}
      />
    </Container>
  );
}
