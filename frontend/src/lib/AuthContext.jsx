import React from "react";

const KEY = "app:user"; // e.g. { id, name, role: "user"|"admin" }
//For testing purposes
const FORCE_ADMIN = false;

function readUser() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeUser(user) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

const AuthCtx = React.createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(readUser);

  // For testing
  React.useEffect(() => {
    if (FORCE_ADMIN) {
      const dev = { id: "dev", name: "Dev Admin", role: "admin" };
      writeUser(dev);
      setUser(dev);
    }
  }, []);

  const loginAs = (nextUser) => {
    writeUser(nextUser);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };

  const value = React.useMemo(() => ({ user, loginAs, logout }), [user]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export function isAdmin(user) {
  return !!user && user.role === "admin";
}
