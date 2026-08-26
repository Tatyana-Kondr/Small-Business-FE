import { createAppSlice } from "../../redux/createAppSlice";
import {
  fetchProductFiles,
  fetchDeleteProductFile,
  fetchUploadProductFile,
  fetchAllPhotos,
  fetchReorderProductPhotos,
  fetchReplaceProductFile,
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
      },
    ),

    getAllProductFiles: create.asyncThunk(
      async () => {
        return await fetchAllPhotos();
      },
      {
        fulfilled: (state, action) => {
          state.files = action.payload;
          console.log("Все фото загружены:", action.payload.length);
        },
      },
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
      },
    ),

    deleteProductFile: create.asyncThunk(
      async (fileId: number) => {
        await fetchDeleteProductFile(fileId);
        return fileId;
      },
      {
        fulfilled: (state, action) => {
          state.files = state.files.filter(
            (file) => file.id !== action.payload,
          );
        },
      },
    ),

    replaceProductFile: create.asyncThunk(
      async ({ photoId, file }: { photoId: number; file: File }) => {
        return await fetchReplaceProductFile(photoId, file);
      },
      {
        fulfilled: (state, action) => {
          const index = state.files.findIndex(
            (file) => file.id === action.payload.id,
          );

          if (index !== -1) {
            state.files[index] = action.payload;
          }
        },
      },
    ),

    reorderProductFiles: create.asyncThunk(
      async ({
        productId,
        files,
      }: {
        productId: number;
        files: ProductFilesState["files"];
      }) => {
        const photoIds = files.map((file) => file.id);

        await fetchReorderProductPhotos(productId, photoIds);

        return files;
      },
      {
        fulfilled: (state, action) => {
          state.files = action.payload.map((file, index) => ({
            ...file,
            position: index,
          }));
        },
      },
    ),
  }),
  selectors: {
    selectProductFiles: (state: ProductFilesState) => state.files,
  },
});

export const {
  getProductFiles,
  getAllProductFiles,
  uploadProductFile,
  deleteProductFile,
  reorderProductFiles,
  replaceProductFile,
} = productFilesSlice.actions;

export const { selectProductFiles } = productFilesSlice.selectors;
