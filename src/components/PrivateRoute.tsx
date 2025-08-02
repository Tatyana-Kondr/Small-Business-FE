import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { JSX } from "react";
import { selectIsAuthenticated } from "../features/auth/authSlice";

interface PrivateRouteProps {
  children: JSX.Element;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}