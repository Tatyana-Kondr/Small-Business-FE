import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { ReactNode } from "react";
import { selectIsAuthenticated, selectSessionChecked } from "../features/auth/authSlice";
import Spinner from "./Spinner";

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isSessionChecked = useAppSelector(selectSessionChecked);

  if (!isSessionChecked) return <Spinner />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}