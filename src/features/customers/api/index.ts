import { Customer, NewCustomerDto, PaginatedResponse } from "../types"

export async function fetchCustomers(page: number, size: number = 10): Promise<PaginatedResponse<Customer>> {
    const res = await fetch(`/api/customers?page=${page}&size=${size}`);
    if (!res.ok) {
      throw new Error("Fehler beim Laden");
    }
    return res.json();
  }

  export async function fetchCustomerswithCustomerNumber(page: number, size: number = 10): Promise<PaginatedResponse<Customer>> {
    const res = await fetch(`/api/customers/customer-number?page=${page}&size=${size}`);
    if (!res.ok) {
      throw new Error("Fehler beim Laden");
    }
    return res.json();
  }

  export async function fetchAddCustomer(newCustomerDto: NewCustomerDto): Promise<Customer> {
    const res = await fetch(`/api/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", 
      },
      credentials: "include",
      body: JSON.stringify(newCustomerDto),
    });
    if (!res.ok) {
      const errorDetails = await res.text(); 
      throw new Error(`Fehler beim Laden: ${errorDetails}`);
    }
    return res.json();
  }

  export async function fetchCustomer(id: number): Promise<Customer> {
    const res = await fetch(`/api/customers/${id}`);
    if (!res.ok) {
      throw new Error("Fehler beim Laden");
    }
    return res.json();
  }

  export async function fetchEditCustomer(id: number, newCustomerDto: NewCustomerDto): Promise<Customer> {
    console.log("Отправляемые данные:", JSON.stringify(newCustomerDto, null, 2));

    const res = await fetch(`/api/customers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", 
      },
      credentials: "include",
      body: JSON.stringify(newCustomerDto), 
    });
  
    if (!res.ok) {
      throw new Error("Fehler beim Laden"); 
    }
  
    return res.json(); 
  }