import { SxProps, Theme } from "@mui/material";
import { colors } from "./colors";

//обрисованая 
export const outlinedButtonStyle: SxProps<Theme> = {
  "&:hover": {
    backgroundColor: colors.accentLight,
    borderColor: colors.accentBlue,
  },
};

//основная
export const primaryButtonStyle: SxProps<Theme> = {
  backgroundColor: colors.accentBlue,
  color: colors.white,

  "&:hover": {
    backgroundColor: colors.accentDark,
  },
};

//кнопка "Abbrechen"
export const cancelButtonStyle: SxProps<Theme> = {
  transition: "transform 0.2s ease, font-weight 0.2s ease",
  "&:hover": {
   // transform: "scale(1.02)",
   // fontWeight: 500,
    color: colors.accentDark,
    backgroundColor: colors.accentLight,
  },
};

//серые иконки
export const iconButtonHoverStyle: SxProps<Theme> = {
  p: 0.5,
  transition: "transform 0.2s ease-in-out",

  "&:hover": {
    color: colors.iconGrey,
    transform: "scale(1.2)",
    backgroundColor: "transparent",
  },
};

//кнопка Neu
export const addButtonStyle: SxProps<Theme> = {
  height: 40,
  minHeight: 40,
  maxHeight: 40,
  minWidth: 72,
  alignSelf: "flex-start",
  whiteSpace: "nowrap",

  "&:hover": {
    borderColor: "#00acc1",
  },
};

//обрисованая 
export const outlinedDeleteButtonStyle: SxProps<Theme> = {
  "&:hover": {
    borderColor: colors.dangerLight,
  },
};

