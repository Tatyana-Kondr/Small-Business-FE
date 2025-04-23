import { createAppSlice } from "../../redux/createAppSlice";
import {
  fetchAddProductCategory,
  fetchProductCategories,
  fetchEditProductCategory,
  fetchDeleteProductCategory,
  fetchProductCategory,
} from "./api";
import {
  NewProductCategoryDto,
  ProductCategoriesState
} from "./types";

const initialState: ProductCategoriesState = {
  productCategoriesList: [],
  selectedProductCategory: undefined,
};

export const productCategoriesSlice = createAppSlice({
  name: "productCategories",
  initialState,
  reducers: (create) => ({
    
    getProductCategories: create.asyncThunk(
      async () => {
        const categories = await fetchProductCategories();
        return categories;
      },
      {
        fulfilled: (state, action) => {
            state.productCategoriesList = action.payload;
        },
      }
    ),
    

    
    addProductCategory: create.asyncThunk(
      async (newProductCategoryDto: NewProductCategoryDto) => {
        return await fetchAddProductCategory(newProductCategoryDto);
      },
      {
        fulfilled: (state, action) => {
          state.productCategoriesList.push(action.payload);
        },
      }
    ),

   
    editProductCategory: create.asyncThunk(
      async ({
        id,
        newProductCategoryDto,
      }: {
        id: number;
        newProductCategoryDto: NewProductCategoryDto;
      }) => {
        return await fetchEditProductCategory({ id, newProductCategoryDto });
      },
      {
        fulfilled: (state, action) => {
          const index = state.productCategoriesList.findIndex(
            (category) => category.id === action.payload.id
          );
          if (index !== -1) {
            state.productCategoriesList[index] = action.payload;
          }
        },
      }
    ),


    deleteProductCategory: create.asyncThunk(
      async (id: number) => {
        await fetchDeleteProductCategory(id);
        return id;
      },
      {
        fulfilled: (state, action) => {
          state.productCategoriesList = state.productCategoriesList.filter(
            (category) => category.id !== action.payload
          );
        },
      }
    ),

    
    getProductCategory: create.asyncThunk(
      async (id: number) => {
        return await fetchProductCategory(id);
      },
      {
        fulfilled: (state, action) => {
          state.selectedProductCategory = action.payload;
        },
      }
    ),
  }),

  selectors: {
    selectProductCategories: (state: ProductCategoriesState) => state.productCategoriesList,
    selectProductCategory: (state: ProductCategoriesState) => state.selectedProductCategory,
  },
});

export const {
  getProductCategories,
  addProductCategory,
  editProductCategory,
  deleteProductCategory,
  getProductCategory,
} = productCategoriesSlice.actions;

export const { selectProductCategories, selectProductCategory } = productCategoriesSlice.selectors;
