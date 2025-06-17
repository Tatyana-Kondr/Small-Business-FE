import { NewPurchaseDto, PaginatedResponse, Purchase } from "../types";

export async function fetchPurchases({
  page,
  size = 15,
  searchTerm = "",
}: {
  page: number;
  size?: number;
  searchTerm?: string;
}): Promise<PaginatedResponse<Purchase>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  if (searchTerm) {
    queryParams.append("search", searchTerm);
  }

  const res = await fetch(`/api/purchases?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch purchases");
  }
  return res.json();
}

export async function fetchAddPurchase(newPurchase: NewPurchaseDto): Promise<Purchase> {
  try {
    const response = await fetch(`/api/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPurchase),
    });

    if (!response.ok) {
      const errorText = await response.text(); // безопасно читаем ошибку
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to add purchase:', error);
    throw error;
  }
}

export async function fetchUpdatePurchase(id: number, updatedPurchase: NewPurchaseDto): Promise<Purchase> {
  const response = await fetch(`/api/purchases/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedPurchase),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error updating purchase ${id}: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function fetchDeletePurchase(id: number): Promise<void> {
  const response = await fetch(`/api/purchases/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error deleting purchase ${id}: ${response.status} - ${errorText}`);
  }
}

export async function fetchPurchaseById(id: number): Promise<Purchase> {
  const res = await fetch(`/api/purchases/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch purchase with ID ${id}`);
  }
  return res.json();
}

export async function fetchSearchPurchases({
  query,
  page,
  size = 10,
  
}: {
  query: string;
  page: number;
  size?: number;
  sort?: string;
}): Promise<PaginatedResponse<Purchase>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("sort", "purchasingDate,DESC"); 

  const res = await fetch(`/api/purchases/search/${encodeURIComponent(query)}?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to search purchases");
  }
  return res.json();
}

export async function fetchPurchasesByFilter({
  page,
  size = 10,
  sort = "purchasingDate",
  id,
  vendorId,
  document,
  documentNumber,
  total,
  paymentStatus,
  startDate,
  endDate,
  searchQuery,  
}: {
  page: number;
  size?: number;
  sort?: string;
  id?: number;
  vendorId?: number;
  document?: string;
  documentNumber?: string;
  total?: number;
  paymentStatus?: string;
  startDate?: string; // формат yyyy-MM-dd
  endDate?: string;   // формат yyyy-MM-dd
  searchQuery?: string;  
}): Promise<PaginatedResponse<Purchase>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("sort", sort);

  if (id !== undefined) queryParams.append("id", id.toString());
  if (vendorId !== undefined) queryParams.append("vendorId", vendorId.toString());
  if (document) queryParams.append("document", document);
  if (documentNumber) queryParams.append("documentNumber", documentNumber);
  if (total !== undefined) queryParams.append("total", total.toString());
  if (paymentStatus) queryParams.append("paymentStatus", paymentStatus);
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);
  if (searchQuery) queryParams.append("searchQuery", searchQuery); 

  const res = await fetch(`/api/purchases/filter?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch purchases by filter");
  }
  return res.json();
}
