import { PaginatedResponse, Product } from "../types"

export async function fetchProducts(page: number, size: number = 5): Promise<PaginatedResponse<Product>> {
  const res = await fetch(`/api/products?page=${page}&size=${size}`);
  if (!res.ok) {
    throw new Error("Ошибка загрузки продуктов");
  }
  return res.json();
}