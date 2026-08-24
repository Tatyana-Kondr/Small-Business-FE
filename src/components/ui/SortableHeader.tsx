import { Box, TableCellProps } from "@mui/material";
import SortIcons from "./SortIcons";

type Props = {
  title: string;
  field: string;
  activeSort: string[];
  onSort: (field: string, direction: "ASC" | "DESC") => void;
  align?: TableCellProps["align"];
};

export default function SortableHeader({
  title,
  field,
  activeSort,
  onSort,
  align = "left",
}: Props) {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        width: "100%",
        userSelect: "none",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          textAlign: align,
        }}
      >
        {title}
      </Box>

      <SortIcons
        field={field}
        activeSort={activeSort}
        onSort={onSort}
      />
    </Box>
  );
}