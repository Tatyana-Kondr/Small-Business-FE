import { createAppSlice } from "../../redux/createAppSlice";
import {
  fetchAddPayment,
  fetchAllPayments,
  fetchDeletePayment,
  fetchGetAllPurchaseIds,
  fetchGetAllSaleIds,
  fetchPaymentById,
  fetchPaymentsByFilter,
  fetchPrefillDataForPurchase,
  fetchPrefillDataForSale,
  fetchSearchPayments,
  fetchUpdatePayment,
} from "./api";
import { NewPaymentDto, PaymentsState } from "./types";


const initialState: PaymentsState = {
  paymentsList: [],
  totalPages: 1,
  currentPage: 0,
  pageSize: 15,
  currentSort: ["paymentDate,DESC", "id,DESC"],
  selectedPayment: undefined,
  prefillData: null,
  allSaleIds: [],
  allPurchaseIds: [],
  paymentsVersion: 0,
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
    sort = ["paymentDate,DESC", "id,DESC"],
  }: {
    page: number;
    size?: number;
    sort?: string[];
  }) => {
    return await fetchAllPayments(
      page,
      size,
      sort
    );
  },
  {
    fulfilled: (state, action) => {
      state.paymentsList = action.payload.content;
      state.totalPages = action.payload.totalPages;
      state.currentPage =
        action.payload.pageable.pageNumber;

      state.pageSize =
        action.meta.arg.size ?? 15;

      state.currentSort =
        action.meta.arg.sort ??
        ["paymentDate,DESC", "id,DESC"];

      state.loading = false;
      state.error = null;
    },

    pending: (state) => {
      state.loading = true;
      state.error = null;
    },

    rejected: (state, action) => {
      state.error =
        action.error.message ||
        "Fehler beim Laden der Zahlungen.";

      state.loading = false;
    },
  }
),

    addPayment: create.asyncThunk(
      async (newPayment: NewPaymentDto) => {
        return await fetchAddPayment(newPayment);
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state) => {
          state.loading = false;
          state.error = null;
          state.paymentsVersion += 1;
        },

        rejected: (state, action) => {
          state.error =
            action.error.message || "Fehler beim Hinzufügen der Zahlung.";
          state.loading = false;
        },
      },
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
          state.error =
            action.error.message || "Fehler beim Laden der Zahlung.";
          state.loading = false;
        },
      },
    ),

    searchPayments: create.asyncThunk(
  async ({
    query,
    page,
    size = 15,
    sort = ["paymentDate,DESC", "id,DESC"],
  }: {
    query: string;
    page: number;
    size?: number;
    sort?: string[];
  }) => {
    return await fetchSearchPayments(
      query,
      page,
      size,
      sort
    );
  },
  {
    fulfilled: (state, action) => {
      state.paymentsList = action.payload.content;
      state.totalPages = action.payload.totalPages;
      state.currentPage =
        action.payload.pageable.pageNumber;

      state.pageSize =
        action.meta.arg.size ?? 15;

      state.currentSort =
        action.meta.arg.sort ??
        ["paymentDate,DESC", "id,DESC"];

      state.loading = false;
      state.error = null;
    },

    pending: (state) => {
      state.loading = true;
      state.error = null;
    },

    rejected: (state, action) => {
      state.error =
        action.error?.message ||
        "Fehler beim Laden der Zahlungen.";

      state.loading = false;
    },
  }
),

    getPaymentsByFilter: create.asyncThunk(
  async ({
    page,
    size = 15,
    sort = ["paymentDate,DESC", "id,DESC"],
    ...filters
  }: {
    page: number;
    size?: number;
    sort?: string[];

    id?: number;
    customerId?: number;
    customerName?: string;
    saleId?: number;
    purchaseId?: number;
    documentId?: number;
    documentNumber?: string;
    amount?: number;
    startDate?: string;
    endDate?: string;
    searchQuery?: string;
  }) => {
    return await fetchPaymentsByFilter(
      page,
      size,
      sort,
      filters
    );
  },
  {
    fulfilled: (state, action) => {
      state.paymentsList = action.payload.content;
      state.totalPages = action.payload.totalPages;
      state.currentPage =
        action.payload.pageable.pageNumber;

      state.pageSize =
        action.meta.arg.size ?? 15;

      state.currentSort =
        action.meta.arg.sort ??
        ["paymentDate,DESC", "id,DESC"];

      state.loading = false;
      state.error = null;
    },

    pending: (state) => {
      state.loading = true;
      state.error = null;
    },

    rejected: (state, action) => {
      state.error =
        action.error?.message ||
        "Fehler beim Abrufen von Zahlungen nach Filter.";

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
      }) => {
        return await fetchUpdatePayment(id, updatePaymentDto);
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.loading = false;
          state.error = null;

          if (state.selectedPayment?.id === action.payload.id) {
            state.selectedPayment = action.payload;
          }

          state.paymentsVersion += 1;
        },

        rejected: (state, action) => {
          state.error =
            action.error.message || "Fehler beim Bearbeiten der Zahlung.";
          state.loading = false;
        },
      },
    ),

    deletePayment: create.asyncThunk(
      async (id: number) => {
        await fetchDeletePayment(id);
        return id;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.loading = false;
          state.error = null;

          if (state.selectedPayment?.id === action.payload) {
            state.selectedPayment = undefined;
          }

          state.paymentsVersion += 1;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error.message || "Fehler beim Löschen der Zahlung.";
        },
      },
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
          state.error =
            action.error.message || "Fehler beim Laden aller Sale IDs.";
          state.loading = false;
        },
      },
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
          state.error =
            action.error.message || "Fehler beim Laden aller Purchase IDs.";
          state.loading = false;
        },
      },
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
          state.error =
            action.error.message ||
            "Fehler beim Laden der Vorausfüll-Daten für Auftrag.";
          state.loading = false;
        },
      },
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
          state.error =
            action.error.message ||
            "Fehler beim Laden der Vorausfüll-Daten für Bestellung.";
          state.loading = false;
        },
      },
    ),
  }),

  selectors: {
    selectPayments: (state: PaymentsState) => state.paymentsList,
    selectTotalPages: (state: PaymentsState) => state.totalPages,
    selectCurrentPage: (state: PaymentsState) => state.currentPage,
    selectPageSize: (state: PaymentsState) => state.pageSize,
    selectCurrentSort: (state: PaymentsState) => state.currentSort,
    selectPayment: (state: PaymentsState) => state.selectedPayment,
    selectPrefillData: (state: PaymentsState) => state.prefillData,
    selectAllSaleIds: (state: PaymentsState) => state.allSaleIds,
    selectAllPurchaseIds: (state: PaymentsState) => state.allPurchaseIds,
    selectPaymentsVersion: (state: PaymentsState) => state.paymentsVersion,
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
  selectPageSize,
  selectCurrentSort,
  selectPayment,
  selectPaymentsVersion,
  selectLoading,
  selectError,
  selectPaymentById,
  selectPrefillData,
  selectAllSaleIds,
  selectAllPurchaseIds,
} = paymentsSlice.selectors;
