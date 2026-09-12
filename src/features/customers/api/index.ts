import { apiFetch } from "../../../utils/apiFetch";
import { Customer, CustomerPick, NewCustomerDto, PaginatedResponse } from "../types"

export async function fetchCustomers(
  page: number,
  size: number,
  sort: string = "name"
): Promise<PaginatedResponse<Customer>> {
  const queryParams = new URLSearchParams();

  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("sort", sort);

  return apiFetch<PaginatedResponse<Customer>>(
    `/api/customers?${queryParams.toString()}`,
    { auth: true },
    "Fehler beim Laden der Lieferanten."
  );
}

export async function fetchSearchCustomers(
  page: number,
  size: number,
  query: string,
  sort: string = "name"
): Promise<PaginatedResponse<Customer>> {
  const queryParams = new URLSearchParams();

  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("query", query);
  queryParams.append("sort", sort);

  return apiFetch<PaginatedResponse<Customer>>(
    `/api/customers/search?${queryParams.toString()}`,
    { auth: true },
    "Fehler bei der Suche nach Lieferanten."
  );
}

export async function fetchCustomersList(): Promise<CustomerPick[]> {
  return apiFetch<CustomerPick[]>
    (`/api/customers/pick`,
      { auth: true },
      "Fehler beim Laden der Lieferanten."
    );
}

export async function fetchCustomersWithCustomerNumber(
  page: number,
  size: number,
  sort: string = "name"
): Promise<PaginatedResponse<Customer>> {
  const queryParams = new URLSearchParams();

  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("sort", sort);

  return apiFetch<PaginatedResponse<Customer>>(
    `/api/customers/customer-number?${queryParams.toString()}`,
    { auth: true },
    "Fehler beim Laden der Kunden."
  );
}

export async function fetchSearchCustomersWithCustomerNumber(
  page: number,
  size: number,
  query: string,
  sort: string = "name"
): Promise<PaginatedResponse<Customer>> {
  const queryParams = new URLSearchParams();

  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("query", query);
  queryParams.append("sort", sort);

  return apiFetch<PaginatedResponse<Customer>>(
    `/api/customers/customer-number/search?${queryParams.toString()}`,
    { auth: true },
    "Fehler bei der Suche nach Kunden."
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
    body: JSON.stringify(newCustomerDto),
    auth: true,
  },
  "Fehler beim Aktualisieren des Kunden."
);
}

export async function fetchDeleteCustomer(id: number): Promise<void> {
  return apiFetch<void>(
    `/api/customers/${id}`,
    {
      method: "DELETE",
      auth: true,
    },
    `Fehler beim Löschen des Kunden mit der ID ${id}.`
  );
}