import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { useRef, useState } from "react";

import { ErrorMessage, Field, Form, Formik } from "formik";

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";

import {
  selectCompany,
  selectError,
  selectLoading,
  updateCompany,
  updateCompanyLogo,
} from "../companiesSlice";

import { NewCompanyDto } from "../types";

import { companyValidationSchema } from "../../../utils/validation/companyValidationSchema";

import PageTitle from "../../../components/PageTitle";

import {
  cancelButtonStyle,
  primaryButtonStyle,
} from "../../../styles/buttonStyles";
import { sectionTitleStyle } from "../../../styles/typographyStyles";

export default function CompanyCard() {
  const dispatch = useAppDispatch();

  const company = useAppSelector(selectCompany);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (loading && !company) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 4,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
      await dispatch(
        updateCompany({
          id: company.id,
          data: values,
        }),
      ).unwrap();

      setEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      await dispatch(
        updateCompanyLogo({
          id: company.id,
          formData,
        }),
      ).unwrap();
    } catch (error) {
      console.error("Fehler beim Hochladen des Logos:", error);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          maxWidth: 900,
          mx: "auto",
          p: 3,
          borderRadius: 2,
          boxShadow: "none",
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 4,
          }}
        >
          {/* Левая часть */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
            }}
          >
            {/* Unternehmensdaten */}
            <Typography variant="subtitle1" sx={sectionTitleStyle}>
              Unternehmensdaten
            </Typography>

            <InfoRow label="Name" value={company.name} />

            <InfoRow label="Adresse" value={company.address} />

            <Divider sx={{ my: 2 }} />

            {/* Kontakt */}
            <Typography variant="subtitle1" sx={sectionTitleStyle}>
              Kontaktdaten
            </Typography>

            <InfoRow label="Telefon" value={company.phone} />

            <InfoRow label="E-Mail" value={company.email} />

            <Divider sx={{ my: 2 }} />

            {/* Bank */}
            <Typography variant="subtitle1" sx={sectionTitleStyle}>
              Bankverbindung
            </Typography>

            <InfoRow label="Bank" value={company.bank} />

            <InfoRow label="IBAN" value={company.ibanNumber} />

            <InfoRow label="BIC" value={company.bicNumber} />

            <InfoRow label="USt-IdNr." value={company.vatId} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                mt: 3,
              }}
            >
              <Button
                variant="contained"
                onClick={() => setEditing(true)}
                sx={{
                  ...primaryButtonStyle,
                  minWidth: 250,
                }}
              >
                Bearbeiten
              </Button>
            </Box>
          </Box>

          {/* Правая часть с логотипом */}
          <Box
            sx={{
              width: 240,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            {company.logoUrl ? (
              <Box
                component="img"
                src={`${import.meta.env.VITE_API_URL}${company.logoUrl}`}
                alt="Firmenlogo"
                sx={{
                  width: 210,
                  height: 150,
                  objectFit: "contain",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 1,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 210,
                  height: 150,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Kein Logo
                </Typography>
              </Box>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            <Button
              variant="text"
              size="small"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? "Hochladen..." : "Logo ändern"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Dialog редактирования */}
      <Dialog
        open={editing}
        onClose={loading ? undefined : () => setEditing(false)}
        fullWidth
        maxWidth="md"
      >
        <Formik
          initialValues={initialValues}
          validationSchema={companyValidationSchema}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <DialogContent>
                <PageTitle>Unternehmen bearbeiten</PageTitle>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "1fr 1fr",
                    },
                    gap: 2,
                    mt: 4,
                  }}
                >
                  <CompanyField name="name" label="Name" />

                  <CompanyField name="address" label="Adresse" />

                  <CompanyField name="phone" label="Telefon" />

                  <CompanyField name="email" label="E-Mail" type="email" />

                  <CompanyField name="bank" label="Bank" />

                  <CompanyField name="ibanNumber" label="IBAN" />

                  <CompanyField name="bicNumber" label="BIC" />

                  <CompanyField name="vatId" label="USt-IdNr." />
                </Box>
              </DialogContent>

              <DialogActions
                sx={{
                  px: 3,
                  pb: 3,
                  justifyContent: "space-between",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setEditing(false)}
                  disabled={isSubmitting || loading}
                  sx={cancelButtonStyle}
                >
                  Abbrechen
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || loading}
                  sx={primaryButtonStyle}
                >
                  {isSubmitting || loading ? "Speichern..." : "Speichern"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  );
}

interface InfoRowProps {
  label: string;
  value?: string | null;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "110px auto",
        justifyContent: "start",
        alignItems: "baseline",
        columnGap: 2,
        py: 0.35,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          textAlign: "left",
        }}
      >
        {label}:
      </Typography>

      <Typography
        variant="body2"
        sx={{
          textAlign: "left",
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}

interface CompanyFieldProps {
  name: keyof NewCompanyDto;
  label: string;
  type?: string;
}

function CompanyField({ name, label, type = "text" }: CompanyFieldProps) {
  return (
    <Box>
      <Field
        as={TextField}
        name={name}
        label={label}
        type={type}
        fullWidth
        size="small"
      />

      <ErrorMessage
        name={name}
        render={(message) => (
          <Typography
            variant="caption"
            color="error"
            sx={{
              display: "block",
              mt: 0.5,
              ml: 1.5,
            }}
          >
            {message}
          </Typography>
        )}
      />
    </Box>
  );
}
