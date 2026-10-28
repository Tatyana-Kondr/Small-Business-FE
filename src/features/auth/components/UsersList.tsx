import {
  Box,
  Button,
  Container,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
} from "@mui/material";

import { useEffect, useState } from "react";

import EditIcon from "@mui/icons-material/Edit";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

import {
  changePassword,
  getAllUsers,
  selectUsers,
  updateUser,
  updateUserRole,
} from "../authSlice";

import { ChangePasswordDto, Role, UpdateUserDto, UserDto } from "../types";

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";

import ChangePasswordPanel from "./ChangePasswordPanel";
import EditUser from "./EditUser";
import Register from "../../../components/Register";

import { compactPageToolbarStyle } from "../../../styles/formStyles";

import {
  actionIconButtonStyle,
  cellStyle,
  centerCellStyle,
  compactTableContainerStyle,
  compactTableStyle,
  fixedCellWidth,
  leftBorderCellStyle,
  StyledTableHead,
  tableRowHoverStyle,
} from "../../../styles/tableStyles";

import { primaryButtonStyle } from "../../../styles/buttonStyles";
import { handleApiError } from "../../../utils/errors/handleApiError";

export default function UsersList() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    dispatch(getAllUsers())
      .unwrap()
      .catch((error) => {
        handleApiError(error, "Die Benutzerliste konnte nicht geladen werden.");
      });
  }, [dispatch]);

  const handleRoleChange = async (user: UserDto, newRole: Role) => {
    if (user.role === newRole) {
      return;
    }

    try {
      await dispatch(
        updateUserRole({
          id: user.id,
          role: newRole,
        }),
      ).unwrap();
    } catch (error) {
      handleApiError(error, "Die Benutzerrolle konnte nicht geändert werden.");
    }
  };

  const handleOpenChangePassword = (userId: number) => {
    setSelectedUserId(userId);
    setShowChangePassword(true);
  };

  const handleCloseChangePassword = () => {
    if (passwordLoading) return;

    setShowChangePassword(false);
    setSelectedUserId(null);
  };

  const handleChangePassword = async (
    dto: ChangePasswordDto,
  ): Promise<void> => {
    if (selectedUserId === null) {
      throw new Error("Kein Benutzer ausgewählt.");
    }

    setPasswordLoading(true);

    try {
      await dispatch(
        changePassword({
          id: selectedUserId,
          dto,
        }),
      ).unwrap();

      setShowChangePassword(false);
      setSelectedUserId(null);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleOpenRegister = () => {
    setShowRegister(true);
  };

  const handleCloseRegister = () => {
    setShowRegister(false);
  };

  const handleEditUser = (user: UserDto) => {
    setEditingUser(user);
  };

  const handleSaveUser = async (
    updateUserDto: UpdateUserDto,
  ): Promise<void> => {
    if (!editingUser) {
      return;
    }

    await dispatch(
      updateUser({
        id: editingUser.id,
        updateUserDto,
      }),
    ).unwrap();

    setEditingUser(null);
  };

  const tableWidth = 850;

  return (
    <Container>
      <Box sx={compactPageToolbarStyle(tableWidth)}>
        <Button
          variant="contained"
          onClick={handleOpenRegister}
          sx={{
            ...primaryButtonStyle,
            ml: "auto",
          }}
        >
          Neuen Benutzer registrieren
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
              <TableCell>Username</TableCell>
              <TableCell sx={fixedCellWidth(250)}>E-Mail</TableCell>
              <TableCell sx={fixedCellWidth(140)}>Rolle</TableCell>
              <TableCell sx={fixedCellWidth(110)}>Aktionen</TableCell>
            </TableRow>
          </StyledTableHead>

          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id} sx={tableRowHoverStyle}>
                  <TableCell
                    sx={{
                      ...centerCellStyle,
                      ...leftBorderCellStyle,
                      ...fixedCellWidth(80),
                    }}
                  >
                    {user.id}
                  </TableCell>

                  <TableCell sx={cellStyle}>{user.username}</TableCell>

                  <TableCell sx={cellStyle}>{user.email}</TableCell>

                  <TableCell
                    sx={{
                      ...cellStyle,
                      ...fixedCellWidth(150),
                    }}
                  >
                    <Select
                      value={user.role}
                      onChange={(event) =>
                        handleRoleChange(user, event.target.value as Role)
                      }
                      size="small"
                      sx={{
                        minWidth: 120,
                        height: 28,
                        fontSize: "0.8rem",
                        "& .MuiSelect-select": {
                          py: 0,
                          fontSize: "0.8rem",
                        },
                      }}
                    >
                      <MenuItem value="USER">USER</MenuItem>

                      <MenuItem value="ADMIN">ADMIN</MenuItem>
                    </Select>
                  </TableCell>

                  <TableCell
                    sx={{
                      ...cellStyle,
                      ...fixedCellWidth(110),
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <Tooltip title="Bearbeiten" arrow>
                        <IconButton
                          onClick={() => handleEditUser(user)}
                          sx={actionIconButtonStyle}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Passwort ändern" arrow>
                        <IconButton
                          onClick={() => handleOpenChangePassword(user.id)}
                          sx={actionIconButtonStyle}
                        >
                          <VpnKeyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={cellStyle}>
                  Keine Benutzer vorhanden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {showChangePassword && selectedUserId !== null && (
        <ChangePasswordPanel
          onClose={handleCloseChangePassword}
          onSubmit={handleChangePassword}
          loading={passwordLoading}
        />
      )}

      {editingUser && (
        <EditUser
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {showRegister && <Register onClose={handleCloseRegister} />}
    </Container>
  );
}
