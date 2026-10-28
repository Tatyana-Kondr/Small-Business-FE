import { createAppSlice } from "../../redux/createAppSlice";
import { HttpError } from "../../utils/errors/handleFetchError";

import {
  fetchAllTypesOfDocument,
  fetchCreateTypeOfDocument,
  fetchDeleteTypeOfDocument,
  fetchTypeOfDocumentById,
  fetchUpdateTypeOfDocument,
} from "./api";

import { NewTypeOfDocumentDto, TypeOfDocumentState } from "./types";

const initialState: TypeOfDocumentState = {
  documentTypesList: [],
  selectedDocumentType: undefined,
  loading: false,
  error: null,
};

export const typeOfDocumentSlice = createAppSlice({
  name: "documentTypes",
  initialState,

  reducers: (create) => ({
    getDocumentTypes: create.asyncThunk(
      async () => {
        return fetchAllTypesOfDocument();
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.documentTypesList = action.payload;
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message || "Fehler beim Laden der Dokumenttypen.";
        },
      },
    ),

    addDocumentType: create.asyncThunk(
      async (newTypeOfDocument: NewTypeOfDocumentDto, { rejectWithValue }) => {
        try {
          return await fetchCreateTypeOfDocument(newTypeOfDocument);
        } catch (error) {
          if (error instanceof HttpError && error.data !== undefined) {
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
          state.documentTypesList.push(action.payload);
          state.selectedDocumentType = action.payload;

          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;

          if (action.payload !== undefined) {
            const payload = action.payload as {
              message?: string;
              errors?: Array<{ message?: string }>;
            };

            state.error =
              payload.message ||
              payload.errors?.[0]?.message ||
              "Fehler beim Erstellen des Dokumenttyps.";
          } else {
            state.error =
              action.error?.message ||
              "Fehler beim Erstellen des Dokumenttyps.";
          }
        },
      },
    ),

    getDocumentTypeById: create.asyncThunk(
      async (id: number) => {
        return fetchTypeOfDocumentById(id);
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.selectedDocumentType = action.payload;
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message || "Fehler beim Laden des Dokumenttyps.";
        },
      },
    ),

    updateDocumentType: create.asyncThunk(
      async (
        {
          id,
          updatedTypeOfDocument,
        }: {
          id: number;
          updatedTypeOfDocument: NewTypeOfDocumentDto;
        },
        { rejectWithValue },
      ) => {
        try {
          return await fetchUpdateTypeOfDocument(id, updatedTypeOfDocument);
        } catch (error) {
          if (error instanceof HttpError && error.data !== undefined) {
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
          const index = state.documentTypesList.findIndex(
            (type) => type.id === action.payload.id,
          );

          if (index !== -1) {
            state.documentTypesList[index] = action.payload;
          }

          if (state.selectedDocumentType?.id === action.payload.id) {
            state.selectedDocumentType = action.payload;
          }

          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;

          if (action.payload !== undefined) {
            const payload = action.payload as {
              message?: string;
              errors?: Array<{ message?: string }>;
            };

            state.error =
              payload.message ||
              payload.errors?.[0]?.message ||
              "Fehler beim Aktualisieren des Dokumenttyps.";
          } else {
            state.error =
              action.error?.message ||
              "Fehler beim Aktualisieren des Dokumenttyps.";
          }
        },
      },
    ),

    deleteDocumentType: create.asyncThunk(
      async (id: number) => {
        await fetchDeleteTypeOfDocument(id);
        return id;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.documentTypesList = state.documentTypesList.filter(
            (type) => type.id !== action.payload,
          );

          if (state.selectedDocumentType?.id === action.payload) {
            state.selectedDocumentType = undefined;
          }

          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message || "Fehler beim Löschen des Dokumenttyps.";
        },
      },
    ),
  }),

  selectors: {
    selectTypeOfDocuments: (state: TypeOfDocumentState) =>
      state.documentTypesList,
    selectTypeOfDocument: (state: TypeOfDocumentState) =>
      state.selectedDocumentType,
    selectLoading: (state: TypeOfDocumentState) => state.loading,
    selectError: (state: TypeOfDocumentState) => state.error,
    selectTypeOfDocumentById: (state: TypeOfDocumentState, id: number) =>
      state.documentTypesList.find((type) => type.id === id),
  },
});

export const {
  getDocumentTypes,
  addDocumentType,
  getDocumentTypeById,
  updateDocumentType,
  deleteDocumentType,
} = typeOfDocumentSlice.actions;

export const {
  selectTypeOfDocuments,
  selectTypeOfDocument,
  selectLoading,
  selectError,
  selectTypeOfDocumentById,
} = typeOfDocumentSlice.selectors;
