import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import { colors } from "../styles/colors";

interface Props {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  align?: "left" | "center" | "right";
  error?: boolean;
  errorText?: string;
}

export default function CompactNumberCell({
  value,
  onChange,
  disabled = false,
  min = 0,
  max,
  step = 0.01,
  align = "right",
  error = false,
  errorText = "",
}: Props) {
  return (
    <Tooltip
      title={error ? errorText : ""}
      placement="top"
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: colors.white,
            color: "error.main",
            fontSize: "0.75rem",
            fontWeight: 500,
            px: 1,
            py: 0.5,
            boxShadow: "none",
          },
        },
        arrow: {
          sx: {
            color: "transparent",
          },
        },
      }}
    >
      <TextField
        type="number"
        variant="standard"
        value={Number.isFinite(Number(value)) ? value : ""}
        disabled={disabled}
        error={error}
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

            ...(error && {
              outline: "1px solid",
              outlineColor: "error.main",
              borderRadius: "3px",
            }),
          },

          "& .MuiInputBase-input": {
            fontSize: "0.875rem",
            p: error ? "1px 3px" : 0,
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
    </Tooltip>
  );
}
