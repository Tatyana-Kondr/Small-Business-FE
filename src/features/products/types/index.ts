
export interface Product {
  id: number;
  name: string;
  article: string;
  vendorArticle: string | null;
  purchasingPrice: number | null;
  markupPercentage: number | null;
  sellingPrice: number | null;
  unitOfMeasurement: UnitOfMeasurement;
  weight: number | null;
  newDimensions: Dimensions | null;
  productCategory: ProductCategory;
  description: string | null;
  customsNumber: string | null;
  createdDate: string;
  dateOfLastPurchase: string | null;
  lastModifiedDate: string | null;
  storageLocation: string | null;
  hasPhoto: boolean;
  quantity: number;
}

export interface ProductPickDto {
  id: number;
  name: string;
  article: string;
  vendorArticle: string | null;
  purchasingPrice: number | null;
  sellingPrice: number | null;
  categoryId: number;
}

export interface ProductCategory {
  id: number;
  name: string;
  artName: string;
}

export interface Dimensions {
  width?: number;
  height?: number;
  length?: number;
  diameter?: number;
}

export interface ProductFile {
  id: number;
  productId?: number;
  product?: Product;
  originFileName: string;
  fileUrl: string;
  position?: number | null;
}

export interface UnitOfMeasurement {
  id: number;
  name: string;
}

export interface NewProductCategoryDto {
  name: string;
  artName: string;
}

export interface NewProductDto {
  name: string;
  vendorArticle: string;
  purchasingPrice: number | null;
  markupPercentage: number | null;
  sellingPrice: number | null;
  productCategoryId: number;
  unitOfMeasurementId: number;
  storageLocation?: string;
}

export interface UpdateProductArticleDto{
  article: string;
}

export interface NewUnitOfMeasurementDto {
  name: string;
}

export interface UpdateProductDto {
  name: string;
  article: string;
  vendorArticle?: string;
  purchasingPrice: number | null;
  markupPercentage: number | null;
  sellingPrice: number | null;
  unitOfMeasurementId: number;
  weight?: number;
  newDimensions?: Dimensions;
  productCategoryId: number;
  description?: string;
  customsNumber?: string;
  storageLocation?: string;
}

export interface ProductsState {
  productsPaged: Product[];
  selectedProduct: Product | undefined;
  pickProducts: ProductPickDto[];
  pickLoading: boolean;
  pickError: string | null;
  pickLastQuery: { searchTerm: string; categoryId: number | null } | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  currentSort: string,
  productsVersion: number;
  loading: boolean;
  error: string | null;
}

export interface ProductCategoriesState {
  productCategoriesList: ProductCategory[];
  selectedProductCategory?: ProductCategory;
  loading: boolean;
  error: string | null;
}

export interface ProductFilesState {
  files: ProductFile[];
}

export interface UnitsOfMeasurementState {
  unitsList: UnitOfMeasurement[];
  selectedUnit: UnitOfMeasurement | undefined;
  loading: boolean;
  error: string | null;
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