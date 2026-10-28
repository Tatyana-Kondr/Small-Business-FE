import { SxProps, Theme } from "@mui/material";
import { colors } from "./colors";

export const pageTitleStyle: SxProps<Theme> = {
  textAlign: "left",
  fontWeight: 700,
  color: colors.primaryBlue,
  textDecoration: "underline",
  letterSpacing: "0.3px",
};

export const dialogTitleStyle: SxProps<Theme> = {
  textAlign: "left",
  fontWeight: "bold",
  color: colors.primaryDark,
  borderLeft: `4px solid ${colors.accentBlue}`,
  pl: 1.5,
  lineHeight: 1.4,
};

export const sectionTitleStyle: SxProps<Theme> = {
  color: colors.accentBlue,
  fontWeight: 550,
  fontSize: "0.8rem",
  textAlign: "left",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  mb: 1,
  pb: 0.5,

};