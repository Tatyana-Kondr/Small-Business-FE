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
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage = action.payload instanceof Error ? action.payload.message : "Failed to fetch methods of payment";
          state.error = errorMessage;
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
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage = action.payload instanceof Error ? action.payload.message : "Failed to add method of payment";
          state.error = errorMessage;
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
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error ? action.payload.message : "Failed to fetch method of payment by ID";
          state.error = errorMessage;
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
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error ? action.payload.message : "Failed to update method of payment";
          state.error = errorMessage;
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
          state.paymentMethodsList = state.paymentMethodsList.filter((method) => method.id !== action.payload);
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          const errorMessage =
            action.payload instanceof Error ? action.payload.message : "Failed to delete method of payment";
          state.error = errorMessage;
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

export const { getPaymentMethods,
  addPaymentMethod,
  getPaymentMethodById,
  updatePaymentMethod,
  deletePaymentMethod } = paymentMethodsSlice.actions;
export const { selectPaymentMethods, selectPaymentMethod, selectLoading, selectError, selectPaymentMethodById } =
  paymentMethodsSlice.selectors;