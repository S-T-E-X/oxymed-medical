import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// The session token now lives exclusively in an HttpOnly cookie set by the
// API — it is never stored in localStorage and never readable from JS.
// Only the (non-secret) user profile is kept locally for instant UI state.
const USER_KEY = "admin_user";

interface AdminUser {
  id: number;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: AdminUser | null;
  login: (user: AdminUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  const navigate = useNavigate();

  const navigateRef = useRef(navigate);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  const login = useCallback((newUser: AdminUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    // Clear the HttpOnly session cookie server-side (best-effort — local
    // state is dropped regardless).
    void fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
    localStorage.removeItem(USER_KEY);
    // Clean up token from older localStorage-based sessions.
    localStorage.removeItem("admin_token");
    setUser(null);
  }, []);

  const logoutRef = useRef(logout);
  useEffect(() => { logoutRef.current = logout; }, [logout]);

  const authFetch = useCallback(async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    // Auth rides on the HttpOnly session cookie; no Authorization header.
    const res = await fetch(input, { ...init, credentials: "include" });
    if (res.status === 401) {
      logoutRef.current();
      toast.error("Oturum süreniz doldu. Lütfen tekrar giriş yapın.");
      navigateRef.current("/admin/login", { replace: true });
    }
    return res;
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
