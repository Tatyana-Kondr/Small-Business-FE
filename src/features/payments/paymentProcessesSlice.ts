import { createAppSlice } from "../../redux/createAppSlice"
import { fetchAllPaymentProcesses, fetchCreatePaymentProcess, fetchDeletePaymentProcess, fetchPaymentProcessById, fetchUpdatePaymentProcess } from "./api";
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
        return await fetchAllPaymentProcesses();
      },
      {
        fulfilled: (state, action) => {
          state.paymentProcessesList = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Laden der Zahlungsprozesse.";
          state.loading = false;
        },
      }
    ),

    addPaymentProcess: create.asyncThunk(
      async (newPaymentProcess: NewPaymentProcessDto) => {
        return await fetchCreatePaymentProcess(newPaymentProcess);
      },
      {
        fulfilled: (state, action) => {
          state.selectedPaymentProcess = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Erstellen des Zahlungsprozesses.";
          state.loading = false;
        },
      }
    ),

    getPaymentProcessById: create.asyncThunk(
      async (id: number) => {
        return await fetchPaymentProcessById(id);
      },
      {
        fulfilled: (state, action) => {
          state.selectedPaymentProcess = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Laden des Zahlungsprozesses.";
          state.loading = false;
        },
      }
    ),

    updatePaymentProcess: create.asyncThunk(
      async ({
        id,
        updatedPaymentProcess,
      }: {
        id: number;
        updatedPaymentProcess: NewPaymentProcessDto;
      }) => {
        return await fetchUpdatePaymentProcess(id, updatedPaymentProcess);
      },
      {
        fulfilled: (state, action) => {
          state.selectedPaymentProcess = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Aktualisieren des Zahlungsprozesses.";
          state.loading = false;
        },
      }
    ),

    deletePaymentProcess: create.asyncThunk(
      async (id: number) => {
        await fetchDeletePaymentProcess(id);
        return id;
      },
      {
        fulfilled: (state, action) => {
          state.paymentProcessesList = state.paymentProcessesList.filter(
            (process) => process.id !== action.payload
          );
          if (
            state.selectedPaymentProcess &&
            state.selectedPaymentProcess.id === action.payload
          ) {
            state.selectedPaymentProcess = undefined;
          }
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Löschen des Zahlungsprozesses.";
          state.loading = false;
        },
      }
    ),
  }),

  selectors: {
    selectPaymentProcesses: (state: PaymentProcessesState) => state.paymentProcessesList,
    selectPaymentProcess: (state: PaymentProcessesState) => state.selectedPaymentProcess,
    selectLoading: (state: PaymentProcessesState) => state.loading,
    selectError: (state: PaymentProcessesState) => state.error,
    selectPaymentProcessById: (state: PaymentProcessesState, id: number) =>
      state.paymentProcessesList.find((p) => p.id === id),
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
