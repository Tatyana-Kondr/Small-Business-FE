import { createAppSlice } from "../../redux/createAppSlice"
import { fetchAddProduction, fetchDeleteProduction, fetchProductionById, fetchProductions, fetchProductionsByFilter, fetchSearchProductions, fetchUpdateProduction } from "./api";
import { NewProductionDto, ProductionsState } from "./types";

const initialState: ProductionsState = {
  productionsList: [],
  selectedProduction: undefined,
  totalPages: 1,
  currentPage: 0,
  pageSize: 15,
  sort: ["dateOfProduction,DESC", "id,DESC"],
  productionsVersion: 0,
  loading: false,
  error: null,
};

interface GetProductionsParams {
  page: number;
  size?: number;
  sort?: string[];
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

export const productionsSlice = createAppSlice({
  name: "productions",
  initialState,
  reducers: (create) => ({

    getProductions: create.asyncThunk(
      async ({ page, size = 15, sort = ["dateOfProduction,DESC", "id,DESC"] }: GetProductionsParams) => {
        return await fetchProductions(page, size, sort);
      },
      {
        fulfilled: (state, action) => {
          const { content, totalPages, pageable } = action.payload;
          state.productionsList = content;
          state.totalPages = totalPages;
          state.currentPage = pageable.pageNumber;
          state.pageSize = action.meta.arg.size ?? 15;
          state.sort = action.meta.arg.sort ?? ["dateOfProduction,DESC", "id,DESC"];
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
  async (newProduction: NewProductionDto) => {
    return await fetchAddProduction(newProduction);
  },
  {
    pending: handlePending,

    fulfilled: (state) => {
      state.loading = false;
      state.error = null;
      state.productionsVersion += 1;
    },

    rejected: (state, action) =>
      handleRejected(
        state,
        action,
        "Fehler beim Hinzufügen der Herstellung.",
      ),
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
      async ({ query, page, size = 15, sort = ["dateOfProduction,DESC", "id,DESC"] }: GetProductionsParams & { query: string }) => {
        return await fetchSearchProductions(query, page, size, sort);
      },
      {
        fulfilled: (state, action) => {
          state.productionsList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
          state.pageSize = action.meta.arg.size ?? 15;
          state.sort = action.meta.arg.sort ?? ["dateOfProduction,DESC", "id,DESC"];
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
        sort?: string[];
        startDate?: string;
        endDate?: string;
        searchQuery?: string;
      }) => {
        const {
          page,
          size = 15,
          sort = ["dateOfProduction,DESC", "id,DESC"],
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
          state.pageSize = action.meta.arg.size ?? 15;
          state.sort = action.meta.arg.sort ?? ["dateOfProduction,DESC", "id,DESC"];
          state.loading = false;
          state.error = null;
        },
        pending: handlePending,
        rejected: (state, action) =>
          handleRejected(state, action, "Fehler beim Laden der gefilterten Herstellungen."),
      }
    ),

    updateProduction: create.asyncThunk(
  async ({
    id,
    updatedProduction,
  }: {
    id: number;
    updatedProduction: NewProductionDto;
  }) => {
    return await fetchUpdateProduction(id, updatedProduction);
  },
  {
    pending: handlePending,

    fulfilled: (state, action) => {
      state.loading = false;
      state.error = null;

      if (state.selectedProduction?.id === action.payload.id) {
        state.selectedProduction = action.payload;
      }

      state.productionsVersion += 1;
    },

    rejected: (state, action) =>
      handleRejected(
        state,
        action,
        "Fehler beim Bearbeiten der Herstellung.",
      ),
  }
),

    deleteProduction: create.asyncThunk(
  async (id: number) => {
    await fetchDeleteProduction(id);
    return id;
  },
  {
    pending: handlePending,

    fulfilled: (state, action) => {
      state.loading = false;
      state.error = null;

      if (state.selectedProduction?.id === action.payload) {
        state.selectedProduction = undefined;
      }

      state.productionsVersion += 1;
    },

    rejected: (state, action) =>
      handleRejected(
        state,
        action,
        "Fehler beim Löschen der Herstellung.",
      ),
  }
),
  }),

  selectors: {
    selectProductions: (state: ProductionsState) => state.productionsList,
    selectTotalPages: (state: ProductionsState) => state.totalPages,
    selectCurrentPage: (state: ProductionsState) => state.currentPage,
    selectPageSize: (state: ProductionsState) => state.pageSize,
    selectProduction: (state: ProductionsState) => state.selectedProduction,
    selectProductionsVersion: (state: ProductionsState) => state.productionsVersion,
    selectLoading: (state: ProductionsState) => state.loading,
    selectError: (state: ProductionsState) => state.error,
    selectProductionById: (state: ProductionsState, id: number) =>
      state.productionsList.find((p) => p.id === id),
  },
});

export const { 
  getProductions,
  addProduction,
  getProductionById,
  searchProductions,
  getProductionsByFilter,
  updateProduction,
  deleteProduction, } = productionsSlice.actions;
export const { selectProductions, selectTotalPages, selectPageSize, selectCurrentPage, selectProduction, selectProductionsVersion, selectLoading, selectError, selectProductionById } =
  productionsSlice.selectors;