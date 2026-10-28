
export interface Purchase {
    id: number
    vendorId: number
    vendorName: string
    purchasingDate: string
    type: string
    document: TypeOfDocument
    documentNumber: string
    subtotal: number
    discountAmount: number
    taxSum: number
    total: number
    paymentStatus: string
    hasPayments: boolean
    purchaseItems: PurchaseItem[]
}

export interface NewPurchaseDto {
    vendorId: number
    vendorName?: string
    purchasingDate: string
    type: string
    documentId: number
    document?: TypeOfDocument
    documentNumber: string
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
    discount: number
    discountAmount: number
    totalPrice: number
    taxPercentage: number
    taxAmount: number
    totalAmount: number
    position: number
}

export interface NewPurchaseItemDto {
    productId: number
    productName: string
    quantity: number
    unitPrice: number
    discount: number
    taxPercentage: number
}

export interface PurchaseFormItem extends NewPurchaseItemDto {
  position: number;
  discountAmount: number;
  totalPrice: number;
  taxAmount: number;
  totalAmount: number;
}

export type PurchaseFormDto = Omit<NewPurchaseDto, "purchaseItems"> & {
    paymentStatus: string;
    hasPayments: boolean;
    purchaseItems: PurchaseFormItem[];
};

export type CreatePurchaseFormDto = Omit<
    PurchaseFormDto,
    "paymentStatus" | "hasPayments"
>;

export type PurchaseDocumentDto = {
  id: number;
  purchaseId: number;
  originFileName: string;
  fileUrl: string;
  contentType: string;
  createdDate: string;
};

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
    pageSize: number;
    sort: string[],
    purchasesVersion: number;
    loading: boolean;
    error: string | null;
}

export interface PurchaseItemsState {
    purchaseItemsList: PurchaseItem[];
    selectedPurchaseItem: PurchaseItem | undefined;
}

export interface PurchaseDocumentsState {
    documentsList: PurchaseDocumentDto[]
    selectedDocument: PurchaseDocumentDto | undefined
    loading: boolean
    error: string | null
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