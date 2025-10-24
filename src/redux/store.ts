import type { Action, ThunkAction } from "@reduxjs/toolkit"
import { combineSlices, configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { productsSlice } from "../features/products/productsSlice";
import { authSlice } from "../features/auth/authSlice";
import { customersSlice } from "../features/customers/customersSlice";
import { productCategoriesSlice } from "../features/products/productCategoriesSlice";
import { productFilesSlice } from "../features/products/productFilesSlice";
import { purchasesSlice } from "../features/purchases/purchasesSlice";
import { salesSlice } from "../features/sales/salesSlice";
import { paymentsSlice } from "../features/payments/paymentsSlice";
import { paymentMethodsSlice } from "../features/payments/paymentMethodsSlice";
import { paymentProcessesSlice } from "../features/payments/paymentProcessesSlice";
import { modalSlice } from "../modal/modalSlice";
import { shippingsSlice } from "../features/sales/shippingsSlice";
import { companiesSlice } from "../features/company/companiesSlice";
import { ProductionsSlice } from "../features/productions/productionsSlice";
import { unitsOfMeasurementSlice } from "../features/products/unitsOfMeasurementSlice";
import { TypeOfDocumentSlice } from "../features/purchases/typeOfDocumentSlice";


const rootReducer = combineSlices(productsSlice, 
                                  authSlice,
                                  customersSlice, 
                                  productCategoriesSlice,       
                                  productFilesSlice, 
                                  purchasesSlice, 
                                  salesSlice,
                                  paymentsSlice,
                                  paymentMethodsSlice,
                                  paymentProcessesSlice,
                                  shippingsSlice,
                                  companiesSlice,
                                  ProductionsSlice,
                                  unitsOfMeasurementSlice,
                                  TypeOfDocumentSlice,
                                  modalSlice,
)

// TypeScript-оператор, который позволяет получить тип возвращаемого значения функции. 
// В данном случае, typeof rootReducer даёт тип самой функции редьюсера, 
// а ReturnType извлекает тип того, что эта функция возвращает 
// (то есть тип состояния, которое хранит Redux Store)
export type RootState = ReturnType<typeof rootReducer>;

// makeStore упрощает настройку Store и подключение middleware для работы с API, 
// что ускоряет разработку и поддержание приложения.
export const makeStore = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    reducer: rootReducer,
    // Добавление промежуточного программного обеспечения api позволяет выполнять кэширование,
    //  аннулирование, опрос и другие полезные функции "rtk-запроса".
   middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          
          ignoredPaths: ["modal.props", "meta.arg.file"],
          ignoredActionPaths: ["payload.props"],

          // игнорируем экшены загрузки файла
          ignoredActions: [
            "productFiles/uploadProductFile/pending",
            "productFiles/uploadProductFile/fulfilled",
            "productFiles/uploadProductFile/rejected",
          ],
        },
      }),
    preloadedState,
  });

  // configure listeners using the provided defaults
  // optional, but required for `refetchOnFocus`/`refetchOnReconnect` behaviors
  setupListeners(store.dispatch)
  return store
}

export const store = makeStore()

// Infer the type of `store`
export type AppStore = typeof store
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"]
export type AppThunk<ThunkReturnType = void> = ThunkAction<ThunkReturnType, RootState, unknown, Action>