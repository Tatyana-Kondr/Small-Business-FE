import { apiFetch } from "../../../utils/apiFetch";
import { PaginatedResponse, WarehouseRecord, WarehouseStock } from "../types";

export async function fetchWarehouseStocks(
  page: number,
  size: number = 15,
  sort: string = "productName,ASC"
): Promise<PaginatedResponse<WarehouseStock>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("sort", sort);

  return apiFetch<PaginatedResponse<WarehouseStock>>(
    `/api/warehouse/stocks?${queryParams.toString()}`,
    { auth: true },
    "Fehler beim Laden des Lagerbestands." 
  );
}

export async function fetchProductStock(productId: number): Promise<WarehouseStock> {
  return apiFetch<WarehouseStock>(
    `/api/warehouse/product/${productId}/stock`,
    { auth: true },
    `Fehler beim Laden des Lagerbestands für Produkt-ID ${productId}.`
  );
}

export async function fetchProductHistory(
  productId: number,
  page: number,
  size: number = 15,
  sort: string = "date,DESC"
): Promise<PaginatedResponse<WarehouseRecord>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("sort", sort);

  return apiFetch<PaginatedResponse<WarehouseRecord>>(
    `/api/warehouse/product/${productId}/history?${queryParams.toString()}`,
    { auth: true },
    `Fehler beim Laden der Bewegungshistorie für Produkt-ID ${productId}.`
  );
}
