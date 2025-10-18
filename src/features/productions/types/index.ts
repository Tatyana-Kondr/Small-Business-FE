
export interface Production {
    id: number
    dateOfProduction: string
    type: string
    productId: number
    quantity: number
    unitPrice: number
    amount: number
    productionItems: ProductionItem[]
}

export interface NewProductionDto {
    dateOfProduction: string
    type: string
    productId: number
    quantity: number
    unitPrice: number
    amount: number
    productionItems: NewProductionItemDto[]
}

export interface ProductionItem {
    id: number
    productionId: number
    productId: number
    type: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

export interface NewProductionItemDto {
    productionId: number
    productId: number
    type: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

export interface ProductionsState {
    productionsList: Production[];
    selectedProduction: Production | undefined;
    totalPages: number;
    currentPage: number;
    sort: string,
    loading: boolean;
    error: string | null;
}

export interface ProductionItemsState {
    productionItemsList: ProductionItem[];
    selectedProductionItem: ProductionItem | undefined;

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
