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

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";

import {
  getDocumentTypes,
  selectTypeOfDocuments,
} from "../typeOfDocumentSlice";

import { TypeOfDocument } from "../types";

import DeleteDocumentType from "./DeleteDocumentType";
import { CreateDocumentType } from "./CreateDocumentType";
import EditDocumentType from "./EditDocumentType";

import {
  cellStyle,
  centerCellStyle,
  compactTableContainerStyle,
  compactTableStyle,
  fixedCellWidth,
  leftBorderCellStyle,
  StyledTableHead,
  tableRowHoverStyle,
} from "../../../styles/tableStyles";

import {
  outlinedButtonStyle,
  primaryButtonStyle,
} from "../../../styles/buttonStyles";

import { compactPageToolbarStyle } from "../../../styles/formStyles";

export default function DocumentTypesList() {
  const dispatch = useAppDispatch();

  const types = useAppSelector(selectTypeOfDocuments);

  const [selectedType, setSelectedType] = useState<TypeOfDocument | null>(null);

  const [openModal, setOpenModal] = useState(false);

  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    dispatch(getDocumentTypes());
  }, [dispatch]);

  const handleEdit = (type: TypeOfDocument) => {
    setSelectedType(type);
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
          Neuen Dokumenttyp anlegen
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
            {types.length > 0 ? (
              types.map((type) => (
                <TableRow key={type.id} sx={tableRowHoverStyle}>
                  <TableCell
                    sx={{
                      ...centerCellStyle,
                      ...leftBorderCellStyle,
                      ...fixedCellWidth(80),
                    }}
                  >
                    {type.id}
                  </TableCell>

                  <TableCell sx={cellStyle}>{type.name}</TableCell>

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
                        onClick={() => handleEdit(type)}
                        sx={{
                          ...outlinedButtonStyle,
                          minWidth: 110,
                        }}
                      >
                        Bearbeiten
                      </Button>

                      <Box>
                        <DeleteDocumentType typeId={type.id} name={type.name} />
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={cellStyle}>
                  Keine Dokumenttypen vorhanden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CreateDocumentType
        open={openModal}
        onClose={() => setOpenModal(false)}
      />

      <EditDocumentType
        open={editOpen}
        onClose={() => setEditOpen(false)}
        type={selectedType}
      />
    </Container>
  );
}
