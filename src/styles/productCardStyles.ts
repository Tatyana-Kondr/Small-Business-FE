import type { SystemStyleObject } from "@mui/system";
import type { Theme } from "@mui/material";
import { colors } from "./colors";

type AppSx = SystemStyleObject<Theme>;

export const productCardContainerStyle: AppSx = {
  display: "flex",
  justifyContent: "center",
  py: 3,
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
  py: 1.5,
  mb: 2,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 2,
  borderRadius: 1,
};

export const productCardTabsStyle: AppSx = {
  mb: 2,
  borderBottom: `1px solid ${colors.border}`,

  "& .MuiTab-root": {
    textTransform: "none",
    fontWeight: 600,
    minHeight: 44,
  },

  "& .Mui-selected": {
    color: `${colors.accentBlue} !important`,
  },

  "& .MuiTabs-indicator": {
    backgroundColor: colors.accentBlue,
  },
};

export const productSectionStyle: AppSx = {
  height: "100%",
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.white,
  p: 2,
};

export const productDetailsBoxStyle: AppSx = {
  display: "flex",
  flexDirection: "column",
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
  gap: 2,
  height: "100%",
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

export const thumbnailListStyle: AppSx = {
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: 1,
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
  gap: 3,
  flexWrap: "wrap",
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