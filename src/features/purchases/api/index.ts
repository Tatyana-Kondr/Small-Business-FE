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
