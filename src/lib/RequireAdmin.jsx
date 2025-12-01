import { Navigate, useLocation } from "react-router-dom";
import { useAuth, isAdmin } from "@/lib/AuthContext";

export function RequireAdmin({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  // Not logged in → go to /auth and come back after login
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // Logged in but not admin → send to home
  if (!isAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
