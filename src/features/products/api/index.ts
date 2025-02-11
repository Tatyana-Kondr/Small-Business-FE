import { Product } from "../types"

export async function fetchProducts(): Promise<Product[]> {
    const res = await fetch("/api/products")
    return res.json()
  }