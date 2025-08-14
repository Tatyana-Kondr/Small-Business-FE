import { createAppSlice } from "../../redux/createAppSlice"
import { fetchAddPayment, fetchAllPayments, fetchDeletePayment, fetchGetAllPurchaseIds, fetchGetAllSaleIds, fetchPaymentById, fetchPaymentsByFilter, fetchPrefillDataForPurchase, fetchPrefillDataForSale, fetchSearchPayments, fetchUpdatePayment } from "./api";
import { NewPaymentDto, PaymentsState } from "./types";

const PAGE_SIZE = 15;

const initialState: PaymentsState = {
  paymentsList: [],
  totalPages: 1,
  currentPage: 0,
  currentSort: "paymentDate,DESC",
  selectedPayment: undefined,
  prefillData: null,
  allSaleIds: [],     
  allPurchaseIds: [],
  loading: false,
  error: null,
};

export const paymentsSlice = createAppSlice({
  name: "payments",
  initialState,
  reducers: (create) => ({
    getPayments: create.asyncThunk(
      async ({ page, size = 15, sort = "paymentDate", }: { page: number; size?: number; sort?: string; }) => {
        return await fetchAllPayments({ page, size, sort });
      },
      {
        fulfilled: (state, action) => {
          state.paymentsList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
          state.currentSort = action.meta.arg.sort || "paymentDate";
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error.message || "Fehler beim Laden der Zahlungen.";
          state.loading = false;
        },
      }
    ),

    addPayment: create.asyncThunk(
      async (newPayment: NewPaymentDto, { dispatch, getState }) => {
        const addedPayment = await fetchAddPayment(newPayment);
        const state = getState() as { payments: PaymentsState };
        await dispatch(
          getPayments({
            page: state.payments.currentPage,
            size: PAGE_SIZE,
            sort: state.payments.currentSort,
          })
        );
        return addedPayment;
      },
      {
        fulfilled: (state) => {
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error.message || "Fehler beim Hinzufügen der Zahlung.";
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
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error.message || "Fehler beim Laden die Zahlung.";
          state.loading = false;
        },
      }
    ),

    searchPayments: create.asyncThunk(
      async ({
        query,
        page,
        size = PAGE_SIZE,
        sort = "paymentDate",
      }: {
        query: string;
        page: number;
        size?: number;
        sort?: string;
      }) => {
        return await fetchSearchPayments({ query, page, size, sort });
      },
      {
        fulfilled: (state, action) => {
          state.paymentsList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
          state.currentSort = action.meta.arg.sort || "paymentDate";
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Laden der Zahlungen.";
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
        saleId?: number;
        purchaseId?: number;
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
          state.currentSort = action.meta.arg.sort || "paymentDate";
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Abrufen von Zahlungen nach Filter.";
          state.loading = false;
        },
      }
    ),

    updatePayment: create.asyncThunk(
      async ({
        id,
        updatePaymentDto,
      }: {
        id: number;
        updatePaymentDto: NewPaymentDto;
      },
        { dispatch, getState }
      ) => {
        const updatedPayment = await fetchUpdatePayment(id, updatePaymentDto);
        const state = getState() as { payments: PaymentsState };
        await dispatch(
          getPayments({
            page: state.payments.currentPage,
            size: PAGE_SIZE,
            sort: state.payments.currentSort,
          })
        );
        return updatedPayment;
      },
      {
        fulfilled: (state) => {
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error.message || "Fehler beim Bearbeiten der Zahlung.";
          state.loading = false;
        },
      }
    ),

    deletePayment: create.asyncThunk(
      async (id: number, { dispatch, getState }) => {
        await fetchDeletePayment(id);
        const state = getState() as { payments: PaymentsState };
        await dispatch(
          getPayments({
            page: state.payments.currentPage,
            size: PAGE_SIZE,
            sort: state.payments.currentSort,
          })
        );
        return id;
      },
      {
        fulfilled: (state) => {
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message || "Fehler beim Löschen der Zahlung.";
        },
      }
    ),

    getAllSaleIds: create.asyncThunk(
      async () => {
        return await fetchGetAllSaleIds();
      },
      {
        fulfilled: (state, action) => {
          state.allSaleIds = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error.message || "Fehler beim Laden aller Sale IDs.";
          state.loading = false;
        },
      }
    ),

    getAllPurchaseIds: create.asyncThunk(
      async () => {
        return await fetchGetAllPurchaseIds();
      },
      {
        fulfilled: (state, action) => {
          state.allPurchaseIds = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error.message || "Fehler beim Laden aller Purchase IDs.";
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
        state.error = null;
      },
      pending: (state) => {
        state.loading = true;
        state.error = null;
      },
      rejected: (state, action) => {
        state.error = action.error.message || "Fehler beim Laden der Vorausfüll-Daten für Auftrag.";
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
        state.error = null;
      },
      pending: (state) => {
        state.loading = true;
        state.error = null;
      },
      rejected: (state, action) => {
        state.error = action.error.message || "Fehler beim Laden der Vorausfüll-Daten für Bestellung.";
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
    selectAllSaleIds: (state: PaymentsState) => state.allSaleIds,
    selectAllPurchaseIds: (state: PaymentsState) => state.allPurchaseIds,
    selectLoading: (state: PaymentsState) => state.loading,
    selectError: (state: PaymentsState) => state.error,
    selectPaymentById: (state: PaymentsState, id: number) =>
      state.paymentsList.find((p) => p.id === id),
  },
});

export const {
  getPayments,
  addPayment,
  getPaymentById,
  searchPayments,
  getPaymentsByFilter,
  updatePayment,
  deletePayment,
  prefillForSale,
  prefillForPurchase,
  getAllSaleIds,      
  getAllPurchaseIds,
 } = paymentsSlice.actions;

export const {
  selectPayments,
  selectTotalPages,
  selectCurrentPage,
  selectPayment,
  selectLoading,
  selectError,
  selectPaymentById,
  selectPrefillData,
  selectAllSaleIds,     
  selectAllPurchaseIds,
} = paymentsSlice.selectors;