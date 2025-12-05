
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
  productArticle: string;
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
  shippingId: number;
  shippingDimensions: NewShippingDimensionsDto;
  termsOfPayment: TermOfPayment;
  salesDate: string;
  paymentDate: string; 
  paymentStatus: string;
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

export interface Shipping{
    id: number;
    name: string;  
}

export interface TermOfPayment{
    id: number;
    name: string;
}

export interface NewSaleItemDto {
  position: number;
  saleId: number
  productId: number;
  productArticle: string;
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
  customerName?: string;
  invoiceNumber: string;
  accountObject?: string;
  typeOfOperation: string;
  shippingId: number | null;
  shippingDimensions?: NewShippingDimensionsDto;
  termsOfPaymentId?: number;
  termOfPayment?: TermOfPayment;
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

export interface NewShippingDto{
    name: string;  
}

export interface NewTermOfPaymentDto {
  name: string;
}

export interface SalesState {
    salesList: Sale[];
    selectedSale: Sale | undefined;
    totalPages: number;
    currentPage: number;
    sort: string[];
    loading: boolean;
    error: string | null;
}

export interface SaleItemsState {
    saleItemsList: SaleItem[];
    selectedSale: SaleItem | undefined;
}

export interface ShippingsState{
  shippingsList: Shipping[];
  selectedShipping: Shipping | undefined;
  loading: boolean;
  error: string | null;
}

export interface TermOfPaymentState{
  paymentTermsList: TermOfPayment[];
  selectedPaymentTerm: TermOfPayment | undefined;
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
