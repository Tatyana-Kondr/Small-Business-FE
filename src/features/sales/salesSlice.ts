import { createAppSlice } from "../../redux/createAppSlice";
import { fetchAddSale, fetchDeleteSale, fetchSaleById, fetchSales, fetchSalesByFilter, fetchSearchSales, fetchUpdateSale, fetchUpdateSalePaymentStatus } from "./api";
import { NewSaleDto, SalesState } from "./types";

const initialState: SalesState = {
  salesList: [],
  totalPages: 1,
  currentPage: 0,
  selectedSale: undefined,
  loading: false,
  error: null,
};

export const salesSlice = createAppSlice({
  name: "sales",
  initialState,
  reducers: (create) => ({
    getSales: create.asyncThunk(
      async ({
        page,
        size = 15,
        searchTerm,
      }: {
        page: number;
        size?: number;
        searchTerm?: string;
      }) => {
        return await fetchSales({ page, size, searchTerm });
      },
      {
        fulfilled: (state, action) => {
          state.salesList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage = action.payload instanceof Error ? action.payload.message : "Failed to fetch sales";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

    addSale: create.asyncThunk(
      async (newSale: NewSaleDto) => {
        return await fetchAddSale(newSale);
      },
      {
        fulfilled: (state, action) => {
          state.selectedSale = action.payload;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage = action.payload instanceof Error ? action.payload.message : "Failed to add sale";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

    getSaleById: create.asyncThunk(
      async (id: number) => {
        return await fetchSaleById(id);
      },
      {
        fulfilled: (state, action) => {
          state.selectedSale = action.payload;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error ? action.payload.message : "Failed to fetch sale by ID";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

    searchSales: create.asyncThunk(
      async ({
        query,
        page,
        size,
      }: {
        query: string;
        page: number;
        size?: number;
        sort?: string;
      }) => {
        return await fetchSearchSales({ query, page, size });
      },
      {
        fulfilled: (state, action) => {
          state.salesList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error ? action.payload.message : "Failed to search sales";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

    getSalesByFilter: create.asyncThunk(
      async (params: {
        page: number;
        size?: number;
        sort?: string;
        id?: number;
        customerId?: number;
        invoiceNumber?: string;
        totalAmount?: number;
        paymentStatus?: string;
        startDate?: string;
        endDate?: string;
        searchQuery?: string;
      }) => {
        return await fetchSalesByFilter(params);
      },
      {
        fulfilled: (state, action) => {
          state.salesList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error ? action.payload.message : "Failed to fetch sales by filter";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

    updateSale: create.asyncThunk(
      async ({
        id,
        updatedSale,
      }: {
        id: number;
        updatedSale: NewSaleDto;
      }) => {
        return await fetchUpdateSale(id, updatedSale);
      },
      {
        fulfilled: (state, action) => {
          state.selectedSale = action.payload;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error ? action.payload.message : "Failed to update sale";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

    deleteSale: create.asyncThunk(
      async (id: number) => {
        await fetchDeleteSale(id);
        return id;
      },
      {
        fulfilled: (state, action) => {
          state.salesList = state.salesList.filter((sale) => sale.id !== action.payload);
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error ? action.payload.message : "Failed to delete sale";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

        updateSalePaymentStatus: create.asyncThunk(
      async (id: number) => {
       return await fetchUpdateSalePaymentStatus(id); 
      },
      {
        fulfilled: (state, action) => {
      const updatedSale = action.payload; 
      const index = state.salesList.findIndex(p => p.id === updatedSale.id);
      if (index !== -1) {
        state.salesList[index] = updatedSale;
      }
      state.loading = false;
    },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error ? action.payload.message : "Failed to update payment status";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

  }),

  selectors: {
    selectSales: (state: SalesState) => state.salesList,
    selectTotalPages: (state: SalesState) => state.totalPages,
    selectCurrentPage: (state: SalesState) => state.currentPage,
    selectSale: (state: SalesState) => state.selectedSale,
    selectLoading: (state: SalesState) => state.loading,
    selectError: (state: SalesState) => state.error,
    selectSaleById: (state: SalesState, id: number) =>
      state.salesList.find((s) => s.id === id),
  },
});

export const { getSales,
  addSale,
  getSaleById,
  searchSales,
  getSalesByFilter,
  updateSale,
  deleteSale,
  updateSalePaymentStatus, } = salesSlice.actions;
export const { selectSales, selectTotalPages, selectCurrentPage, selectSale, selectLoading, selectError, selectSaleById } =
  salesSlice.selectors;