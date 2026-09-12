import { styled } from "@mui/material/styles";
import { TableHead } from "@mui/material";
import { SxProps, Theme } from "@mui/material";
import { SystemStyleObject } from "@mui/system";
import { colors } from "./colors";

type AppSx = SystemStyleObject<Theme>;

const TABLE_ROW_HEIGHT = 32;
const TABLE_CELL_PADDING = "2px 8px";

// =========================
// TABLE
// =========================

export const tableContainerStyle: AppSx = { 
  width: "100%",
  borderRadius: 0,
  boxShadow: "none",

  "&.MuiPaper-root": {
    borderRadius: 0,
  },
};

export const tableStyle: AppSx = {//
  width: "100%",
  tableLayout: "fixed",
};

// =========================
// TABLE HEAD
// =========================

export const StyledTableHead = styled(TableHead)({
  "& th": {
    height: 44,
    padding: "6px 8px",
    backgroundColor: colors.primaryDark,
    color: colors.white,
    fontWeight: "bold",
    textAlign: "center",
    borderRight: `1px solid ${colors.border}`,
    verticalAlign: "middle",
  },

  "& .MuiTableCell-stickyHeader": {
    backgroundColor: colors.primaryDark,
    color: colors.white,
  },
});

export const StyledSubTableHead = styled(TableHead)({
  "& th": {
    backgroundColor: colors.accent,
    color: colors.white,
    fontWeight: "bold",
    textAlign: "center",
    borderRight: `1px solid ${colors.border}`,
    verticalAlign: "middle",
  },
});

// =========================
// CELLS
// =========================

export const cellStyle: AppSx = {
  height: TABLE_ROW_HEIGHT,
  padding: TABLE_CELL_PADDING,
  lineHeight: 1.2,
  verticalAlign: "middle",

  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",

  borderRight: `1px solid ${colors.border}`,
};

export const fixedCellWidth = (width: number): AppSx => ({
  width,
  minWidth: width,
  maxWidth: width,
});

export const hoverExpandCellStyle: AppSx = {
  ...cellStyle,
  position: "relative",
  overflow: "visible",
};

export const leftBorderCellStyle: AppSx = {
  borderLeft: `1px solid ${colors.border}`,
};

export const centerCellStyle: AppSx = {
  ...cellStyle,
  textAlign: "center",
};

export const rightCellStyle: AppSx = {
  ...cellStyle,
  textAlign: "right",
};

// =========================
// ROWS
// =========================

export const tableRowHoverStyle: AppSx = {
  cursor: "pointer",
  transition: "background-color 0.2s ease",

  "& td": {
    height: TABLE_ROW_HEIGHT,
    verticalAlign: "middle",
  },

  "&:hover": {
    backgroundColor: `${colors.tableHover} !important`,
  },
};

// =========================
// PRODUCT PHOTO
// =========================

export const productPhotoCellStyle: AppSx = {
  ...cellStyle,
  ...fixedCellWidth(40),
  ...leftBorderCellStyle,

  textAlign: "center",
  padding: "2px 4px",
};

// =========================
// ACTIONS
// =========================

export const actionCellStyle: AppSx = {
  ...centerCellStyle,
  padding: "0 2px",
};

export const actionIconButtonStyle: AppSx = {
  p: 0.25,
  transition:
    "transform 0.2s ease-in-out, color 0.2s ease-in-out, background-color 0.2s ease-in-out",

  "&:hover": {
    color: colors.iconGrey,
    transform: "scale(1.2)",
    backgroundColor: "transparent",
  },
};

export const pdfTextButtonStyle: SxProps<Theme> = {
  fontWeight: "bold",
  transition: "transform 0.2s ease-in-out",

  "&:hover": {
    color: colors.iconGrey,
    transform: "scale(1.2)",
    backgroundColor: "transparent",
  },
};

export const pdfActionsStyle: AppSx = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 0.75,
  width: "100%",
};

export const tableActionsStyle: AppSx = {
  display: "grid",
  gridTemplateColumns: "28px 28px 28px",
  justifyContent: "center",
  alignItems: "center",
  columnGap: 1,
  width: "100%",
};

export const tableActionSlotStyle: AppSx = {
  width: 28,
  height: 28,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

// =========================
// INPUTS INSIDE TABLES
// =========================

export const saleTableTextInputStyle: AppSx = {
  "& .MuiInputBase-root": {
    border: "none",
    backgroundColor: "transparent",
    p: 0,
  },

  "& .MuiInputBase-input": {
    fontSize: "0.875rem",
    p: 0,
  },
};

export const saleTableNameInputStyle: AppSx = {
  "& .MuiInputBase-root": {
    alignItems: "flex-start",
    p: 0,
    backgroundColor: "transparent",
  },

  "& .MuiInputBase-inputMultiline": {
    p: 0,
    lineHeight: 1.35,
    fontSize: "0.875rem",
    overflow: "hidden !important",
    resize: "none",
  },

  "& textarea": {
    overflow: "hidden !important",
  },
};

export const saleTableNameCellStyle: AppSx = { 
  ...cellStyle, 
  verticalAlign: "top", 
  py: 0.75, 
};

// =========================
// CATEGORY CELL
// =========================

export const categoryCellWidthStyle: AppSx = {
  width: "15%",
  minWidth: 150,
};