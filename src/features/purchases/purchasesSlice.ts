import { createAppSlice } from "../../redux/createAppSlice";
import {
  fetchAddPurchase,
  fetchDeletePurchase,
  fetchPurchaseById,
  fetchPurchases,
  fetchPurchasesByFilter,
  fetchSearchPurchases,
  fetchUpdatePurchase,
  fetchUpdatePurchasePaymentStatus,
} from "./api";
import { NewPurchaseDto, PurchasesState } from "./types";

const initialState: PurchasesState = {
  purchasesList: [],
  totalPages: 1,
  currentPage: 0,
  pageSize: 15,
  selectedPurchase: undefined,
  sort: ["purchasingDate,DESC", "id,DESC"],
  purchasesVersion: 0,
  loading: false,
  error: null,
};

interface GetPurchasesParams {
  page: number;
  size?: number;
  sort?: string[];
  searchTerm?: string;
}

const handlePending = (state: PurchasesState) => {
  state.loading = true;
  state.error = null;
};

const handleRejected = (
  state: PurchasesState,
  action: any,
  message: string,
) => {
  state.error = action.error?.message ?? message;
  state.loading = false;
};

export const purchasesSlice = createAppSlice({
  name: "purchases",
  initialState,
  reducers: (create) => ({
    getPurchases: create.asyncThunk(
      async ({
        page,
        size = 15,
        sort = ["purchasingDate,DESC", "id,DESC"],
        searchTerm = "",
      }: GetPurchasesParams) => {
        return await fetchPurchases(page, size, sort, searchTerm);
      },
      {
        fulfilled: (state, action) => {
          const { content, totalPages, pageable } = action.payload;
          state.purchasesList = content;
          state.totalPages = totalPages;
          state.currentPage = pageable.pageNumber;
          state.pageSize = action.meta.arg.size ?? 15;
          state.sort = action.meta.arg.sort ?? [
            "purchasingDate,DESC",
            "id,DESC",
          ];
          state.loading = false;
          state.error = null;
        },
        pending: handlePending,
        rejected: (state, action) => {
          handleRejected(state, action, "Fehler beim Laden der Bestellungen.");
        },
      },
    ),

    addPurchase: create.asyncThunk(
      async (newPurchase: NewPurchaseDto) => {
        return await fetchAddPurchase(newPurchase);
      },
      {
        pending: handlePending,

        fulfilled: (state) => {
          state.loading = false;
          state.error = null;
          state.purchasesVersion += 1;
        },

        rejected: (state, action) =>
          handleRejected(
            state,
            action,
            "Fehler beim Hinzufügen der Bestellung.",
          ),
      },
    ),

    getPurchaseById: create.asyncThunk(
      async (id: number) => await fetchPurchaseById(id),
      {
        pending: handlePending,
        fulfilled: (state, action) => {
          state.selectedPurchase = action.payload;
          state.loading = false;
          state.error = null;
        },
        rejected: (state, action) =>
          handleRejected(state, action, "Fehler beim Laden der Bestellung."),
      },
    ),

    searchPurchases: create.asyncThunk(
      async ({
        query,
        page,
        size = 15,
        sort = ["purchasingDate,DESC", "id,DESC"],
      }: GetPurchasesParams & { query: string }) => {
        return await fetchSearchPurchases(query, page, size, sort);
      },
      {
        fulfilled: (state, action) => {
          state.purchasesList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
          state.pageSize = action.meta.arg.size ?? 15;
          state.sort = action.meta.arg.sort ?? [
            "purchasingDate,DESC",
            "id,DESC",
          ];
          state.loading = false;
          state.error = null;
        },
        pending: handlePending,
        rejected: (state, action) =>
          handleRejected(state, action, "Fehler beim Laden der Bestellungen."),
      },
    ),

    getPurchasesByFilter: create.asyncThunk(
      async (params: {
        page: number;
        size?: number;
        sort?: string[];
        id?: number;
        vendorId?: number;
        documentId?: number;
        documentNumber?: string;
        total?: number;
        paymentStatus?: string;
        startDate?: string;
        endDate?: string;
        searchQuery?: string;
      }) => {
        const {
          page,
          size = 15,
          sort = ["purchasingDate,DESC", "id,DESC"],
          id,
          vendorId,
          documentId,
          documentNumber,
          total,
          paymentStatus,
          startDate,
          endDate,
          searchQuery,
        } = params;

        return await fetchPurchasesByFilter(page, size, sort, {
          id,
          vendorId,
          documentId,
          documentNumber,
          total,
          paymentStatus,
          startDate,
          endDate,
          searchQuery,
        });
      },
      {
        fulfilled: (state, action) => {
          state.purchasesList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
          state.pageSize = action.meta.arg.size ?? 15;
          state.sort = action.meta.arg.sort ?? [
            "purchasingDate,DESC",
            "id,DESC",
          ];
          state.loading = false;
          state.error = null;
        },
        pending: handlePending,
        rejected: (state, action) =>
          handleRejected(
            state,
            action,
            "Fehler beim Laden der gefilterten Bestellungen.",
          ),
      },
    ),

    updatePurchase: create.asyncThunk(
  async ({
    id,
    updatedPurchase,
  }: {
    id: number;
    updatedPurchase: NewPurchaseDto;
  }) => {
    return await fetchUpdatePurchase(id, updatedPurchase);
  },
  {
    pending: handlePending,

    fulfilled: (state, action) => {
      state.loading = false;
      state.error = null;

      if (state.selectedPurchase?.id === action.payload.id) {
        state.selectedPurchase = action.payload;
      }

      state.purchasesVersion += 1;
    },

    rejected: (state, action) =>
      handleRejected(
        state,
        action,
        "Fehler beim Bearbeiten der Bestellung.",
      ),
  },
),

    deletePurchase: create.asyncThunk(
  async (id: number) => {
    await fetchDeletePurchase(id);
    return id;
  },
  {
    pending: handlePending,

    fulfilled: (state, action) => {
      state.loading = false;
      state.error = null;

      if (state.selectedPurchase?.id === action.payload) {
        state.selectedPurchase = undefined;
      }

      state.purchasesVersion += 1;
    },

    rejected: (state, action) =>
      handleRejected(
        state,
        action,
        "Fehler beim Löschen der Bestellung.",
      ),
  },
),

    updatePurchasePaymentStatus: create.asyncThunk(
      async (id: number) => {
        return await fetchUpdatePurchasePaymentStatus(id);
      },
      {
        fulfilled: (state, action) => {
          const updatedPurchase = action.payload;
          state.purchasesList = state.purchasesList.map((p) =>
            p.id === updatedPurchase.id ? updatedPurchase : p,
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
    selectPurchases: (state: PurchasesState) => state.purchasesList,
    selectTotalPages: (state: PurchasesState) => state.totalPages,
    selectCurrentPage: (state: PurchasesState) => state.currentPage,
    selectPageSize: (state: PurchasesState) => state.pageSize,
    selectPurchase: (state: PurchasesState) => state.selectedPurchase,
    selectPurchasesVersion: (state: PurchasesState) => state.purchasesVersion,
    selectLoading: (state: PurchasesState) => state.loading,
    selectError: (state: PurchasesState) => state.error,
    selectPurchaseById: (state: PurchasesState, id: number) =>
      state.purchasesList.find((p) => p.id === id),
  },
});

export const {
  getPurchases,
  addPurchase,
  getPurchaseById,
  searchPurchases,
  getPurchasesByFilter,
  updatePurchase,
  deletePurchase,
  updatePurchasePaymentStatus,
} = purchasesSlice.actions;
export const {
  selectPurchases,
  selectTotalPages,
  selectCurrentPage,
  selectPageSize,
  selectPurchase,
  selectPurchasesVersion,
  selectLoading,
  selectError,
  selectPurchaseById,
} = purchasesSlice.selectors;
