import { createAppSlice } from "../../redux/createAppSlice";
import { fetchAllShippings, fetchCreateShipping, fetchDeleteShipping, fetchShippingById, fetchUpdateShipping } from "./api";
import { NewShippingDto, ShippingsState } from "./types";

const initialState: ShippingsState = {
  shippingsList: [],
  selectedShipping: undefined,
  loading: false,
  error: null,
};

export const shippingsSlice = createAppSlice({
  name: "shippings",
  initialState,
  reducers: (create) => ({
    getShippings: create.asyncThunk(
      async () => {
        return await fetchAllShippings();
      },
      {
        fulfilled: (state, action) => {
          state.shippingsList = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Laden der Versandliste.";
          state.loading = false;
        },
      }
    ),

    addShipping: create.asyncThunk(
      async (newShipping: NewShippingDto) => {
        return await fetchCreateShipping(newShipping);
      },
      {
        fulfilled: (state, action) => {
          state.selectedShipping = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Erstellen des Versands.";
          state.loading = false;
        },
      }
    ),

    getShippingById: create.asyncThunk(
      async (id: number) => {
        return await fetchShippingById(id);
      },
      {
        fulfilled: (state, action) => {
          state.selectedShipping = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Laden des Versands.";
          state.loading = false;
        },
      }
    ),

    updateShipping: create.asyncThunk(
      async ({
        id,
        updatedShipping,
      }: {
        id: number;
        updatedShipping: NewShippingDto;
      }) => {
        return await fetchUpdateShipping(id, updatedShipping);
      },
      {
        fulfilled: (state, action) => {
          state.selectedShipping = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Aktualisieren des Versands.";
          state.loading = false;
        },
      }
    ),

    deleteShipping: create.asyncThunk(
      async (id: number) => {
        await fetchDeleteShipping(id);
        return id;
      },
      {
        fulfilled: (state, action) => {
          state.shippingsList = state.shippingsList.filter(
            (process) => process.id !== action.payload
          );
          if (
            state.selectedShipping &&
            state.selectedShipping.id === action.payload
          ) {
            state.selectedShipping = undefined;
          }
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Löschen des Versands.";
          state.loading = false;
        },
      }
    ),
  }),

  selectors: {
    selectShippings: (state: ShippingsState) => state.shippingsList,
    selectShipping: (state: ShippingsState) => state.selectedShipping,
    selectLoading: (state: ShippingsState) => state.loading,
    selectError: (state: ShippingsState) => state.error,
    selectShippingById: (state: ShippingsState, id: number) =>
      state.shippingsList.find((s) => s.id === id),
  },
});

export const {
  getShippings,
  addShipping,
  getShippingById,
  updateShipping,
  deleteShipping,
} = shippingsSlice.actions;

export const {
  selectShippings,
  selectShipping,
  selectLoading,
  selectError,
  selectShippingById,
} = shippingsSlice.selectors;
