import { useAppDispatch } from "../redux/hooks";
import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { register } from "../features/auth/authSlice";

export default function Register() {
  const dispatch = useAppDispatch();
  const { status, registerErrorMessage } = useSelector((state: RootState) => state.auth);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email format").required("Required"),
    password: Yup.string()
      .min(4, "Password must be at least 4 characters")
      //.max(8, "Password must be no more than 8 characters")
      //.matches(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{4,8}$/, "Password must contain at least one uppercase letter and one number")
      .required("Required"),
  });

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 5 }}>
      <Typography variant="h5">Anmeldung</Typography>
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

            <Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitting || status === "loading"}>
              Anmelden
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
}
