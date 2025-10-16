import { createAppSlice } from "../../redux/createAppSlice"
import { fetchAddProduction, fetchDeleteProduction, fetchProductionById, fetchProductions, fetchProductionsByFilter, fetchSearchProductions, fetchUpdateProduction } from "./api";
import { NewProductionDto, ProductionsState } from "./types";

const initialState: ProductionsState = {
  productionsList: [],
  selectedProduction: undefined,
  totalPages: 1,
  currentPage: 0,
  sort: "dateOfProduction,DESC",
  loading: false,
  error: null,
};

interface GetProductionsParams {
  page: number;
  size?: number;
  sort?: string;
  searchTerm?: string;
}

const handlePending = (state: ProductionsState) => {
  state.loading = true;
  state.error = null;
};

const handleRejected = (state: ProductionsState, action: any, message: string) => {
  state.error = action.error?.message ?? message;
  state.loading = false;
};

export const ProductionsSlice = createAppSlice({
  name: "productions",
  initialState,
  reducers: (create) => ({

    getProductions: create.asyncThunk(
      async ({ page, size = 15, sort = "dateOfProduction,DESC", searchTerm = "" }: GetProductionsParams) => {
        return await fetchProductions(page, size, sort, searchTerm);
      },
      {
        fulfilled: (state, action) => {
          const { content, totalPages, pageable } = action.payload;
          state.productionsList = content;
          state.totalPages = totalPages;
          state.currentPage = pageable.pageNumber;
          state.sort = action.meta.arg.sort ?? "dateOfProduction,DESC";
          state.loading = false;
          state.error = null;
        },
        pending: handlePending,
        rejected: (state, action) => {
          handleRejected(state, action, "Fehler beim Laden der Herstellungen.");
        },
      }
    ),

    addProduction: create.asyncThunk(
      async (newProduction: NewProductionDto, { dispatch, getState }) => {
        const addedProduction = await fetchAddProduction(newProduction);
        const state = getState() as { productions: ProductionsState };
        await dispatch(
          getProductions({
            page: state.productions.currentPage,
            size: 15,
            sort: state.productions.sort,
          })
        );
        return addedProduction;
      },
      {
        pending: handlePending,
        fulfilled: (state) => {
          state.loading = false;
        },
        rejected: (state, action) =>
          handleRejected(state, action, "Fehler beim Hinzufügen der Herstellung."),
      }
    ),


    getProductionById: create.asyncThunk(
      async (id: number) => await fetchProductionById(id),
      {
        pending: handlePending,
        fulfilled: (state, action) => {
          state.selectedProduction = action.payload;
          state.loading = false;
          state.error = null;
        },
        rejected: (state, action) =>
          handleRejected(state, action, "Fehler beim Laden der Herstellung."),
      }
    ),

    searchProductions: create.asyncThunk(
      async ({ query, page, size = 15, sort = "dateOfProduction,DESC" }: GetProductionsParams & { query: string }) => {
        return await fetchSearchProductions(query, page, size, sort);
      },
      {
        fulfilled: (state, action) => {
          state.productionsList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
          state.sort = action.meta.arg.sort ?? "dateOfProduction,DESC";
          state.loading = false;
          state.error = null;
        },
        pending: handlePending,
        rejected: (state, action) =>
          handleRejected(state, action, "Fehler beim Laden der Herstellungen."),
      }
    ),

    getProductionsByFilter: create.asyncThunk(
      async (params: {
        page: number;
        size?: number;
        sort?: string;
        startDate?: string;
        endDate?: string;
        searchQuery?: string;
      }) => {
        const {
          page,
          size = 15,
          sort = "dateOfProduction,DESC",
          startDate,
          endDate,
          searchQuery,
        } = params;

        return await fetchProductionsByFilter(page, size, sort, {
          startDate,
          endDate,
          searchQuery,
        });
      },
      {
        fulfilled: (state, action) => {
          state.productionsList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
          state.sort = action.meta.arg.sort ?? "dateOfProduction,DESC";
          state.loading = false;
          state.error = null;
        },
        pending: handlePending,
        rejected: (state, action) =>
          handleRejected(state, action, "Fehler beim Laden der gefilterten Hertellungen."),
      }
    ),

    updateProduction: create.asyncThunk(
      async ({ id, updatedProduction }: { id: number; updatedProduction: NewProductionDto }, { dispatch, getState }) => {
        const editedProduction = await fetchUpdateProduction(id, updatedProduction);
        const state = getState() as { productions: ProductionsState };
        await dispatch(
          getProductions({
            page: state.productions.currentPage,
            size: 15,
            sort: state.productions.sort,
          })
        );

        return editedProduction;
      },
      {
        fulfilled: (state) => {
          state.loading = false;
        },
        pending: handlePending,
        rejected: (state, action) =>
          handleRejected(state, action, "Fehler beim Bearbeiten der Hertellung."),
      }
    ),

    deleteProduction: create.asyncThunk(
      async (id: number, { dispatch, getState }) => {
        await fetchDeleteProduction(id);
        const state = getState() as { productions: ProductionsState };
        await dispatch(
          getProductions({
            page: state.productions.currentPage,
            size: 15,
            sort: state.productions.sort,
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
          handleRejected(state, action, "Fehler beim Löschen der Hertellung."),
      }
    ),
  }),

  selectors: {
    selectProductions: (state: ProductionsState) => state.productionsList,
    selectTotalPages: (state: ProductionsState) => state.totalPages,
    selectCurrentPage: (state: ProductionsState) => state.currentPage,
    selectProduction: (state: ProductionsState) => state.selectedProduction,
    selectLoading: (state: ProductionsState) => state.loading,
    selectError: (state: ProductionsState) => state.error,
    selectProductionById: (state: ProductionsState, id: number) =>
      state.productionsList.find((p) => p.id === id),
  },
});

export const { getProductions,
  addProduction,
  getProductionById,
  searchProductions,
  getProductionsByFilter,
  updateProduction,
  deleteProduction, } = ProductionsSlice.actions;
export const { selectProductions, selectTotalPages, selectCurrentPage, selectProduction, selectLoading, selectError, selectProductionById } =
  ProductionsSlice.selectors;