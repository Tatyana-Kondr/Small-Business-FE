import { Box, IconButton, TextField } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

type SearchBoxProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  width?: number;
  label?: string;
};

export default function SearchBox({
  value,
  onChange,
  onClear,
  width = 400,
  label = "Suche",
}: SearchBoxProps) {
  return (
    <Box display="flex" gap={1}>
      <TextField
        label={label}
        variant="outlined"
        size="small"
        value={value}
        onChange={onChange}
        sx={{
          width,
          backgroundColor: "white",
        }}
      />

      <IconButton
        aria-label="Suche zurücksetzen"
        onClick={onClear}
      >
        <ClearIcon />
      </IconButton>
    </Box>
  );
}