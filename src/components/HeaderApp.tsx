import { AppBar, Toolbar, Button, Box } from "@mui/material";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAppDispatch } from "../redux/hooks";
import { logout } from "../features/auth/authSlice";

const LogoImg = "/media/LogoMashCom.jpg";

export default function HeaderApp() {

  const dispatch = useAppDispatch()
  function handleLogout() {
    dispatch(logout())
  }
  return (
    <AppBar position="fixed" sx={{ backgroundColor: "white", boxShadow: 2 }}>
      <Toolbar  sx={{ display: "flex", justifyContent: "space-between" }}>
        <img
          src={LogoImg}
          alt="Logo"
          style={{ height: 60, marginRight: 16 }}
        />
        <Box sx={{ display: "flex", gap: 2 }}>
          
          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            startIcon={<ExitToAppIcon fontSize="small" />}
            sx={{
              borderRadius: "4px",
              backgroundColor: "#d32f2f",
              "&:hover": {
                fontWeight: "bold",
                backgroundColor: "red",
              },
            }}
          >
            Exit
          </Button>

        </Box>
      </Toolbar>
    </AppBar>
  );
}