import { SxProps, Theme } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";
import { colors } from "./colors";

type AppSx = SystemStyleObject<Theme>;

export const formBoxStyle: SxProps<Theme> = {
  bgcolor: "#fafafa",
  borderRadius: 2,
  p: 4,
  boxShadow: 4,
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export const formGridStyle: SxProps<Theme> = {
  display: "grid",
  gap: 2,
};

export const formActionsRightStyle: SxProps<Theme> = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 2,
  mt: 1,
};

export const requiredFieldHelperStyle: SxProps<Theme> = {
  color: colors.danger,
};

export const pageToolbarStyle: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 2,

  position: "sticky",
  top: 0,
  zIndex: 1000,

  mb: 2,

  pl: 0,
  pr: {
    xs: 1,
    sm: 2,
  },
};

export const formSectionStyle: SxProps<Theme> = {
  p: 2,
  mb: 2,
  border: `1px solid ${colors.border}`,
  boxShadow: "none",
  borderRadius: 1,
};

export const saleFormFieldStyle: AppSx = {
  "& .MuiOutlinedInput-root": {
    height: 40,
  },

  "& .MuiInputBase-input": {
    boxSizing: "border-box",
  },

  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
  },
};

export const saleDateFieldStyle: AppSx = {
  "& .MuiOutlinedInput-root": {
    height: 40,
  },

  "& .MuiInputBase-input": {
    py: 0,
  },

  "& .MuiInputAdornment-root": {
    height: "100%",
  },

  "& .MuiIconButton-root": {
    p: 0.75,
  },
};

export const filterPanelStyle: AppSx = {
  mb: 4,
  px: 4,
  py: 3,
  borderRadius: 2,
  border: `1px solid ${colors.border}`,
  backgroundColor: "#f9f9f9",
};

export const filterDateRangeStyle: AppSx = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  flexWrap: "nowrap",
};

export const filterDateFieldsStyle: AppSx = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  flexWrap: "nowrap",

  "& .MuiTextField-root": {
    width: 165,
  },
};

export const filterDateRangeTitleStyle: AppSx = {
  fontSize: 16,
  whiteSpace: "nowrap",
};

export const filterPanelRowStyle: AppSx = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 3,
  flexWrap: "wrap",
};

export const filterOptionsStyle: AppSx = {
  display: "flex",
  alignItems: "center",
  gap: 2,
  flexWrap: "nowrap",

  "& .MuiFormControl-root": {
    height: 40,
  },

  "& .MuiOutlinedInput-root": {
    height: 40,
  },

  "& .MuiButton-root": {
    height: 40,
    minHeight: 40,
  },
};