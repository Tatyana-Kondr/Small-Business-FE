import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { Alert, Box, Button, Link, TextField, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { register } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Register() {
  const dispatch = useAppDispatch();
  const { status, registerErrorMessage } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Ungültiges E-Mail-Format").required("Erforderlich"),
    password: Yup.string()
      .min(4, "Das Passwort muss mindestens 4 Zeichen lang sein")
      .max(8, "Das Passwort darf nicht mehr als 8 Zeichen lang sein")
      .matches(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{4,8}$/, "Das Passwort muss mindestens einen Großbuchstaben und eine Zahl enthalten")
      .required("Required"),
  });

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 5, p: 3, bgcolor: "white", boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: "bold",  color: "#0277bd" }}  align="center" gutterBottom>ANMELDUNG</Typography>
      {registerErrorMessage && <Alert severity="error">{registerErrorMessage}</Alert>}
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          dispatch(register(values));
          setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Field as={TextField} label="Email" name="email" type="email" fullWidth margin="normal" />
            <ErrorMessage name="email">
              {(msg) => <div style={{ color: "red", fontSize: 12 }}>{msg}</div>}
            </ErrorMessage>

            <Field as={TextField} label="Passwort" name="password" type="password" fullWidth margin="normal" />
            <ErrorMessage name="password">
              {(msg) => <div style={{ color: "red", fontSize: 12 }}>{msg}</div>}
            </ErrorMessage>

            <Button type="submit" variant="contained" sx={{ marginTop:2, backgroundImage: "linear-gradient(to right, #006064, #4dd0e1)"}} fullWidth disabled={isSubmitting || status === "loading"}>
              Anmelden
            </Button>
          </Form>
        )}
      </Formik>
      <Typography variant="body2" align="center" mt={2}>
        Bereits registriert?{" "}
        <Link href="/login" color="primary" underline="hover" sx={{transition: "color 0.2s", "&:hover": { color: "#1e88e5" } }}>
          Einloggen
        </Link>
      </Typography>

    </Box>
  );
}
