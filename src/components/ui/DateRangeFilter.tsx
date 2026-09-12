import { Box, TextField, Typography } from "@mui/material";
import {
  filterDateFieldsStyle,
  filterDateRangeStyle,
  filterDateRangeTitleStyle,
} from "../../styles/formStyles";

type DateRangeFilterProps = {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
};

export default function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) {
  return (
    <Box sx={filterDateRangeStyle}>
      <Typography variant="caption" sx={filterDateRangeTitleStyle}>
        Zeitraum:
      </Typography>

      <Box sx={filterDateFieldsStyle}>
        <TextField
          label="Von"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Bis"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Box>
    </Box>
  );
}