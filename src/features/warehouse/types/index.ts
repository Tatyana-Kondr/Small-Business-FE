export interface WarehouseStock {
    productId: number
    productName: string
    productArticle: string
    quantity: number
}

export interface WarehouseRecord {
    id: number
    typeOfOperation: string
    documentId: number
    date: string
    partnerName: string
    quantity: number
    productId: number
    productName: string
}

export interface WarenhousStockState {
    warehouseStocksLiist: WarehouseStock[];
    selectedWarehouseStock: WarehouseStock | undefined;
    loading: boolean;
    error: string | null;
}

export interface WarenhousRecordState {
    warehouseRecordsLiist: WarehouseRecord[];
    selectedWarehouseRecord: WarehouseRecord | undefined;
    totalPages: number;
    currentPage: number;
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