import { createAppSlice } from "../../redux/createAppSlice";
import { HttpError } from "../../utils/errors/handleFetchError";

import {
  fetchActiveDiscountRates,
  fetchAllDiscountRates,
  fetchCreateDiscountRate,
  fetchDeleteDiscountRate,
  fetchUpdateDiscountRate,
} from "./api";

import { DiscountRatesState, NewDiscountRateDto } from "./types";

const initialState: DiscountRatesState = {
  discountRatesList: [],
  activeDiscountRatesList: [],
  selectedDiscountRate: undefined,
  loading: false,
  error: null,
};

export const discountRatesSlice = createAppSlice({
  name: "discountRates",
  initialState,

  reducers: (create) => ({
    getDiscountRates: create.asyncThunk(
      async () => {
        return fetchAllDiscountRates();
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.discountRatesList = action.payload;
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message || "Fehler beim Laden der Rabattsätze.";
        },
      },
    ),

    getActiveDiscountRates: create.asyncThunk(
      async () => {
        return fetchActiveDiscountRates();
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.activeDiscountRatesList = action.payload;
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message ||
            "Fehler beim Laden der aktiven Rabattsätze.";
        },
      },
    ),

    addDiscountRate: create.asyncThunk(
      async (newDiscountRate: NewDiscountRateDto, { rejectWithValue }) => {
        try {
          return await fetchCreateDiscountRate(newDiscountRate);
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
          const discountRate = action.payload;

          state.discountRatesList.push(discountRate);

          if (discountRate.active) {
            state.activeDiscountRatesList.push(discountRate);
          }

          state.selectedDiscountRate = discountRate;
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
              "Fehler beim Erstellen des Rabattsatzes.";
          } else {
            state.error =
              action.error?.message ||
              "Fehler beim Erstellen des Rabattsatzes.";
          }
        },
      },
    ),

    updateDiscountRate: create.asyncThunk(
      async (
        {
          id,
          updatedDiscountRate,
        }: {
          id: number;
          updatedDiscountRate: NewDiscountRateDto;
        },
        { rejectWithValue },
      ) => {
        try {
          return await fetchUpdateDiscountRate(id, updatedDiscountRate);
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
          const discountRate = action.payload;

          const index = state.discountRatesList.findIndex(
            (item) => item.id === discountRate.id,
          );

          if (index !== -1) {
            state.discountRatesList[index] = discountRate;
          }

          state.activeDiscountRatesList = state.activeDiscountRatesList.filter(
            (item) => item.id !== discountRate.id,
          );

          if (discountRate.active) {
            state.activeDiscountRatesList.push(discountRate);
          }

          if (state.selectedDiscountRate?.id === discountRate.id) {
            state.selectedDiscountRate = discountRate;
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
              "Fehler beim Aktualisieren des Rabattsatzes.";
          } else {
            state.error =
              action.error?.message ||
              "Fehler beim Aktualisieren des Rabattsatzes.";
          }
        },
      },
    ),

    deleteDiscountRate: create.asyncThunk(
      async (id: number) => {
        await fetchDeleteDiscountRate(id);
        return id;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          const id = action.payload;

          state.discountRatesList = state.discountRatesList.filter(
            (item) => item.id !== id,
          );

          state.activeDiscountRatesList = state.activeDiscountRatesList.filter(
            (item) => item.id !== id,
          );

          if (state.selectedDiscountRate?.id === id) {
            state.selectedDiscountRate = undefined;
          }

          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message || "Fehler beim Löschen des Rabattsatzes.";
        },
      },
    ),
  }),

  selectors: {
    selectDiscountRates: (state: DiscountRatesState) => state.discountRatesList,
    selectActiveDiscountRates: (state: DiscountRatesState) =>
      state.activeDiscountRatesList,
    selectDiscountRate: (state: DiscountRatesState) =>
      state.selectedDiscountRate,
    selectDiscountRatesLoading: (state: DiscountRatesState) => state.loading,
    selectDiscountRatesError: (state: DiscountRatesState) => state.error,
    selectDiscountRateById: (state: DiscountRatesState, id: number) =>
      state.discountRatesList.find((discountRate) => discountRate.id === id),
  },
});

export const {
  getDiscountRates,
  getActiveDiscountRates,
  addDiscountRate,
  updateDiscountRate,
  deleteDiscountRate,
} = discountRatesSlice.actions;

export const {
  selectDiscountRates,
  selectActiveDiscountRates,
  selectDiscountRate,
  selectDiscountRatesLoading,
  selectDiscountRatesError,
  selectDiscountRateById,
} = discountRatesSlice.selectors;
