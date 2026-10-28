import { TextField, Tooltip } from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { colors } from "../../styles/colors";

type EllipsisInputProps = Omit<TextFieldProps, "value"> & {
  value: string;
};

export default function EllipsisInput({
  value,
  sx,
  onFocus,
  onBlur,
  ...props
}: EllipsisInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [focused, setFocused] = useState(false);
  const [isOverflowed, setIsOverflowed] = useState(false);

  const checkOverflow = useCallback(() => {
    const input = inputRef.current;

    if (!input || !value) {
      setIsOverflowed(false);
      return;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      setIsOverflowed(false);
      return;
    }

    const style = window.getComputedStyle(input);
    context.font = style.font;

    const textWidth = context.measureText(value).width;
    const availableWidth = input.clientWidth;

    setIsOverflowed(textWidth > availableWidth + 1);
  }, [value]);

  useEffect(() => {
    checkOverflow();

    const input = inputRef.current;
    if (!input) return;

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(input);

    return () => observer.disconnect();
  }, [checkOverflow]);

  return (
    <Tooltip
      title={isOverflowed ? value : ""}
      placement="top-start"
      arrow
      disableHoverListener={
        !isOverflowed || focused || props.disabled
      }
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: colors.tableHover,
            color: colors.primaryDark,
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: 1.5,
            maxWidth: 1000,
            px: 1.5,
            py: 1,
            border: `1px solid ${colors.border}`,

          },
        },
        arrow: {
          sx: {
            color: colors.tableHover,
          },
        },
      }}
    >
      <TextField
        {...props}
        value={value}
        inputRef={inputRef}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        sx={{
          "& .MuiInputBase-input:not(:focus)": {
            textOverflow: "ellipsis",
          },
          ...sx,
        }}
      />
    </Tooltip>
  );
}