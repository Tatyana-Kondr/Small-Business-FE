
export interface NewShippingDimensionsDto {
  width?: number | null;
  height?: number | null;
  length?: number | null;
  weight?: number | null;
}


export interface SaleItem {
  id: number;
  position: number;
  saleId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountAmount: number;
  totalPrice: number;
  tax: number;
  taxAmount: number;
  totalAmount: number;
}

export interface Sale {
  id: number;
  customerId: number;
  customerName: string;
  invoiceNumber: string;
  accountObject: string;
  typeOfOperation: string;
  shipping: string;
  shippingDimensions: NewShippingDimensionsDto;
  termsOfPayment: string;
  salesDate: string; 
  paymentStatus: string;
  paymentDate: string;
  orderNumber: string;
  orderType: string;
  deliveryDate: string;
  deliveryBill: string;
  discountAmount: number;
  totalPrice: number;
  defaultTax: number;
  taxAmount: number;
  totalAmount: number;
  defaultDiscount: number;
  saleItems: SaleItem[];
}

export interface NewSaleItemDto {
  position: number;
  saleId: number
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountAmount: number;
  totalPrice: number;
  tax: number;
  taxAmount: number;
  totalAmount: number;
}

export interface NewSaleDto {
  customerId: number;
  invoiceNumber: string;
  accountObject?: string;
  typeOfOperation: string;
  shipping: string;
  shippingDimensions?: NewShippingDimensionsDto;
  termsOfPayment?: string;
  salesDate?: string;
  paymentStatus: string;
  paymentDate?: string;
  orderNumber?: string;
  orderType?: string;
  deliveryDate?: string;
  deliveryBill: string;
  defaultTax: number;
  defaultDiscount: number;
  salesItems: NewSaleItemDto[];
}

export interface SalesState {
    salesList: Sale[];
    selectedSale: Sale | undefined;
    totalPages: number;
    currentPage: number;
    loading: boolean;
    error: string | null;
}

export interface SaleItemsState {
    saleItemsList: SaleItem[];
    selectedSale: SaleItem | undefined;
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
