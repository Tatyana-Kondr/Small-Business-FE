import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { UpdateUserDto, UserDto } from "../types";

interface Props {
  user: UserDto;
  onSave: (dto: UpdateUserDto) => void;
  onClose: () => void;
}

export default function EditUser({ user, onSave, onClose }: Props) {

  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      onSave({ username, email });
    } catch (err: any) {
      setError(err.message || "Fehler beim Speichern.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Benutzer bearbeiten
      </Typography>

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          fullWidth
          margin="normal"
        />

        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button variant="outlined" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Speichern..." : "Speichern"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}