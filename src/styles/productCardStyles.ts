import type { SystemStyleObject } from "@mui/system";
import type { Theme } from "@mui/material";
import { colors } from "./colors";

type AppSx = SystemStyleObject<Theme>;

export const productCardContainerStyle: AppSx = {
  display: "flex",
  justifyContent: "center",
  pb: 2,
};

export const productCardPaperStyle: AppSx = {
  overflow: "hidden",
  p: 3,
  width: {
    xs: "100%",
    sm: "95%",
    md: "90%",
    lg: 1200,
  },
  mx: "auto",
  display: "flex",
  flexDirection: "column",

  height: 680,
  minHeight: 680,

  boxSizing: "border-box",
  minWidth: 0,

  borderRadius: 2,
};

export const productCardHeaderStyle: AppSx = {
  backgroundImage: `linear-gradient(
    to right,
    ${colors.gradientDark},
    ${colors.primaryBlue}
  )`,
  color: colors.white,
  px: 2.5,
  py: 1,
  mb: 1,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 2,
  borderRadius: 1,
};

export const productCardTabsStyle: AppSx = {
  mb: 1,
  borderBottom: `1px solid ${colors.border}`,

  "& .MuiTab-root": {
    textTransform: "none",
    fontWeight: 600,
    minHeight: 44,

    "&:focus": {
      outline: "none",
    },

    "&:focus-visible": {
      outline: "none",
    },
  },

  "& .Mui-selected": {
    color: `${colors.accentBlue} !important`,
  },

  "& .MuiTabs-indicator": {
    backgroundColor: colors.accentBlue,
  },
};

export const productDetailsBoxStyle: AppSx = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
};

export const productDetailRowStyle: AppSx = {
  display: "grid",
  gridTemplateColumns: "150px minmax(0, 1fr)",
  gap: 2,
  alignItems: "center",
  minHeight: 30,
  py: 0.5,
  borderBottom: `1px solid ${colors.border}`,
};

export const productDetailLabelStyle: AppSx = {
  color: `${colors.primaryDark} !important`,
  fontWeight: 700,
  textAlign: "left",
};

export const productDetailValueStyle: AppSx = {
  color: "text.primary",
  textAlign: "left",
  overflowWrap: "anywhere",
};

export const productGalleryStyle: AppSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  height: "100%",
  minHeight: 0,
};

export const productMainImageBoxStyle: AppSx = {
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  minHeight: 420,
};

export const galleryArrowLeftStyle: AppSx = {
  position: "absolute",
  left: 0,
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 1,
};

export const galleryArrowRightStyle: AppSx = {
  position: "absolute",
  right: 0,
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 1,
};

export const thumbnailStyle = (selected: boolean): AppSx => ({
  border: selected
    ? `2px solid ${colors.accentBlue}`
    : `1px solid ${colors.border}`,
  borderRadius: 1,
  p: "2px",
  cursor: "pointer",
  transition: "transform 0.2s ease, border-color 0.2s ease",

  "&:hover": {
    transform: "scale(1.05)",
    borderColor: colors.accentBlue,
  },
});

export const galleryActionsStyle: AppSx = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 1,
  flexWrap: "wrap",
  mt: "auto",
  pt: 4,
};

export const imageModalStyle: AppSx = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 800,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 2,
};
