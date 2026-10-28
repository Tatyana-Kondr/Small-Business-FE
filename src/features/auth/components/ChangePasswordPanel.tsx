import { useState } from "react";

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

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import type { ChangePasswordDto } from "../types";
import type { ApiError } from "../../../utils/errors/apiError";

import DraggableDialog from "../../../components/DraggableDialog";

import { primaryButtonStyle } from "../../../styles/buttonStyles";

import { handleApiError } from "../../../utils/errors/handleApiError";
import { getFieldErrors } from "../../../utils/errors/getFieldErrors";
import { errorMap } from "../../../utils/errors/errorMap";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

interface Props {
  onClose: () => void;
  onSubmit: (dto: ChangePasswordDto) => Promise<void>;
  loading: boolean;
  requireOldPassword?: boolean;
}

interface FormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type PasswordField = keyof FormValues;

// --------------------------------------------------
// VALIDATION
// --------------------------------------------------

const createValidationSchema = (requireOldPassword: boolean) =>
  Yup.object({
    oldPassword: requireOldPassword
      ? Yup.string().required("Bitte aktuelles Passwort eingeben")
      : Yup.string(),

    newPassword: Yup.string()
      .required("Bitte neues Passwort eingeben")
      .min(8, "Mindestens 8 Zeichen erforderlich")
      .matches(/[A-Z]/, "Mindestens ein Großbuchstabe erforderlich")
      .matches(/[a-z]/, "Mindestens ein Kleinbuchstabe erforderlich")
      .matches(/\d/, "Mindestens eine Zahl erforderlich")
      .matches(
        /[@#$%^&+=!]/,
        "Mindestens ein Sonderzeichen (@#$%^&+=!) erforderlich",
      )
      .matches(/^\S*$/, "Leerzeichen sind nicht erlaubt"),

    confirmPassword: Yup.string()
      .required("Bitte neues Passwort bestätigen")
      .oneOf([Yup.ref("newPassword")], "Passwörter stimmen nicht überein"),
  });

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

export default function ChangePasswordPanel({
  onClose,
  onSubmit,
  loading,
  requireOldPassword = false,
}: Props) {
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const togglePassword = (field: PasswordField) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validationSchema = createValidationSchema(requireOldPassword);

  const passwordFields = [
    ...(requireOldPassword
      ? [
          {
            name: "oldPassword" as const,
            label: "Aktuelles Passwort",
            autoComplete: "current-password",
          },
        ]
      : []),
    {
      name: "newPassword" as const,
      label: "Neues Passwort",
      autoComplete: "new-password",
    },
    {
      name: "confirmPassword" as const,
      label: "Neues Passwort bestätigen",
      autoComplete: "new-password",
    },
  ];

  return (
    <Formik<FormValues>
      initialValues={{
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }}
      validationSchema={validationSchema}
      validateOnBlur
      validateOnChange
      onSubmit={async (values, { setSubmitting, setErrors, setTouched }) => {
        try {
          // ------------------------------------------
          // CHANGE PASSWORD
          // ------------------------------------------

          await onSubmit({
            oldPassword: requireOldPassword ? values.oldPassword : undefined,
            newPassword: values.newPassword,
          });

          // Родительский компонент закрывает окно
          // после успешного сохранения.
        } catch (error) {
          // ------------------------------------------
          // BACKEND ERRORS
          // ------------------------------------------

          const apiError = error as ApiError;

          const fieldErrors = getFieldErrors(apiError.data, [
            "oldPassword",
            "newPassword",
          ]);

          // ------------------------------------------
          // INVALID OLD PASSWORD
          // ------------------------------------------

          if (
            apiError.message === "Invalid old password" ||
            apiError.message === "INVALID_OLD_PASSWORD"
          ) {
            fieldErrors.oldPassword =
              errorMap[apiError.message] ?? "Das aktuelle Passwort ist falsch.";
          }

          // ------------------------------------------
          // INVALID NEW PASSWORD
          // ------------------------------------------

          if (apiError.message === "Invalid password") {
            fieldErrors.newPassword =
              errorMap[apiError.message] ?? "Das neue Passwort ist ungültig.";
          }

          // ------------------------------------------
          // SHOW FIELD ERRORS
          // ------------------------------------------

          if (Object.keys(fieldErrors).length > 0) {
            await setTouched(
              {
                oldPassword: Boolean(fieldErrors.oldPassword),
                newPassword: Boolean(fieldErrors.newPassword),
                confirmPassword: false,
              },
              false,
            );

            setErrors(fieldErrors);
          } else {
            handleApiError(error, "Das Passwort konnte nicht geändert werden.");
          }
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, touched, errors, values }) => {
        const busy = loading || isSubmitting;

        return (
          <DraggableDialog
            open
            title={
              <Typography variant="h6" fontWeight={600}>
                Passwort ändern
              </Typography>
            }
            dialogWidth={480}
            onClose={() => {
              if (!busy) {
                onClose();
              }
            }}
            actions={
              <>
                <Button
                  type="submit"
                  form="change-password-form"
                  variant="contained"
                  disabled={busy}
                  sx={primaryButtonStyle}
                >
                  {busy ? "Speichern..." : "Passwort ändern"}
                </Button>
              </>
            }
          >
            <Form id="change-password-form" noValidate>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  mt: 2,
                  mb: 2,
                }}
              >
                {passwordFields.map(({ name, label, autoComplete }) => (
                  <Field
                    key={name}
                    as={TextField}
                    name={name}
                    label={label}
                    type={showPasswords[name] ? "text" : "password"}
                    fullWidth
                    size="small"
                    autoComplete={autoComplete}
                    disabled={busy}
                    error={Boolean(
                      (touched[name] ||
                        (name === "newPassword" &&
                          values.newPassword.length > 0)) &&
                      errors[name],
                    )}
                    helperText={
                      touched[name] ||
                      (name === "newPassword" && values.newPassword.length > 0)
                        ? errors[name]
                        : ""
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            edge="end"
                            disabled={busy}
                            onClick={() => togglePassword(name)}
                            aria-label={
                              showPasswords[name]
                                ? "Passwort verbergen"
                                : "Passwort anzeigen"
                            }
                          >
                            {showPasswords[name] ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                ))}
              </Box>
            </Form>
          </DraggableDialog>
        );
      }}
    </Formik>
  );
}
