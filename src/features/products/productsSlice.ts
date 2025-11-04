import { createAppSlice } from "../../redux/createAppSlice";
import {
  fetchAddProduct,
  fetchDeleteProduct,
  fetchEditProduct,
  fetchProduct,
  fetchProducts,
  fetchProductsByCategory,
} from "./api";
import { NewProductDto, ProductsState, UpdateProductDto } from "./types";

const initialState: ProductsState = {
  productsList: [],
  totalPages: 1,
  currentPage: 0,
  currentSort: "name",
  selectedProduct: undefined,
  loading: false,
  error: null,
};

export const productsSlice = createAppSlice({
  name: "products",
  initialState,
  reducers: (create) => ({
   getProducts: create.asyncThunk(
      async (
        { page, size = 15, sort = "name", searchTerm = "" }: { page: number; size?: number; sort?: string; searchTerm?: string }
      ) => {
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
          state.productsList = response.content;
          state.totalPages = response.totalPages;
          state.currentPage = response.pageable.pageNumber;
          state.currentSort = action.meta.arg.sort ?? "name";
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message || "Fehler beim Laden der Produkte.";
        },
      }
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
        return await fetchProductsByCategory(categoryId, page, size, sort, searchTerm);
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          const response = action.payload;
          state.loading = false;
          state.productsList = response.content;
          state.totalPages = response.totalPages;
          state.currentPage = response.pageable.pageNumber;
          state.currentSort = action.meta.arg.sort ?? "name";
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message || "Fehler beim Laden der Produktkategorien.";
        },
      }
    ),

    addProduct: create.asyncThunk(
      async (newProductDto: NewProductDto, { dispatch, getState }) => {
        const addedProduct = await fetchAddProduct(newProductDto);

        const state = getState() as { products: ProductsState };
        await dispatch(
          getProducts({
            page: state.products.currentPage,
            size: 15, 
            sort: state.products.currentSort,
          })
        );

        return addedProduct;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state) => {
          state.loading = false;
          // productsList обновится через getProducts, здесь не нужно пушить
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message || "Fehler beim Hinzufügen des Produkts.";
        },
      }
    ),

    editProduct: create.asyncThunk(
      async (
        {
          id,
          updateProductDto,
        }: {
          id: number;
          updateProductDto: UpdateProductDto;
        },
        { dispatch, getState }
      ) => {
        const editedProduct = await fetchEditProduct({ id, updateProductDto });

        const state = getState() as { products: ProductsState };
        await dispatch(
          getProducts({
            page: state.products.currentPage,
            size: 15,
            sort: state.products.currentSort,
          })
        );

        return editedProduct;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state) => {
          state.loading = false;
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message || "Fehler beim Bearbeiten des Produkts.";
        },
      }
    ),

    deleteProduct: create.asyncThunk(
      async (id: number, { dispatch, getState }) => {
        await fetchDeleteProduct(id);

        const state = getState() as { products: ProductsState };
        await dispatch(
          getProducts({
            page: state.products.currentPage,
            size: 15,
            sort: state.products.currentSort,
          })
        );

        return id;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state) => {
          state.loading = false;
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message || "Fehler beim Löschen des Produkts.";
        },
      }
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
          state.error = action.error.message || "Fehler beim Laden der Produkt.";
        },
      }
    ),
  }),

  selectors: {
    selectProducts: (state: ProductsState) => state.productsList,
    selectTotalPages: (state: ProductsState) => state.totalPages,
    selectCurrentPage: (state: ProductsState) => state.currentPage,
    selectProduct: (state: ProductsState) => state.selectedProduct,
    selectLoading: (state: ProductsState) => state.loading,
    selectError: (state: ProductsState) => state.error,
  },
});

export const {
  getProducts,
  getProductsByCategory,
  addProduct,
  editProduct,
  getProduct,
  deleteProduct,
} = productsSlice.actions;

export const {
  selectProducts,
  selectTotalPages,
  selectCurrentPage,
  selectProduct,
  selectLoading,
  selectError,
} = productsSlice.selectors;
