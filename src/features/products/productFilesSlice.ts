import { createAppSlice } from "../../redux/createAppSlice";
import {
  fetchProductFiles,
  fetchDeleteProductFile,
  fetchUploadProductFile,
  fetchAllPhotos,
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

    getAllProductFiles: create.asyncThunk(
      async () => {
        return await fetchAllPhotos();
      },
      {
        fulfilled: (state, action) => {
          state.files = action.payload;
          console.log( "Все фото загружены:", action.payload.length);
        },
      }
    ),

    uploadProductFile: create.asyncThunk(
  async ({ productId, file }: { productId: number; file: File }) => {
    // API теперь возвращает ProductPhoto
    return await fetchUploadProductFile(productId, file);
  },
  {
    fulfilled: (state, action) => {
      // пушим сразу готовый объект в список
      state.files.push(action.payload);
      console.log("File uploaded:", action.payload);
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

export const { getProductFiles, getAllProductFiles, uploadProductFile, deleteProductFile } =
  productFilesSlice.actions;

export const { selectProductFiles } = productFilesSlice.selectors;