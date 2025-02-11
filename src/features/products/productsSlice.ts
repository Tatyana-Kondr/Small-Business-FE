import { createAppSlice } from "../../redux/createAppSlice"
import { fetchProducts } from "./api"
import { ProductsState } from "./types"

const initialState: ProductsState = {
    productsList: [],
    selectedProduct: undefined
  }
  
  export const productsSlice = createAppSlice({
    name: "products",
    initialState,
    reducers: create => ({
      
      getProducts: create.asyncThunk(
        async () => {
          const response = await fetchProducts()
          return response
        },
        {
          pending: () => {},
          fulfilled: (state, action) => {
            state.productsList = action.payload
          },
          rejected: () => {},
        },
      ),
    }),
      selectors: {
        selectProducts: (productsState: ProductsState ) => productsState.productsList,
        selectProduct: (productsState: ProductsState) => productsState.selectedProduct,
      },
    })
    
    export const { getProducts } = productsSlice.actions
    export const { selectProducts, selectProduct } = productsSlice.selectors