import { Box, Paper, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Container, Select, MenuItem, IconButton, Tooltip, Dialog } from "@mui/material";
import { useEffect, useState } from "react";
import { changePassword, getAllUsers, selectUsers, updateUser, updateUserRole } from "../authSlice";
import { ChangePasswordDto, Role, UpdateUserDto, UserDto } from "../types";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import ChangePasswordPanel from "./ChangePasswordPanel";
import EditIcon from "@mui/icons-material/Edit";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import EditUser from "./EditUser";
import Register from "../../../components/Register";


const StyledTableHead = styled(TableHead)(({
  backgroundColor: "#1a3d6d",
  "& th": {
    color: "white",
    fontWeight: "bold",
    borderRight: "1px solid #ddd",
    textAlign: "center"
  },
}));
const StyledTableRow = styled(TableRow)({
  backgroundColor: "#ffffff",
  "&:hover": {
    backgroundColor: "#f5f5f5", // Подсветка строки при наведении
    cursor: "pointer",
  },
});

export default function UsersList() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    dispatch(getAllUsers()).unwrap().catch(console.error);
  }, [dispatch]);

  const handleRoleChange = (user: UserDto, newRole: Role) => {
    if (user.role === newRole) return;
    dispatch(updateUserRole({ id: user.id, role: newRole }));
  };

  const handleOpenChangePassword = (userId: number) => {
    setSelectedUserId(userId);
    setShowChangePassword(true);
  }; 
  
 const handleChangePassword = (dto: ChangePasswordDto) => {
  if (!selectedUserId) return;
  setPasswordLoading(true);
  setPasswordError(null);

  dispatch(changePassword({ id: selectedUserId, dto }))
    .unwrap()
    .then(() => setShowChangePassword(false))
    .catch((err: any) => setPasswordError(err.message || "Fehler beim Ändern des Passworts."))
    .finally(() => setPasswordLoading(false));
};

  const handleOpenRegister = () => {
    setShowRegister(true);
  };

  const handleCloseRegister = () => {
    setShowRegister(false);
    dispatch(getAllUsers()).unwrap().catch(console.error); 
  }

  const handleEditUser = (user: UserDto) => {
    setEditingUser(user);
  };

  const handleSaveUser = (updateUserDto: UpdateUserDto) => {
    if (!editingUser) return;

    dispatch(updateUser({ id: editingUser.id, updateUserDto }))
      .unwrap()
      .then(() => setEditingUser(null))
      .catch((err) => console.error(err));
  };

  return (
    <Container>
      {/* Верхняя панель */}
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>  
        <Button variant="contained" color="primary" onClick={handleOpenRegister}>
          Neuen Benutzer registrieren
        </Button>
      </Box>

      {/* Таблица */}

      <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
        <Table>
          <StyledTableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>E-Mail</TableCell>
              <TableCell>Rolle</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <StyledTableRow key={user.id}>
                  <TableCell
                    style={{
                      padding: "6px 12px",
                      borderRight: "1px solid #ddd",
                      borderLeft: "1px solid #ddd",
                    }}
                  >
                    {user.id}
                  </TableCell>
                  <TableCell
                    style={{
                      padding: "6px 12px",
                      borderRight: "1px solid #ddd",
                      borderLeft: "1px solid #ddd",
                    }}
                  >
                    {user.username}
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "400px",
                      padding: "6px 12px",
                      borderRight: "1px solid #ddd",
                    }}
                  >
                    {user.email}
                  </TableCell>
                  <TableCell sx={{ padding: "6px", borderRight: "1px solid #ddd" }}>
                    <Select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user, e.target.value as Role)}
                      size="small"
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="USER">USER</MenuItem>
                      <MenuItem value="ADMIN">ADMIN</MenuItem>
                    </Select>
                  </TableCell>
                   <TableCell sx={{ padding: "2px 12px", borderRight: "1px solid #ddd" }}>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Bearbeiten" arrow>
                        <IconButton onClick={() =>  handleEditUser(user)} sx={{ p: 0.5, "&:hover": { color: "#bdbdbd" } }}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Passwort ändern" arrow>
                        <IconButton onClick={() => handleOpenChangePassword(user.id)}>
                          <VpnKeyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>

                </StyledTableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Keine Benutzer vorhanden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {showChangePassword && selectedUserId && (
        <Dialog open={showChangePassword} onClose={() => setShowChangePassword(false)}>
          <ChangePasswordPanel
            userId={selectedUserId}
            onClose={() => setShowChangePassword(false)}
            onSubmit={handleChangePassword}
            loading={passwordLoading}
            error={passwordError}
          />
        </Dialog>
      )}

      <Dialog open={!!editingUser} onClose={() => setEditingUser(null)} maxWidth="sm" fullWidth>
        {editingUser && (
          <EditUser
            user={editingUser}
            onSave={handleSaveUser}
            onClose={() => setEditingUser(null)}
          />
        )}
      </Dialog>

      {showRegister && <Register onClose={handleCloseRegister} />}

    </Container>
  );
}