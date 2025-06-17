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
  selectedProduct: undefined,
  loading: false,
  error: null,
};

export const productsSlice = createAppSlice({
  name: "products",
  initialState,
  reducers: (create) => ({
    getProducts: create.asyncThunk(
      async ({
        page,
        size = 15,
        searchTerm,
      }: {
        page: number;
        size?: number;
        searchTerm?: string;
      }) => await fetchProducts({ page, size, searchTerm }),
      {
        fulfilled: (state, action) => {
          state.productsList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
        },
      }
    ),

    getProductsByCategory: create.asyncThunk(
      async ({
        categoryId,
        page = 0,
        size = 15,
      }: {
        categoryId: number;
        page?: number;
        size?: number;
      }) => await fetchProductsByCategory(categoryId, page, size),
      {
        fulfilled: (state, action) => {
          state.productsList = action.payload.content;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.pageable.pageNumber;
        },
      }
    ),

    addProduct: create.asyncThunk(
      async (newProductDto: NewProductDto) => await fetchAddProduct(newProductDto),
      {
        fulfilled: (state, action) => {
          state.productsList.push(action.payload);
        },
      }
    ),

    editProduct: create.asyncThunk(
      async ({
        id,
        updateProductDto,
      }: {
        id: number;
        updateProductDto: UpdateProductDto;
      }) => await fetchEditProduct({ id, updateProductDto }),
      {
        fulfilled: (state, action) => {
          const index = state.productsList.findIndex((product) => product.id === action.payload.id);
          if (index !== -1) {
            state.productsList[index] = action.payload;
          }
        },
      }
    ),

    deleteProduct: create.asyncThunk(
      async (id: number) => {
        await fetchDeleteProduct(id);
        return id;
      },
      {
        fulfilled: (state, action) => {
          state.productsList = state.productsList.filter((product) => product.id !== action.payload);
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
          state.error = action.error.message || "Произошла ошибка";
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
