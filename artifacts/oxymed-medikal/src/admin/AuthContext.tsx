import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

const TOKEN_KEY = "admin_token";

interface AdminUser {
  id: number;
  email: string;
  name: string;
}

interface AuthContextValue {
  token: string | null;
  user: AdminUser | null;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AdminUser | null>(() => {
    const raw = localStorage.getItem("admin_user");
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  });

  // Register the getter on every render so HMR module reloads never reset it.
  // setAuthTokenGetter just writes a module-level variable — safe to call in render.
  setAuthTokenGetter(() => localStorage.getItem(TOKEN_KEY));

  const login = useCallback((newToken: string, newUser: AdminUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem("admin_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("admin_user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
