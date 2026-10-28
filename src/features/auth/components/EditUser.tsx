import { Box, Button, TextField, Typography } from "@mui/material";

import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

import type { UpdateUserDto, UserDto } from "../types";
import type { ApiError } from "../../../utils/errors/apiError";

import DraggableDialog from "../../../components/DraggableDialog";

import { primaryButtonStyle } from "../../../styles/buttonStyles";

import { handleApiError } from "../../../utils/errors/handleApiError";
import { getFieldErrors } from "../../../utils/errors/getFieldErrors";
import { errorMap } from "../../../utils/errors/errorMap";

// --------------------------------------------------
// PROPS
// --------------------------------------------------

interface Props {
  user: UserDto;
  onSave: (dto: UpdateUserDto) => Promise<void>;
  onClose: () => void;
}

type EditUserValues = {
  username: string;
  email: string;
};

// --------------------------------------------------
// VALIDATION
// --------------------------------------------------

const validationSchema = Yup.object({
  username: Yup.string().trim().required("Bitte Benutzername eingeben"),

  email: Yup.string()
    .trim()
    .email("Ungültige E-Mail-Adresse")
    .required("Bitte E-Mail-Adresse eingeben"),
});

// --------------------------------------------------
// EDIT USER
// --------------------------------------------------

export default function EditUser({ user, onSave, onClose }: Props) {
  return (
    <Formik<EditUserValues>
      initialValues={{
        username: user.username ?? "",
        email: user.email ?? "",
      }}
      enableReinitialize
      validationSchema={validationSchema}
      validateOnBlur
      validateOnChange
      onSubmit={async (values, { setSubmitting, setErrors, setTouched }) => {
        try {
          // ------------------------------------------
          // UPDATE USER
          // ------------------------------------------

          await onSave({
            username: values.username.trim(),
            email: values.email.trim(),
          });

          // Успешное сохранение.
          // Родительский компонент может закрывать
          // форму самостоятельно после onSave.
        } catch (error) {
          // ------------------------------------------
          // BACKEND ERRORS
          // ------------------------------------------

          const apiError = error as ApiError;

          const fieldErrors = getFieldErrors(apiError.data, [
            "username",
            "email",
          ]);

          const message = apiError.message;

          // ------------------------------------------
          // DUPLICATE USERNAME
          // ------------------------------------------

          if (
            message === "Username already exists" ||
            message === "User already exists"
          ) {
            fieldErrors.username =
              errorMap[message] ?? "Dieser Benutzername ist bereits vergeben.";
          }

          // ------------------------------------------
          // DUPLICATE EMAIL
          // ------------------------------------------

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
              },
              false,
            );

            setErrors(fieldErrors);
          } else {
            handleApiError(
              error,
              "Der Benutzer konnte nicht aktualisiert werden.",
            );
          }
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, touched, errors, dirty }) => (
        <DraggableDialog
          open
          title={
            <Typography variant="h6" fontWeight={600}>
              Benutzer bearbeiten
            </Typography>
          }
          dialogWidth={480}
          onClose={() => {
            if (!isSubmitting) {
              onClose();
            }
          }}
          actions={
            <>
              <Button
                type="submit"
                form="edit-user-form"
                variant="contained"
                disabled={isSubmitting || !dirty}
                sx={primaryButtonStyle}
              >
                {isSubmitting ? "Speichern..." : "Speichern"}
              </Button>
            </>
          }
        >
          <Form id="edit-user-form" noValidate>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt: 2,
                mb: 2,
              }}
            >
              {/* USERNAME */}

              <Field
                as={TextField}
                name="username"
                label="Benutzername"
                fullWidth
                size="small"
                autoComplete="username"
                disabled={isSubmitting}
                error={Boolean(touched.username && errors.username)}
                helperText={touched.username && errors.username}
              />

              {/* EMAIL */}

              <Field
                as={TextField}
                name="email"
                label="E-Mail"
                type="email"
                fullWidth
                size="small"
                autoComplete="email"
                disabled={isSubmitting}
                error={Boolean(touched.email && errors.email)}
                helperText={touched.email && errors.email}
              />
            </Box>
          </Form>
        </DraggableDialog>
      )}
    </Formik>
  );
}
