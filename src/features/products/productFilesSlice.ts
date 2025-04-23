import { createAppSlice } from "../../redux/createAppSlice";
import {
  fetchProductFiles,
  fetchUploadProductFile,
  fetchDeleteProductFile,
} from "./api";
import { ProductFilesState } from "./types";


const initialState: ProductFilesState = {
  files: [],
};

export const productFilesSlice = createAppSlice({
  name: "productFiles",
  initialState,
  reducers: (create) => ({
    
    getProductFiles: create.asyncThunk(
      async (productId: number) => {
        return await fetchProductFiles(productId);
      },
      {
        fulfilled: (state, action) => {
          state.files = action.payload;
        },
      }
    ),

    
    uploadProductFile: create.asyncThunk(
      async ({ productId, file }: { productId: number; file: File }) => {
        return await fetchUploadProductFile(productId, file);
      },
      {
        fulfilled: (state, action) => {
          state.files.push(action.payload);
        },
      }
    ),


    deleteProductFile: create.asyncThunk(
      async (fileId: number) => {
        await fetchDeleteProductFile(fileId);
        return fileId;
      },
      {
        fulfilled: (state, action) => {
          state.files = state.files.filter((file) => file.id !== action.payload);
        },
      }
    ),
  }),

  selectors: {
    selectProductFiles: (state: ProductFilesState) => state.files,
  },
});

export const { getProductFiles, uploadProductFile, deleteProductFile } =
  productFilesSlice.actions;

export const { selectProductFiles } = productFilesSlice.selectors;
