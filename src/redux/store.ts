import type { Action, ThunkAction } from "@reduxjs/toolkit"
import { combineSlices, configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { productsSlice } from "../features/products/productsSlice";
import { authSlice } from "../features/auth/authSlice";
import { customersSlice } from "../features/customers/customersSlice";
import { productCategoriesSlice } from "../features/products/productCategoriesSlice";
import { productFilesSlice } from "../features/products/productFilesSlice";
import { purchasesSlice } from "../features/purchases/purchasesSlice";


const rootReducer = combineSlices(productsSlice, authSlice, customersSlice, productCategoriesSlice, productFilesSlice, purchasesSlice)

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
    middleware: getDefaultMiddleware => {
      return getDefaultMiddleware().concat()
    },
    preloadedState,
  })
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