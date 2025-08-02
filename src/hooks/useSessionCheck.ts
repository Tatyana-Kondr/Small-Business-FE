import { useEffect } from "react"; 
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { RootState } from "../redux/store";
import { user } from "../features/auth/authSlice";

export const useSessionCheck = () => {
  const dispatch = useAppDispatch();
  const isSessionChecked = useAppSelector((state: RootState) => state.auth.isSessionChecked);

  useEffect(() => {
    if (!isSessionChecked) {
      dispatch(user());
    }
  }, [dispatch, isSessionChecked]);
};

