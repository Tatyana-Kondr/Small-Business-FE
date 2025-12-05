import { apiFetch } from "../../../utils/apiFetch";
import { NewPurchaseDto, NewTypeOfDocumentDto, PaginatedResponse, Purchase, TypeOfDocument } from "../types";

export async function fetchPurchases(
  page: number,
  size: number,
  sort: string[] = ["purchasingDate,DESC", "id,DESC"],
  searchTerm: string = ""
): Promise<PaginatedResponse<Purchase>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  sort.forEach(s => queryParams.append("sort", s));
  if (searchTerm) queryParams.append("search", searchTerm);

  return apiFetch<PaginatedResponse<Purchase>>(
    `/api/purchases?${queryParams.toString()}`,
    {auth: true},
    "Fehler beim Laden der Bestellungen."
  );
}

export async function fetchAddPurchase(newPurchase: NewPurchaseDto): Promise<Purchase> {
  return apiFetch<Purchase>(
    "/api/purchases",
    {
      method: "POST",
      body: JSON.stringify(newPurchase),
      headers: { "Content-Type": "application/json" },
      auth: true,
    },
    "Fehler beim Hinzufügen der Bestellung."
  );
}

export async function fetchUpdatePurchase(id: number, updatedPurchase: NewPurchaseDto): Promise<Purchase> {
  return apiFetch<Purchase>(
    `/api/purchases/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(updatedPurchase),
      headers: { "Content-Type": "application/json" },
      auth: true,
    },
    `Fehler beim Aktualisieren der Bestellung mit der ID ${id}.`
  );
}

export async function fetchDeletePurchase(id: number): Promise<void> {
  return apiFetch<void>(
    `/api/purchases/${id}`,
    { method: "DELETE", auth: true },
    `Fehler beim Löschen der Bestellung mit der ID ${id}.`
  );
}

export async function fetchPurchaseById(id: number): Promise<Purchase> {
  return apiFetch<Purchase>(
    `/api/purchases/${id}`,
    {auth: true},
    `Fehler beim Laden der Bestellung mit der ID ${id}.`
  );
}

export async function fetchSearchPurchases(
  query: string,
  page: number,
  size: number,
  sort: string[] = ["purchasingDate,DESC", "id,DESC"]
): Promise<PaginatedResponse<Purchase>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  sort.forEach(s => queryParams.append("sort", s));

  return apiFetch<PaginatedResponse<Purchase>>(
    `/api/purchases/search/${encodeURIComponent(query)}?${queryParams.toString()}`,
    {auth: true},
    "Fehler bei der Suche der Bestellungen."
  );
}

export async function fetchPurchasesByFilter(
  page: number,
  size: number,
  sort: string[] = ["purchasingDate,DESC", "id,DESC"],
  filters?: {
    id?: number;
    vendorId?: number;
    documentId?: number;
    documentNumber?: string;
    total?: number;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    searchQuery?: string;
  }
): Promise<PaginatedResponse<Purchase>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  sort.forEach(s => queryParams.append("sort", s));

  if (filters) {
    if (filters.id !== undefined) queryParams.append("id", filters.id.toString());
    if (filters.vendorId !== undefined) queryParams.append("vendorId", filters.vendorId.toString());
    if (filters.documentId !== undefined) queryParams.append("documentId", filters.documentId.toString());
    if (filters.documentNumber) queryParams.append("documentNumber", filters.documentNumber);
    if (filters.total !== undefined) queryParams.append("total", filters.total.toString());
    if (filters.paymentStatus) queryParams.append("paymentStatus", filters.paymentStatus);
    if (filters.startDate) queryParams.append("startDate", filters.startDate);
    if (filters.endDate) queryParams.append("endDate", filters.endDate);
    if (filters.searchQuery) queryParams.append("searchQuery", filters.searchQuery);
  }

  return apiFetch<PaginatedResponse<Purchase>>(
    `/api/purchases/filter?${queryParams.toString()}`,
    {auth: true},
    "Fehler beim Laden der gefilterten Bestellungen."
  );
}

export async function fetchUpdatePurchasePaymentStatus(id: number): Promise<Purchase> {
  return apiFetch<Purchase>(
    `/api/purchases/${id}/update-payment-status`,
    { method: "PATCH", credentials: "include", auth: true },
    `Fehler beim Aktualisieren des Zahlungsstatus für Bestellung ${id}.`
  );
}

// Type of Document
export async function fetchAllTypesOfDocument(): Promise<TypeOfDocument[]> {
   return apiFetch<TypeOfDocument[]>(
     `/api/document-types`,
     {auth: true},
     "Fehler beim Laden der Dokumenttypen."
   );
 }
 
 export async function fetchTypeOfDocumentById(id: number): Promise<TypeOfDocument> {
   return apiFetch<TypeOfDocument>(
     `/api/document-types/${id}`,
     {auth: true},
     "Fehler beim Laden des Dokumenttyps."
   );
 }
 
 export async function fetchCreateTypeOfDocument(data: NewTypeOfDocumentDto): Promise<TypeOfDocument> {
   return apiFetch<TypeOfDocument>(
     `/api/document-types`,
     {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(data),
       auth: true, 
     },
     "Fehler beim Erstellen des Dokumenttyps."
   );
 }
 
 export async function fetchUpdateTypeOfDocument(
   id: number,
   data: NewTypeOfDocumentDto
 ): Promise<TypeOfDocument> {
   return apiFetch<TypeOfDocument>(
     `/api/document-types/${id}`,
     {
       method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(data),
       auth: true,
     },
     "Fehler beim Aktualisieren des Dokumenttyps."
   );
 }
 
 export async function fetchDeleteTypeOfDocument(id: number): Promise<void> {
   await apiFetch<void>(
     `/api/document-types/${id}`,
     { method: "DELETE", auth: true },
     "Fehler beim Löschen des Dokumenttyps."
   );
 }
