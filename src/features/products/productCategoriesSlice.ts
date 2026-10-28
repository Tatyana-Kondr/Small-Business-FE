import { createAppSlice } from "../../redux/createAppSlice";

import {
  fetchAddProductCategory,
  fetchDeleteProductCategory,
  fetchEditProductCategory,
  fetchProductCategories,
  fetchProductCategory,
} from "./api";

import { NewProductCategoryDto, ProductCategoriesState } from "./types";

import { HttpError } from "../../utils/errors/handleFetchError";

const sortCategories = <T extends { name: string }>(categories: T[]): T[] =>
  [...categories].sort((a, b) =>
    a.name.localeCompare(b.name, "de", { sensitivity: "base" }),
  );

const initialState: ProductCategoriesState = {
  productCategoriesList: [],
  selectedProductCategory: undefined,
  loading: false,
  error: null,
};

export const productCategoriesSlice = createAppSlice({
  name: "productCategories",
  initialState,

  reducers: (create) => ({
    getProductCategories: create.asyncThunk(
      async () => {
        return fetchProductCategories();
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.productCategoriesList = sortCategories(action.payload);
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message || "Fehler beim Laden der Produktkategorien.";
        },
      },
    ),

    addProductCategory: create.asyncThunk(
      async (
        newProductCategoryDto: NewProductCategoryDto,
        { rejectWithValue },
      ) => {
        try {
          return await fetchAddProductCategory(newProductCategoryDto);
        } catch (error) {
          if (error instanceof HttpError) {
            return rejectWithValue(error.data);
          }

          throw error;
        }
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.productCategoriesList = sortCategories([
            ...state.productCategoriesList,
            action.payload,
          ]);

          state.selectedProductCategory = action.payload;
          state.loading = false;
          state.error = null;
        },

        rejected: (state) => {
          state.loading = false;
          state.error = "Fehler beim Speichern der Produktkategorie.";
        },
      },
    ),

    editProductCategory: create.asyncThunk(
      async (
        {
          id,
          newProductCategoryDto,
        }: {
          id: number;
          newProductCategoryDto: NewProductCategoryDto;
        },
        { rejectWithValue },
      ) => {
        try {
          return await fetchEditProductCategory({
            id,
            newProductCategoryDto,
          });
        } catch (error) {
          if (error instanceof HttpError) {
            return rejectWithValue(error.data);
          }

          throw error;
        }
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          const index = state.productCategoriesList.findIndex(
            (category) => category.id === action.payload.id,
          );

          if (index !== -1) {
            state.productCategoriesList[index] = action.payload;
          }

          state.productCategoriesList = sortCategories(
            state.productCategoriesList,
          );

          if (state.selectedProductCategory?.id === action.payload.id) {
            state.selectedProductCategory = action.payload;
          }

          state.loading = false;
          state.error = null;
        },

        rejected: (state) => {
          state.loading = false;
          state.error = "Fehler beim Speichern der Produktkategorie.";
        },
      },
    ),

    deleteProductCategory: create.asyncThunk(
      async (id: number, { rejectWithValue }) => {
        try {
          await fetchDeleteProductCategory(id);
          return id;
        } catch (error) {
          if (error instanceof HttpError) {
            return rejectWithValue(error.data);
          }

          throw error;
        }
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.productCategoriesList = state.productCategoriesList.filter(
            (category) => category.id !== action.payload,
          );

          if (state.selectedProductCategory?.id === action.payload) {
            state.selectedProductCategory = undefined;
          }

          state.loading = false;
          state.error = null;
        },

        rejected: (state) => {
          state.loading = false;
          state.error = "Fehler beim Löschen der Produktkategorie.";
        },
      },
    ),

    getProductCategory: create.asyncThunk(
      async (id: number) => {
        return fetchProductCategory(id);
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
          state.selectedProductCategory = undefined;
        },

        fulfilled: (state, action) => {
          state.selectedProductCategory = action.payload;
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;

          state.error =
            action.error?.message || "Fehler beim Laden der Produktkategorie.";
        },
      },
    ),
  }),

  selectors: {
    selectProductCategories: (state: ProductCategoriesState) =>
      state.productCategoriesList,

    selectProductCategory: (state: ProductCategoriesState) =>
      state.selectedProductCategory,

    selectLoading: (state: ProductCategoriesState) => state.loading,

    selectError: (state: ProductCategoriesState) => state.error,

    selectProductCategoryById: (state: ProductCategoriesState, id: number) =>
      state.productCategoriesList.find((category) => category.id === id),
  },
});

export const {
  getProductCategories,
  addProductCategory,
  editProductCategory,
  deleteProductCategory,
  getProductCategory,
} = productCategoriesSlice.actions;

export const {
  selectProductCategories,
  selectProductCategory,
  selectLoading,
  selectError,
  selectProductCategoryById,
} = productCategoriesSlice.selectors;
