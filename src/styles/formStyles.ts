import { SxProps, Theme } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";
import { colors } from "./colors";

type AppSx = SystemStyleObject<Theme>;

export const pageContentStyle: SxProps<Theme> = {
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",

  px: {
    xs: 1,
    sm: 2,
    md: 2,
  },

  py: 2,
};

export const listPageStyle: SxProps<Theme> = {
  p: 0,
  m: 0,
  width: "100%",
  height: "calc(100vh - 96px)",
  minHeight: 0,

  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",

  overflow: "hidden",
};

export const pageToolbarStyle: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 2,

  position: "sticky",
  top: 0,
  zIndex: 1000,
  mt: 1,
  mb: 2,
};

export const compactPageToolbarStyle = (width: number): AppSx => ({
  ...pageToolbarStyle,
  width,
  maxWidth: "100%",
  mx: "auto",
});

export const dateFieldStyle: AppSx = {
  "& .MuiPickersOutlinedInput-root": {
    height: 40,

    "&:hover": {
      backgroundColor: colors.accentLight,
    },

    "&:hover .MuiPickersOutlinedInput-notchedOutline": {
      borderColor: colors.accentBlue,
    },

    "&.Mui-focused": {
      backgroundColor: colors.accentLight,
      boxShadow: `0 0 0 2px ${colors.accentLight}`,
    },

    "&.Mui-focused .MuiPickersOutlinedInput-notchedOutline": {
      borderColor: colors.accentBlue,
      borderWidth: 2,
    },
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

export const listTableAreaStyle: SxProps<Theme> = {
  width: "100%",
  maxWidth: "100%",
  flex: 1,
  minHeight: 0,
  overflowX: "auto",
};

export const listPaginationStyle: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  flexShrink: 0,
  pb: 1,
};

export const productFormColumnsStyle: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "1fr 1fr",
  },
  gap: 3,
};

export const productFormColumnStyle: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export const compactDimensionFieldStyle = {
  "& .MuiInputBase-input": {
    fontSize: "0.8rem",
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.8rem",
  },
};

export const productEditSectionStyle: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  minWidth: 0,
};

export const productDimensionsGridStyle: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "minmax(0, 1fr)",
    sm: "repeat(2, minmax(0, 1fr))",
  },
  gap: 2,
};

export const productMainRowStyle: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "minmax(0, 1fr)",
    md: "minmax(0, 1.5fr) minmax(0, 0.7fr)",
  },
  gap: 2,
};

export const productDetailsRowStyle: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "minmax(0, 1fr)",
    sm: "repeat(2, minmax(0, 1fr))",
    md: "repeat(4, minmax(0, 1fr))",
  },
  gap: 2,
};

export const productEditThreeColumnsStyle: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "minmax(0, 1fr)",
    md: "minmax(0, 0.4fr) minmax(0, 0.8fr) minmax(0, 1.2fr)",
  },
  gap: 4,
  mt: 1,
  alignItems: "start",
};
