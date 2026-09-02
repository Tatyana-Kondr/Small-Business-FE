import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  getSalesReport,
  selectSalesReportError,
  selectSalesReportLoading,
  selectSalesReports,
} from "../salesReportSlice";
import { fetchSalesReportPdf } from "../api";

const monthNames = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
};

export default function SalesReport() {
  const dispatch = useAppDispatch();

  const reports = useAppSelector(selectSalesReports);
  const loading = useAppSelector(selectSalesReportLoading);
  const error = useAppSelector(selectSalesReportError);

  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    dispatch(
      getSalesReport(selectedYear === "all" ? {} : { year: selectedYear }),
    )
      .unwrap()
      .then((data) => {
        if (selectedYear === "all") {
          const years = data.map((report) => report.year).sort((a, b) => b - a);

          setAvailableYears(years);
        }
      });
  }, [dispatch, selectedYear]);

  const handleOpenPdf = async () => {
    try {
      const year = selectedYear === "all" ? undefined : selectedYear;

      const blob = await fetchSalesReportPdf(year);

      const pdfUrl = URL.createObjectURL(blob);

      window.open(pdfUrl, "_blank");

      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 10000);
    } catch (error) {
      console.error("Fehler beim Öffnen des Umsatzberichts:", error);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="h6"
        sx={{
          textAlign: "left",
          fontWeight: "bold",
          textDecoration: "underline",
          color: "#1a3d6d",
          mb: 2,
        }}
      >
        Umsatzbericht
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          mb: 3,
        }}
      >
        <FormControl
          size="small"
          sx={{
            minWidth: 220,
          }}
        >
          <InputLabel id="sales-report-year-label">Zeitraum</InputLabel>

          <Select
            labelId="sales-report-year-label"
            value={selectedYear}
            label="Zeitraum"
            onChange={(event) => {
              const value = event.target.value;

              setSelectedYear(value === "all" ? "all" : Number(value));
            }}
          >
            <MenuItem value="all">Gesamter Zeitraum</MenuItem>

            {availableYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleOpenPdf}
          sx={{
            backgroundColor: "#1a3d6d",
            textTransform: "none",
            fontWeight: "bold",
            ml: 5,

            "&:hover": {
              backgroundColor: "#254f85",
            },
          }}
        >
          PDF erstellen
        </Button>
      </Box>

      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 4,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography
          color="error"
          sx={{
            mt: 2,
            textAlign: "left",
          }}
        >
          {error}
        </Typography>
      )}

      {!loading && !error && reports.length === 0 && (
        <Typography
          sx={{
            mt: 2,
            textAlign: "left",
          }}
        >
          Keine Daten vorhanden.
        </Typography>
      )}

      {!loading &&
        !error &&
        reports.map((report) => (
          <Box
            key={report.year}
            sx={{
              mb: 4,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#1a3d6d",
                textAlign: "left",
                mb: 1,
              }}
            >
              {report.year}
            </Typography>

            <TableContainer>
              <Table
                size="small"
                sx={{
                  tableLayout: "fixed",
                  width: "100%",
                }}
              >
                <TableHead
                  sx={{
                    backgroundColor: "#1a3d6d",

                    "& th": {
                      color: "white",
                      fontWeight: "bold",
                      borderRight: "1px solid #ddd",
                    },
                  }}
                >
                  <TableRow>
                    <TableCell
                      sx={{
                        width: "25%",
                      }}
                    >
                      Monat
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        width: "25%",
                      }}
                    >
                      Netto
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        width: "25%",
                      }}
                    >
                      MwSt.
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        width: "25%",
                      }}
                    >
                      Brutto
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {report.months.map((month) => (
                    <TableRow
                      key={`${month.year}-${month.month}`}
                      sx={{
                        "&:hover td": {
                          backgroundColor: "#e3f2fd",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          borderRight: "1px solid #ddd",
                        }}
                      >
                        {monthNames[month.month - 1]}
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          borderRight: "1px solid #ddd",
                        }}
                      >
                        {formatCurrency(month.netAmount)}
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          borderRight: "1px solid #ddd",
                        }}
                      >
                        {formatCurrency(month.taxAmount)}
                      </TableCell>

                      <TableCell align="right">
                        {formatCurrency(month.grossAmount)}
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow
                    sx={{
                      backgroundColor: "#f5f5f5",

                      "& td": {
                        fontWeight: "bold",
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        borderRight: "1px solid #ddd",
                      }}
                    >
                      Gesamt {report.year}
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        borderRight: "1px solid #ddd",
                      }}
                    >
                      {formatCurrency(report.totalNet)}
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        borderRight: "1px solid #ddd",
                      }}
                    >
                      {formatCurrency(report.totalTax)}
                    </TableCell>

                    <TableCell align="right">
                      {formatCurrency(report.totalGross)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
    </Box>
  );
}
