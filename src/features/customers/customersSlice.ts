import { createAppSlice } from "../../redux/createAppSlice";
import { fetchAddCustomer, fetchCustomer, fetchCustomers, fetchCustomerswithCustomerNumber, fetchDeleteCustomer, fetchEditCustomer } from "./api";
import { CustomersState, NewCustomerDto } from "./types";

const initialState: CustomersState = {
  customersList: [],
  totalPages: 1, // Количество страниц
  currentPage: 0, // Текущая страница
  selectedCustomer: undefined,
};
  
export const customersSlice = createAppSlice({
  name: "customers",
  initialState,
  reducers: (create) => ({
    getCustomers: create.asyncThunk(
      async ({ page, size }: { page: number; size: number }) => {
        const response = await fetchCustomers(page, size);
        return response;
      },
      {
        pending: () => {},
        fulfilled: (state, action) => {
          console.log("Полученные поставщики и клиенты:", action.payload.content);
          state.customersList = action.payload.content;
          state.totalPages = action.payload.totalPages; // API должен возвращать totalPages
          state.currentPage = action.payload.pageable.pageNumber;
        },
        rejected: () => {},
      }
    ),

    getCustomersWithCustomerNumber: create.asyncThunk(
      async ({ page, size }: { page: number; size: number }) => {
        const response = await fetchCustomerswithCustomerNumber(page, size);
        return response;
      },
      {
        pending: () => {},
        fulfilled: (state, action) => {
          console.log("Полученные поставщики и клиенты:", action.payload.content);
          state.customersList = action.payload.content;
          state.totalPages = action.payload.totalPages; // API должен возвращать totalPages
          state.currentPage = action.payload.pageable.pageNumber;
        },
        rejected: () => {},
      }
    ),

    getCustomer: create.asyncThunk(
      async (id: number) => {
        const response = await fetchCustomer(id);
        return response;
      },
      {
        pending: () => {},
        fulfilled: (state, action) => {
          state.selectedCustomer = action.payload;          
        },
        rejected: () => {},
      }
    ),


    addCustomer: create.asyncThunk(
      async ({newCustomerDto}: {newCustomerDto: NewCustomerDto}) => {
        console.log("New customer DTO:", newCustomerDto);
        const response = await fetchAddCustomer(newCustomerDto);
        return response;
      },
      {
        pending: () => {},
        fulfilled: (state, action) => {
          console.log("Customer added successfully:", action.payload);
          state.customersList.push(action.payload)
        },        
        rejected: () => {},
      },
    ),


    editCustomer: create.asyncThunk(
      async ({ id, newCustomerDto }: { id: number; newCustomerDto: NewCustomerDto }) => {
        const response = await fetchEditCustomer(id, newCustomerDto);
        return response;
      },
      {
        pending: () => {},
        fulfilled: (state, action) => {
          state.selectedCustomer = action.payload;
          // Обновляем клиента в списке, а не добавляем его заново
          state.customersList = state.customersList.map(c => 
            c.id === action.payload.id ? action.payload : c
          );
        },
        rejected: (state, action) => {
          console.error("Error editing customer:", action.error);
        },
      }
    ),

    deleteCustomer: create.asyncThunk(
          async (id: number) => {
            await fetchDeleteCustomer(id);
            return id;
          },
          {
            fulfilled: (state, action) => {
              state.customersList = state.customersList.filter((customer) => customer.id !== action.payload);
            },
            pending: () => {},
            rejected: (state, action) => {
              console.error("Error remote customer:", action.error);
            },
          }
        ),
  }),
  selectors: {
    selectCustomers: (customersState: CustomersState) => customersState.customersList,
    selectCustomersWithCustomerNumber: (customersState: CustomersState) => customersState.customersList,
    selectTotalPages: (customersState: CustomersState) => customersState.totalPages,
    selectCurrentPage: (customersState: CustomersState) => customersState.currentPage,
    selectCustomer: (customersState: CustomersState) => customersState.selectedCustomer,
  },
});

export const { getCustomers, getCustomersWithCustomerNumber, getCustomer, addCustomer, editCustomer, deleteCustomer } = customersSlice.actions;
export const { selectCustomers, selectCustomersWithCustomerNumber, selectTotalPages, selectCurrentPage, selectCustomer } =
  customersSlice.selectors;