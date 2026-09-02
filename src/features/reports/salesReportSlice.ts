import { createAppSlice } from "../../redux/createAppSlice";
import { fetchSalesReport } from "./api";
import { SalesReportState } from "./types";

const initialState: SalesReportState = {
  reports: [],
  loading: false,
  error: null,
};

const handlePending = (state: SalesReportState) => {
  state.loading = true;
  state.error = null;
};

const handleRejected = (
  state: SalesReportState,
  action: any,
  message: string,
) => {
  state.error = action.error?.message ?? message;
  state.loading = false;
};

export const salesReportSlice = createAppSlice({
  name: "salesReport",
  initialState,

  reducers: (create) => ({
    getSalesReport: create.asyncThunk(
      async ({ year }: { year?: number }) => {
        return await fetchSalesReport(year);
      },
      {
        pending: handlePending,

        fulfilled: (state, action) => {
          state.reports = action.payload;
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          handleRejected(
            state,
            action,
            "Fehler beim Laden des Umsatzberichts.",
          );
        },
      },
    ),
  }),

  selectors: {
    selectSalesReports: (state) => state.reports,
    selectSalesReportLoading: (state) => state.loading,
    selectSalesReportError: (state) => state.error,
  },
});

export const { getSalesReport } = salesReportSlice.actions;

export const {
  selectSalesReports,
  selectSalesReportLoading,
  selectSalesReportError,
} = salesReportSlice.selectors;
