import { Outlet, useLocation } from 'react-router-dom'
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import HeaderApp from './HeaderApp';


export default function Layout() {
  const location = useLocation();
  const hideLayout = location.pathname === "/login" || location.pathname === "/register";

  if (hideLayout) return <Outlet />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <HeaderApp />
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

