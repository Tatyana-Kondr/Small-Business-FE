
export interface Product{
    id: number
    name: string
    article: string
    vendorArticle: string
    purchasingPrice: number
    sellingPrice: number
    unitOfMeasurement: string
    weight: number
    newDimensions: string
    productCategory: string
    description: string
    customsNumber: string
    createdDate: string
    dateOfLastPurchase: string
    lastModifiedDate: string
}

export interface ProductsState {
    productsList: Product[]
    selectedProduct: Product | undefined
  }