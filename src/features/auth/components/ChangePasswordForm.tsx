import { Button, TextField, Box, Typography } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { ChangePasswordDto } from "../types";


interface Props {
  userId: number;
  onSubmit: (dto: ChangePasswordDto) => void;
  loading: boolean;
  error: string | null;
}

interface FormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordForm({ onSubmit, loading, error }: Props) {
  const { handleSubmit, control, watch, formState: { errors } } = useForm<FormValues>();
  const newPassword = watch("newPassword", "");

  const submitHandler = (values: FormValues) => {
    const dto: ChangePasswordDto = {
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    };
    onSubmit(dto);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(submitHandler)} sx={{ maxWidth: 400, mx: "auto" }}>
      <Controller
        name="oldPassword"
        control={control}
        rules={{ required: "Aktuelles Passwort ist erforderlich." }}
        render={({ field }) => (
          <TextField
            {...field}
            type="password"
            label="Aktuelles Passwort"
            fullWidth
            margin="normal"
            error={!!errors.oldPassword}
            helperText={errors.oldPassword?.message}
          />
        )}
      />

      <Controller
        name="newPassword"
        control={control}
        rules={{
          required: "Ein neues Passwort ist erforderlich.",
          minLength: { value: 8, message: "Das Passwort muss mindestens 8 Zeichen lang sein." },
          validate: (value) =>
            /[A-Z]/.test(value) && /[0-9]/.test(value) && /[@#$%^&+=!]/.test(value)
              ? true
              : "Das Passwort muss Großbuchstaben, Zahlen und Sonderzeichen enthalten.",
        }}
        render={({ field }) => (
          <TextField
            {...field}
            type="password"
            label="Neues Passwort"
            fullWidth
            margin="normal"
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />
        )}
      />

      <Controller
        name="confirmPassword"
        control={control}
        rules={{
          required: "Bestätigung des Passworts erforderlich",
          validate: (value) => value === newPassword || "Passwörter stimmen nicht überein",
        }}
        render={({ field }) => (
          <TextField
            {...field}
            type="password"
            label="Bestätige neues Passwort"
            fullWidth
            margin="normal"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
        )}
      />

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        disabled={loading}
      >
        {loading ? "Speichern..." : "Passwort ändern"}
      </Button>
    </Box>
  );
}