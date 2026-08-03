import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/auth-context";

export function ProtectedRoute(): JSX.Element {
  const { authenticated } = useAuth();
  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
