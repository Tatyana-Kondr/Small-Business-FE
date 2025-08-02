import { createAppSlice } from "../../redux/createAppSlice"
import { fetchAddPayment, fetchAllPayments, fetchDeletePayment, fetchPaymentById, fetchPaymentsByFilter, fetchPrefillDataForPurchase, fetchPrefillDataForSale, fetchSearchPayments, fetchUpdatePayment } from "./api";
import { NewPaymentDto, PaymentsState } from "./types";

const initialState: PaymentsState = {
  paymentsList: [],
  totalPages: 1,
  currentPage: 0,
  selectedPayment: undefined,
  prefillData: null,
  loading: false,
  error: null,
};

export const paymentsSlice = createAppSlice({
  name: "payments",
  initialState,
  reducers: (create) => ({
    getPayments: create.asyncThunk(
      async ({
        page,
        size = 15,
      }: {
        page: number;
        size?: number;
      }) => {
        return await fetchAllPayments({ page, size });
      },
      {
        fulfilled: (state, action) => {
          state.paymentsList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage = action.payload instanceof Error ? action.payload.message : "Failed to fetch payments";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

    addPayment: create.asyncThunk(
      async (newPayment: NewPaymentDto) => {
        return await fetchAddPayment(newPayment);
      },
      {
        fulfilled: (state, action) => {
          state.selectedPayment = action.payload;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage = action.payload instanceof Error ? action.payload.message : "Failed to add payment";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

    getPaymentById: create.asyncThunk(
      async (id: number) => {
        return await fetchPaymentById(id);
      },
      {
        fulfilled: (state, action) => {
          state.selectedPayment = action.payload;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error ? action.payload.message : "Failed to fetch payment by ID";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

    searchPayments: create.asyncThunk(
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
        return await fetchSearchPayments({ query, page, size });
      },
      {
        fulfilled: (state, action) => {
          state.paymentsList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error ? action.payload.message : "Failed to search payments";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

    getPaymentsByFilter: create.asyncThunk(
      async (params: {
        page: number;
        size?: number;
        sort?: string;
        id?: number;
        customerId?: number;
        document?: string;
        documentNumber?: string;
        amount?: number;
        startDate?: string;
        endDate?: string;
        searchQuery?: string;
      }) => {
        return await fetchPaymentsByFilter(params);
      },
      {
        fulfilled: (state, action) => {
          state.paymentsList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error ? action.payload.message : "Failed to fetch payments by filter";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

    updatePayment: create.asyncThunk(
      async ({
        id,
        updatedPayment,
      }: {
        id: number;
        updatedPayment: NewPaymentDto;
      }) => {
        return await fetchUpdatePayment(id, updatedPayment);
      },
      {
        fulfilled: (state, action) => {
          state.selectedPayment = action.payload;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error ? action.payload.message : "Failed to update payment";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

    deletePayment: create.asyncThunk(
      async (id: number) => {
        await fetchDeletePayment(id);
        return id;
      },
      {
        fulfilled: (state, action) => {
          state.paymentsList = state.paymentsList.filter((payment) => payment.id !== action.payload);
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error ? action.payload.message : "Failed to delete payment";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),
  prefillForSale: create.asyncThunk(
      async (saleId: number) => {
        return await fetchPrefillDataForSale(saleId);
      },
      {
        fulfilled: (state, action) => {
          state.prefillData = action.payload;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error
              ? action.payload.message
              : "Failed to fetch prefill data for sale";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

    prefillForPurchase: create.asyncThunk(
      async (purchaseId: number) => {
        return await fetchPrefillDataForPurchase(purchaseId);
      },
      {
        fulfilled: (state, action) => {
          state.prefillData = action.payload;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error
              ? action.payload.message
              : "Failed to fetch prefill data for purchase";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),
  }),

  selectors: {
    selectPayments: (state: PaymentsState) => state.paymentsList,
    selectTotalPages: (state: PaymentsState) => state.totalPages,
    selectCurrentPage: (state: PaymentsState) => state.currentPage,
    selectPayment: (state: PaymentsState) => state.selectedPayment,
    selectPrefillData: (state: PaymentsState) => state.prefillData,
    selectLoading: (state: PaymentsState) => state.loading,
    selectError: (state: PaymentsState) => state.error,
    selectPaymentById: (state: PaymentsState, id: number) =>
      state.paymentsList.find((p) => p.id === id),
  },
});

export const { getPayments,
  addPayment,
  getPaymentById,
  searchPayments,
  getPaymentsByFilter,
  updatePayment,
  deletePayment,
 prefillForSale,
prefillForPurchase } = paymentsSlice.actions;
export const { selectPayments, selectTotalPages, selectCurrentPage, selectPayment, selectLoading, selectError, selectPaymentById, selectPrefillData } =
  paymentsSlice.selectors;