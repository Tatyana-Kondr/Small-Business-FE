import { AppBar, Toolbar, Button, Box } from "@mui/material";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import KeyboardDoubleArrowLeftOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftOutlined';
import { selectCompany } from "../features/company/companiesSlice";

export default function HeaderApp() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate();
  const company = useAppSelector(selectCompany);

  function handleLogout() {
    dispatch(logout())
      .unwrap()
      .finally(() => {
        localStorage.removeItem("accessToken"); // очистим токен на всякий случай
        navigate("/login", { replace: true }); // редирект на логин
      });
  }

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: "white", boxShadow: 2 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexGrow: 1 }}>
          {company?.logoUrl && (
            <img
              src={`${import.meta.env.VITE_API_URL}${company.logoUrl}`}
              alt="Logo"
              style={{ height: 60, marginRight: 16 }}
            />
          )}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, flexGrow: 1 }}>
            <Button
              onClick={handleGoBack}
              sx={{
                fontSize: 12,
                minWidth: 50,
                minHeight: 40,
                pr: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 1,
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "transparent", // фон не меняется при ховере
                  "& .MuiSvgIcon-root": {
                    color: "#00838f", // цвет иконки при наведении
                  },
                },
                "& .MuiSvgIcon-root": {
                  transition: "color 0.3s ease", // плавный переход цвета
                },
              }}>
              <KeyboardDoubleArrowLeftOutlinedIcon fontSize="large" />
              ZURÜCK
            </Button>
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
        </Box>
      </Toolbar>
    </AppBar>
  );
}