
export interface Product{
    id: number
    name: string
    article: string
    vendorArticle: string
    purchasingPrice: number
    markupPercentage: number
    sellingPrice: number
    unitOfMeasurement: UnitOfMeasurement
    weight: number
    newDimensions: Dimensions
    productCategory: ProductCategory
    description: string
    customsNumber: string
    createdDate: string
    dateOfLastPurchase: string
    lastModifiedDate: string
    storageLocation: string
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
  diameter: number;
}

export interface ProductFile {
  id: number;
  productId?: number; 
  product?: Product;
  originFileName: string;
  fileUrl: string;
}

export interface UnitOfMeasurement{
    id: number;
    name: string;  
}

export interface NewProductCategoryDto{
  name: string;
  artName: string;
}

export interface NewProductDto{
  name: string;
  vendorArticle: string
  purchasingPrice: number
  markupPercentage: number
  sellingPrice: number
  productCategory: ProductCategory
  unitOfMeasurementId?: number
  unitOfMeasurement?: UnitOfMeasurement
  storageLocation?: string
}

export interface NewUnitOfMeasurementDto{
    name: string;  
}

export interface UpdateProductDto {
  name?: string;
  article?: string;
  vendorArticle?: string;
  purchasingPrice?: number;
  markupPercentage?: number;
  sellingPrice?: number;
  unitOfMeasurementId?: number;
  unitOfMeasurement?: UnitOfMeasurement;
  weight?: number;
  newDimensions?: Dimensions;
  productCategory?: ProductCategory;
  description?: string;
  storageLocation?: string
  customsNumber?: string;
  // Добавляем индексную сигнатуру
  [key: string]: string | number | Dimensions | ProductCategory | UnitOfMeasurement | undefined;
}

export interface ProductsState {
  productsPaged: Product[];
  productsAll: Product[],
  selectedProduct: Product | undefined;
  totalPages: number;
  currentPage: number;
  currentSort: string,
  loading: boolean;          
  error: string | null;
}

export interface ProductCategoriesState {
  productCategoriesList: ProductCategory[];
  selectedProductCategory: ProductCategory | undefined;
}

export interface ProductFilesState {
  files: ProductFile[];
}

export interface UnitsOfMeasurementState{
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