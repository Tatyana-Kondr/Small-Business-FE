import { useState } from "react";
import { TextField, Button, Box, Typography, Alert, Link} from "@mui/material";
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
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 5, p: 3, bgcolor: "white", boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: "bold",  color: "#0277bd"}} align="center" gutterBottom>
        SIGN IN
      </Typography>
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
          label="Passwort"
          name="password"
          type="password"
          fullWidth
          margin="normal"
          value={form.password}
          onChange={handleChange}
        />
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Link  color="primary"  href="#" underline="hover" sx={{marginTop: 1, fontSize: 14, transition: "color 0.2s", "&:hover": { color: "#1e88e5" } }}>
            Passwort vergessen?
          </Link>
        </Box>
        <Button type="submit" variant="contained" sx={{  backgroundImage: "linear-gradient(to right, #006064, #4dd0e1)"}}  fullWidth disabled={status === "loading"}>
          Login
        </Button>
      </form>
      <Box mt={2} textAlign="center">
        <Typography variant="body2">
          Noch nicht registriert?{" "}
          <Link href="/register" color="primary" underline="hover" sx={{ transition: "color 0.2s", "&:hover": { color: "#1e88e5" } }} >
            Jetzt registrieren
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;
