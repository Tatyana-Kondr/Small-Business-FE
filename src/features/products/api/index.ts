import { apiFetch } from "../../../utils/apiFetch";
import { NewProductCategoryDto, NewProductDto, NewUnitOfMeasurementDto, PaginatedResponse, Product, ProductCategory, UnitOfMeasurement, UpdateProductDto } from "../types"

export async function fetchProducts(page: number, size: number, sort = "name", searchTerm = ""): Promise<PaginatedResponse<Product>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("sort", sort);
  if (searchTerm) {
    queryParams.append("search", searchTerm);
  }

  return apiFetch<PaginatedResponse<Product>>(
    `/api/products?${queryParams.toString()}`,
    { auth: true }, 
    "Fehler beim Laden der Produktiste.",
  );
}

export async function fetchAddProduct(newProduct: NewProductDto): Promise<Product> {
   return apiFetch<Product>(`/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify(newProduct),
      auth: true,
    },
  "Fehler beim Hinzufügen des Produkt."
);
}

export async function fetchEditProduct({ id, updateProductDto }: { id: number, updateProductDto: UpdateProductDto }): Promise<Product> {
  return apiFetch<Product>(
    `/api/products/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateProductDto),
      auth: true,
    },
    "Fehler beim Aktualisieren des Produkt."
  );
}

export async function fetchProduct(id: number): Promise<Product> {
  return apiFetch<Product>(
    `/api/products/${id}`,
    { auth: true }, 
    "Fehler beim Laden der Produkt."
  );
}

export async function fetchProductsByCategory(
  categoryId: number,
  page: number,
  size: number,
  sort = "name"
): Promise<PaginatedResponse<Product>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("sort", sort);

  return apiFetch<PaginatedResponse<Product>>(
    `/api/products/category/${categoryId}?${queryParams.toString()}`,
    { auth: true }, 
    "Fehler beim Laden der Produktkategorien."
  );
}

export async function fetchDeleteProduct(id: number): Promise<void> {
  return apiFetch<void>(
    `/api/products/${id}`,
    { method: "DELETE", auth: true },
    `Fehler beim Löschen des Produkt mit ID ${id}.`
  );
}


// === ProductCategory ===
export async function fetchAddProductCategory(newCategory: NewProductCategoryDto): Promise<ProductCategory> {
  return apiFetch<ProductCategory>(
    `/api/product-categories`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCategory),
      auth: true,
    },
    "Fehler beim Hinzufügen des Produktkategorie."
  );
}

export async function fetchProductCategory(id: number): Promise<ProductCategory> {
   return apiFetch<ProductCategory>(
    `/api/product-categories/${id}`,
    { auth: true }, 
    "Fehler beim Laden der Produktkategorie."
  );
}

export async function fetchEditProductCategory({ id, newProductCategoryDto }: { id: number, newProductCategoryDto: NewProductCategoryDto }): Promise<ProductCategory> {
  return apiFetch<ProductCategory>(
    `/api/product-categories/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProductCategoryDto),
      auth: true,
    },
    "Fehler beim Aktualisieren des Produktkategorie."
  );
}


export async function fetchDeleteProductCategory(id: number): Promise<void> {
  return apiFetch<void>(
    `/api/product-categories/${id}`,
    { method: "DELETE", auth: true },
    `Fehler beim Löschen des Produktkategorie mit ID ${id}.`
  );
}


export async function fetchProductCategories(): Promise<ProductCategory[]> {
return apiFetch<ProductCategory[]>(
    `/api/product-categories`,
    {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
      auth: true,
    },
    "Fehler beim Laden der Produktkategorieiste."
  );
}


// Photos and Files
export async function fetchProductFiles(productId: number): Promise<any> {
  return apiFetch<any>(
    `/api/products/${productId}/photos`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      auth: true,
    },
    "Fehler beim Abrufen von Produktdateien"
  );
}

export async function fetchUploadProductFile(productId: number, file: File): Promise<any> {
 const formData = new FormData();
  formData.append("file", file);

  return apiFetch<any>(
    `/api/products/${productId}/files`,
    {
      method: "POST",
      body: formData,
      auth: true,
    },
    "Fehler beim Hochladen der Datei"
  );
}

export async function fetchDeleteProductFile(fileId: number): Promise<void> {
  return apiFetch<void>(
    `/api/products/photos/${fileId}`,
    { method: "DELETE", auth: true },
    "Fehler beim Löschen der Datei."
  );
}

// UnitOfMeasurement
export async function fetchAllUnits(): Promise<UnitOfMeasurement[]> {
   return apiFetch<UnitOfMeasurement[]>(
     `/api/units`,
     {auth: true},
     "Fehler beim Laden der Maßeinheiten."
   );
 }
 
 export async function fetchUnitById(id: number): Promise<UnitOfMeasurement> {
   return apiFetch<UnitOfMeasurement>(
     `/api/units/${id}`,
     {auth: true},
     "Fehler beim Laden der Maßeinheit."
   );
 }
 
 export async function fetchCreateUnit(data: NewUnitOfMeasurementDto): Promise<UnitOfMeasurement> {
   return apiFetch<UnitOfMeasurement>(
     `/api/units`,
     {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(data),
       auth: true, 
     },
     "Fehler beim Erstellen der Maßeinheit."
   );
 }
 
 export async function fetchUpdateUnit(
   id: number,
   data: NewUnitOfMeasurementDto
 ): Promise<UnitOfMeasurement> {
   return apiFetch<UnitOfMeasurement>(
     `/api/units/${id}`,
     {
       method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(data),
       auth: true,
     },
     "Fehler beim Aktualisieren der Maßeinheit."
   );
 }
 
 export async function fetchDeleteUnit(id: number): Promise<void> {
   await apiFetch<void>(
     `/api/units/${id}`,
     { method: "DELETE", auth: true },
     "Fehler beim Löschen der Maßeinheit."
   );
 }