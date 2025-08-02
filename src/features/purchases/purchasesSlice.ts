import { createAppSlice } from "../../redux/createAppSlice"
import { fetchAddPurchase, fetchDeletePurchase, fetchPurchaseById, fetchPurchases, fetchPurchasesByFilter, fetchSearchPurchases, fetchUpdatePurchase, fetchUpdatePurchasePaymentStatus, } from "./api";
import { NewPurchaseDto, PurchasesState } from "./types";

const initialState: PurchasesState = {
  purchasesList: [],
  totalPages: 1,
  currentPage: 0,
  selectedPurchase: undefined,
  loading: false,
  error: null,
};

export const purchasesSlice = createAppSlice({
  name: "purchases",
  initialState,
  reducers: (create) => ({
    getPurchases: create.asyncThunk(
      async ({
        page,
        size = 15,
        searchTerm,
      }: {
        page: number;
        size?: number;
        searchTerm?: string;
      }) => {
        return await fetchPurchases({ page, size, searchTerm });
      },
      {
        fulfilled: (state, action) => {
          state.purchasesList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage = action.payload instanceof Error ? action.payload.message : "Failed to fetch purchases";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

    addPurchase: create.asyncThunk(
      async (newPurchase: NewPurchaseDto) => {
        return await fetchAddPurchase(newPurchase);
      },
      {
        fulfilled: (state, action) => {
          state.selectedPurchase = action.payload;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage = action.payload instanceof Error ? action.payload.message : "Failed to add purchase";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

    getPurchaseById: create.asyncThunk(
      async (id: number) => {
        return await fetchPurchaseById(id);
      },
      {
        fulfilled: (state, action) => {
          state.selectedPurchase = action.payload;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error ? action.payload.message : "Failed to fetch purchase by ID";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

    searchPurchases: create.asyncThunk(
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
        return await fetchSearchPurchases({ query, page, size });
      },
      {
        fulfilled: (state, action) => {
          state.purchasesList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error ? action.payload.message : "Failed to search purchases";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

    getPurchasesByFilter: create.asyncThunk(
      async (params: {
        page: number;
        size?: number;
        sort?: string;
        id?: number;
        vendorId?: number;
        document?: string;
        documentNumber?: string;
        total?: number;
        paymentStatus?: string;
        startDate?: string;
        endDate?: string;
        searchQuery?: string;
      }) => {
        return await fetchPurchasesByFilter(params);
      },
      {
        fulfilled: (state, action) => {
          state.purchasesList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error ? action.payload.message : "Failed to fetch purchases by filter";
          state.error = errorMessage;
          state.loading = false;
        },
      }
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
        fulfilled: (state, action) => {
          state.selectedPurchase = action.payload;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error ? action.payload.message : "Failed to update purchase";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

    deletePurchase: create.asyncThunk(
      async (id: number) => {
        await fetchDeletePurchase(id);
        return id;
      },
      {
        fulfilled: (state, action) => {
          state.purchasesList = state.purchasesList.filter((purchase) => purchase.id !== action.payload);
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error ? action.payload.message : "Failed to delete purchase";
          state.error = errorMessage;
          state.loading = false;
        },
      }
    ),

    updatePurchasePaymentStatus: create.asyncThunk(
  async (id: number) => {
    return await fetchUpdatePurchasePaymentStatus(id); 
  },
  {
    fulfilled: (state, action) => {
      const updatedPurchase = action.payload; 
      const index = state.purchasesList.findIndex(p => p.id === updatedPurchase.id);
      if (index !== -1) {
        state.purchasesList[index] = updatedPurchase;
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
    selectPurchases: (state: PurchasesState) => state.purchasesList,
    selectTotalPages: (state: PurchasesState) => state.totalPages,
    selectCurrentPage: (state: PurchasesState) => state.currentPage,
    selectPurchase: (state: PurchasesState) => state.selectedPurchase,
    selectLoading: (state: PurchasesState) => state.loading,
    selectError: (state: PurchasesState) => state.error,
    selectPurchaseById: (state: PurchasesState, id: number) =>
      state.purchasesList.find((p) => p.id === id),
  },
});

export const { getPurchases,
  addPurchase,
  getPurchaseById,
  searchPurchases,
  getPurchasesByFilter,
  updatePurchase,
  deletePurchase,
  updatePurchasePaymentStatus, } = purchasesSlice.actions;
export const { selectPurchases, selectTotalPages, selectCurrentPage, selectPurchase, selectLoading, selectError, selectPurchaseById } =
  purchasesSlice.selectors;