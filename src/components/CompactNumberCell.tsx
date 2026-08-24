import TextField from "@mui/material/TextField";

interface Props {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  align?: "left" | "center" | "right";
}

export default function CompactNumberCell({
  value,
  onChange,
  disabled = false,
  min = 0,
  max,
  step = 0.01,
  align = "right",
}: Props) {
  return (
    <TextField
      type="number"
      variant="standard"
      value={
        Number.isFinite(Number(value))
          ? value
          : ""
      }
      disabled={disabled}
      onChange={(e) => {
        const rawValue = e.target.value;

        if (rawValue === "") {
          onChange(0);
          return;
        }

        const parsedValue = Number(rawValue);

        if (Number.isFinite(parsedValue)) {
          onChange(parsedValue);
        }
      }}
      onFocus={(e) => {
        setTimeout(() => {
          e.target.select();
        }, 0);
      }}
      slotProps={{
        input: {
          disableUnderline: true,
        },

        htmlInput: {
          min,
          max,
          step,
        },
      }}
      sx={{
        width: "100%",

        "& .MuiInputBase-root": {
          width: "100%",
          p: 0,
        },

        "& .MuiInputBase-input": {
          fontSize: "0.875rem",
          p: 0,
          textAlign: align,
        },

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
      }}
    />
  );
}