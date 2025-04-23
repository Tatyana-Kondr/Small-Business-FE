
export interface Customer{
id: number
name: string
customerNumber: string
address: AddressDto
phone: string
email: string
website: string
}

export interface AddressDto{
    postalCode: string
    country: string
    city: string
    street: string 
    building:string
}

export interface NewCustomerDto {
  name: string;
  customerNumber?: string | null;  // customerNumber может быть null или не передано
  addressDto: AddressDto;  // адрес всегда обязателен
  phone?: string | null;  // phone может быть пустым или null
  email?: string | null;  // email может быть пустым или null
  website?: string | null;  // website может быть пустым или null
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