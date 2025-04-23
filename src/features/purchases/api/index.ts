import { PaginatedResponse, Purchase } from "../types";

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