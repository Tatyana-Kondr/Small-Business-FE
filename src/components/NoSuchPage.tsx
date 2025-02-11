import { Box, Typography, List, ListItem } from "@mui/material";
import { styled } from "@mui/material/styles";

const PageContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  height: "100vh", // Заполняем весь экран
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
}));

const StyledList = styled(List)(({ theme }) => ({
  textAlign: "left",
  maxWidth: "400px",
  marginTop: theme.spacing(2),
}));

export default function NoSuchPage() {
  return (
    <PageContainer>
      <Typography variant="h2" color="error">
        Ой!
      </Typography>
      <Typography variant="body1" mt={2}>
        Похоже, вы что-то ищете. Мы поможем найти то, что нужно:
      </Typography>
      <StyledList>
        <ListItem>🔹 Узнайте о предстоящих событиях.</ListItem>
        <ListItem>🔹 Посмотрите новости в блоге.</ListItem>
        <ListItem>🔹 Зарегистрируйтесь, чтобы получить демо-версию, настроенную для вас.</ListItem>
      </StyledList>
    </PageContainer>
  );
}
