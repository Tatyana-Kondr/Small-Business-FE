import { createAppSlice } from "../../redux/createAppSlice";
import { HttpError } from "../../utils/errors/handleFetchError";

import {
  fetchAllTermsOfPayment,
  fetchCreateTermOfPayment,
  fetchDeleteTermOfPayment,
  fetchTermOfPaymentById,
  fetchUpdateTermOfPayment,
} from "./api";

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
        return fetchAllTermsOfPayment();
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.paymentTermsList = action.payload;
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message ||
            "Beim Laden der Zahlungsbedingungen ist ein Fehler aufgetreten.";
        },
      },
    ),

    addTermOfPayment: create.asyncThunk(
      async (newTermOfPayment: NewTermOfPaymentDto, { rejectWithValue }) => {
        try {
          return await fetchCreateTermOfPayment(newTermOfPayment);
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
          state.paymentTermsList.push(action.payload);
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
              "Beim Erstellen der Zahlungsbedingung ist ein Fehler aufgetreten.";
          } else {
            state.error =
              action.error?.message ||
              "Beim Erstellen der Zahlungsbedingung ist ein Fehler aufgetreten.";
          }
        },
      },
    ),

    getTermOfPaymentById: create.asyncThunk(
      async (id: number) => {
        return fetchTermOfPaymentById(id);
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.selectedPaymentTerm = action.payload;
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message ||
            "Beim Laden der Zahlungsbedingung ist ein Fehler aufgetreten.";
        },
      },
    ),

    updateTermOfPayment: create.asyncThunk(
      async (
        {
          id,
          updatedTermOfPayment,
        }: {
          id: number;
          updatedTermOfPayment: NewTermOfPaymentDto;
        },
        { rejectWithValue },
      ) => {
        try {
          return await fetchUpdateTermOfPayment(id, updatedTermOfPayment);
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
          const index = state.paymentTermsList.findIndex(
            (term) => term.id === action.payload.id,
          );

          if (index !== -1) {
            state.paymentTermsList[index] = action.payload;
          }

          if (state.selectedPaymentTerm?.id === action.payload.id) {
            state.selectedPaymentTerm = action.payload;
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
              "Beim Aktualisieren der Zahlungsbedingung ist ein Fehler aufgetreten.";
          } else {
            state.error =
              action.error?.message ||
              "Beim Aktualisieren der Zahlungsbedingung ist ein Fehler aufgetreten.";
          }
        },
      },
    ),

    deleteTermOfPayment: create.asyncThunk(
      async (id: number) => {
        await fetchDeleteTermOfPayment(id);
        return id;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.paymentTermsList = state.paymentTermsList.filter(
            (term) => term.id !== action.payload,
          );

          if (state.selectedPaymentTerm?.id === action.payload) {
            state.selectedPaymentTerm = undefined;
          }

          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message ||
            "Beim Löschen der Zahlungsbedingung ist ein Fehler aufgetreten.";
        },
      },
    ),
  }),

  selectors: {
    selectTermsOfPayment: (state: TermOfPaymentState) => state.paymentTermsList,
    selectTermOfPayment: (state: TermOfPaymentState) =>
      state.selectedPaymentTerm,
    selectLoading: (state: TermOfPaymentState) => state.loading,
    selectError: (state: TermOfPaymentState) => state.error,
    selectTermOfPaymentById: (state: TermOfPaymentState, id: number) =>
      state.paymentTermsList.find((term) => term.id === id),
  },
});

export const {
  getTermsOfPayment,
  addTermOfPayment,
  getTermOfPaymentById,
  updateTermOfPayment,
  deleteTermOfPayment,
} = termOfPaymentSlice.actions;

export const {
  selectTermsOfPayment,
  selectTermOfPayment,
  selectLoading,
  selectError,
  selectTermOfPaymentById,
} = termOfPaymentSlice.selectors;
