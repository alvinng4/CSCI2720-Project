import { Navigate, useLocation } from "react-router-dom";
import { getUser, getToken, isAdmin } from "@/lib/AuthHelpers";

export function RequireAdmin({ children }) {
  const user = getUser();
  const token = getToken();
  const location = useLocation();

  // Not logged in (no token) -> go to /auth and come back after login
  if (!token) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // Logged in but not admin -> send to home
  if (!isAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
