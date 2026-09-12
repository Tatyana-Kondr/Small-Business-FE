import { SxProps, Theme } from "@mui/material";
import { colors } from "./colors";

export const loginPageStyle: SxProps<Theme> = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  pt: 12,
  boxSizing: "border-box",
  bgcolor: colors.background,
};

export const loginCardStyle: SxProps<Theme> = {
  width: 430,
  maxWidth: "90%",
  mx: "auto",
  p: 3,
  bgcolor: colors.white,
  boxShadow: 3,
  borderRadius: 2,
};

export const loginTitleStyle: SxProps<Theme> = {
  fontWeight: "bold",
  color: colors.primaryBlue,
};

export const loginFieldStyle: SxProps<Theme> = {
  "& .MuiOutlinedInput-root": {
    height: 48,
  },
};

export const loginButtonStyle: SxProps<Theme> = {
  mt: 4,
  height: 48,
  borderRadius: 1,
  backgroundImage: `linear-gradient(to right, ${colors.gradientDark}, ${colors.gradientLight})`,

  "&:hover": {
    backgroundImage: `linear-gradient(to right, ${colors.gradientDark}, ${colors.accent})`,
  },
};