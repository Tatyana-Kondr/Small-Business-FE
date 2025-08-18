import { createAppSlice } from "../../redux/createAppSlice"
import { fetchAllPaymentMethods, fetchCreatePaymentMethod, fetchDeletePaymentMethod, fetchPaymentMethodById, fetchUpdatePaymentMethod } from "./api";
import { NewPaymentMethodDto, PaymentMethodsState } from "./types";

const initialState: PaymentMethodsState = {
  paymentMethodsList: [],
  selectedPaymentMethod: undefined,
  loading: false,
  error: null,
};

export const paymentMethodsSlice = createAppSlice({
  name: "paymentMethods",
  initialState,
  reducers: (create) => ({
    getPaymentMethods: create.asyncThunk(
      async () => {
        return await fetchAllPaymentMethods();
      },
      {
        fulfilled: (state, action) => {
          state.paymentMethodsList = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Laden der Zahlungsmethoden.";
          state.loading = false;
        },
      }
    ),

    addPaymentMethod: create.asyncThunk(
      async (newPaymentMethod: NewPaymentMethodDto) => {
        return await fetchCreatePaymentMethod(newPaymentMethod);
      },
      {
        fulfilled: (state, action) => {
          state.selectedPaymentMethod = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Erstellen der Zahlungsmethode.";
          state.loading = false;
        },
      }
    ),

    getPaymentMethodById: create.asyncThunk(
      async (id: number) => {
        return await fetchPaymentMethodById(id);
      },
      {
        fulfilled: (state, action) => {
          state.selectedPaymentMethod = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Laden der Zahlungsmethode.";
          state.loading = false;
        },
      }
    ),

    updatePaymentMethod: create.asyncThunk(
      async ({
        id,
        updatedPaymentMethod,
      }: {
        id: number;
        updatedPaymentMethod: NewPaymentMethodDto;
      }) => {
        return await fetchUpdatePaymentMethod(id, updatedPaymentMethod);
      },
      {
        fulfilled: (state, action) => {
          state.selectedPaymentMethod = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Aktualisieren der Zahlungsmethode.";
          state.loading = false;
        },
      }
    ),

    deletePaymentMethod: create.asyncThunk(
      async (id: number) => {
        await fetchDeletePaymentMethod(id);
        return id;
      },
      {
        fulfilled: (state, action) => {
          state.paymentMethodsList = state.paymentMethodsList.filter(
            (method) => method.id !== action.payload
          );
          if (
            state.selectedPaymentMethod &&
            state.selectedPaymentMethod.id === action.payload
          ) {
            state.selectedPaymentMethod = undefined;
          }
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Löschen der Zahlungsmethode.";
          state.loading = false;
        },
      }
    ),
  }),

  selectors: {
    selectPaymentMethods: (state: PaymentMethodsState) => state.paymentMethodsList,
    selectPaymentMethod: (state: PaymentMethodsState) => state.selectedPaymentMethod,
    selectLoading: (state: PaymentMethodsState) => state.loading,
    selectError: (state: PaymentMethodsState) => state.error,
    selectPaymentMethodById: (state: PaymentMethodsState, id: number) =>
      state.paymentMethodsList.find((p) => p.id === id),
  },
});

export const {
  getPaymentMethods,
  addPaymentMethod,
  getPaymentMethodById,
  updatePaymentMethod,
  deletePaymentMethod,
} = paymentMethodsSlice.actions;

export const {
  selectPaymentMethods,
  selectPaymentMethod,
  selectLoading,
  selectError,
  selectPaymentMethodById,
} = paymentMethodsSlice.selectors;
