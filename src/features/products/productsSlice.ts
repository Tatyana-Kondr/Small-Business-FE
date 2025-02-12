import { createAppSlice } from "../../redux/createAppSlice"
import { fetchProducts } from "./api"
import { ProductsState } from "./types"

const initialState: ProductsState = {
  productsList: [],
  totalPages: 1, // Количество страниц
  currentPage: 0, // Текущая страница
  selectedProduct: undefined,
};
  
export const productsSlice = createAppSlice({
  name: "products",
  initialState,
  reducers: (create) => ({
    getProducts: create.asyncThunk(
      async ({ page, size }: { page: number; size: number }) => {
        const response = await fetchProducts(page, size);
        return response;
      },
      {
        pending: () => {},
        fulfilled: (state, action) => {
          console.log("Полученные продукты:", action.payload.content);
          state.productsList = action.payload.content;
          state.totalPages = action.payload.totalPages; // API должен возвращать totalPages
          state.currentPage = action.payload.pageable.pageNumber;
        },
        rejected: () => {},
      }
    ),
  }),
  selectors: {
    selectProducts: (productsState: ProductsState) => productsState.productsList,
    selectTotalPages: (productsState: ProductsState) => productsState.totalPages,
    selectCurrentPage: (productsState: ProductsState) => productsState.currentPage,
    selectProduct: (productsState: ProductsState) => productsState.selectedProduct,
  },
});

export const { getProducts } = productsSlice.actions;
export const { selectProducts, selectTotalPages, selectCurrentPage, selectProduct } =
  productsSlice.selectors;