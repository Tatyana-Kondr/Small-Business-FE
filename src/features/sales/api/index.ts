import { apiFetch } from "../../../utils/apiFetch";
import { NewSaleDto, NewShippingDto, NewTermOfPaymentDto, PaginatedResponse, Sale, Shipping, TermOfPayment } from "../types";

export async function fetchSales(
 page: number,
  size: number,
  sort: string[] = ["salesDate,DESC", "invoiceNumber,DESC"],
  searchTerm: string = ""
): Promise<PaginatedResponse<Sale>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  sort.forEach((s) => queryParams.append("sort", s));
  if (searchTerm) {
    queryParams.append("search", searchTerm);
  }
  return apiFetch<PaginatedResponse<Sale>>(
 `/api/sales?${queryParams.toString()}`,
  {auth: true},
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
      auth: true,
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
      auth: true,
    },
    `Fehler beim Aktualisieren des Auftrags mit der ID ${id}.`
  );
}

export async function fetchDeleteSale(id: number): Promise<void> {
 return apiFetch<void>(
    `/api/sales/${id}`,
    { method: "DELETE", auth: true },
    `Fehler beim Löschen des Auftrags mit der ID ${id}.`
  );
}

export async function fetchSaleById(id: number): Promise<Sale> {
   return apiFetch<Sale>(
      `/api/sales/${id}`,
      {auth: true},
      `Fehler beim Laden des Auftrags mit der ID ${id}.`
    );
  }

export async function fetchSearchSales(
 query: string,
   page: number,
   size: number,
   sort: string[] = ["salesDate,DESC", "invoiceNumber,DESC"],
 ): Promise<PaginatedResponse<Sale>> {
   const queryParams = new URLSearchParams();
   queryParams.append("page", page.toString());
   queryParams.append("size", size.toString());
   sort.forEach((s) => queryParams.append("sort", s));
 
   return apiFetch<PaginatedResponse<Sale>>(
     `/api/sales/search/${encodeURIComponent(query)}?${queryParams.toString()}`,
     {auth: true},
     "Fehler bei der Suche des Auftrags."
   );
 }

export async function fetchSalesByFilter(
  page: number,
  size: number,
  sort: string[] = ["salesDate,DESC", "invoiceNumber,DESC"],
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
  sort.forEach((s) => queryParams.append("sort", s));

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
      {auth: true},
      "Fehler beim Laden der gefilterten Aufträge."
    );
  }

export async function fetchUpdateSalePaymentStatus(id: number): Promise<Sale> {
 return apiFetch<Sale>(
     `/api/sales/${id}/update-payment-status`,
     { method: "PATCH", credentials: "include", auth: true },
     `Fehler beim Aktualisieren des Zahlungsstatus für Auftrag ${id}.`
   );
 }

 // === Shipping ===
 
 export async function fetchAllShippings(): Promise<Shipping[]> {
   return apiFetch<Shipping[]>(
     `/api/shippings`,
     {auth: true},
     "Fehler beim Laden der Versand."
   );
 }
 
 export async function fetchShippingById(id: number): Promise<Shipping> {
   return apiFetch<Shipping>(
     `/api/shippings/${id}`,
     {auth: true},
     "Fehler beim Laden des Versands."
   );
 }
 
 export async function fetchCreateShipping(data: NewShippingDto): Promise<Shipping> {
   return apiFetch<Shipping>(
     `/api/shippings`,
     {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(data),
       auth: true, 
     },
     "Fehler beim Erstellen des Versands."
   );
 }
 
 export async function fetchUpdateShipping(
   id: number,
   data: NewShippingDto
 ): Promise<Shipping> {
   return apiFetch<Shipping>(
     `/api/shippings/${id}`,
     {
       method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(data),
       auth: true,
     },
     "Fehler beim Aktualisieren des Versands."
   );
 }
 
 export async function fetchDeleteShipping(id: number): Promise<void> {
   await apiFetch<void>(
     `/api/shippings/${id}`,
     { method: "DELETE", auth: true },
     "Fehler beim Löschen des Versands."
   );
 }

 // === Term of payment ===

 export async function fetchAllTermsOfPayment(): Promise<TermOfPayment[]> {
    return apiFetch<TermOfPayment[]>(
      `/api/payment-terms`,
      {auth: true},
      "Beim Laden der Zahlungsbedingungen ist ein Fehler aufgetreten."
    );
  }
  
  export async function fetchTermOfPaymentById(id: number): Promise<TermOfPayment> {
    return apiFetch<TermOfPayment>(
      `/api/payment-terms/${id}`,
      {auth: true},
      "Beim Laden der Zahlungsbedingung ist ein Fehler aufgetreten."
    );
  }
  
  export async function fetchCreateTermOfPayment(data: NewTermOfPaymentDto): Promise<TermOfPayment> {
    return apiFetch<TermOfPayment>(
      `/api/payment-terms`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        auth: true, 
      },
      "Beim Erstellen der Zahlungsbedingung ist ein Fehler aufgetreten."
    );
  }
  
  export async function fetchUpdateTermOfPayment(
    id: number,
    data: NewTermOfPaymentDto
  ): Promise<TermOfPayment> {
    return apiFetch<TermOfPayment>(
      `/api/payment-terms/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        auth: true,
      },
      "Beim Aktualisieren der Zahlungsbedingung ist ein Fehler aufgetreten."
    );
  }
  
  export async function fetchDeleteTermOfPayment(id: number): Promise<void> {
    await apiFetch<void>(
      `/api/payment-terms/${id}`,
      { method: "DELETE", auth: true },
      "Beim Löschen der Zahlungsbedingung ist ein Fehler aufgetreten."
    );
  }