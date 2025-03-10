import { createAppSlice } from "../../redux/createAppSlice";
import { fetchAddCustomer, fetchCustomer, fetchCustomers, fetchCustomerswithCustomerNumber, fetchEditCustomer } from "./api";
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
        const response = await fetchAddCustomer(newCustomerDto);
        return response;
      },
      {
        pending: () => {},
        fulfilled: (state, action) => {
          state.customersList.push(action.payload)
        },        
        rejected: () => {},
      },
    ),


    editCustomer: create.asyncThunk(
      async ({id, newCustomerDto}: {id: number, newCustomerDto: NewCustomerDto}) => {
        const response = await fetchEditCustomer(id, newCustomerDto);
        return response;
      },
      {
        pending: () => {},
        fulfilled: (state, action) => {
          state.selectedCustomer = action.payload;
          state.customersList = state.customersList.map(c=>{
            if(c.id===action.payload.id){
              state.customersList.push(action.payload)
              return action.payload
            }
            return c;
          })          
        },
        rejected: () => {},
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

export const { getCustomers, getCustomersWithCustomerNumber, getCustomer, addCustomer, editCustomer } = customersSlice.actions;
export const { selectCustomers, selectCustomersWithCustomerNumber, selectTotalPages, selectCurrentPage, selectCustomer } =
  customersSlice.selectors;