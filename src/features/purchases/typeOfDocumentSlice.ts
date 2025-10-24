import { createAppSlice } from "../../redux/createAppSlice";
import { fetchAllTypesOfDocument, fetchCreateTypeOfDocument, fetchDeleteTypeOfDocument, fetchTypeOfDocumentById, fetchUpdateTypeOfDocument } from "./api";
import { NewTypeOfDocumentDto, TypeOfDocumentState } from "./types";


const initialState: TypeOfDocumentState = {
  documentTypesList: [],
  selectedDocumentType: undefined,
  loading: false,
  error: null,
};

export const TypeOfDocumentSlice = createAppSlice({
  name: "documentTypes",
  initialState,
  reducers: (create) => ({
    getDocumentTypes: create.asyncThunk(
      async () => {
        return await fetchAllTypesOfDocument();
      },
      {
        fulfilled: (state, action) => {
          state.documentTypesList = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Laden der Documenttypen.";
          state.loading = false;
        },
      }
    ),

    addDocumentType: create.asyncThunk(
      async (newTypeOfDocument: NewTypeOfDocumentDto) => {
        return await fetchCreateTypeOfDocument(newTypeOfDocument);
      },
      {
        fulfilled: (state, action) => {
          state.selectedDocumentType = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Erstellen des Documenttyps.";
          state.loading = false;
        },
      }
    ),

    getDocumentTypeById: create.asyncThunk(
      async (id: number) => {
        return await fetchTypeOfDocumentById(id);
      },
      {
        fulfilled: (state, action) => {
          state.selectedDocumentType = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Laden des Documenttyps.";
          state.loading = false;
        },
      }
    ),

    updateDocumentType: create.asyncThunk(
      async ({
        id,
        updatedTypeOfDocument,
      }: {
        id: number;
        updatedTypeOfDocument: NewTypeOfDocumentDto;
      }) => {
        return await fetchUpdateTypeOfDocument(id, updatedTypeOfDocument);
      },
      {
        fulfilled: (state, action) => {
          state.selectedDocumentType = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Aktualisieren des Documenttyps.";
          state.loading = false;
        },
      }
    ),

    deleteDocumentType: create.asyncThunk(
      async (id: number) => {
        await fetchDeleteTypeOfDocument(id);
        return id;
      },
      {
        fulfilled: (state, action) => {
          state.documentTypesList = state.documentTypesList.filter(
            (process) => process.id !== action.payload
          );
          if (
            state.selectedDocumentType &&
            state.selectedDocumentType.id === action.payload
          ) {
            state.selectedDocumentType = undefined;
          }
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Löschen des Documenttyps.";
          state.loading = false;
        },
      }
    ),
  }),

  selectors: {
    selectTypeOfDocuments: (state: TypeOfDocumentState) => state.documentTypesList,
    selectTypeOfDocument: (state: TypeOfDocumentState) => state.selectedDocumentType,
    selectLoading: (state: TypeOfDocumentState) => state.loading,
    selectError: (state: TypeOfDocumentState) => state.error,
    selectTypeOfDocumentById: (state: TypeOfDocumentState, id: number) =>
      state.documentTypesList.find((s) => s.id === id),
  },
});

export const { getDocumentTypes, addDocumentType, getDocumentTypeById, updateDocumentType, deleteDocumentType} = TypeOfDocumentSlice.actions;
export const {selectTypeOfDocuments, selectTypeOfDocument, selectLoading, selectError, selectTypeOfDocumentById} = TypeOfDocumentSlice.selectors;
