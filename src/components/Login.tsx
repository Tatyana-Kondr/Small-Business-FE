import { useState } from "react";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { login, selectIsAuthenticated, selectLoginError, selectStatus } from "../features/auth/authSlice";
import { AuthRequestDto } from "../features/auth/types";
import { handleApiError } from "../utils/handleApiError";


const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectStatus);
  const loginError = useAppSelector(selectLoginError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [form, setForm] = useState<AuthRequestDto>({ username: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await dispatch(login(form)).unwrap();
    } catch (err) {
      handleApiError(err); 
    }
  };

  if (isAuthenticated) {
    return (
      <Typography align="center" sx={{ mt: 5 }}>
        Sie sind eingeloggt!
      </Typography>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 5,
        p: 3,
        bgcolor: "white",
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: "bold", color: "#0277bd" }} align="center" gutterBottom>
        SIGN IN
      </Typography>

      {loginError && <Alert severity="error">{loginError}</Alert>}

      <TextField
        label="Username"
        name="username"
        type="text"
        fullWidth
        margin="normal"
        value={form.username}
        onChange={handleChange}
      />

      <TextField
        label="Passwort"
        name="password"
        type="password"
        fullWidth
        margin="normal"
        value={form.password}
        onChange={handleChange}
      />

      <Button
        type="submit"
        variant="contained"
        sx={{ backgroundImage: "linear-gradient(to right, #006064, #4dd0e1)", mt: 3 }}
        fullWidth
        disabled={status === "loading"}
      >
        Login
      </Button>
    </Box>
  );
};

export default LoginForm;