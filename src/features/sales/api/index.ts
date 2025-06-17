import { NewSaleDto, PaginatedResponse, Sale } from "../types";

export async function fetchSales({
  page,
  size = 15,
  searchTerm = "",
}: {
  page: number;
  size?: number;
  searchTerm?: string;
}): Promise<PaginatedResponse<Sale>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  if (searchTerm) {
    queryParams.append("search", searchTerm);
  }

  const res = await fetch(`/api/sales?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch sales");
  }
  return res.json();
}

export async function fetchAddSale(newSale: NewSaleDto): Promise<Sale> {
  try {
    const response = await fetch(`/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSale),
    });

    if (!response.ok) {
      const errorText = await response.text(); 
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to add sale:', error);
    throw error;
  }
}

export async function fetchUpdateSale(id: number, updatedSale: NewSaleDto): Promise<Sale> {
  const response = await fetch(`/api/sales/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedSale),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error updating sale ${id}: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function fetchDeleteSale(id: number): Promise<void> {
  const response = await fetch(`/api/sales/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error deleting sale ${id}: ${response.status} - ${errorText}`);
  }
}

export async function fetchSaleById(id: number): Promise<Sale> {
  const res = await fetch(`/api/sales/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch sale with ID ${id}`);
  }
  return res.json();
}

export async function fetchSearchSales({
  query,
  page,
  size = 10,
  
}: {
  query: string;
  page: number;
  size?: number;
  sort?: string;
}): Promise<PaginatedResponse<Sale>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("sort", "salesDate,DESC"); 

  const res = await fetch(`/api/sales/search/${encodeURIComponent(query)}?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to search sales");
  }
  return res.json();
}

export async function fetchSalesByFilter({
  page,
  size = 10,
  sort = "salesDate",
  id,
  customerId,
  invoiceNumber,
  totalAmount,
  paymentStatus,
  startDate,
  endDate,
  searchQuery,  
}: {
  page: number;
  size?: number;
  sort?: string;
  id?: number;
  customerId?: number;
  invoiceNumber?: string;
  totalAmount?: number;
  paymentStatus?: string;
  startDate?: string; // формат yyyy-MM-dd
  endDate?: string;   // формат yyyy-MM-dd
  searchQuery?: string;  
}): Promise<PaginatedResponse<Sale>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("sort", sort);

  if (id !== undefined) queryParams.append("id", id.toString());
  if (customerId !== undefined) queryParams.append("customerId", customerId.toString());
  if (invoiceNumber) queryParams.append("invoiceNumber", invoiceNumber);
  if (totalAmount !== undefined) queryParams.append("total", totalAmount.toString());
  if (paymentStatus) queryParams.append("paymentStatus", paymentStatus);
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);
  if (searchQuery) queryParams.append("searchQuery", searchQuery); 

  const res = await fetch(`/api/sales/filter?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch sales by filter");
  }
  return res.json();
}
