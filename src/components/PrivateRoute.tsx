import { Navigate } from "react-router-dom";
import { JSX } from "react";
import { useAppSelector } from "../redux/hooks";
import { selectIsAuthenticated, selectUser } from "../features/auth/authSlice";

interface PrivateRouteProps {
  children: JSX.Element;
  role?: "USER" | "ADMIN";
}

export default function PrivateRoute({ children, role }: PrivateRouteProps) {
  

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />; // если роль не совпадает
  }

  return children;
}
