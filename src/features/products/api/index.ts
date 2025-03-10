import { NewProductCategoryDto, NewProductDto, PaginatedResponse, Product, ProductCategory, UpdateProductDto } from "../types"

export async function fetchProducts(page: number, size: number = 15): Promise<PaginatedResponse<Product>> {
  const res = await fetch(`/api/products?page=${page}&size=${size}`);
  if (!res.ok) {
    throw new Error("Ошибка загрузки продуктов");
  }
  return res.json();
}

export async function fetchAddProduct(newProduct: NewProductDto): Promise<Product> {
  try {
    const response = await fetch(`/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProduct),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} - ${errorData.message || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to add product:', error);
    throw error;
  }
}

export async function fetchEditProduct({id, updateProductDto}: {id: number, updateProductDto: UpdateProductDto}): Promise<Product> {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateProductDto)
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to update product:', error);
    throw error;
  }
}

export async function fetchProduct(id: number): Promise<Product> {
  try {
    const url = `/api/products/${id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const product = await response.json();
    return product;
  } catch (error) {
    console.error('Failed to fetch product by ID:', error);
    throw error;
  }
}

export async function fetchDeleteProduct(id: number): Promise<void> {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    console.error("Ошибка при удалении продукта:", error);
    throw error;
  }
}



//Фичи для категории продукта
export async function fetchAddProductCategory(newCategory: NewProductCategoryDto): Promise<ProductCategory> {
  try {
    const response = await fetch('/api/product-categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newCategory)
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to add product category:', error);
    throw error;
  }
}

export async function fetchProductCategory(id: number): Promise<ProductCategory> {
  try {
    const response = await fetch(`/api/product-categories/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    return await response.json(); // Получаем JSON-ответ с категорией
  } catch (error) {
    console.error('Failed to fetch product category by ID:', error);
    throw error;
  }
}

export async function fetchEditProductCategory({id, newProductCategoryDto}: {id: number, newProductCategoryDto: NewProductCategoryDto}): Promise<ProductCategory> {
  try {
    const response = await fetch(`/api/product-categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newProductCategoryDto)
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to update product category:', error);
    throw error;
  }
}


export async function fetchDeleteProductCategory(id: number): Promise<void> {
  try {
    const response = await fetch(`/api/product-categories/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    console.error("Ошибка при удалении категории:", error);
    throw error;
  }
}


export async function fetchProductCategories(): Promise<ProductCategory[]> {
  const res = await fetch(`api/product-categories`);
  if (!res.ok) {
    throw new Error("Fehler beim laden product categories");
  }
  return res.json();
}



// Фичи для Фото и файлов
export async function fetchProductFiles(productId: number) {
  try {
    const response = await fetch(`/api/products/${productId}/photos`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Fehler: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fehler beim Abrufen von Produktdateien:", error);
    throw error;
  }
}

export async function fetchUploadProductFile(productId: number, file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`/api/products/${productId}/files`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Fehler: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fehler beim Hochladen der Datei:", error);
    throw error;
  }
}

export async function fetchDeleteProductFile(fileId: number) {
  try {
    const response = await fetch(`/api/products/photos/${fileId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Fehler: ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    console.error("Fehler beim Löschen der Datei:", error);
    throw error;
  }
}
