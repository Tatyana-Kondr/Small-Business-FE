import { Box, Toolbar } from "@mui/material";
import { Outlet, } from "react-router-dom";
import HeaderApp from "./HeaderApp";

export default function Layout() {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <HeaderApp />

      <Toolbar />

      <Box
        component="main"
        sx={{
          width: "100%",
          px: 1,
          py: 2,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}