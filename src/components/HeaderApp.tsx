import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { NavLink } from "react-router-dom";
import { styled } from "@mui/material/styles";

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: "none",
  color: theme.palette.common.white,
  marginRight: theme.spacing(2),
  fontSize: "1rem",
  "&:hover": {
    color: theme.palette.secondary.main,
  },
}));

export default function HeaderApp() {
  return (
    <AppBar position="fixed" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
        MyApp
        </Typography>
        <StyledNavLink to="/">Home</StyledNavLink>
        <StyledNavLink to="/products">Products</StyledNavLink>
        <StyledNavLink to="/sales">Sales</StyledNavLink>
        <StyledNavLink to="/purchases">Purchases</StyledNavLink>
        <StyledNavLink to="/customs">Customs</StyledNavLink>
        <Button color="inherit" component={NavLink} to="/login">
          Sign In
        </Button>
      </Toolbar>
    </AppBar>
  );
}