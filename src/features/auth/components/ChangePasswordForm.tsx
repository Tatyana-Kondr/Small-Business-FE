
import { Box, TextField } from "@mui/material";

import { Controller, useForm } from "react-hook-form";

import type { ChangePasswordDto } from "../types";

interface Props {
  onSubmit: (dto: ChangePasswordDto) => Promise<void>;
  loading: boolean;
}

interface FormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordForm({
  onSubmit,
  loading,
}: Props) {
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword", "");

  const submitHandler = async (values: FormValues) => {
    const dto: ChangePasswordDto = {
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    };

    await onSubmit(dto);
  };

  return (
    <Box
      component="form"
      id="change-password-form"
      onSubmit={handleSubmit(submitHandler)}
    >
      <Controller
        name="oldPassword"
        control={control}
        rules={{
          required: "Aktuelles Passwort ist erforderlich.",
        }}
        render={({ field }) => (
          <TextField
            {...field}
            type="password"
            label="Aktuelles Passwort"
            fullWidth
            margin="normal"
            error={Boolean(errors.oldPassword)}
            helperText={errors.oldPassword?.message}
            disabled={loading}
          />
        )}
      />

      <Controller
        name="newPassword"
        control={control}
        rules={{
          required: "Ein neues Passwort ist erforderlich.",
          minLength: {
            value: 8,
            message: "Das Passwort muss mindestens 8 Zeichen lang sein.",
          },
          validate: (value) =>
            /[A-Z]/.test(value) &&
            /[0-9]/.test(value) &&
            /[@#$%^&+=!]/.test(value)
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
            error={Boolean(errors.newPassword)}
            helperText={errors.newPassword?.message}
            disabled={loading}
          />
        )}
      />

      <Controller
        name="confirmPassword"
        control={control}
        rules={{
          required: "Bestätigung des Passworts erforderlich.",
          validate: (value) =>
            value === newPassword ||
            "Passwörter stimmen nicht überein.",
        }}
        render={({ field }) => (
          <TextField
            {...field}
            type="password"
            label="Neues Passwort bestätigen"
            fullWidth
            margin="normal"
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword?.message}
            disabled={loading}
          />
        )}
      />
    </Box>
  );
}
