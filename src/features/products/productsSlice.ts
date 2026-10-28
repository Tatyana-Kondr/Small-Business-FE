import { createAppSlice } from "../../redux/createAppSlice";
import {
  fetchDeleteProduct,
  fetchEditProduct,
  fetchPickProducts,
  fetchProduct,
  fetchProducts,
  fetchProductsByCategory,
} from "./api";
import { ProductPickDto, ProductsState, UpdateProductDto } from "./types";

const initialState: ProductsState = {
  productsPaged: [],
  pickProducts: [],
  pickLoading: false,
  pickError: null,
  pickLastQuery: null,
  totalPages: 1,
  currentPage: 0,
  pageSize: 15,
  currentSort: "name",
  selectedProduct: undefined,
  productsVersion: 0,
  loading: false,
  error: null,
};

export const productsSlice = createAppSlice({
  name: "products",
  initialState,
  reducers: (create) => ({
    invalidateProducts: create.reducer((state) => {
      state.productsVersion += 1;
    }),

    clearPickProducts: create.reducer((state) => {
      state.pickProducts = [];
      state.pickLoading = false;
      state.pickError = null;
      state.pickLastQuery = null;
    }),

    getProducts: create.asyncThunk(
      async ({
        page,
        size = 15,
        sort = "name",
        searchTerm = "",
      }: {
        page: number;
        size?: number;
        sort?: string;
        searchTerm?: string;
      }) => {
        const response = await fetchProducts(page, size, sort, searchTerm);
        return response;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          const response = action.payload;
          state.loading = false;
          state.productsPaged = response.content;
          state.totalPages = response.totalPages;
          state.currentPage = response.pageable.pageNumber;
          state.pageSize = action.meta.arg.size ?? 15;
          state.currentSort = action.meta.arg.sort ?? "name";
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error.message || "Fehler beim Laden der Produkte.";
        },
      },
    ),

    getPickProducts: create.asyncThunk<
      ProductPickDto[],
      { searchTerm?: string; categoryId?: number | null; limit?: number }
    >(
      async ({ searchTerm = "", categoryId = null, limit = 50 }) => {
        return await fetchPickProducts({ searchTerm, categoryId, limit });
      },
      {
        pending: (state, action) => {
          state.pickLoading = true;
          state.pickError = null;
          state.pickLastQuery = {
            searchTerm: action.meta.arg.searchTerm?.trim() || "",
            categoryId: action.meta.arg.categoryId ?? null,
          };
        },
        fulfilled: (state, action) => {
          state.pickProducts = action.payload;
          state.pickLoading = false;
        },
        rejected: (state, action) => {
          state.pickLoading = false;
          state.pickProducts = [];
          state.pickError =
            action.error.message || "Fehler beim Laden der Produkt-Auswahl.";
        },
      },
    ),

    getProductsByCategory: create.asyncThunk(
      async ({
        categoryId,
        page = 0,
        size = 15,
        sort = "name",
        searchTerm = "",
      }: {
        categoryId: number;
        page?: number;
        size?: number;
        sort?: string;
        searchTerm?: string;
      }) => {
        return await fetchProductsByCategory(
          categoryId,
          page,
          size,
          sort,
          searchTerm,
        );
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          const response = action.payload;
          state.loading = false;
          state.productsPaged = response.content;
          state.totalPages = response.totalPages;
          state.currentPage = response.pageable.pageNumber;
          state.pageSize = action.meta.arg.size ?? 15;
          state.currentSort = action.meta.arg.sort ?? "name";
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error.message || "Fehler beim Laden der Produkte.";
        },
      },
    ),

    editProduct: create.asyncThunk(
      async ({
        id,
        updateProductDto,
      }: {
        id: number;
        updateProductDto: UpdateProductDto;
      }) => {
        return await fetchEditProduct({ id, updateProductDto });
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          if (state.selectedProduct?.id === action.payload.id) {
            state.selectedProduct = action.payload;
          }
          state.productsVersion += 1;
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error.message || "Fehler beim Bearbeiten des Produkts.";
        },
      },
    ),

    deleteProduct: create.asyncThunk(
      async (id: number) => {
        await fetchDeleteProduct(id);
        return id;
      },
      {
        pending: () => {
          // Не изменяем loading и error карточки продукта.
          // ConfirmDeleteDialog управляет состоянием удаления.
        },

        fulfilled: (state, action) => {
          if (state.selectedProduct?.id === action.payload) {
            state.selectedProduct = undefined;
          }

          state.productsVersion += 1;
        },

        rejected: () => {
          // Ошибку отображает DeleteProduct через showErrorToast().
          // selectedProduct и error карточки не изменяем.
        },
      },
    ),

    getProduct: create.asyncThunk(
      async (id: number) => await fetchProduct(id),
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.selectedProduct = action.payload;
          state.loading = false;
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error.message || "Fehler beim Laden des Produkts.";
        },
      },
    ),
  }),

  selectors: {
    selectProductsPaged: (state) => state.productsPaged,
    selectTotalPages: (state: ProductsState) => state.totalPages,
    selectCurrentPage: (state: ProductsState) => state.currentPage,
    selectPageSize: (state: ProductsState) => state.pageSize,
    selectProduct: (state: ProductsState) => state.selectedProduct,
    selectLoading: (state: ProductsState) => state.loading,
    selectError: (state: ProductsState) => state.error,
    selectPickProducts: (state) => state.pickProducts,
    selectProductsVersion: (state: ProductsState) => state.productsVersion,
    selectPickLoading: (state: ProductsState) => state.pickLoading,
    selectPickError: (state: ProductsState) => state.pickError,
    selectPickLastQuery: (state: ProductsState) => state.pickLastQuery,
  },
});

export const {
  invalidateProducts,
  clearPickProducts,
  getProducts,
  getProductsByCategory,
  editProduct,
  getProduct,
  deleteProduct,
  getPickProducts,
} = productsSlice.actions;

export const {
  selectProductsPaged,
  selectTotalPages,
  selectCurrentPage,
  selectPageSize,
  selectProduct,
  selectProductsVersion,
  selectLoading,
  selectError,
  selectPickProducts,
  selectPickLoading,
  selectPickError,
  selectPickLastQuery,
} = productsSlice.selectors;
