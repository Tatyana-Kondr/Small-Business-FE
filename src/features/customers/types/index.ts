
export interface Customer{
id: number
name: string
customerNumber: string
address: Address
phone: string
email: string
website: string
}

export interface Address{
  postalCode: string
  country: string
  city: string
  street: string 
  building:string
}

export interface AddressDto{
    postalCode: string
    country: string
    city: string
    street: string 
    building:string
}

export interface NewCustomerDto{
    name: string
    customerNumber?: string | null;
    address: AddressDto
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    }

export interface CustomersState {
  customersList: Customer[];
  selectedCustomer: Customer | undefined;
  totalPages: number;
  currentPage: number;
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