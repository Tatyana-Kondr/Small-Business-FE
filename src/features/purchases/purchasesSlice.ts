import { createAppSlice } from "../../redux/createAppSlice"
import { fetchAddPurchase, fetchPurchases } from "./api";
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
  }),



  selectors: {
    selectPurchases: (state: PurchasesState) => state.purchasesList,
    selectTotalPages: (state: PurchasesState) => state.totalPages,
    selectCurrentPage: (state: PurchasesState) => state.currentPage,
    selectPurchase: (state: PurchasesState) => state.selectedPurchase,
    selectLoading: (state: PurchasesState) => state.loading,
    selectError: (state: PurchasesState) => state.error,

  },
});

export const { getPurchases, addPurchase } = purchasesSlice.actions;
export const { selectPurchases, selectTotalPages, selectCurrentPage, selectPurchase, selectLoading, selectError } =
  purchasesSlice.selectors;