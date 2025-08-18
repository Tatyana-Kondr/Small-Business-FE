import { apiFetch } from "../../../utils/apiFetch";
import { NewSaleDto, PaginatedResponse, Sale } from "../types";

export async function fetchSales(
 page: number,
  size: number,
  sort: string = "salesDate,DESC",
  searchTerm: string = ""
): Promise<PaginatedResponse<Sale>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("sort", sort);
  if (searchTerm) {
    queryParams.append("search", searchTerm);
  }
  return apiFetch<PaginatedResponse<Sale>>(
 `/api/sales?${queryParams.toString()}`,
  undefined,
    "Fehler beim Laden der Aufträge."
  );
}

export async function fetchAddSale(newSale: NewSaleDto): Promise<Sale> {
  return apiFetch<Sale>(
    `/api/sales`, 
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSale),
    },
    "Fehler beim Erstellen des Auftrags."
  );
}

export async function fetchUpdateSale(id: number, updatedSale: NewSaleDto): Promise<Sale> {
  return apiFetch<Sale>(
  `/api/sales/${id}`, 
  {
     method: "PUT",
      body: JSON.stringify(updatedSale),
      headers: { "Content-Type": "application/json" },
    },
    `Fehler beim Aktualisieren des Auftrags mit der ID ${id}.`
  );
}

export async function fetchDeleteSale(id: number): Promise<void> {
 return apiFetch<void>(
    `/api/sales/${id}`,
    { method: "DELETE" },
    `Fehler beim Löschen des Auftrags mit der ID ${id}.`
  );
}

export async function fetchSaleById(id: number): Promise<Sale> {
   return apiFetch<Sale>(
      `/api/sales/${id}`,
      undefined,
      `Fehler beim Laden des Auftrags mit der ID ${id}.`
    );
  }

export async function fetchSearchSales(
 query: string,
   page: number,
   size: number,
   sort = "salesDate,DESC",
 ): Promise<PaginatedResponse<Sale>> {
   const queryParams = new URLSearchParams();
   queryParams.append("page", page.toString());
   queryParams.append("size", size.toString());
   queryParams.append("sort", sort);
 
   return apiFetch<PaginatedResponse<Sale>>(
     `/api/sales/search/${encodeURIComponent(query)}?${queryParams.toString()}`,
     undefined,
     "Fehler bei der Suche des Auftrags."
   );
 }

export async function fetchSalesByFilter(
  page: number,
  size: number,
  sort = "salesDate,DESC",
 filters?: {
  id?: number;
  customerId?: number;
  invoiceNumber?: string;
  totalAmount?: number;
  paymentStatus?: string;
  startDate?: string; 
  endDate?: string;   
  searchQuery?: string;    
}
): Promise<PaginatedResponse<Sale>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("sort", sort);

  if (filters) {
      if (filters.id !== undefined) queryParams.append("id", filters.id.toString());
      if (filters.customerId !== undefined) queryParams.append("customerId", filters.customerId.toString());
      if (filters.invoiceNumber) queryParams.append("invoiceNumber", filters.invoiceNumber);
      if (filters.totalAmount !== undefined) queryParams.append("totalAmount", filters.totalAmount.toString());
      if (filters.paymentStatus) queryParams.append("paymentStatus", filters.paymentStatus);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      if (filters.searchQuery) queryParams.append("searchQuery", filters.searchQuery);
    }
  
    return apiFetch<PaginatedResponse<Sale>>(
      `/api/sales/filter?${queryParams.toString()}`,
      undefined,
      "Fehler beim Laden der gefilterten Aufträge."
    );
  }

export async function fetchUpdateSalePaymentStatus(id: number): Promise<Sale> {
 return apiFetch<Sale>(
     `/api/sales/${id}/update-payment-status`,
     { method: "PATCH", credentials: "include" },
     `Fehler beim Aktualisieren des Zahlungsstatus für Auftrag ${id}.`
   );
 }