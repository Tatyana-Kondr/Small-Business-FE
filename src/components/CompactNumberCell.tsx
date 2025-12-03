import TextField from "@mui/material/TextField";

interface Props {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function CompactNumberCell({ value, onChange, disabled }: Props) {
  return (
    <TextField
      type="number"
      variant="standard"
      value={value}
      disabled={disabled}
      onChange={(e) => {
        const val = Number(e.target.value);
        if (!isNaN(val)) onChange(val);
      }}
      onFocus={(e) => {
        // Выделяет ВСЁ число при клике
        setTimeout(() => e.target.select(), 0);
      }}
      InputProps={{
        disableUnderline: true,
        sx: {
          "& input[type=number]": {
            MozAppearance: "textfield",
          },
          "& input[type=number]::-webkit-outer-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
          },
          "& input[type=number]::-webkit-inner-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
          },
          "& .MuiInputBase-input": {
            fontSize: "0.875rem",
            padding: 0,
            textAlign: "right",
          },
        },
      }}
      sx={{
        "& .MuiInputBase-root": {
          padding: 0,
        },
      }}
    />
  );
}
