import { useState } from "react";
import {
  Box,
  Typography,
} from "@mui/material";
import { ChangePasswordDto } from "../types";
import ChangePasswordForm from "./ChangePasswordForm";


interface Props {
  userId: number;
  onClose: () => void;
  onSubmit: (dto: ChangePasswordDto) => void;
  loading: boolean;
  error: string | null;
}

const ChangePasswordPanel: React.FC<Props> = ({ userId, onSubmit, loading, error }) => {
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (dto: ChangePasswordDto) => {
    setSuccess(false);
    await onSubmit(dto);
    setSuccess(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Passwort ändern
      </Typography>

      {success && (
        <Typography color="success.main" sx={{ mb: 2 }}>
          Passwort erfolgreich geändert!
        </Typography>
      )}

      <ChangePasswordForm
        userId={userId}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    </Box>
  );
};

export default ChangePasswordPanel;