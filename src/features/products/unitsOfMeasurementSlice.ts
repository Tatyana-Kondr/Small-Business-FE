import { createAppSlice } from "../../redux/createAppSlice";
import { fetchAllUnits, fetchCreateUnit, fetchDeleteUnit, fetchUnitById, fetchUpdateUnit } from "./api";
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
        return await fetchAllUnits();
      },
      {
        fulfilled: (state, action) => {
          state.unitsList = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Laden der Maßeinheiten.";
          state.loading = false;
        },
      }
    ),

    addUnit: create.asyncThunk(
      async (newUnit: NewUnitOfMeasurementDto) => {
        return await fetchCreateUnit(newUnit);
      },
      {
        fulfilled: (state, action) => {
          state.selectedUnit = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Erstellen der Maßeinheit.";
          state.loading = false;
        },
      }
    ),

    getUnitById: create.asyncThunk(
      async (id: number) => {
        return await fetchUnitById(id);
      },
      {
        fulfilled: (state, action) => {
          state.selectedUnit = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Laden der Maßeinheit.";
          state.loading = false;
        },
      }
    ),

    updateUnit: create.asyncThunk(
      async ({
        id,
        updatedUnit,
      }: {
        id: number;
        updatedUnit: NewUnitOfMeasurementDto;
      }) => {
        return await fetchUpdateUnit(id, updatedUnit);
      },
      {
        fulfilled: (state, action) => {
          state.selectedUnit = action.payload;
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Aktualisieren der Maßeinheit.";
          state.loading = false;
        },
      }
    ),

    deleteUnit: create.asyncThunk(
      async (id: number) => {
        await fetchDeleteUnit(id);
        return id;
      },
      {
        fulfilled: (state, action) => {
          state.unitsList = state.unitsList.filter(
            (process) => process.id !== action.payload
          );
          if (
            state.selectedUnit &&
            state.selectedUnit.id === action.payload
          ) {
            state.selectedUnit = undefined;
          }
          state.loading = false;
          state.error = null;
        },
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.error = action.error?.message || "Fehler beim Löschen der Maßeinheit.";
          state.loading = false;
        },
      }
    ),
  }),

  selectors: {
    selectUnits: (state: UnitsOfMeasurementState) => state.unitsList,
    selectUnit: (state: UnitsOfMeasurementState) => state.selectedUnit,
    selectLoading: (state: UnitsOfMeasurementState) => state.loading,
    selectError: (state: UnitsOfMeasurementState) => state.error,
    selectUnitById: (state: UnitsOfMeasurementState, id: number) =>
      state.unitsList.find((s) => s.id === id),
  },
});

export const { getUnits, addUnit, getUnitById, updateUnit, deleteUnit} = unitsOfMeasurementSlice.actions;
export const {selectUnits, selectUnit, selectLoading, selectError, selectUnitById} = unitsOfMeasurementSlice.selectors;



