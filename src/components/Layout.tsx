import { Box, Toolbar } from "@mui/material";
import { Outlet, } from "react-router-dom";
import HeaderApp from "./HeaderApp";
import { pageContentStyle } from "../styles/formStyles";

export default function Layout() {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <HeaderApp />

      <Toolbar />

      <Box
        component="main"
        sx={pageContentStyle}
      >
        <Outlet />
      </Box>
    </Box>
  );
}