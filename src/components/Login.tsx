import { useState } from "react";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { login, selectIsAuthenticated, selectLoginError, selectStatus } from "../features/auth/authSlice";
import { AuthRequestDto } from "../features/auth/types";
import { errorMap } from "../utils/handleApiError";
import { loginButtonStyle, loginCardStyle, loginFieldStyle, loginTitleStyle } from "../styles/loginStyles";



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
    } catch {
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
      sx={loginCardStyle}
    >
      <Typography variant="h5" sx={loginTitleStyle} align="center" gutterBottom>
        SIGN IN
      </Typography>

      <TextField
        label="Username"
        name="username"
        type="text"
        fullWidth
        margin="normal"
        value={form.username}
        onChange={handleChange}
        sx={loginFieldStyle}
      />

      <TextField
        label="Passwort"
        name="password"
        type="password"
        fullWidth
        margin="normal"
        value={form.password}
        onChange={handleChange}
        sx={loginFieldStyle}
      />

      {loginError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMap[loginError] || loginError}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        sx={loginButtonStyle}
        fullWidth
        disabled={status === "loading"}
      >
        Login
      </Button>
    </Box>
  );
};

export default LoginForm;