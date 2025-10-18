import { createAppSlice } from "../../redux/createAppSlice";
import { fetchCompany, fetchCreateCompany, fetchUpdateCompany, fetchUploadLogo } from "./api";
import { CompanyState, NewCompanyDto } from "./types";

const initialState: CompanyState = {
    selectedCompany: undefined,
    loading: false,
    error: null,
};

export const companiesSlice = createAppSlice({
    name: "companies",
    initialState,
    reducers: (create) => ({

        addCompany: create.asyncThunk(
            async (newCompany: NewCompanyDto) => {
                return await fetchCreateCompany(newCompany);
            },
            {
                fulfilled: (state, action) => {
                    state.selectedCompany = action.payload;
                    state.loading = false;
                    state.error = null;
                },
                pending: (state) => {
                    state.loading = true;
                    state.error = null;
                },
                rejected: (state, action) => {
                    state.error = action.error?.message || "Fehler beim Erstellen des Unternehmens.";
                    state.loading = false;
                },
            }
        ),

        getCompany: create.asyncThunk(
            async () => {
                return await fetchCompany();
            },
            {
                fulfilled: (state, action) => {
                    state.selectedCompany = action.payload;
                    state.loading = false;
                    state.error = null;
                },
                pending: (state) => {
                    state.loading = true;
                    state.error = null;
                },
                rejected: (state, action) => {
                    state.error = action.error?.message || "Fehler beim Laden des Unternehmens.";
                    state.loading = false;
                },
            }
        ),

        updateCompany: create.asyncThunk(
            async ({ id, data, }: { id: number; data: NewCompanyDto; }) => {
                return await fetchUpdateCompany(id, data);
            },
            {
                fulfilled: (state, action) => {
                    state.selectedCompany = action.payload;
                    state.loading = false;
                    state.error = null;
                },
                pending: (state) => {
                    state.loading = true;
                    state.error = null;
                },
                rejected: (state, action) => {
                    state.error = action.error?.message || "Fehler beim Aktualisieren des Unternehmens.";
                    state.loading = false;
                },
            }
        ),

        updateCompanyLogo: create.asyncThunk(
            async ({ id, formData }: { id: number; formData: FormData }) => {
                // Передаём FormData напрямую в API
                return await fetchUploadLogo(id, formData);
            },
            {
                fulfilled: (state, action) => {
                    state.selectedCompany = action.payload;
                    state.loading = false;
                    state.error = null;
                },
                pending: (state) => {
                    state.loading = true;
                    state.error = null;
                },
                rejected: (state, action) => {
                    state.error = action.error?.message || "Fehler beim Hochladen des Logos.";
                    state.loading = false;
                },
            }
        ),

    }),

    selectors: {
        selectCompany: (state: CompanyState) => state.selectedCompany,
        selectLoading: (state: CompanyState) => state.loading,
        selectError: (state: CompanyState) => state.error,
    },
});

export const {
    addCompany,
    getCompany,
    updateCompany,
    updateCompanyLogo,
} = companiesSlice.actions;

export const {
    selectCompany,
    selectLoading,
    selectError,
} = companiesSlice.selectors;