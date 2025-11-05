import { Outlet, useLocation } from 'react-router-dom'
import { Box, IconButton } from '@mui/material';
import Sidebar from './Sidebar';
import HeaderApp from './HeaderApp';
import { useState } from 'react';
import MenuIcon from "@mui/icons-material/Menu";

const drawerWidth = 80;
const collapsedWidth = 60; 

export default function Layout() {
  const location = useLocation();
  const hideLayout =
    location.pathname === "/login" || location.pathname === "/register";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // 👉 отслеживаем состояние sidebar

  if (hideLayout) return <Outlet />;

  const handleDrawerToggle = () => setMobileOpen((v) => !v);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* 🔹 Верхний Header */}
      <HeaderApp />

      {/* 🔹 Кнопка меню для мобильных */}
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerToggle}
        sx={{
          position: "fixed",
          top:  5,
          left: 10,
          zIndex: 1201,
          display: { sm: "none" },
          backgroundColor: "white",
          border: "1px solid #ddd",
          "&:hover": { backgroundColor: "#f5f5f5" },
        }}
      >
        <MenuIcon />
      </IconButton>

      <Box sx={{ display: "flex", flexGrow: 1 }}>
        {/* 🔹 Sidebar */}
        <Sidebar
          mobileOpen={mobileOpen}
          onDrawerToggle={handleDrawerToggle}
          onCollapseChange={setCollapsed} // 👈 сообщаем Layout, свернут Sidebar или нет
        />

        {/* 🔹 Основной контент */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: 1,
            py: 2,
            transition: "margin-left 0.3s ease",
            ml: {
              xs: 0,
              sm: collapsed ? `${collapsedWidth}px` : `${drawerWidth}px`,
            },
          }}
        >
          <Outlet />
        </Box>

      </Box>
    </Box>
  );
}