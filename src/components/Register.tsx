import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { NewUserDto } from "../features/auth/types";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  getAllUsers,
  register,
  selectRegisterError,
  selectStatus,
} from "../features/auth/authSlice";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import {
  loginButtonStyle,
  loginCardStyle,
  loginFieldStyle,
  loginTitleStyle,
} from "../styles/loginStyles";
import { cancelButtonStyle } from "../styles/buttonStyles";

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
    email: Yup.string()
      .email("Ungültige E-Mail-Adresse")
      .required("Erforderlich"),
    password: Yup.string()
      .min(4, "Das Passwort muss mindestens 4 Zeichen lang sein")
      .max(8, "Das Passwort darf nicht mehr als 16 Zeichen lang sein")
      .matches(
        /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*]{4,16}$/,
        "Das Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben und eine Zahl enthalten",
      )
      .required("Erforderlich"),
  });

  return (
    <Dialog open onClose={onClose}>
      <DialogContent>
        <Box sx={{ ...loginCardStyle, mt: 0, boxShadow: "none" }}>
          <Typography
            variant="h5"
            sx={loginTitleStyle}
            align="center"
            gutterBottom
          >
            Neuen Benutzer registrieren
          </Typography>
          {registerErrorMessage && (
            <Alert severity="error">{registerErrorMessage}</Alert>
          )}

          <Formik
            initialValues={
              { username: "", email: "", password: "" } as NewUserDto
            }
            validationSchema={validationSchema}
            onSubmit={async (
              values: NewUserDto,
              { setSubmitting, resetForm },
            ) => {
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
            {({ isSubmitting, touched, errors }) => (
              <Form>
                {/* Username */}
                <Field
                  as={TextField}
                  label="Username"
                  name="username"
                  fullWidth
                  margin="normal"
                  sx={loginFieldStyle}
                  error={Boolean(touched.username && errors.username)}
                  helperText={touched.username && errors.username}
                />

                {/* Email */}
                <Field
                  as={TextField}
                  label="E-Mail"
                  name="email"
                  type="email"
                  fullWidth
                  margin="normal"
                  sx={loginFieldStyle}
                  error={Boolean(touched.email && errors.email)}
                  helperText={touched.email && errors.email}
                />

                {/* Passwort */}
                <Field
                  as={TextField}
                  label="Passwort"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  sx={loginFieldStyle}
                  error={Boolean(touched.password && errors.password)}
                  helperText={touched.password && errors.password}
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

                <Box display="flex" gap={2} mt={3}>
                  <Button sx={cancelButtonStyle} fullWidth onClick={onClose}>
                    Abbrechen
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || status === "loading"}
                    fullWidth
                    sx={{
                      ...loginButtonStyle,
                      mt: 0,
                    }}
                  >
                    {isSubmitting || status === "loading"
                      ? "Speichern..."
                      : "Registrieren"}
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
