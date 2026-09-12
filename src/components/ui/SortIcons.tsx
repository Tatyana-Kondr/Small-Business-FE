import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Box } from "@mui/material";
import { colors } from "../../styles/colors";


type SortIconsProps = {
  field: string;
  activeSort: string[];
  onSort: (field: string, direction: "ASC" | "DESC") => void;
};

export default function SortIcons({
  field,
  activeSort,
  onSort,
}: SortIconsProps) {
  return (
    <Box display="flex" flexDirection="column" ml={0.5}>
      <ArrowDropUpIcon
        fontSize="small"
        onClick={() => onSort(field, "ASC")}
        sx={{
          cursor: "pointer",
          color:
            activeSort[0] === `${field},ASC`
              ? colors.accent
              : "#bdbdbd",

          "&:hover": {
            color: colors.accent,
          },
        }}
      />

      <ArrowDropDownIcon
        fontSize="small"
        onClick={() => onSort(field, "DESC")}
        sx={{
          cursor: "pointer",
          color:
            activeSort[0] === `${field},DESC`
              ? colors.accent
              : "#bdbdbd",

          "&:hover": {
            color: colors.accent,
          },
        }}
      />
    </Box>
  );
}