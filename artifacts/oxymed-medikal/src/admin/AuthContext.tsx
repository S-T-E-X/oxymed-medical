import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AdminUser | null>(() => {
    const raw = localStorage.getItem("admin_user");
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  const navigate = useNavigate();

  setAuthTokenGetter(() => localStorage.getItem(TOKEN_KEY));

  const navigateRef = useRef(navigate);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

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

  const logoutRef = useRef(logout);
  useEffect(() => { logoutRef.current = logout; }, [logout]);

  const authFetch = useCallback(async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    const currentToken = localStorage.getItem(TOKEN_KEY);
    const headers = new Headers(init?.headers);
    if (currentToken) {
      headers.set("Authorization", `Bearer ${currentToken}`);
    }
    const res = await fetch(input, { ...init, headers });
    if (res.status === 401) {
      logoutRef.current();
      toast.error("Oturum süreniz doldu. Lütfen tekrar giriş yapın.");
      navigateRef.current("/admin/login", { replace: true });
    }
    return res;
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
