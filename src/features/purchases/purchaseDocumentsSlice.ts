import { createAppSlice } from "../../redux/createAppSlice";

import {
  fetchDeletePurchaseDocument,
  fetchPurchaseDocuments,
  fetchUploadPurchaseDocument,
} from "./api";

import {
  PurchaseDocumentDto,
  PurchaseDocumentsState,
} from "./types";

const initialState: PurchaseDocumentsState = {
  documentsList: [],
  selectedDocument: undefined,
  loading: false,
  error: null,
};

export const purchaseDocumentsSlice = createAppSlice({
  name: "purchaseDocuments",

  initialState,

  reducers: (create) => ({

    getPurchaseDocuments: create.asyncThunk(
      async (purchaseId: number) => {
        return await fetchPurchaseDocuments(purchaseId);
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.loading = false;
          state.documentsList = action.payload;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error.message ??
            "Dokumente konnten nicht geladen werden";
        },
      }
    ),

    uploadPurchaseDocument: create.asyncThunk(
      async ({
        purchaseId,
        file,
      }: {
        purchaseId: number;
        file: File;
      }) => {
        return await fetchUploadPurchaseDocument(
          purchaseId,
          file
        );
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.loading = false;

          state.documentsList.push(action.payload);
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error.message ??
            "Dokument konnte nicht hochgeladen werden";
        },
      }
    ),

    deletePurchaseDocument: create.asyncThunk(
      async (documentId: number) => {
        await fetchDeletePurchaseDocument(documentId);

        return documentId;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.loading = false;

          state.documentsList =
            state.documentsList.filter(
              (document) =>
                document.id !== action.payload
            );

          if (
            state.selectedDocument?.id ===
            action.payload
          ) {
            state.selectedDocument = undefined;
          }
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error.message ??
            "Dokument konnte nicht gelöscht werden";
        },
      }
    ),

    setSelectedPurchaseDocument: create.reducer(
      (
        state,
        action: {
          payload: PurchaseDocumentDto | undefined;
        }
      ) => {
        state.selectedDocument = action.payload;
      }
    ),

    clearPurchaseDocuments: create.reducer(
      (state) => {
        state.documentsList = [];
        state.selectedDocument = undefined;
        state.error = null;
      }
    ),

  }),

  selectors: {
    selectPurchaseDocuments: (
      state: PurchaseDocumentsState
    ) => state.documentsList,

    selectSelectedPurchaseDocument: (
      state: PurchaseDocumentsState
    ) => state.selectedDocument,

    selectPurchaseDocumentsLoading: (
      state: PurchaseDocumentsState
    ) => state.loading,

    selectPurchaseDocumentsError: (
      state: PurchaseDocumentsState
    ) => state.error,
  },
});

export const {
  getPurchaseDocuments,
  uploadPurchaseDocument,
  deletePurchaseDocument,
  setSelectedPurchaseDocument,
  clearPurchaseDocuments,
} = purchaseDocumentsSlice.actions;

export const {
  selectPurchaseDocuments,
  selectSelectedPurchaseDocument,
  selectPurchaseDocumentsLoading,
  selectPurchaseDocumentsError,
} = purchaseDocumentsSlice.selectors;