
export interface Product{
    id: number
    name: string
    article: string
    vendorArticle: string
    purchasingPrice: number
    sellingPrice: number
    unitOfMeasurement: string
    weight: number
    newDimensions: Dimensions
    productCategory: ProductCategory
    description: string
    customsNumber: string
    createdDate: string
    dateOfLastPurchase: string
    lastModifiedDate: string
}

export interface ProductCategory {
  id: number;
  name: string;
  artName: string;
}

export interface Dimensions {
  height: number;
  length: number;
  width: number;
}

export interface ProductsState {
  productsList: Product[];
  selectedProduct: Product | undefined;
  totalPages: number;
  currentPage: number;
}

// Интерфейс для ответа с пагинацией
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