import { createAppSlice } from "../../redux/createAppSlice";
import {
  fetchAddSale,
  fetchDeleteSale,
  fetchSaleById,
  fetchSales,
  fetchSalesByFilter,
  fetchSearchSales,
  fetchUpdateSale,
  fetchUpdateSalePaymentStatus,
} from "./api";
import { NewSaleDto, SalesState } from "./types";

const initialState: SalesState = {
  salesList: [],
  totalPages: 1,
  currentPage: 0,
  pageSize: 15,
  sort: ["salesDate,DESC", "invoiceNumber,DESC"],
  selectedSale: undefined,
  salesVersion: 0,
  loading: false,
  error: null,
};

interface GetSalesParams {
  page: number;
  size?: number;
  sort?: string[];
  searchTerm?: string;
}

const handlePending = (state: SalesState) => {
  state.loading = true;
  state.error = null;
};

const handleRejected = (state: SalesState, action: any, message: string) => {
  state.error = action.error?.message ?? message;
  state.loading = false;
};

export const salesSlice = createAppSlice({
  name: "sales",
  initialState,
  reducers: (create) => ({
    getSales: create.asyncThunk(
      async ({
        page,
        size = 15,
        sort = ["salesDate,DESC", "invoiceNumber,DESC"],
        searchTerm = "",
      }: GetSalesParams) => {
        return await fetchSales(page, size, sort, searchTerm);
      },
      {
        fulfilled: (state, action) => {
          const { content, totalPages, pageable } = action.payload;
          state.salesList = content;
          state.totalPages = totalPages;
          state.currentPage = pageable.pageNumber;
          state.pageSize = action.meta.arg.size ?? 15;
          state.sort = action.meta.arg.sort ?? [
            "salesDate,DESC",
            "invoiceNumber,DESC",
          ];
          state.loading = false;
          state.error = null;
        },
        pending: handlePending,
        rejected: (state, action) => {
          handleRejected(state, action, "Fehler beim Laden der Aufträge.");
        },
      },
    ),

    addSale: create.asyncThunk(
      async (newSale: NewSaleDto) => {
        return await fetchAddSale(newSale);
      },
      {
        pending: handlePending,

        fulfilled: (state) => {
          state.loading = false;
          state.error = null;
          state.salesVersion += 1;
        },

        rejected: (state, action) =>
          handleRejected(state, action, "Fehler beim Hinzufügen des Auftrags."),
      },
    ),

    getSaleById: create.asyncThunk(
      async (id: number) => {
        return await fetchSaleById(id);
      },
      {
        pending: handlePending,
        fulfilled: (state, action) => {
          state.selectedSale = action.payload;
          state.loading = false;
          state.error = null;
        },
        rejected: (state, action) =>
          handleRejected(state, action, "Fehler beim Laden des Auftrags."),
      },
    ),

    searchSales: create.asyncThunk(
      async ({
        query,
        page,
        size = 15,
        sort = ["salesDate,DESC", "invoiceNumber,DESC"],
      }: GetSalesParams & { query: string }) => {
        return await fetchSearchSales(query, page, size, sort);
      },
      {
        fulfilled: (state, action) => {
          state.salesList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
          state.pageSize = action.meta.arg.size ?? 15;
          state.sort = action.meta.arg.sort ?? [
            "salesDate,DESC",
            "invoiceNumber,DESC",
          ];
          state.loading = false;
          state.error = null;
        },
        pending: handlePending,
        rejected: (state, action) =>
          handleRejected(state, action, "Fehler beim Laden des Auftrags."),
      },
    ),

    getSalesByFilter: create.asyncThunk(
      async (params: {
        page: number;
        size?: number;
        sort?: string[];
        id?: number;
        customerId?: number;
        invoiceNumber?: string;
        totalAmount?: number;
        paymentStatus?: string;
        startDate?: string;
        endDate?: string;
        searchQuery?: string;
      }) => {
        const {
          page,
          size = 15,
          sort = ["salesDate,DESC", "invoiceNumber,DESC"],
          id,
          customerId,
          invoiceNumber,
          totalAmount,
          paymentStatus,
          startDate,
          endDate,
          searchQuery,
        } = params;

        return await fetchSalesByFilter(page, size, sort, {
          id,
          customerId,
          invoiceNumber,
          totalAmount,
          paymentStatus,
          startDate,
          endDate,
          searchQuery,
        });
      },
      {
        fulfilled: (state, action) => {
          state.salesList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
          state.pageSize = action.meta.arg.size ?? 15;
          state.sort = action.meta.arg.sort ?? [
            "salesDate,DESC",
            "invoiceNumber,DESC",
          ];
          state.loading = false;
          state.error = null;
        },
        pending: handlePending,
        rejected: (state, action) =>
          handleRejected(
            state,
            action,
            "Fehler beim Laden der gefilterten Aufträge.",
          ),
      },
    ),

    updateSale: create.asyncThunk(
      async ({ id, updatedSale }: { id: number; updatedSale: NewSaleDto }) => {
        return await fetchUpdateSale(id, updatedSale);
      },
      {
        pending: handlePending,

        fulfilled: (state, action) => {
          state.loading = false;
          state.error = null;

          if (state.selectedSale?.id === action.payload.id) {
            state.selectedSale = action.payload;
          }

          state.salesVersion += 1;
        },

        rejected: (state, action) =>
          handleRejected(state, action, "Fehler beim Bearbeiten des Auftrags."),
      },
    ),

    deleteSale: create.asyncThunk(
      async (id: number) => {
        await fetchDeleteSale(id);
        return id;
      },
      {
        pending: handlePending,

        fulfilled: (state, action) => {
          state.loading = false;
          state.error = null;

          if (state.selectedSale?.id === action.payload) {
            state.selectedSale = undefined;
          }

          state.salesVersion += 1;
        },

        rejected: (state, action) =>
          handleRejected(state, action, "Fehler beim Löschen des Auftrags."),
      },
    ),

    updateSalePaymentStatus: create.asyncThunk(
      async (id: number) => {
        return await fetchUpdateSalePaymentStatus(id);
      },
      {
        fulfilled: (state, action) => {
          const updatedSale = action.payload;
          state.salesList = state.salesList.map((s) =>
            s.id === updatedSale.id ? updatedSale : s,
          );
          state.loading = false;
          state.error = null;
        },
        pending: handlePending,
        rejected: (state, action) =>
          handleRejected(
            state,
            action,
            "Fehler beim Aktualisieren des Zahlungsstatus.",
          ),
      },
    ),
  }),

  selectors: {
    selectSales: (state: SalesState) => state.salesList,
    selectTotalPages: (state: SalesState) => state.totalPages,
    selectCurrentPage: (state: SalesState) => state.currentPage,
    selectPageSize: (state: SalesState) => state.pageSize,
    selectSale: (state: SalesState) => state.selectedSale,
    selectSalesVersion: (state: SalesState) => state.salesVersion,
    selectLoading: (state: SalesState) => state.loading,
    selectError: (state: SalesState) => state.error,
    selectSaleById: (state: SalesState, id: number) =>
      state.salesList.find((s) => s.id === id),
  },
});

export const {
  getSales,
  addSale,
  getSaleById,
  searchSales,
  getSalesByFilter,
  updateSale,
  deleteSale,
  updateSalePaymentStatus,
} = salesSlice.actions;
export const {
  selectSales,
  selectTotalPages,
  selectCurrentPage,
  selectPageSize,
  selectSale,
  selectSalesVersion,
  selectLoading,
  selectError,
  selectSaleById,
} = salesSlice.selectors;
