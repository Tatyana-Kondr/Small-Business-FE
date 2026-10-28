import { createAppSlice } from "../../redux/createAppSlice";

import {
  fetchAllUnits,
  fetchCreateUnit,
  fetchDeleteUnit,
  fetchUnitById,
  fetchUpdateUnit,
} from "./api";

import { NewUnitOfMeasurementDto, UnitsOfMeasurementState } from "./types";

const initialState: UnitsOfMeasurementState = {
  unitsList: [],
  selectedUnit: undefined,
  loading: false,
  error: null,
};

export const unitsOfMeasurementSlice = createAppSlice({
  name: "units",
  initialState,

  reducers: (create) => ({
    getUnits: create.asyncThunk(
      async () => {
        return fetchAllUnits();
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.unitsList = action.payload;
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message || "Fehler beim Laden der Maßeinheiten.";
        },
      },
    ),

    addUnit: create.asyncThunk(
      async (newUnit: NewUnitOfMeasurementDto) => {
        return fetchCreateUnit(newUnit);
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.unitsList.push(action.payload);
          state.unitsList.sort((a, b) =>
            a.name.localeCompare(b.name, "de", {
              sensitivity: "base",
            }),
          );
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message || "Fehler beim Erstellen der Maßeinheit.";
        },
      },
    ),

    getUnitById: create.asyncThunk(
      async (id: number) => {
        return fetchUnitById(id);
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.selectedUnit = action.payload;
          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message || "Fehler beim Laden der Maßeinheit.";
        },
      },
    ),

    updateUnit: create.asyncThunk(
      async ({
        id,
        updatedUnit,
      }: {
        id: number;
        updatedUnit: NewUnitOfMeasurementDto;
      }) => {
        return fetchUpdateUnit(id, updatedUnit);
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          const index = state.unitsList.findIndex(
            (unit) => unit.id === action.payload.id,
          );

          if (index !== -1) {
            state.unitsList[index] = action.payload;
          }

          state.unitsList.sort((a, b) =>
            a.name.localeCompare(b.name, "de", {
              sensitivity: "base",
            }),
          );

          if (state.selectedUnit?.id === action.payload.id) {
            state.selectedUnit = action.payload;
          }

          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message ||
            "Fehler beim Aktualisieren der Maßeinheit.";
        },
      },
    ),

    deleteUnit: create.asyncThunk(
      async (id: number) => {
        await fetchDeleteUnit(id);
        return id;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.unitsList = state.unitsList.filter(
            (unit) => unit.id !== action.payload,
          );

          if (state.selectedUnit?.id === action.payload) {
            state.selectedUnit = undefined;
          }

          state.loading = false;
          state.error = null;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error?.message || "Fehler beim Löschen der Maßeinheit.";
        },
      },
    ),
  }),

  selectors: {
    selectUnits: (state: UnitsOfMeasurementState) => state.unitsList,

    selectUnit: (state: UnitsOfMeasurementState) => state.selectedUnit,

    selectLoading: (state: UnitsOfMeasurementState) => state.loading,

    selectError: (state: UnitsOfMeasurementState) => state.error,

    selectUnitById: (state: UnitsOfMeasurementState, id: number) =>
      state.unitsList.find((unit) => unit.id === id),
  },
});

export const { getUnits, addUnit, getUnitById, updateUnit, deleteUnit } =
  unitsOfMeasurementSlice.actions;

export const {
  selectUnits,
  selectUnit,
  selectLoading,
  selectError,
  selectUnitById,
} = unitsOfMeasurementSlice.selectors;
