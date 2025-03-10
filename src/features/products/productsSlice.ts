import { createAppSlice } from "../../redux/createAppSlice"
import { fetchAddProduct, fetchDeleteProduct, fetchEditProduct, fetchProduct, fetchProducts } from "./api"
import { NewProductDto, ProductsState, UpdateProductDto } from "./types"

const initialState: ProductsState = {
  productsList: [],
  totalPages: 1, // Количество страниц
  currentPage: 0, // Текущая страница
  selectedProduct: undefined,
  loading: false,        
  error: null,
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

    addProduct: create.asyncThunk(
          async (newProductDto: NewProductDto) => {
            return await fetchAddProduct(newProductDto);
          },
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
         }) => {
           return await fetchEditProduct({ id, updateProductDto });
         },
         {
           fulfilled: (state, action) => {
             const index = state.productsList.findIndex(
               (product) => product.id === action.payload.id
             );
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
            state.productsList = state.productsList.filter(
              (product) => product.id !== action.payload 
            );
          },
        }
      ),
   
       
      getProduct: create.asyncThunk(
        async (id: number) => {
          console.log("Fetching product with id:", id);
          return await fetchProduct(id); // Ваш асинхронный запрос
        },
        {
          pending: (state) => {
            state.loading = true; // Устанавливаем загрузку в true
            state.error = null; // Очищаем ошибку перед новым запросом
          },
          fulfilled: (state, action) => {
            state.selectedProduct = action.payload; // Сохраняем продукт в состояние
            state.loading = false; // Завершаем загрузку
          },
          rejected: (state, action) => {
            state.loading = false; // Завершаем загрузку
            state.error = action.error.message || "Произошла ошибка"; // Сохраняем ошибку
          },
        }
      ),
     }),

  selectors: {
    selectProducts: (productsState: ProductsState) => productsState.productsList,
    selectTotalPages: (productsState: ProductsState) => productsState.totalPages,
    selectCurrentPage: (productsState: ProductsState) => productsState.currentPage,
    selectProduct: (productsState: ProductsState) => productsState.selectedProduct,
    selectLoading: (productsState: ProductsState) => productsState.loading,
    selectError: (productsState: ProductsState) => productsState.error,
  },
});

export const { getProducts, addProduct, editProduct, getProduct, deleteProduct } = productsSlice.actions;
export const { selectProducts, selectTotalPages, selectCurrentPage, selectProduct, selectLoading, selectError } =
  productsSlice.selectors;