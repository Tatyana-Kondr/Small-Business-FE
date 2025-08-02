import { NewPaymentDto, NewPaymentMethodDto, NewPaymentProcessDto, PaginatedResponse, Payment, PaymentMethod, PaymentPrefillDto, PaymentProcess } from "../types";

// === Payment ===
export async function fetchAllPayments({
  page,
  size = 15,
}: {
  page: number;
  size?: number;
}): Promise<PaginatedResponse<Payment>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());

  const res = await fetch(`/api/payments?${queryParams.toString()}`);
  return handleResponse<PaginatedResponse<Payment>>(res);
}

export async function fetchAddPayment(newPayment: NewPaymentDto): Promise<Payment> {
  const response = await fetch(`/api/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newPayment),
  });

  return handleResponse<Payment>(response);
}

export async function fetchUpdatePayment(id: number, updatedPayment: NewPaymentDto): Promise<Payment> {
  const response = await fetch(`/api/payments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedPayment),
  });

  return handleResponse<Payment>(response);
}

export async function fetchDeletePayment(id: number): Promise<void> {
  const response = await fetch(`/api/payments/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<void>(response);
}

export async function fetchPaymentById(id: number): Promise<Payment> {
  const res = await fetch(`/api/payments/${id}`);
  return handleResponse<Payment>(res);
}

export async function fetchSearchPayments({
  query,
  page,
  size = 10,
}: {
  query: string;
  page: number;
  size?: number;
  sort?: string;
}): Promise<PaginatedResponse<Payment>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("sort", "paymentDate,DESC");

  const res = await fetch(`/api/payments/search/${encodeURIComponent(query)}?${queryParams.toString()}`);
  return handleResponse<PaginatedResponse<Payment>>(res);
}

export async function fetchPaymentsByFilter({
  page,
  size = 10,
  sort = "paymentDate",
  id,
  customerId,
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
  document?: string;
  documentNumber?: string;
  amount?: number;
  startDate?: string; 
  endDate?: string;  
  searchQuery?: string;  
}): Promise<PaginatedResponse<Payment>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("sort", sort);

   const filters: Record<string, string | number | undefined> = {
    id,
    customerId,
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

  const res = await fetch(`/api/payments/filter?${queryParams.toString()}`);
  return handleResponse<PaginatedResponse<Payment>>(res);
}

export async function fetchPrefillDataForSale(saleId: number): Promise<PaymentPrefillDto> {
  const res = await fetch(`/api/payments/prefill/sale/${saleId}`);
  return handleResponse<PaymentPrefillDto>(res);
}

export async function fetchPrefillDataForPurchase(purchaseId: number): Promise<PaymentPrefillDto> {
  const res = await fetch(`/api/payments/prefill/purchase/${purchaseId}`);
  return handleResponse<PaymentPrefillDto>(res);
}


// === PaymentMethod ===

export async function fetchAllPaymentMethods(): Promise<PaymentMethod[]> {
  const res = await fetch(`/api/payment-methods`);
  return handleResponse<PaymentMethod[]>(res);
}

export async function fetchPaymentMethodById(id: number): Promise<PaymentMethod> {
  const res = await fetch(`/api/payment-methods/${id}`);
  return handleResponse<PaymentMethod>(res);
}

export async function fetchCreatePaymentMethod(data: NewPaymentMethodDto): Promise<PaymentMethod> {
  const res = await fetch(`/api/payment-methods`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<PaymentMethod>(res);
}

export async function fetchUpdatePaymentMethod(id: number, data: NewPaymentMethodDto): Promise<PaymentMethod> {
  const res = await fetch(`/api/payment-methods/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<PaymentMethod>(res);
}

export async function fetchDeletePaymentMethod(id: number): Promise<void> {
  const res = await fetch(`/api/payment-methods/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error deleting purchase ${id}: ${res.status} - ${errorText}`);
  }
}

// === PaymentProcess ===

export async function fetchAllPaymentProcesses(): Promise<PaymentProcess[]> {
  const res = await fetch(`/api/payment-processes`);
  return handleResponse<PaymentProcess[]>(res);
}

export async function fetchPaymentProcessById(id: number): Promise<PaymentProcess> {
  const res = await fetch(`/api/payment-processes/${id}`);
  return handleResponse<PaymentProcess>(res);
}

export async function fetchCreatePaymentProcess(data: NewPaymentProcessDto): Promise<PaymentProcess> {
  const res = await fetch(`/api/payment-processes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<PaymentProcess>(res);
}

export async function fetchUpdatePaymentProcess(id: number, data: NewPaymentProcessDto): Promise<PaymentProcess> {
  const res = await fetch(`/api/payment-processes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<PaymentProcess>(res);
}

export async function fetchDeletePaymentProcess(id: number): Promise<void> {
  const res = await fetch(`/api/payment-processes/${id}`, {
    method: "DELETE",
  });
 if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error deleting purchase ${id}: ${res.status} - ${errorText}`);
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }
  return res.json();
}

