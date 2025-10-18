import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { addCompany, selectError, selectLoading } from "../companiesSlice";
import { NewCompanyDto } from "../types";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { companyValidationSchema } from "../../../utils/companyValidationSchema";

export default function RegisterCompany() {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectError);
  const loading = useAppSelector(selectLoading);

  const initialValues: NewCompanyDto = {
    name: "",
    address: "",
    phone: "",
    email: "",
    bank: "",
    ibanNumber: "",
    bicNumber: "",
    vatId: "", // обрати внимание, чтобы совпадало с DTO
  };

  const handleSubmit = async (values: NewCompanyDto, formikHelpers: FormikHelpers<NewCompanyDto>) => {
    console.log("Submitting company →", values);
    try {
      await dispatch(addCompany(values)).unwrap();
      console.log("Company successfully added!");
      formikHelpers.resetForm();
    } catch (err: any) {
      console.error("Error creating company:", err.message || err);
    }
  };

  const handleValidation = (values: NewCompanyDto) => {
    try {
      companyValidationSchema.validateSync(values, { abortEarly: false });
    } catch (err: any) {
      console.error("Validation errors:", err.inner.map((e: any) => ({ path: e.path, message: e.message })));
    }
  };

  return (
    <Box sx={{ maxWidth: 600, p: 3, border: "1px solid #ccc", borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Neue Firma registrieren
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Formik
        initialValues={initialValues}
        validationSchema={companyValidationSchema}
        validate={handleValidation}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            {[
              { name: "name", label: "Name" },
              { name: "address", label: "Adresse" },
              { name: "phone", label: "Telefon" },
              { name: "email", label: "E-Mail", type: "email" },
              { name: "bank", label: "Bank" },
              { name: "ibanNumber", label: "IBAN" },
              { name: "bicNumber", label: "BIC" },
              { name: "vatId", label: "USt-IdNr." },
            ].map(({ name, label, type }) => (
              <Box key={name} mb={2}>
                <Field
                  as={TextField}
                  fullWidth
                  name={name}
                  label={label}
                  type={type || "text"}
                  variant="outlined"
                />
                <ErrorMessage
                  name={name}
                  render={(msg) => (
                    <Typography color="error" variant="caption">
                      {msg}
                    </Typography>
                  )}
                />
              </Box>
            ))}

            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button type="submit" variant="contained" disabled={isSubmitting || loading}>
                Registrieren
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
}