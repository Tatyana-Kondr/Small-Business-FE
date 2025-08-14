import { createAppSlice } from "../../redux/createAppSlice";
import { fetchAddCustomer, fetchCustomer, fetchCustomers, fetchDeleteCustomer, fetchEditCustomer } from "./api";
import { CustomersState, NewCustomerDto } from "./types";

const initialState: CustomersState = {
  customersList: [],
  totalPages: 1,
  currentPage: 0,
  currentSort: "name",
  selectedCustomer: undefined,
  loading: false,
  error: null,
};

export const customersSlice = createAppSlice({
  name: "customers",
  initialState,
  reducers: (create) => ({
    getCustomers: create.asyncThunk(
      async ({ page, size, sort }: { page: number; size: number; sort?: string }) => {
       const response = await fetchCustomers(page, size, sort ?? "name");
        return response;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          const response = action.payload;
          state.loading = false;
          state.customersList = response.content;
          state.totalPages = response.totalPages;
          state.currentPage = response.pageable.pageNumber;
          state.currentSort = action.meta.arg.sort ?? "name";
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message || "Fehler beim Laden der Lieferanten.";
        },
      }
    ),

    getCustomersWithCustomerNumber: create.asyncThunk(
      async ({ page, size, sort }: { page: number; size: number; sort?: string }) => {
       const response = await fetchCustomers(page, size, sort ?? "name");
        return response;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          const response = action.payload;
          state.loading = false;
          state.customersList = response.content;
          state.totalPages = response.totalPages;
          state.currentPage = response.pageable.pageNumber;
          state.currentSort = action.meta.arg.sort ?? "name";
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message || "Fehler beim Laden der Kunden.";
        },
      }
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
          state.error = action.error.message || "Fehler beim Laden des Kunden/Lieferanten.";
        },
      }
    ),

    addCustomer: create.asyncThunk(
      async ({ newCustomerDto }: { newCustomerDto: NewCustomerDto }, { dispatch, getState }) => {
        const addedCustomer = await fetchAddCustomer(newCustomerDto);
        // После успешного добавления подгружаем заново список с текущей пагинацией и сортировкой
        const state = getState() as { customers: CustomersState };
        await dispatch(
          getCustomers({
            page: state.customers.currentPage,
            size: 15,
            sort: state.customers.currentSort,
          })
        );
        return addedCustomer;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, ) => {
          state.loading = false;
          // В customersList теперь уже свежие данные из getCustomers
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message || "Fehler beim Hinzufügen des Kunden/Lieferanten.";
        },
      }
    ),

    editCustomer: create.asyncThunk(
      async ({ id, newCustomerDto }: { id: number; newCustomerDto: NewCustomerDto }, { dispatch, getState }) => {
        const editedCustomer = await fetchEditCustomer(id, newCustomerDto);
        const state = getState() as { customers: CustomersState };
        await dispatch(
          getCustomers({
            page: state.customers.currentPage,
            size: 15,
            sort: state.customers.currentSort,
          })
        );
        return editedCustomer;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, ) => {
          state.loading = false;
          // customersList обновится через getCustomers
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message || "Fehler beim Bearbeiten des Kunden/Lieferanten.";
        },
      }
    ),

        deleteCustomer: create.asyncThunk(
      async (id: number, { dispatch, getState }) => {
        await fetchDeleteCustomer(id);
        const state = getState() as { customers: CustomersState };
        await dispatch(
          getCustomers({
            page: state.customers.currentPage,
            size: 15,
            sort: state.customers.currentSort,
          })
        );
        return id;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, ) => {
          state.loading = false;
          // customersList обновится через getCustomers
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message || "Fehler beim Löschen des Kunden/Lieferanten.";
        },
      }
    ),

  }),
  selectors: {
    selectCustomers: (state: CustomersState) => state.customersList,
    selectCustomersWithCustomerNumber: (state: CustomersState) => state.customersList,
    selectTotalPages: (state: CustomersState) => state.totalPages,
    selectCurrentPage: (state: CustomersState) => state.currentPage,
    selectCustomer: (state: CustomersState) => state.selectedCustomer,
  },
});

export const {
  getCustomers,
  getCustomersWithCustomerNumber,
  getCustomer,
  addCustomer,
  editCustomer,
  deleteCustomer,
} = customersSlice.actions;

export const {
  selectCustomers,
  selectCustomersWithCustomerNumber,
  selectTotalPages,
  selectCurrentPage,
  selectCustomer,
} = customersSlice.selectors;