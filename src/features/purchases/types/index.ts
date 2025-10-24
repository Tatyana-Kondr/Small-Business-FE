
export interface Purchase {
    id: number
    vendorId: number
    vendorName: string
    purchasingDate: string
    type: string
    document: TypeOfDocument
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
    documentId?: number
    document?: TypeOfDocument
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

export interface TypeOfDocument{
    id: number;
    name: string;
}

export interface NewTypeOfDocumentDto{
    name: string;
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
    selectedPurchaseItem: PurchaseItem | undefined;
}

export interface TypeOfDocumentState{
  documentTypesList: TypeOfDocument[];
  selectedDocumentType: TypeOfDocument | undefined;
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