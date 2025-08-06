import CreateCustomer from "../features/customers/components/CreateCustomer";
import CreatePayment from "../features/payments/components/CreatePayment";
import CreateProduct from "../features/products/components/CreateProduct";
import CreatePurchasePage from "../features/purchases/components/CreatePurchasePage";
import CreateSalePage from "../features/sales/components/CreateSalePage";

export const modalRegistry: Record<string, React.FC<any>> = {
  createPayment: CreatePayment,
  createCustomer: CreateCustomer,
  createProduct: CreateProduct,
  createPurchase: CreatePurchasePage,
  createSale: CreateSalePage,
};


