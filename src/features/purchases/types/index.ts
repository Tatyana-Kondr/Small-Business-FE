
export interface Purchase {
    id: number
    vendorId: number
    vendorName: string
    purchasingDate: string
    type: string
    document: string
    documentNumber: string
    subtotal: number
    taxSum: number
    total: number
    paymentStatus: string
    purchaseItems: PurchaseItem[]
}

export interface NewPurchaseDto {
    vendorId: number
    purchasingDate: string
    type: string
    document: string
    documentNumber: string
    paymentStatus: string
    purchaseItems: NewPurchaseItemDto[]
}

export interface PurchaseItem {
    id: number
    productId: number
    productName: string
    productArticle: string
    purchaseId: number
    quantity: number
    unitPrice: number
    totalPrice: number
    taxPercentage: number
    taxAmount: number
    totalAmount: number
    position: number
}

export interface NewPurchaseItemDto {
    productId: number
    productName: string
    purchaseId: number
    quantity: number
    unitPrice: number
    totalPrice: number
    taxPercentage: number
    taxAmount: number
    totalAmount: number
    position: number
}

export interface PurchasesState {
    purchasesList: Purchase[];
    selectedPurchase: Purchase | undefined;
    totalPages: number;
    currentPage: number;
    sort: string,
    loading: boolean;
    error: string | null;
}

export interface PurchaseItemsState {
    purchaseItemsList: PurchaseItem[];
    selectedPurchase: PurchaseItem | undefined;

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