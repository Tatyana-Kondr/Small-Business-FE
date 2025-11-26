import { createAppSlice } from "../../redux/createAppSlice";
import { fetchAllTermsOfPayment, fetchCreateTermOfPayment, fetchDeleteTermOfPayment, fetchTermOfPaymentById, fetchUpdateTermOfPayment } from "./api";
import { NewTermOfPaymentDto, TermOfPaymentState } from "./types";



const initialState: TermOfPaymentState = {
  paymentTermsList: [],
  selectedPaymentTerm: undefined,
  loading: false,
  error: null,
};

export const termOfPaymentSlice = createAppSlice({
  name: "paymentTerms",
  initialState,
  reducers: (create) => ({
    getTermsOfPayment: create.asyncThunk(
      async () => {
        return await fetchAllTermsOfPayment();
      },
      {
        fulfilled: (state, action) => {
          state.paymentTermsList = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Beim Laden der Zahlungsbedingungen ist ein Fehler aufgetreten.";
          state.loading = false;
        },
      }
    ),

    addTermOfPayment: create.asyncThunk(
      async (newTermOfPayment: NewTermOfPaymentDto) => {
        return await fetchCreateTermOfPayment(newTermOfPayment);
      },
      {
        fulfilled: (state, action) => {
          state.selectedPaymentTerm = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Beim Erstellen der Zahlungsbedingung ist ein Fehler aufgetreten.";
          state.loading = false;
        },
      }
    ),

    getTermOfPaymentById: create.asyncThunk(
      async (id: number) => {
        return await fetchTermOfPaymentById(id);
      },
      {
        fulfilled: (state, action) => {
          state.selectedPaymentTerm = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Beim Laden der Zahlungsbedingung ist ein Fehler aufgetreten.";
          state.loading = false;
        },
      }
    ),

    updateTermOfPayment: create.asyncThunk(
      async ({
        id,
        updatedTermOfPayment,
      }: {
        id: number;
        updatedTermOfPayment: NewTermOfPaymentDto;
      }) => {
        return await fetchUpdateTermOfPayment(id, updatedTermOfPayment);
      },
      {
        fulfilled: (state, action) => {
          state.selectedPaymentTerm = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Beim Aktualisieren der Zahlungsbedingung ist ein Fehler aufgetreten.";
          state.loading = false;
        },
      }
    ),

    deleteTermOfPayment: create.asyncThunk(
      async (id: number) => {
        await fetchDeleteTermOfPayment(id);
        return id;
      },
      {
        fulfilled: (state, action) => {
          state.paymentTermsList = state.paymentTermsList.filter(
            (process) => process.id !== action.payload
          );
          if (
            state.selectedPaymentTerm &&
            state.selectedPaymentTerm.id === action.payload
          ) {
            state.selectedPaymentTerm = undefined;
          }
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Beim Löschen der Zahlungsbedingung ist ein Fehler aufgetreten..";
          state.loading = false;
        },
      }
    ),
  }),

  selectors: {
    selectTermsOfPayment: (state: TermOfPaymentState) => state.paymentTermsList,
    selectTermOfPayment: (state: TermOfPaymentState) => state.selectedPaymentTerm,
    selectLoading: (state: TermOfPaymentState) => state.loading,
    selectError: (state: TermOfPaymentState) => state.error,
    selectTermOfPaymentById: (state: TermOfPaymentState, id: number) =>
      state.paymentTermsList.find((s) => s.id === id),
  },
});

export const { getTermsOfPayment, addTermOfPayment, getTermOfPaymentById, updateTermOfPayment, deleteTermOfPayment} = termOfPaymentSlice.actions;
export const {selectTermsOfPayment, selectTermOfPayment, selectLoading, selectError, selectTermOfPaymentById} = termOfPaymentSlice.selectors;
