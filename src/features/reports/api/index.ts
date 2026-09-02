import { apiFetch } from "../../../utils/apiFetch";
import { SalesYearReport } from "../types";

export async function fetchSalesReport(
  year?: number,
): Promise<SalesYearReport[]> {
  const url = year ? `/api/reports/sales?year=${year}` : "/api/reports/sales";

  return apiFetch<SalesYearReport[]>(
    url,
    {
      auth: true,
    },
    "Fehler beim Laden des Umsatzberichts.",
  );
}

export async function fetchSalesReportPdf(
  year?: number
): Promise<Blob> {

  const url =
    year !== undefined
      ? `/api/reports/sales/pdf?year=${year}`
      : "/api/reports/sales/pdf";

  const token = localStorage.getItem("accessToken");

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}${url}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Fehler beim Erstellen des Umsatzberichts."
    );
  }

  return await response.blob();
}