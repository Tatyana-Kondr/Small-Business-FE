export type SalesMonthlyReport = {
  year: number;
  month: number;
  netAmount: number;
  taxAmount: number;
  grossAmount: number;
};

export type SalesYearReport = {
  year: number;
  months: SalesMonthlyReport[];
  totalNet: number;
  totalTax: number;
  totalGross: number;
};

export interface SalesReportState {
  reports: SalesYearReport[];
  loading: boolean;
  error: string | null;
}