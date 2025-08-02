export interface Payment{
    id: number;
    paymentDate: string;
    customerId: number;
    customerName: string;
    type: string;
    amount: number;
    saleId: number;
    purchaseId: number;
    document: string;
    documentNumber: string;
    paymentMethodId: number;
    paymentProcessId: number;
}

export interface NewPaymentDto{
    paymentDate: string;
    customerId: number;
    customerName: string;
    type: string;
    amount: number;
    saleId?: number;
    purchaseId?: number;
    document: string;
    documentNumber: string;
    paymentMethodId: number;
    paymentProcessId: number;
}

export interface PaymentPrefillDto{
    customerId: number;
    customerName: string;
    amount: number;
    amountLeft: number;
    saleId: number;
    purchaseId: number;
    document: string;
    documentNumber: string;
    type: string;
}

export interface PaymentMethod{
    id: number;
    provider: string;  
    maskedNumber: string;  
    details: string;  
    active: boolean;
}

export interface NewPaymentMethodDto{
    provider: string;  
    maskedNumber?: string;  
    details?: string;  
    active: boolean;
}

export interface PaymentProcess{
    id: number;
    processName: string;  
}

export interface NewPaymentProcessDto{
    processName: string;  
}

export interface PaymentsState {
  paymentsList: Payment[];
  selectedPayment: Payment | undefined;
  prefillData: PaymentPrefillDto | null;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}


export interface PaymentMethodsState {
    paymentMethodsList: PaymentMethod[];
    selectedPaymentMethod: PaymentMethod | undefined;
    loading: boolean;
    error: string | null;
}

export interface PaymentProcessesState {
    paymentProcessesList: PaymentProcess[];
    selectedPaymentProcess: PaymentProcess | undefined;
    loading: boolean;
    error: string | null;
}

export interface PaginatedResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        offset: number;
        paged: boolean;
        sort: {
            empty: boolean;
            unsorted: boolean;
            sorted: boolean;
        };
    };
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}  
