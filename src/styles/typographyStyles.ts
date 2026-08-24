import { SxProps, Theme } from "@mui/material";
import { colors } from "./colors";

export const pageTitleStyle: SxProps<Theme> = {
  textAlign: "left",
  fontWeight: "bold",
  textDecoration: "underline",
  color: colors.primaryBlue,
};

export const sectionTitleStyle: SxProps<Theme> = {
  textAlign: "left",
  fontWeight: "bold",
  color: colors.primaryBlue,
};

export const dialogTitleStyle: SxProps<Theme> = {
  textAlign: "left",
  fontWeight: "bold",
  textDecoration: "underline",
  color: colors.primaryBlue,
};

export const errorTextStyle: SxProps<Theme> = {
  color: "error.main",
  fontWeight: 500,
};

export const formSaleSectionTitleStyle: SxProps<Theme> = {
  color: colors.accentBlue,
  fontWeight: 600,
  textAlign: "left",
  mb: 2,
};