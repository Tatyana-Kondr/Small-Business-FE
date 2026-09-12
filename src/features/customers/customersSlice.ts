import { createAppSlice } from "../../redux/createAppSlice";
import {
  fetchAddCustomer,
  fetchCustomer,
  fetchCustomers,
  fetchCustomersList,
  fetchCustomersListWithCustomerNumber,
  fetchCustomersWithCustomerNumber,
  fetchDeleteCustomer,
  fetchEditCustomer,
  fetchSearchCustomers,
  fetchSearchCustomersWithCustomerNumber,
} from "./api";
import { CustomersState, NewCustomerDto } from "./types";

const initialState: CustomersState = {
  customersList: [],
  customersPickList: [],
  customersPickListWithNumber: [],
  totalPages: 1,
  currentPage: 0,
  pageSize: 15,
  currentSort: "name",
  selectedCustomer: undefined,
  customersVersion: 0,
  loading: false,
  loadingList: false,
  loadingPick: false,
  error: null,
};

export const customersSlice = createAppSlice({
  name: "customers",
  initialState,
  reducers: (create) => ({
    getCustomers: create.asyncThunk(
      async ({
        page,
        size,
        sort,
      }: {
        page: number;
        size: number;
        sort?: string;
      }) => {
        const response = await fetchCustomers(page, size, sort ?? "name");
        return response;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.loadingList = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          const response = action.payload;
          state.loading = false;
          state.loadingList = false;
          state.customersList = response.content;
          state.totalPages = response.totalPages;
          state.currentPage = response.pageable.pageNumber;
          state.pageSize = action.meta.arg.size ?? 15;
          state.currentSort = action.meta.arg.sort ?? "name";
        },
        rejected: (state, action) => {
          state.loading = false;
          state.loadingList = false;
          state.error =
            action.error.message || "Fehler beim Laden der Lieferanten.";
        },
      },
    ),

    searchCustomers: create.asyncThunk(
      async ({
        page,
        size,
        query,
        sort,
      }: {
        page: number;
        size: number;
        query: string;
        sort?: string;
      }) => {
        const response = await fetchSearchCustomers(
          page,
          size,
          query,
          sort ?? "name",
        );

        return response;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.loadingList = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          const response = action.payload;

          state.loading = false;
          state.loadingList = false;
          state.customersList = response.content;
          state.totalPages = response.totalPages;
          state.currentPage = response.pageable.pageNumber;
          state.pageSize = action.meta.arg.size ?? 15;
          state.currentSort = action.meta.arg.sort ?? "name";
        },
        rejected: (state, action) => {
          state.loading = false;
          state.loadingList = false;
          state.error =
            action.error.message || "Fehler bei der Suche nach Lieferanten.";
        },
      },
    ),

    getCustomersPickList: create.asyncThunk(
      async () => {
        const response = await fetchCustomersList();
        return response;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.loadingPick = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.loadingPick = false;
          state.customersPickList = action.payload;
        },
        rejected: (state, action) => {
          state.loading = false;
          state.loadingPick = false;
          state.error =
            action.error.message || "Fehler beim Laden der Lieferanten.";
        },
      },
    ),

    getCustomersWithCustomerNumber: create.asyncThunk(
      async ({
        page,
        size,
        sort,
      }: {
        page: number;
        size: number;
        sort?: string;
      }) => {
        const response = await fetchCustomersWithCustomerNumber(
          page,
          size,
          sort ?? "name",
        );
        return response;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.loadingList = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          const response = action.payload;
          state.loading = false;
          state.loadingList = false;
          state.customersList = response.content;
          state.totalPages = response.totalPages;
          state.currentPage = response.pageable.pageNumber;
          state.pageSize = action.meta.arg.size ?? 15;
          state.currentSort = action.meta.arg.sort ?? "name";
        },
        rejected: (state, action) => {
          state.loading = false;
          state.loadingList = false;
          state.error = action.error.message || "Fehler beim Laden der Kunden.";
        },
      },
    ),

    searchCustomersWithCustomerNumber: create.asyncThunk(
      async ({
        page,
        size,
        query,
        sort,
      }: {
        page: number;
        size: number;
        query: string;
        sort?: string;
      }) => {
        const response = await fetchSearchCustomersWithCustomerNumber(
          page,
          size,
          query,
          sort ?? "name",
        );

        return response;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.loadingList = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          const response = action.payload;

          state.loading = false;
          state.loadingList = false;
          state.customersList = response.content;
          state.totalPages = response.totalPages;
          state.currentPage = response.pageable.pageNumber;
          state.pageSize = action.meta.arg.size ?? 15;
          state.currentSort = action.meta.arg.sort ?? "name";
        },
        rejected: (state, action) => {
          state.loading = false;
          state.loadingList = false;
          state.error =
            action.error.message || "Fehler bei der Suche nach Kunden.";
        },
      },
    ),

    getCustomersPickListWithCustomerNumber: create.asyncThunk(
      async () => {
        const response = await fetchCustomersListWithCustomerNumber();
        return response;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.loadingPick = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.loadingPick = false;
          state.customersPickListWithNumber = action.payload;
        },
        rejected: (state, action) => {
          state.loading = false;
          state.loadingPick = false;
          state.error =
            action.error.message || "Fehler beim Laden der Kundenliste.";
        },
      },
    ),

    getCustomer: create.asyncThunk(
      async (id: number) => {
        return await fetchCustomer(id);
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.selectedCustomer = action.payload;
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error.message || "Fehler beim Laden des Kunden/Lieferanten.";
        },
      },
    ),

    addCustomer: create.asyncThunk(
      async ({ newCustomerDto }: { newCustomerDto: NewCustomerDto }) => {
        return await fetchAddCustomer(newCustomerDto);
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state) => {
          state.loading = false;
          state.error = null;
          state.customersVersion += 1;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error.message ||
            "Fehler beim Hinzufügen des Kunden/Lieferanten.";
        },
      },
    ),

    editCustomer: create.asyncThunk(
      async ({
        id,
        newCustomerDto,
      }: {
        id: number;
        newCustomerDto: NewCustomerDto;
      }) => {
        return await fetchEditCustomer(id, newCustomerDto);
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.loading = false;
          state.error = null;

          if (state.selectedCustomer?.id === action.payload.id) {
            state.selectedCustomer = action.payload;
          }

          state.customersVersion += 1;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error.message ||
            "Fehler beim Bearbeiten des Kunden/Lieferanten.";
        },
      },
    ),

    deleteCustomer: create.asyncThunk(
      async (id: number) => {
        await fetchDeleteCustomer(id);
        return id;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },

        fulfilled: (state, action) => {
          state.loading = false;
          state.error = null;

          if (state.selectedCustomer?.id === action.payload) {
            state.selectedCustomer = undefined;
          }

          state.customersVersion += 1;
        },

        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error.message ||
            "Fehler beim Löschen des Kunden/Lieferanten.";
        },
      },
    ),
  }),
  selectors: {
    selectCustomers: (state: CustomersState) => state.customersList,
    selectCustomersWithCustomerNumber: (state: CustomersState) => state.customersList,
    selectCustomersPickList: (state: CustomersState) => state.customersPickList,
    selectCustomersPickListWithNumber: (state: CustomersState) => state.customersPickListWithNumber,
    selectTotalPages: (state: CustomersState) => state.totalPages,
    selectCurrentPage: (state: CustomersState) => state.currentPage,
    selectPageSize: (state: CustomersState) => state.pageSize,
    selectCustomer: (state: CustomersState) => state.selectedCustomer,
    selectCustomersVersion: (state: CustomersState) => state.customersVersion,
    selectLoading: (state: CustomersState) => state.loading,
    selectLoadingList: (state: CustomersState) => state.loadingList,
    selectLoadingPick: (state: CustomersState) => state.loadingPick,
    selectError: (state: CustomersState) => state.error,
  },
});

export const {
  getCustomers,
  searchCustomers,
  getCustomersPickList,
  getCustomersWithCustomerNumber,
  searchCustomersWithCustomerNumber,
  getCustomersPickListWithCustomerNumber,
  getCustomer,
  addCustomer,
  editCustomer,
  deleteCustomer,
} = customersSlice.actions;

export const {
  selectCustomers,
  selectCustomersWithCustomerNumber,
  selectCustomersPickList,
  selectCustomersPickListWithNumber,
  selectTotalPages,
  selectCurrentPage,
  selectPageSize,
  selectCustomer,
  selectCustomersVersion,
  selectLoading,
  selectLoadingList,
  selectLoadingPick,
  selectError,
} = customersSlice.selectors;
