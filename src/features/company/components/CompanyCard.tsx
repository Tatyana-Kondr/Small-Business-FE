import { Alert, Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import { NewCompanyDto } from "../types";
import { selectCompany, selectError, selectLoading, updateCompany, updateCompanyLogo } from "../companiesSlice";
import { useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { companyValidationSchema } from "../../../utils/companyValidationSchema";

export default function CompanyCard() {
  const dispatch = useAppDispatch();
  const company = useAppSelector(selectCompany);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (loading) return <CircularProgress />;

  if (!company) {
    return (
      <Alert severity="info">
        Keine Unternehmensdaten gefunden. Bitte erstellen Sie eine neue Firma.
      </Alert>
    );
  }

  const initialValues: NewCompanyDto = {
    name: company.name,
    address: company.address,
    phone: company.phone,
    email: company.email,
    bank: company.bank,
    ibanNumber: company.ibanNumber,
    bicNumber: company.bicNumber,
    vatId: company.vatId,
  };

  const handleSubmit = async (values: NewCompanyDto) => {
    try {
      await dispatch(updateCompany({ id: company.id, data: values })).unwrap();
      setEditing(false);
    } catch (err: any) {
      console.error(err.message || "Fehler beim Speichern");
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        await dispatch(updateCompanyLogo({ id: company.id, formData })).unwrap();
      } catch (err: any) {
        console.error("Fehler beim Hochladen des Logos:", err.message);
      } finally {
        setUploading(false);
        event.target.value = ""; // чтобы можно было выбрать тот же файл ещё раз
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 800, p: 3, border: "1px solid #ccc", borderRadius: 2 }}>
      {editing ? (
        <Formik
          initialValues={initialValues}
          validationSchema={companyValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <Typography variant="h6" gutterBottom>
                Unternehmen bearbeiten
              </Typography>

              {error && <Alert severity="error">{error}</Alert>}

              {[
                "name",
                "address",
                "phone",
                "email",
                "bank",
                "ibanNumber",
                "bicNumber",
                "vatId",
              ].map((field) => (
                <Box key={field} mb={1}>
                  <Field
                    as={TextField}
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    name={field}
                    fullWidth
                    margin="normal"
                  />
                  <ErrorMessage
                    name={field}
                    render={(msg) => (
                      <div style={{ color: "red", fontSize: 12 }}>{msg}</div>
                    )}
                  />
                </Box>
              ))}

              <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                <Button variant="outlined" onClick={() => setEditing(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  Speichern
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      ) : (
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={3}>
          {/* Левая колонка с данными */}
          <Box flex={1} sx={{ textAlign: "left" }}>
            <Typography variant="subtitle1">
              <strong>Name:</strong> {company.name}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Adresse:</strong> {company.address}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Telefon:</strong> {company.phone}
            </Typography>
            <Typography variant="subtitle1">
              <strong>E-Mail:</strong> {company.email}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Bank:</strong> {company.bank}
            </Typography>
            <Typography variant="subtitle1">
              <strong>IBAN:</strong> {company.ibanNumber}
            </Typography>
            <Typography variant="subtitle1">
              <strong>BIC:</strong> {company.bicNumber}
            </Typography>
            <Typography variant="subtitle1">
              <strong>USt-IdNr.:</strong> {company.vatId}
            </Typography>

            <Button
              sx={{ mt: 2 }}
              variant="contained"
              onClick={() => setEditing(true)}
            >
              Bearbeiten
            </Button>
          </Box>

          {/* Правая колонка с логотипом */}
          <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
            {company.logoUrl ? (
              <img
                src={`${import.meta.env.VITE_API_URL}${company.logoUrl}`}
                alt="Company Logo"
                style={{
                  width: 150,
                  height: 120,
                  objectFit: "contain",
                  border: "1px solid #ccc",
                  borderRadius: 8,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 150,
                  height: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px dashed #ccc",
                  borderRadius: 8,
                }}
              >
                <Typography variant="caption" color="textSecondary">
                  Kein Logo
                </Typography>
              </Box>
            )}

            {/* Скрытый input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {/* Текст-ссылка */}
            <Typography
              variant="body2"
              sx={{
                color: "primary.main",
                cursor: uploading ? "default" : "pointer",
                "&:hover": !uploading
                  ? { textDecoration: "underline", color: "primary.dark" }
                  : {},
                opacity: uploading ? 0.6 : 1,
                mt: 1,
              }}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              {uploading ? "Hochladen..." : "Neues Logo hochladen"}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}