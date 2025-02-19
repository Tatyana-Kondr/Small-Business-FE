import { Customer } from "../types"

export async function fetchCustomers(page: number, size: number = 10): Promise<Customer[]> {
    const res = await fetch(`/api/customers?page=${page}&size=${size}`);
    if (!res.ok) {
      throw new Error("Fehler beim Laden");
    }
    return res.json();
  }