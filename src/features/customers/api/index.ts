import { apiFetch } from "../../../utils/apiFetch";
import { Customer, CustomerPick, NewCustomerDto, PaginatedResponse } from "../types"

export async function fetchCustomers(page: number, size: number, sort = "name"): Promise<PaginatedResponse<Customer>> {
  return apiFetch<PaginatedResponse<Customer>>
    (`/api/customers?page=${page}&size=${size}&sort=${sort}`,
      { auth: true },
      "Fehler beim Laden der Lieferanten."
    );
}
export async function fetchCustomersList(): Promise<CustomerPick[]> {
  return apiFetch<CustomerPick[]>
    (`/api/customers/pick`,
      { auth: true },
      "Fehler beim Laden der Lieferanten."
    );
}

export async function fetchCustomerswithCustomerNumber(page: number, size: number, sort = "name"): Promise<PaginatedResponse<Customer>> {
  return apiFetch<PaginatedResponse<Customer>>(`/api/customers/customer-number?page=${page}&size=${size}&sort=${sort}`,
    { auth: true },
    "Fehler beim Laden der Kunden."
  );
}

export async function fetchCustomersListWithCustomerNumber(): Promise<CustomerPick[]> {
  return apiFetch<CustomerPick[]>(
    `/api/customers/customer-number/pick`,
    { auth: true },
    "Fehler beim Laden der Kunden."
  );
}

export async function fetchAddCustomer(newCustomerDto: NewCustomerDto): Promise<Customer> {
  return apiFetch<Customer>(`/api/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(newCustomerDto),
    auth: true,
  },
    "Fehler beim Hinzufügen des Kunden."
  );
}

export async function fetchCustomer(id: number): Promise<Customer> {
  return apiFetch<Customer>(
    `/api/customers/${id}`,
    { auth: true },
   "Fehler beim Laden des Kunden."
  );
}

export async function fetchEditCustomer(id: number, newCustomerDto: NewCustomerDto): Promise<Customer> {
   return apiFetch<Customer>(
    `/api/customers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json",},
    credentials: "include",
    body: JSON.stringify(newCustomerDto),
    auth: true,
  },
  "Fehler beim Aktualisieren des Kunden."
);
}

export async function fetchDeleteCustomer(id: number): Promise<void> {
  return apiFetch<void>(
    `/api/customers/${id}`,
    { method: "DELETE", auth: true },
    `Error deleting customer ${id}`
  );
}