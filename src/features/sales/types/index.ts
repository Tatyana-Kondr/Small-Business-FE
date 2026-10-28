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
  hasPayments: boolean;
  orderNumber: string;
  orderType: string;
  deliveryDate: string;
  deliveryBill: string;
  discountAmount: number;
  totalPrice: number;
  taxAmount: number;
  totalAmount: number;
  totalPaid?: number;
  remaining?: number;
  overpayment?: number;
  saleItems: SaleItem[];
}

export interface Shipping {
  id: number;
  name: string;
}

export interface TermOfPayment {
  id: number;
  name: string;
}

export interface NewSaleItemDto {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
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
  salesDate?: string;
  orderNumber?: string;
  orderType?: string;
  deliveryDate?: string;
  deliveryBill: string;
  salesItems: NewSaleItemDto[];
}

export interface SaleFormItem extends NewSaleItemDto {
  position: number;
  productArticle: string;
  discountAmount: number;
  totalPrice: number;
  taxAmount: number;
  totalAmount: number;
}

export type SaleFormDto = Omit<NewSaleDto, "salesItems"> & {
  paymentStatus: string;
  paymentDate: string;
  hasPayments: boolean;
  salesItems: SaleFormItem[];
};

export type CreateSaleFormDto = Omit<
  SaleFormDto,
  "paymentStatus" | "paymentDate" | "hasPayments"
>;

export interface NewShippingDto {
  name: string;
}

export interface NewTermOfPaymentDto {
  name: string;
}

export interface TaxRate {
  id: number;
  value: number;
  active: boolean;
  defaultRate: boolean;
}

export interface NewTaxRateDto {
  value: number;
  active: boolean;
  defaultRate: boolean;
}

export interface DiscountRate {
  id: number;
  value: number;
  active: boolean;
}

export interface NewDiscountRateDto {
  value: number;
  active: boolean;
}

export interface SalesState {
  salesList: Sale[];
  selectedSale: Sale | undefined;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  sort: string[];
  salesVersion: number;
  loading: boolean;
  error: string | null;
}

export interface SaleItemsState {
  saleItemsList: SaleItem[];
  selectedSale: SaleItem | undefined;
}

export interface ShippingsState {
  shippingsList: Shipping[];
  selectedShipping: Shipping | undefined;
  loading: boolean;
  error: string | null;
}

export interface TermOfPaymentState {
  paymentTermsList: TermOfPayment[];
  selectedPaymentTerm: TermOfPayment | undefined;
  loading: boolean;
  error: string | null;
}

export interface TaxRatesState {
  taxRatesList: TaxRate[];
  activeTaxRatesList: TaxRate[];
  selectedTaxRate: TaxRate | undefined;
  defaultTaxRate: TaxRate | undefined;
  loading: boolean;
  error: string | null;
}

export interface DiscountRatesState {
  discountRatesList: DiscountRate[];
  activeDiscountRatesList: DiscountRate[];
  selectedDiscountRate: DiscountRate | undefined;
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
