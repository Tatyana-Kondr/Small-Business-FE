import { createAppSlice } from "../../redux/createAppSlice";
import { HttpError } from "../../utils/errors/handleFetchError";

import {
  fetchAllPaymentMethods,
  fetchActivePaymentMethods,
  fetchCreatePaymentMethod,
  fetchDeletePaymentMethod,
  fetchPaymentMethodById,
  fetchUpdatePaymentMethod,
} from "./api";

import { NewPaymentMethodDto, PaymentMethodsState } from "./types";

type ApiErrorPayload = {
  message?: string;
  errors?: Array<{
    field?: string;
    message?: string;
  }>;
};

const getErrorMessage = (payload: unknown, fallback: string): string => {
  if (payload && typeof payload === "object") {
    const error = payload as ApiErrorPayload;

    return error.message || error.errors?.[0]?.message || fallback;
  }

  return fallback;
};

const initialState: PaymentMethodsState = {
  paymentMethodsList: [],
  activePaymentMethodsList: [],
  selectedPaymentMethod: undefined,
  loading: false,
  error: null,
};

export const paymentMethodsSlice = createAppSlice({
  name: "paymentMethods",
  initialState,

  reducers: (create) => ({
    getPaymentMethods: create.asyncThunk(async () => fetchAllPaymentMethods(), {
      pending: (state) => {
        state.loading = true;
        state.error = null;
      },

      fulfilled: (state, action) => {
        state.paymentMethodsList = action.payload;
        state.loading = false;
        state.error = null;
      },

      rejected: (state, action) => {
        state.loading = false;
        state.error = getErrorMessage(
          action.payload,
          action.error.message || "Fehler beim Laden der Zahlungsmethoden.",
        );
      },
    }),

    getActivePaymentMethods: create.asyncThunk(
      async () => fetchActivePaymentMethods(),
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.activePaymentMethodsList = action.payload;
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error = getErrorMessage(
            action.payload,
            action.error.message ||
              "Fehler beim Laden der aktiven Zahlungsmethoden.",
          );
        },
      },
    ),

    addPaymentMethod: create.asyncThunk(
      async (newPaymentMethod: NewPaymentMethodDto, { rejectWithValue }) => {
        try {
          return await fetchCreatePaymentMethod(newPaymentMethod);
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
          const method = action.payload;

          state.paymentMethodsList.push(method);

          if (method.active) {
            state.activePaymentMethodsList.push(method);
          }

          state.selectedPaymentMethod = method;
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error = getErrorMessage(
            action.payload,
            action.error.message ||
              "Fehler beim Erstellen der Zahlungsmethode.",
          );
        },
      },
    ),

    getPaymentMethodById: create.asyncThunk(
      async (id: number) => fetchPaymentMethodById(id),
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.selectedPaymentMethod = action.payload;
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error = getErrorMessage(
            action.payload,
            action.error.message || "Fehler beim Laden der Zahlungsmethode.",
          );
        },
      },
    ),

    updatePaymentMethod: create.asyncThunk(
      async (
        {
          id,
          updatedPaymentMethod,
        }: {
          id: number;
          updatedPaymentMethod: NewPaymentMethodDto;
        },
        { rejectWithValue },
      ) => {
        try {
          return await fetchUpdatePaymentMethod(id, updatedPaymentMethod);
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
          const method = action.payload;

          const index = state.paymentMethodsList.findIndex(
            (item) => item.id === method.id,
          );

          if (index !== -1) {
            state.paymentMethodsList[index] = method;
          }

          // Обновляем список активных методов
          state.activePaymentMethodsList =
            state.activePaymentMethodsList.filter(
              (item) => item.id !== method.id,
            );

          if (method.active) {
            state.activePaymentMethodsList.push(method);
          }

          if (state.selectedPaymentMethod?.id === method.id) {
            state.selectedPaymentMethod = method;
          }

          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error = getErrorMessage(
            action.payload,
            action.error.message ||
              "Fehler beim Aktualisieren der Zahlungsmethode.",
          );
        },
      },
    ),

    deletePaymentMethod: create.asyncThunk(
      async (id: number, { rejectWithValue }) => {
        try {
          await fetchDeletePaymentMethod(id);
          return id;
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
          const id = action.payload;

          state.paymentMethodsList = state.paymentMethodsList.filter(
            (method) => method.id !== id,
          );

          state.activePaymentMethodsList =
            state.activePaymentMethodsList.filter((method) => method.id !== id);

          if (state.selectedPaymentMethod?.id === id) {
            state.selectedPaymentMethod = undefined;
          }

          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error = getErrorMessage(
            action.payload,
            action.error.message || "Fehler beim Löschen der Zahlungsmethode.",
          );
        },
      },
    ),
  }),

  selectors: {
    selectPaymentMethods: (state: PaymentMethodsState) =>
      state.paymentMethodsList,

    selectActivePaymentMethods: (state: PaymentMethodsState) =>
      state.activePaymentMethodsList,

    selectPaymentMethod: (state: PaymentMethodsState) =>
      state.selectedPaymentMethod,

    selectLoading: (state: PaymentMethodsState) => state.loading,

    selectError: (state: PaymentMethodsState) => state.error,

    selectPaymentMethodById: (state: PaymentMethodsState, id: number) =>
      state.paymentMethodsList.find((method) => method.id === id),
  },
});

export const {
  getPaymentMethods,
  getActivePaymentMethods,
  addPaymentMethod,
  getPaymentMethodById,
  updatePaymentMethod,
  deletePaymentMethod,
} = paymentMethodsSlice.actions;

export const {
  selectPaymentMethods,
  selectActivePaymentMethods,
  selectPaymentMethod,
  selectLoading,
  selectError,
  selectPaymentMethodById,
} = paymentMethodsSlice.selectors;
