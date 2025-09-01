import { useEffect } from "react"; 
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logout, refresh, selectSessionChecked } from "../features/auth/authSlice";

export function useSessionCheck() {
  const dispatch = useAppDispatch();
  const isSessionChecked = useAppSelector(selectSessionChecked);
    const status = useAppSelector(state => state.auth.status);

   useEffect(() => {
    if (!isSessionChecked && status === "idle") {
      // Проверяем сессию только один раз при загрузке
      dispatch(refresh())
        .unwrap()
        .catch(() => {
          dispatch(logout());
        });
    }
  }, [dispatch, isSessionChecked, status]);
}

