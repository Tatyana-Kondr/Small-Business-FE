import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { NavLink } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { useAppDispatch } from "../redux/hooks";
import { logout } from "../features/auth/authSlice";

const LogoImg = "/media/LogoMashCom.jpg";

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: "none",
  color: theme.palette.info.dark,
  marginRight: theme.spacing(2),
  fontSize: "1rem",
  "&:hover": {
    color: "#9ACBD0",
    fontWeight: "bold",
  },
}));

export default function HeaderApp() {

  const dispatch = useAppDispatch()
  function handleLogout() {
    dispatch(logout())
  }
  return (
    <AppBar position="fixed" sx={{ backgroundColor: "white", boxShadow: 2 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <img
          src={LogoImg}
          alt="Logo"
          style={{ height: 60, marginRight: 16 }}
        />
        <Box sx={{ display: "flex", gap: 2 }}>
          <StyledNavLink to="/">Home</StyledNavLink>
          <StyledNavLink to="/sales">Aufträge</StyledNavLink>
          <StyledNavLink to="/purchases">Bestellungen</StyledNavLink>
          <StyledNavLink to="/kunden">Kunden</StyledNavLink>
          <StyledNavLink to="/lieferanten">Lieferanten</StyledNavLink>
          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            sx={{

              borderRadius: "4px",
              backgroundColor: "#d32f2f",
              "&:hover": {
                fontWeight: "bold",
                backgroundColor: "red", // Цвет при наведении
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