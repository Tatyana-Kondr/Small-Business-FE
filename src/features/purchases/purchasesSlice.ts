import { createAppSlice } from "../../redux/createAppSlice"
import { fetchPurchases } from "./api";
import { PurchasesState } from "./types";

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
    
    export const { getPurchases } = purchasesSlice.actions;
    export const { selectPurchases, selectTotalPages, selectCurrentPage, selectPurchase, selectLoading, selectError } =
      purchasesSlice.selectors;