import { useState } from "react";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useAppDispatch } from "../redux/hooks";
import { login } from "../features/auth/authSlice";

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const { status, loginErrorMessage } = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 5 }}>
      <Typography variant="h5">Login form</Typography>
      {loginErrorMessage && <Alert severity="error">{loginErrorMessage}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          name="email"
          type="email"
          fullWidth
          margin="normal"
          value={form.email}
          onChange={handleChange}
        />
        <TextField
          label="Пароль"
          name="password"
          type="password"
          fullWidth
          margin="normal"
          value={form.password}
          onChange={handleChange}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={status === "loading"}>
          Login
        </Button>
      </form>
    </Box>
  );
};

export default LoginForm;
