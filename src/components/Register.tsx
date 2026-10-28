
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useState } from "react";

import type { NewUserDto } from "../features/auth/types";
import { useAppDispatch } from "../redux/hooks";

import {
  getAllUsers,
  register,
} from "../features/auth/authSlice";

import {
  handleApiError,
} from "../utils/errors/handleApiError";

import {
  getFieldErrors,
} from "../utils/errors/getFieldErrors";

import type { ApiError } from "../utils/errors/apiError";

import { errorMap } from "../utils/errors/errorMap";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import DraggableDialog from "../components/DraggableDialog";

import {
  primaryButtonStyle,
} from "../styles/buttonStyles";

interface Props {
  onClose: () => void;
}

type RegisterField = "username" | "email" | "password";

const registerFields: RegisterField[] = [
  "username",
  "email",
  "password",
];

// --------------------------------------------------
// VALIDATION
// --------------------------------------------------

const validationSchema = Yup.object({
  username: Yup.string()
    .trim()
    .required("Bitte Benutzername eingeben"),

  email: Yup.string()
    .trim()
    .email("Ungültige E-Mail-Adresse")
    .required("Bitte E-Mail-Adresse eingeben"),

  password: Yup.string()
    .required("Bitte Passwort eingeben")
    .min(8, "Mindestens 8 Zeichen erforderlich")
    .matches(
      /[A-Z]/,
      "Mindestens ein Großbuchstabe erforderlich"
    )
    .matches(
      /[a-z]/,
      "Mindestens ein Kleinbuchstabe erforderlich"
    )
    .matches(
      /\d/,
      "Mindestens eine Zahl erforderlich"
    )
    .matches(
      /[@#$%^&+=!]/,
      "Mindestens ein Sonderzeichen (@#$%^&+=!) erforderlich"
    )
    .matches(
      /^\S*$/,
      "Leerzeichen sind nicht erlaubt"
    ),
});

// --------------------------------------------------
// REGISTER COMPONENT
// --------------------------------------------------

export default function Register({ onClose }: Props) {
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = useState(false);

  return (
    <Formik<NewUserDto>
      initialValues={{
        username: "",
        email: "",
        password: "",
      }}
      validationSchema={validationSchema}
      validateOnBlur
      validateOnChange
      onSubmit={async (
        values,
        {
          setSubmitting,
          resetForm,
          setErrors,
          setTouched,
        }
      ) => {
        try {
          // ------------------------------------------
          // REGISTER
          // ------------------------------------------

          await dispatch(
            register({
              ...values,
              username: values.username.trim(),
              email: values.email?.trim() ?? "",
            })
          ).unwrap();

          resetForm();
          onClose();

          // ------------------------------------------
          // REFRESH USERS LIST
          // ------------------------------------------

          try {
            await dispatch(getAllUsers()).unwrap();
          } catch (error) {
            handleApiError(
              error,
              "Die Benutzerliste konnte nicht aktualisiert werden."
            );
          }
        } catch (error) {
          // ------------------------------------------
          // BACKEND ERRORS
          // ------------------------------------------

          const apiError = error as ApiError;

          const fieldErrors = getFieldErrors(
            apiError.data,
            registerFields
          );

          // ------------------------------------------
          // USERNAME / EMAIL ALREADY EXISTS
          // ------------------------------------------

          const message = apiError.message;

          if (
            message === "Username already exists" ||
            message === "User already exists"
          ) {
            fieldErrors.username =
              errorMap[message] ??
              "Dieser Benutzername ist bereits vergeben.";
          }

          if (message === "Email already exists") {
            fieldErrors.email =
              errorMap[message] ??
              "Diese E-Mail-Adresse wird bereits verwendet.";
          }

          // ------------------------------------------
          // SHOW FIELD ERRORS
          // ------------------------------------------

          if (Object.keys(fieldErrors).length > 0) {
            await setTouched(
              {
                username: Boolean(fieldErrors.username),
                email: Boolean(fieldErrors.email),
                password: Boolean(fieldErrors.password),
              },
              false
            );

            setErrors(fieldErrors);
          } else {
            // Ошибки, не связанные с полями
            handleApiError(
              error,
              "Der Benutzer konnte nicht registriert werden."
            );
          }
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, touched, errors }) => (
        <DraggableDialog
          open
          title={
            <Typography
              variant="h6"
              fontWeight={600}
            >
              Neuen Benutzer registrieren
            </Typography>
          }
          dialogWidth={480}
          onClose={() => {
            if (!isSubmitting) {
              onClose();
            }
          }}
          actions={
            <Button
              type="submit"
              form="register-form"
              variant="contained"
              disabled={isSubmitting}
              sx={primaryButtonStyle}
            >
              {isSubmitting
                ? "Speichern..."
                : "Registrieren"}
            </Button>
          }
        >
          <Form id="register-form" noValidate>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt: 2,
                mb: 2,
              }}
            >
              {/* ---------------------------------- */}
              {/* USERNAME */}
              {/* ---------------------------------- */}

              <Field
                as={TextField}
                name="username"
                label="Benutzername"
                fullWidth
                size="small"
                autoComplete="username"
                disabled={isSubmitting}
                error={Boolean(
                  touched.username && errors.username
                )}
                helperText={
                  touched.username && errors.username
                }
              />

              {/* ---------------------------------- */}
              {/* EMAIL */}
              {/* ---------------------------------- */}

              <Field
                as={TextField}
                name="email"
                label="E-Mail"
                type="email"
                fullWidth
                size="small"
                autoComplete="email"
                disabled={isSubmitting}
                error={Boolean(
                  touched.email && errors.email
                )}
                helperText={
                  touched.email && errors.email
                }
              />

              {/* ---------------------------------- */}
              {/* PASSWORD */}
              {/* ---------------------------------- */}

              <Field
                as={TextField}
                name="password"
                label="Passwort"
                type={showPassword ? "text" : "password"}
                fullWidth
                size="small"
                autoComplete="new-password"
                disabled={isSubmitting}
                error={Boolean(
                  touched.password && errors.password
                )}
                helperText={
                  touched.password && errors.password
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPassword((prev) => !prev)
                        }
                        edge="end"
                        size="small"
                        disabled={isSubmitting}
                        aria-label={
                          showPassword
                            ? "Passwort verbergen"
                            : "Passwort anzeigen"
                        }
                      >
                        {showPassword
                          ? <VisibilityOff />
                          : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Form>
        </DraggableDialog>
      )}
    </Formik>
  );
}
