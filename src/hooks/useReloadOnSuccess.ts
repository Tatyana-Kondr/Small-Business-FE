// hooks/useReloadOnSuccess.ts
import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch } from "../redux/hooks";
import { getPurchases } from "../features/purchases/purchasesSlice";
import { getSales } from "../features/sales/salesSlice";
import { getProductions } from "../features/productions/productionsSlice";

export function useReloadOnSuccess() {
  const dispatch = useAppDispatch();
  const location = useLocation();

  return useCallback(() => {
    if (location.pathname.startsWith("/purchases")) {
      // Передаём параметры пагинации по умолчанию
      dispatch(getPurchases({ page: 0, size: 15 }));
    }
    if (location.pathname.startsWith("/sales")) {
      dispatch(getSales({ page: 0, size: 15 }));
    }
    if (location.pathname.startsWith("/payments")) {
      dispatch(getSales({ page: 0, size: 15 }));
    }
   if (location.pathname.startsWith("/kunden")) {
      dispatch(getSales({ page: 0, size: 15 }));
    }
    if (location.pathname.startsWith("/lieferanten")) {
      dispatch(getSales({ page: 0, size: 15 }));
    } 
    if (location.pathname.startsWith("/productions")) {
      dispatch(getProductions({ page: 0, size: 15 }));
    } 
  }, [dispatch, location.pathname]);
}
