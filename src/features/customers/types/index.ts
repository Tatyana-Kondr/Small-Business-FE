
export interface Customer{
id: number
name: string
customerNumber?: string | null;
address: AddressDto
phone: string
email: string
website: string
}

export interface AddressDto {
  postalCode: string | null;
  country: string;
  city: string | null;
  street: string | null;
  building: string | null;
}

export interface NewCustomerDto {
  name: string;
  customerNumber?: string | null;
  addressDto: AddressDto;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
}

export interface CustomerPick{
id: number
name: string
customerNumber?: string | null;
}

export interface CustomersState {
  customersList: Customer[];
  customersPickList: CustomerPick[];
  customersPickListWithNumber: CustomerPick[];
  selectedCustomer: Customer | undefined;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  currentSort: string;
  customersVersion: number;
  loading: boolean;
  loadingList: boolean;
  loadingPick: boolean;
  error: string | null;
}

// Интерфейс для ответа с пагинацией
export interface PaginatedResponse<T> {
    content: T[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      offset: number;
      paged: boolean;
      sort: {
        empty: boolean;
        unsorted: boolean;
        sorted: boolean;
      };
    };
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}  