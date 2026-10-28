import { createAppSlice } from "../../redux/createAppSlice";
import { HttpError } from "../../utils/errors/handleFetchError";

import {
  fetchAllShippings,
  fetchCreateShipping,
  fetchDeleteShipping,
  fetchShippingById,
  fetchUpdateShipping,
} from "./api";

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
        return fetchAllShippings();
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.shippingsList = action.payload;
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message || "Fehler beim Laden der Versandliste.";
        },
      },
    ),

    addShipping: create.asyncThunk(
      async (newShipping: NewShippingDto, { rejectWithValue }) => {
        try {
          return await fetchCreateShipping(newShipping);
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
          state.shippingsList.push(action.payload);
          state.selectedShipping = action.payload;
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
              "Fehler beim Erstellen der Versandart.";
          } else {
            state.error =
              action.error.message || "Fehler beim Erstellen der Versandart.";
          }
        },
      },
    ),

    getShippingById: create.asyncThunk(
      async (id: number) => {
        return fetchShippingById(id);
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.selectedShipping = action.payload;
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message || "Fehler beim Laden der Versandart.";
        },
      },
    ),

    updateShipping: create.asyncThunk(
      async (
        {
          id,
          updatedShipping,
        }: {
          id: number;
          updatedShipping: NewShippingDto;
        },
        { rejectWithValue },
      ) => {
        try {
          return await fetchUpdateShipping(id, updatedShipping);
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
          const index = state.shippingsList.findIndex(
            (shipping) => shipping.id === action.payload.id,
          );

          if (index !== -1) {
            state.shippingsList[index] = action.payload;
          }

          if (state.selectedShipping?.id === action.payload.id) {
            state.selectedShipping = action.payload;
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
              "Fehler beim Aktualisieren der Versandart.";
          } else {
            state.error =
              action.error.message ||
              "Fehler beim Aktualisieren der Versandart.";
          }
        },
      },
    ),

    deleteShipping: create.asyncThunk(
      async (id: number) => {
        await fetchDeleteShipping(id);
        return id;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.shippingsList = state.shippingsList.filter(
            (shipping) => shipping.id !== action.payload,
          );

          if (state.selectedShipping?.id === action.payload) {
            state.selectedShipping = undefined;
          }

          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message || "Fehler beim Löschen der Versandart.";
        },
      },
    ),
  }),

  selectors: {
    selectShippings: (state: ShippingsState) => state.shippingsList,

    selectShipping: (state: ShippingsState) => state.selectedShipping,

    selectLoading: (state: ShippingsState) => state.loading,

    selectError: (state: ShippingsState) => state.error,

    selectShippingById: (state: ShippingsState, id: number) =>
      state.shippingsList.find((shipping) => shipping.id === id),
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
