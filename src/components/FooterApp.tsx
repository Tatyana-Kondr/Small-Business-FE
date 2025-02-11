import { Link } from "react-router-dom";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.common.white,
  textAlign: "center",
  padding: theme.spacing(2),
  position: "fixed",
  bottom: 0,
  left: 0, // Выравнивание по левому краю
  width: "100%",
  display: "flex",
  justifyContent: "center", // Центрируем ссылки
  gap: theme.spacing(2) // Отступы между ссылками
}));

const FooterLink = styled(Link)(({ theme }) => ({
  textDecoration: "none",
  color: theme.palette.common.white,
  margin: theme.spacing(1),
  "&:hover": {
    color: theme.palette.secondary.main,
  },
}));

export default function FooterApp() {
  return (
    <FooterContainer>
      <FooterLink to="">Social media</FooterLink>
      <FooterLink to="">Address</FooterLink>
      <FooterLink to="">Foto Gallery</FooterLink>
    </FooterContainer>
  );
}
