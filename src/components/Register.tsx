import { Alert, Box, Button, Dialog, DialogContent, DialogTitle, IconButton, InputAdornment, TextField } from "@mui/material";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { NewUserDto } from "../features/auth/types";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getAllUsers, register, selectRegisterError, selectStatus } from "../features/auth/authSlice";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";

interface Props {
  onClose: () => void;
}

export default function Register({ onClose }: Props) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectStatus);
  const registerErrorMessage = useAppSelector(selectRegisterError);

  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    username: Yup.string().required("Erforderlich"),
    email: Yup.string().email("Ungültige E-Mail-Adresse").required("Erforderlich"),
    password: Yup.string()
      .min(4, "Das Passwort muss mindestens 4 Zeichen lang sein")
      .max(8, "Das Passwort darf nicht mehr als 16 Zeichen lang sein")
      .matches(
        /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*]{4,16}$/,
        "Das Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben und eine Zahl enthalten"
      )
      .required("Erforderlich"),
  });

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Neuen Benutzer registrieren</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, minWidth: 300 }}>
        {registerErrorMessage && <Alert severity="error">{registerErrorMessage}</Alert>}

        <Formik
          initialValues={{ username: "", email: "", password: "" } as NewUserDto}
          validationSchema={validationSchema}
          onSubmit={async (values: NewUserDto, { setSubmitting, resetForm }) => {
            try {
              await dispatch(register(values)).unwrap();
              await dispatch(getAllUsers());
              resetForm();
              onClose();
            } catch (err) {
              console.error("Registration failed", err);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              {/* Username */}
              <Field
                as={TextField}
                label="Username"
                name="username"
                fullWidth
                margin="normal"
              />
              <ErrorMessage name="username">
                {(msg) => <div style={{ color: "red", fontSize: 12 }}>{msg}</div>}
              </ErrorMessage>

              {/* Email */}
              <Field
                as={TextField}
                label="E-Mail"
                name="email"
                type="email"
                fullWidth
                margin="normal"
              />
              <ErrorMessage name="email">
                {(msg) => <div style={{ color: "red", fontSize: 12 }}>{msg}</div>}
              </ErrorMessage>

              {/* Passwort */}
              <Field
                as={TextField}
                label="Passwort"
                name="password"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <ErrorMessage name="password">
                {(msg) => <div style={{ color: "red", fontSize: 12 }}>{msg}</div>}
              </ErrorMessage>

               <Box display="flex" justifyContent="space-between" mt={2}>
                  <Button variant="outlined" onClick={onClose}>
                    Abbrechen
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || status === "loading"}
                  >
                    {isSubmitting || status === "loading" ? "Speichern..." : "Benutzer registrieren"}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </DialogContent>
    </Dialog>
  );
}