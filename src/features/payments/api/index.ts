import { apiFetch } from "../../../utils/apiFetch";

import {
  NewPaymentDto,
  NewPaymentMethodDto,
  NewPaymentProcessDto,
  PaginatedResponse,
  Payment,
  PaymentMethod,
  PaymentPrefillDto,
  PaymentProcess,
} from "../types";

// ==================== Payment ====================

export async function fetchAllPayments(
  page: number,
  size: number,
  sort: string[] = ["paymentDate,DESC", "id,DESC"],
  searchTerm: string = "",
): Promise<PaginatedResponse<Payment>> {
  const queryParams = new URLSearchParams();

  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());

  sort.forEach((s) => {
    queryParams.append("sort", s);
  });

  if (searchTerm) {
    queryParams.append("search", searchTerm);
  }

  return apiFetch<PaginatedResponse<Payment>>(
    `/api/payments?${queryParams.toString()}`,
    { auth: true },
    "Fehler beim Laden der Zahlungen.",
  );
}

export async function fetchAddPayment(
  newPayment: NewPaymentDto,
): Promise<Payment> {
  return apiFetch<Payment>(
    "/api/payments",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPayment),
      auth: true,
    },
    "Fehler beim Hinzufügen der Zahlung.",
  );
}

export async function fetchUpdatePayment(
  id: number,
  updatePaymentDto: NewPaymentDto,
): Promise<Payment> {
  return apiFetch<Payment>(
    `/api/payments/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePaymentDto),
      auth: true,
    },
    `Fehler beim Aktualisieren der Zahlung mit der ID ${id}.`,
  );
}

export async function fetchDeletePayment(id: number): Promise<void> {
  return apiFetch<void>(
    `/api/payments/${id}`,
    {
      method: "DELETE",
      auth: true,
    },
    `Fehler beim Löschen der Zahlung mit der ID ${id}.`,
  );
}

export async function fetchPaymentById(id: number): Promise<Payment> {
  return apiFetch<Payment>(
    `/api/payments/${id}`,
    { auth: true },
    `Fehler beim Laden der Zahlung mit der ID ${id}.`,
  );
}

// ==================== Search ====================

export async function fetchSearchPayments(
  query: string,
  page: number,
  size: number,
  sort: string[] = ["paymentDate,DESC", "id,DESC"],
): Promise<PaginatedResponse<Payment>> {
  const queryParams = new URLSearchParams();

  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());

  sort.forEach((s) => {
    queryParams.append("sort", s);
  });

  return apiFetch<PaginatedResponse<Payment>>(
    `/api/payments/search/${encodeURIComponent(query)}?${queryParams.toString()}`,
    { auth: true },
    "Fehler bei der Suche nach Zahlungen.",
  );
}

// ==================== Filter ====================

export async function fetchPaymentsByFilter(
  page: number,
  size: number,
  sort: string[] = ["paymentDate,DESC", "id,DESC"],
  filters?: {
    id?: number;
    customerId?: number;
    customerName?: string;
    saleId?: number;
    purchaseId?: number;
    documentId?: number;
    documentNumber?: string;
    amount?: number;
    startDate?: string;
    endDate?: string;
    searchQuery?: string;
  },
): Promise<PaginatedResponse<Payment>> {
  const queryParams = new URLSearchParams();

  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());

  sort.forEach((s) => {
    queryParams.append("sort", s);
  });

  if (filters) {
    if (filters.id !== undefined) {
      queryParams.append("id", filters.id.toString());
    }

    if (filters.customerId !== undefined) {
      queryParams.append("customerId", filters.customerId.toString());
    }

    if (filters.customerName) {
      queryParams.append("customerName", filters.customerName);
    }

    if (filters.saleId !== undefined) {
      queryParams.append("saleId", filters.saleId.toString());
    }

    if (filters.purchaseId !== undefined) {
      queryParams.append("purchaseId", filters.purchaseId.toString());
    }

    if (filters.documentId !== undefined) {
      queryParams.append("documentId", filters.documentId.toString());
    }

    if (filters.documentNumber) {
      queryParams.append("documentNumber", filters.documentNumber);
    }

    if (filters.amount !== undefined) {
      queryParams.append("amount", filters.amount.toString());
    }

    if (filters.startDate) {
      queryParams.append("startDate", filters.startDate);
    }

    if (filters.endDate) {
      queryParams.append("endDate", filters.endDate);
    }

    if (filters.searchQuery) {
      queryParams.append("searchQuery", filters.searchQuery);
    }
  }

  return apiFetch<PaginatedResponse<Payment>>(
    `/api/payments/filter?${queryParams.toString()}`,
    { auth: true },
    "Fehler beim Laden der gefilterten Zahlungen.",
  );
}

// ==================== IDs ====================

export async function fetchGetAllSaleIds(): Promise<number[]> {
  return apiFetch<number[]>(
    "/api/payments/all-sale-ids",
    { auth: true },
    "Fehler beim Laden aller Auftrag-IDs.",
  );
}

export async function fetchGetAllPurchaseIds(): Promise<number[]> {
  return apiFetch<number[]>(
    "/api/payments/all-purchase-ids",
    { auth: true },
    "Fehler beim Laden aller Bestellungs-IDs.",
  );
}

// ==================== Prefill ====================

export async function fetchPrefillDataForSale(
  saleId: number,
): Promise<PaymentPrefillDto> {
  return apiFetch<PaymentPrefillDto>(
    `/api/payments/prefill/sale/${saleId}`,
    { auth: true },
    "Fehler beim Laden der Vorausfüll-Daten für Auftrag.",
  );
}

export async function fetchPrefillDataForPurchase(
  purchaseId: number,
): Promise<PaymentPrefillDto> {
  return apiFetch<PaymentPrefillDto>(
    `/api/payments/prefill/purchase/${purchaseId}`,
    { auth: true },
    "Fehler beim Laden der Vorausfüll-Daten für Bestellung.",
  );
}

// ==================== PaymentMethod ====================

export async function fetchAllPaymentMethods(): Promise<PaymentMethod[]> {
  return apiFetch<PaymentMethod[]>(
    "/api/payment-methods",
    { auth: true },
    "Fehler beim Laden der Zahlungsmethoden.",
  );
}

export async function fetchPaymentMethodById(
  id: number,
): Promise<PaymentMethod> {
  return apiFetch<PaymentMethod>(
    `/api/payment-methods/${id}`,
    { auth: true },
    "Fehler beim Laden der Zahlungsmethode.",
  );
}

export async function fetchCreatePaymentMethod(
  data: NewPaymentMethodDto,
): Promise<PaymentMethod> {
  return apiFetch<PaymentMethod>(
    "/api/payment-methods",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      auth: true,
    },
    "Fehler beim Erstellen der Zahlungsmethode.",
  );
}

export async function fetchUpdatePaymentMethod(
  id: number,
  data: NewPaymentMethodDto,
): Promise<PaymentMethod> {
  return apiFetch<PaymentMethod>(
    `/api/payment-methods/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      auth: true,
    },
    "Fehler beim Aktualisieren der Zahlungsmethode.",
  );
}

export async function fetchDeletePaymentMethod(id: number): Promise<void> {
  return apiFetch<void>(
    `/api/payment-methods/${id}`,
    {
      method: "DELETE",
      auth: true,
    },
    "Fehler beim Löschen der Zahlungsmethode.",
  );
}

// ==================== PaymentProcess ====================

export async function fetchAllPaymentProcesses(): Promise<PaymentProcess[]> {
  return apiFetch<PaymentProcess[]>(
    "/api/payment-processes",
    { auth: true },
    "Fehler beim Laden der Zahlungsprozesse.",
  );
}

export async function fetchPaymentProcessById(
  id: number,
): Promise<PaymentProcess> {
  return apiFetch<PaymentProcess>(
    `/api/payment-processes/${id}`,
    { auth: true },
    "Fehler beim Laden des Zahlungsprozesses.",
  );
}

export async function fetchCreatePaymentProcess(
  data: NewPaymentProcessDto,
): Promise<PaymentProcess> {
  return apiFetch<PaymentProcess>(
    "/api/payment-processes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      auth: true,
    },
    "Fehler beim Erstellen des Zahlungsprozesses.",
  );
}

export async function fetchUpdatePaymentProcess(
  id: number,
  data: NewPaymentProcessDto,
): Promise<PaymentProcess> {
  return apiFetch<PaymentProcess>(
    `/api/payment-processes/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      auth: true,
    },
    "Fehler beim Aktualisieren des Zahlungsprozesses.",
  );
}

export async function fetchDeletePaymentProcess(id: number): Promise<void> {
  return apiFetch<void>(
    `/api/payment-processes/${id}`,
    {
      method: "DELETE",
      auth: true,
    },
    "Fehler beim Löschen des Zahlungsprozesses.",
  );
}
