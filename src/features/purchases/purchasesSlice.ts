import { createAppSlice } from "../../redux/createAppSlice"
import { fetchAddPurchase, fetchDeletePurchase, fetchPurchaseById, fetchPurchases, fetchPurchasesByFilter, fetchSearchPurchases, fetchUpdatePurchase, fetchUpdatePurchasePaymentStatus, } from "./api";
import { NewPurchaseDto, PurchasesState } from "./types";


const initialState: PurchasesState = {
  purchasesList: [],
  totalPages: 1,
  currentPage: 0,
  selectedPurchase: undefined,
  sort: ["purchasingDate,DESC", "id,DESC"],
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

const handleRejected = (state: PurchasesState, action: any, message: string) => {
  state.error = action.error?.message ?? message;
  state.loading = false;
};

export const purchasesSlice = createAppSlice({
  name: "purchases",
  initialState,
  reducers: (create) => ({

    getPurchases: create.asyncThunk(
      async ({ page, size = 15, sort = ["purchasingDate,DESC", "id,DESC"], searchTerm = "" }: GetPurchasesParams) => {
        return await fetchPurchases(page, size, sort, searchTerm);
      },
      {
        fulfilled: (state, action) => {
          const { content, totalPages, pageable } = action.payload;
          state.purchasesList = content;
          state.totalPages = totalPages;
          state.currentPage = pageable.pageNumber;
          state.sort = action.meta.arg.sort ?? ["purchasingDate,DESC", "id,DESC"];
          state.loading = false;
          state.error = null;
        },
        pending: handlePending,
        rejected: (state, action) => {
          handleRejected(state, action, "Fehler beim Laden der Bestellungen.");
        },
      }
    ),

    addPurchase: create.asyncThunk(
      async (newPurchase: NewPurchaseDto, { dispatch, getState }) => {
        const addedPurchase = await fetchAddPurchase(newPurchase);
        const state = getState() as { purchases: PurchasesState };
        await dispatch(
          getPurchases({
            page: state.purchases.currentPage,
            size: 15,
            sort: state.purchases.sort,
          })
        );
        return addedPurchase;
      },
      {
        pending: handlePending,
        fulfilled: (state) => {
          state.loading = false;
        },
        rejected: (state, action) =>
          handleRejected(state, action, "Fehler beim Hinzufügen der Bestellung."),
      }
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
      }
    ),

    searchPurchases: create.asyncThunk(
      async ({ query, page, size = 15, sort = ["purchasingDate,DESC", "id,DESC"] }: GetPurchasesParams & { query: string }) => {
        return await fetchSearchPurchases(query, page, size, sort);
      },
      {
        fulfilled: (state, action) => {
          state.purchasesList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
          state.sort = action.meta.arg.sort ?? ["purchasingDate,DESC", "id,DESC"];
          state.loading = false;
          state.error = null;
        },
        pending: handlePending,
        rejected: (state, action) =>
          handleRejected(state, action, "Fehler beim Laden der Bestellungen."),
      }
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
          state.sort = action.meta.arg.sort ?? ["purchasingDate,DESC", "id,DESC"];
          state.loading = false;
          state.error = null;
        },
        pending: handlePending,
        rejected: (state, action) =>
          handleRejected(state, action, "Fehler beim Laden der gefilterten Bestellungen."),
      }
    ),

    updatePurchase: create.asyncThunk(
      async ({ id, updatedPurchase }: { id: number; updatedPurchase: NewPurchaseDto }, { dispatch, getState }) => {
        const editedPurchase = await fetchUpdatePurchase(id, updatedPurchase);
        const state = getState() as { purchases: PurchasesState };
        await dispatch(
          getPurchases({
            page: state.purchases.currentPage,
            size: 15,
            sort: state.purchases.sort,
          })
        );

        return editedPurchase;
      },
      {
        fulfilled: (state) => {
          state.loading = false;
        },
        pending: handlePending,
        rejected: (state, action) =>
          handleRejected(state, action, "Fehler beim Bearbeiten der Bestellung."),
      }
    ),

    deletePurchase: create.asyncThunk(
      async (id: number, { dispatch, getState }) => {
        await fetchDeletePurchase(id);
        const state = getState() as { purchases: PurchasesState };
        await dispatch(
          getPurchases({
            page: state.purchases.currentPage,
            size: 15,
            sort: state.purchases.sort,
          })
        );
        return id;
      },
      {
        fulfilled: (state) => {
          state.loading = false;
          state.error = null;
        },
        pending: handlePending,
        rejected: (state, action) =>
          handleRejected(state, action, "Fehler beim Löschen der Bestellung."),
      }
    ),

    updatePurchasePaymentStatus: create.asyncThunk(
      async (id: number) => {
        return await fetchUpdatePurchasePaymentStatus(id);
      },
      {
        fulfilled: (state, action) => {
          const updatedPurchase = action.payload;
          state.purchasesList = state.purchasesList.map(p =>
            p.id === updatedPurchase.id ? updatedPurchase : p);
          state.loading = false;
          state.error = null;
        },
        pending: handlePending,
        rejected: (state, action) =>
          handleRejected(state, action, "Fehler beim Aktualisieren des Zahlungsstatus."),
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