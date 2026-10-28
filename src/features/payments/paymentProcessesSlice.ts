import { createAppSlice } from "../../redux/createAppSlice";
import { HttpError } from "../../utils/errors/handleFetchError";

import {
  fetchAllPaymentProcesses,
  fetchCreatePaymentProcess,
  fetchDeletePaymentProcess,
  fetchPaymentProcessById,
  fetchUpdatePaymentProcess,
} from "./api";

import { NewPaymentProcessDto, PaymentProcessesState } from "./types";

const initialState: PaymentProcessesState = {
  paymentProcessesList: [],
  selectedPaymentProcess: undefined,
  loading: false,
  error: null,
};

export const paymentProcessesSlice = createAppSlice({
  name: "paymentProcesses",
  initialState,

  reducers: (create) => ({
    getPaymentProcesses: create.asyncThunk(
      async () => {
        return fetchAllPaymentProcesses();
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.paymentProcessesList = action.payload;
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message || "Fehler beim Laden der Zahlungsprozesse.";
        },
      },
    ),

    addPaymentProcess: create.asyncThunk(
      async (newPaymentProcess: NewPaymentProcessDto, { rejectWithValue }) => {
        try {
          return await fetchCreatePaymentProcess(newPaymentProcess);
        } catch (error) {
          if (error instanceof HttpError) {
            return rejectWithValue(error.data ?? { message: error.message });
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
          state.paymentProcessesList.push(action.payload);
          state.selectedPaymentProcess = action.payload;
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;

          const payload = action.payload as
            | {
                message?: string;
                errors?: Array<{ message?: string }>;
              }
            | undefined;

          state.error =
            payload?.message ||
            payload?.errors?.[0]?.message ||
            (action.payload === undefined ? action.error.message : undefined) ||
            "Fehler beim Erstellen des Zahlungsprozesses.";
        },
      },
    ),

    getPaymentProcessById: create.asyncThunk(
      async (id: number) => {
        return fetchPaymentProcessById(id);
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.selectedPaymentProcess = action.payload;
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message || "Fehler beim Laden des Zahlungsprozesses.";
        },
      },
    ),

    updatePaymentProcess: create.asyncThunk(
      async (
        {
          id,
          updatedPaymentProcess,
        }: {
          id: number;
          updatedPaymentProcess: NewPaymentProcessDto;
        },
        { rejectWithValue },
      ) => {
        try {
          return await fetchUpdatePaymentProcess(id, updatedPaymentProcess);
        } catch (error) {
          if (error instanceof HttpError) {
            return rejectWithValue(error.data ?? { message: error.message });
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
          const index = state.paymentProcessesList.findIndex(
            (process) => process.id === action.payload.id,
          );

          if (index !== -1) {
            state.paymentProcessesList[index] = action.payload;
          }

          if (state.selectedPaymentProcess?.id === action.payload.id) {
            state.selectedPaymentProcess = action.payload;
          }
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;

          const payload = action.payload as
            | {
                message?: string;
                errors?: Array<{ message?: string }>;
              }
            | undefined;

          state.error =
            payload?.message ||
            payload?.errors?.[0]?.message ||
            (action.payload === undefined ? action.error.message : undefined) ||
            "Fehler beim Aktualisieren des Zahlungsprozesses.";
        },
      },
    ),

    deletePaymentProcess: create.asyncThunk(
      async (id: number) => {
        await fetchDeletePaymentProcess(id);
        return id;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.paymentProcessesList = state.paymentProcessesList.filter(
            (process) => process.id !== action.payload,
          );

          if (state.selectedPaymentProcess?.id === action.payload) {
            state.selectedPaymentProcess = undefined;
          }

          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message ||
            "Fehler beim Löschen des Zahlungsprozesses.";
        },
      },
    ),
  }),

  selectors: {
    selectPaymentProcesses: (state: PaymentProcessesState) =>
      state.paymentProcessesList,

    selectPaymentProcess: (state: PaymentProcessesState) =>
      state.selectedPaymentProcess,

    selectLoading: (state: PaymentProcessesState) => state.loading,

    selectError: (state: PaymentProcessesState) => state.error,

    selectPaymentProcessById: (state: PaymentProcessesState, id: number) =>
      state.paymentProcessesList.find((process) => process.id === id),
  },
});

export const {
  getPaymentProcesses,
  addPaymentProcess,
  getPaymentProcessById,
  updatePaymentProcess,
  deletePaymentProcess,
} = paymentProcessesSlice.actions;

export const {
  selectPaymentProcesses,
  selectPaymentProcess,
  selectLoading,
  selectError,
  selectPaymentProcessById,
} = paymentProcessesSlice.selectors;
