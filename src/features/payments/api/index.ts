import { apiFetch } from "../../../utils/apiFetch";
import { NewPaymentDto, NewPaymentMethodDto, NewPaymentProcessDto, PaginatedResponse, Payment, PaymentMethod, PaymentPrefillDto, PaymentProcess } from "../types";

// === Payment ===
export async function fetchAllPayments({
  page,
  size = 15,
  sort = "paymentDate",
}: {
  page: number;
  size?: number;
  sort?: string;
}): Promise<PaginatedResponse<Payment>> {
   const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort,
  });

  return apiFetch<PaginatedResponse<Payment>>(
    `/api/payments?${queryParams.toString()}`,
    undefined,
    "Fehler beim Laden der Zahlungsiste."
  );
}

export async function fetchAddPayment(newPayment: NewPaymentDto): Promise<Payment> {
  return apiFetch<Payment>(
    `/api/payments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPayment),
    },
    "Fehler beim Hinzufügen der Zahlung."
  );
}

export async function fetchUpdatePayment(id: number, updatePaymentDto: NewPaymentDto): Promise<Payment> {
  return apiFetch<Payment>(
    `/api/payments/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePaymentDto),
    },
    "Fehler beim Aktualisieren der Zahlung."
  );
}

export async function fetchDeletePayment(id: number): Promise<void> {
  await apiFetch<void>(
    `/api/payments/${id}`,
    { method: "DELETE" },
    "Fehler beim Löschen der Zahlung."
  );
}

export async function fetchGetAllSaleIds(): Promise<number[]> {
  return apiFetch<number[]>(
    `/api/payments/all-sale-ids`,
    undefined,
    "Fehler beim Laden aller Sale IDs."
  );
}

export async function fetchGetAllPurchaseIds(): Promise<number[]> {
  return apiFetch<number[]>(
    `/api/payments/all-purchase-ids`,
    undefined,
    "Fehler beim Laden aller Purchase IDs."
  );
}

export async function fetchPaymentById(id: number): Promise<Payment> {
  return apiFetch<Payment>(`/api/payments/${id}`, undefined, "Fehler beim Laden der Zahlung.");
}

export async function fetchSearchPayments({
  query,
  page,
  size = 15,
  sort = "paymentDate",
}: {
  query: string;
  page: number;
  size?: number;
  sort?: string;
}): Promise<PaginatedResponse<Payment>> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort,
  });

  return apiFetch<PaginatedResponse<Payment>>(
    `/api/payments/search/${encodeURIComponent(query)}?${queryParams.toString()}`,
    undefined,
    "Fehler bei der Suche nach Zahlungen."
  );
}

export async function fetchPaymentsByFilter({
  page,
  size = 15,
  sort = "paymentDate",
  id,
  customerId,
  saleId,
  purchaseId,
  document,
  documentNumber,
  amount,
  startDate,
  endDate,
  searchQuery,
}: {
  page: number;
  size?: number;
  sort?: string;
  id?: number;
  customerId?: number;
  saleId?: number;
  purchaseId?: number;
  document?: string;
  documentNumber?: string;
  amount?: number;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}): Promise<PaginatedResponse<Payment>> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort,
  });

  const filters: Record<string, string | number | undefined> = {
    id,
    customerId,
    saleId,
    purchaseId,
    document,
    documentNumber,
    amount,
    startDate,
    endDate,
    searchQuery,
  };

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value.toString());
    }
  });

  return apiFetch<PaginatedResponse<Payment>>(
    `/api/payments/filter?${queryParams.toString()}`,
    undefined,
    "Fehler beim Filtern der Zahlungen."
  );
}

export async function fetchPrefillDataForSale(saleId: number): Promise<PaymentPrefillDto> {
  return apiFetch<PaymentPrefillDto>(
    `/api/payments/prefill/sale/${saleId}`,
    undefined,
    "Fehler beim Laden der Vorausfüll-Daten für Verkauf."
  );
}

export async function fetchPrefillDataForPurchase(purchaseId: number): Promise<PaymentPrefillDto> {
  return apiFetch<PaymentPrefillDto>(
    `/api/payments/prefill/purchase/${purchaseId}`,
    undefined,
    "Fehler beim Laden der Vorausfüll-Daten für Einkauf."
  );
}

// === PaymentMethod ===

export async function fetchAllPaymentMethods(): Promise<PaymentMethod[]> {
  return apiFetch<PaymentMethod[]>(
    `/api/payment-methods`,
    undefined,
    "Fehler beim Laden der Zahlungsmethoden."
  );
}

export async function fetchPaymentMethodById(id: number): Promise<PaymentMethod> {
  return apiFetch<PaymentMethod>(
    `/api/payment-methods/${id}`,
    undefined,
    "Fehler beim Laden der Zahlungsmethode."
  );
}

export async function fetchCreatePaymentMethod(data: NewPaymentMethodDto): Promise<PaymentMethod> {
  return apiFetch<PaymentMethod>(
    `/api/payment-methods`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    "Fehler beim Erstellen der Zahlungsmethode."
  );
}

export async function fetchUpdatePaymentMethod(
  id: number,
  data: NewPaymentMethodDto
): Promise<PaymentMethod> {
  return apiFetch<PaymentMethod>(
    `/api/payment-methods/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    "Fehler beim Aktualisieren der Zahlungsmethode."
  );
}

export async function fetchDeletePaymentMethod(id: number): Promise<void> {
  await apiFetch<void>(
    `/api/payment-methods/${id}`,
    { method: "DELETE" },
    "Fehler beim Löschen der Zahlungsmethode."
  );
}

// === PaymentProcess ===

export async function fetchAllPaymentProcesses(): Promise<PaymentProcess[]> {
  return apiFetch<PaymentProcess[]>(
    `/api/payment-processes`,
    undefined,
    "Fehler beim Laden der Zahlungsprozesse."
  );
}

export async function fetchPaymentProcessById(id: number): Promise<PaymentProcess> {
  return apiFetch<PaymentProcess>(
    `/api/payment-processes/${id}`,
    undefined,
    "Fehler beim Laden des Zahlungsprozesses."
  );
}

export async function fetchCreatePaymentProcess(data: NewPaymentProcessDto): Promise<PaymentProcess> {
  return apiFetch<PaymentProcess>(
    `/api/payment-processes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    "Fehler beim Erstellen des Zahlungsprozesses."
  );
}

export async function fetchUpdatePaymentProcess(
  id: number,
  data: NewPaymentProcessDto
): Promise<PaymentProcess> {
  return apiFetch<PaymentProcess>(
    `/api/payment-processes/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    "Fehler beim Aktualisieren des Zahlungsprozesses."
  );
}

export async function fetchDeletePaymentProcess(id: number): Promise<void> {
  await apiFetch<void>(
    `/api/payment-processes/${id}`,
    { method: "DELETE" },
    "Fehler beim Löschen des Zahlungsprozesses."
  );
}