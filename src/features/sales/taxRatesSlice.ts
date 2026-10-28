import { createAppSlice } from "../../redux/createAppSlice";
import { HttpError } from "../../utils/errors/handleFetchError";

import {
  fetchActiveTaxRates,
  fetchAllTaxRates,
  fetchCreateTaxRate,
  fetchDefaultTaxRate,
  fetchDeleteTaxRate,
  fetchUpdateTaxRate,
} from "./api";

import { NewTaxRateDto, TaxRatesState } from "./types";

const initialState: TaxRatesState = {
  taxRatesList: [],
  activeTaxRatesList: [],
  selectedTaxRate: undefined,
  defaultTaxRate: undefined,
  loading: false,
  error: null,
};

export const taxRatesSlice = createAppSlice({
  name: "taxRates",
  initialState,

  reducers: (create) => ({
    // === GET ALL ===

    getTaxRates: create.asyncThunk(async () => fetchAllTaxRates(), {
      pending: (state) => {
        state.loading = true;
        state.error = null;
      },

      fulfilled: (state, action) => {
        state.taxRatesList = action.payload;
        state.loading = false;
        state.error = null;
      },

      rejected: (state, action) => {
        state.loading = false;
        state.error =
          action.error?.message || "Fehler beim Laden der Steuersätze.";
      },
    }),

    // === GET ACTIVE ===

    getActiveTaxRates: create.asyncThunk(async () => fetchActiveTaxRates(), {
      pending: (state) => {
        state.loading = true;
        state.error = null;
      },

      fulfilled: (state, action) => {
        state.activeTaxRatesList = action.payload;
        state.loading = false;
        state.error = null;
      },

      rejected: (state, action) => {
        state.loading = false;
        state.error =
          action.error?.message || "Fehler beim Laden der aktiven Steuersätze.";
      },
    }),

    // === GET DEFAULT ===

    getDefaultTaxRate: create.asyncThunk(async () => fetchDefaultTaxRate(), {
      pending: (state) => {
        state.loading = true;
        state.error = null;
      },

      fulfilled: (state, action) => {
        state.defaultTaxRate = action.payload;
        state.loading = false;
        state.error = null;
      },

      rejected: (state, action) => {
        state.loading = false;
        state.error =
          action.error?.message ||
          "Fehler beim Laden des Standard-Steuersatzes.";
      },
    }),

    // === CREATE ===

    addTaxRate: create.asyncThunk(
      async (newTaxRate: NewTaxRateDto, { rejectWithValue }) => {
        try {
          return await fetchCreateTaxRate(newTaxRate);
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
          const created = action.payload;

          if (created.defaultRate) {
            state.taxRatesList.forEach((rate) => {
              rate.defaultRate = false;
            });

            state.activeTaxRatesList.forEach((rate) => {
              rate.defaultRate = false;
            });

            state.defaultTaxRate = created;
          }

          state.taxRatesList.push(created);
          state.taxRatesList.sort((a, b) => a.value - b.value);

          if (created.active) {
            state.activeTaxRatesList.push(created);
            state.activeTaxRatesList.sort((a, b) => a.value - b.value);
          }

          state.selectedTaxRate = created;
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
              "Fehler beim Erstellen des Steuersatzes.";
          } else {
            state.error =
              action.error?.message ||
              "Fehler beim Erstellen des Steuersatzes.";
          }
        },
      },
    ),

    // === UPDATE ===

    updateTaxRate: create.asyncThunk(
      async (
        {
          id,
          updatedTaxRate,
        }: {
          id: number;
          updatedTaxRate: NewTaxRateDto;
        },
        { rejectWithValue },
      ) => {
        try {
          return await fetchUpdateTaxRate(id, updatedTaxRate);
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
          const updated = action.payload;

          if (updated.defaultRate) {
            state.taxRatesList.forEach((rate) => {
              rate.defaultRate = false;
            });

            state.activeTaxRatesList.forEach((rate) => {
              rate.defaultRate = false;
            });

            state.defaultTaxRate = updated;
          } else if (state.defaultTaxRate?.id === updated.id) {
            state.defaultTaxRate = undefined;
          }

          const index = state.taxRatesList.findIndex(
            (rate) => rate.id === updated.id,
          );

          if (index !== -1) {
            state.taxRatesList[index] = updated;
          }

          state.taxRatesList.sort((a, b) => a.value - b.value);

          state.activeTaxRatesList = state.activeTaxRatesList.filter(
            (rate) => rate.id !== updated.id,
          );

          if (updated.active) {
            state.activeTaxRatesList.push(updated);
          }

          state.activeTaxRatesList.sort((a, b) => a.value - b.value);

          if (state.selectedTaxRate?.id === updated.id) {
            state.selectedTaxRate = updated;
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
              "Fehler beim Aktualisieren des Steuersatzes.";
          } else {
            state.error =
              action.error?.message ||
              "Fehler beim Aktualisieren des Steuersatzes.";
          }
        },
      },
    ),

    // === DELETE ===

    deleteTaxRate: create.asyncThunk(
      async (id: number) => {
        await fetchDeleteTaxRate(id);
        return id;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          const deletedId = action.payload;

          state.taxRatesList = state.taxRatesList.filter(
            (rate) => rate.id !== deletedId,
          );

          state.activeTaxRatesList = state.activeTaxRatesList.filter(
            (rate) => rate.id !== deletedId,
          );

          if (state.selectedTaxRate?.id === deletedId) {
            state.selectedTaxRate = undefined;
          }

          if (state.defaultTaxRate?.id === deletedId) {
            state.defaultTaxRate = undefined;
          }

          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message || "Fehler beim Löschen des Steuersatzes.";
        },
      },
    ),
  }),

  selectors: {
    selectTaxRates: (state: TaxRatesState) => state.taxRatesList,

    selectActiveTaxRates: (state: TaxRatesState) => state.activeTaxRatesList,

    selectTaxRate: (state: TaxRatesState) => state.selectedTaxRate,

    selectDefaultTaxRate: (state: TaxRatesState) => state.defaultTaxRate,

    selectTaxRatesLoading: (state: TaxRatesState) => state.loading,

    selectTaxRatesError: (state: TaxRatesState) => state.error,

    selectTaxRateById: (state: TaxRatesState, id: number) =>
      state.taxRatesList.find((rate) => rate.id === id),
  },
});

export const {
  getTaxRates,
  getActiveTaxRates,
  getDefaultTaxRate,
  addTaxRate,
  updateTaxRate,
  deleteTaxRate,
} = taxRatesSlice.actions;

export const {
  selectTaxRates,
  selectActiveTaxRates,
  selectTaxRate,
  selectDefaultTaxRate,
  selectTaxRatesLoading,
  selectTaxRatesError,
  selectTaxRateById,
} = taxRatesSlice.selectors;
