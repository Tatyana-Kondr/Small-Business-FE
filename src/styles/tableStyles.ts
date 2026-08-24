import { styled } from "@mui/material/styles";
import { TableHead } from "@mui/material";
import { colors } from "./colors";
import { SxProps, Theme } from "@mui/material";
import { SystemStyleObject } from "@mui/system";

//контейнер для таблицы
export const tableContainerStyle: AppSx = {
  borderRadius: 0,
  boxShadow: "none",
  width: "100%",

  "&.MuiPaper-root": {
    borderRadius: 0,
  },
};

//таблица
export const tableStyle: AppSx = {
  tableLayout: "fixed",
  width: "100%",
};

//Заголовок таблицы
export const StyledTableHead = styled(TableHead)({
  "& th": {
    backgroundColor: colors.primaryDark,
    color: colors.white,
    fontWeight: "bold",
    borderRight: `1px solid ${colors.border}`,
    textAlign: "center",
    padding: "6px 8px",
    height: 44,
  },

  "& .MuiTableCell-stickyHeader": {
    backgroundColor: colors.primaryDark,
    color: colors.white,
  },
});

//Подзаголовок таблицы
export const StyledSubTableHead = styled(TableHead)({
  backgroundColor: colors.accent,

  "& th": {
    color: colors.white,
    fontWeight: "bold",
    borderRight: `1px solid ${colors.border}`,
    textAlign: "center",
  },
});

//Ячейка таблицы
type AppSx = SystemStyleObject<Theme>;

export const cellStyle: AppSx = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  borderRight: `1px solid ${colors.border}`,
  padding: "2px 8px",
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

export const productPhotoCellStyle: AppSx = {
  ...fixedCellWidth(50),
  ...leftBorderCellStyle,

  borderRight: `1px solid ${colors.border}`,
  textAlign: "center",
  overflow: "hidden",
  whiteSpace: "nowrap",
  padding: "2px 8px",
};

export const compactTableCellStyle: AppSx = {
  ...cellStyle,
  padding: "2px 8px",
  height: 34,
  lineHeight: 1.2,
  verticalAlign: "middle",
};

export const compactActionCellStyle: AppSx = {
  ...compactTableCellStyle,
  padding: "0 2px",
  textAlign: "center",
};

//строка
export const tableRowHoverStyle = {
  cursor: "pointer",
  transition: "background-color 0.2s ease",

  "&:hover": {
    backgroundColor: `${colors.tableHover} !important`,
    transform: "translateY(-1px)",
  },
};

export const compactTableRowStyle: AppSx = {
  ...tableRowHoverStyle,

  "& td": {
    height: 34,
  },
};

export const actionIconButtonStyle: AppSx = {
  p: 0.5,
  transition:
    "transform 0.2s ease-in-out, color 0.2s ease-in-out, background-color 0.2s ease-in-out",

  "&:hover": {
    color: colors.iconGrey,
    transform: "scale(1.2)",
    backgroundColor: "transparent",
  },
};

export const compactIconButtonStyle: AppSx = {
  ...actionIconButtonStyle,
  p: 0.25,
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

export const actionBoxStyle: SxProps<Theme> = {
  padding: "2px 12px",
};

// Поля внутри таблиц Auftrag / Bestellung

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

export const saleTableCellStyle: AppSx = {
  borderRight: `1px solid ${colors.border}`,
  padding: "6px 6px",
  verticalAlign: "middle",
};

export const saleTableCenterCellStyle: AppSx = {
  ...saleTableCellStyle,
  textAlign: "center",
};

export const saleTableRightCellStyle: AppSx = {
  ...saleTableCellStyle,
  textAlign: "right",
};

export const saleTableNameCellStyle: AppSx = {
  ...saleTableCellStyle,
  verticalAlign: "top",
  py: 0.75,
};

export const saleTableDeleteCellStyle: AppSx = {
  ...saleTableCellStyle,
  textAlign: "center",
  p: 0,
};

