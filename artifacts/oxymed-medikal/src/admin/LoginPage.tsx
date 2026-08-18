import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAdminLogin } from "@workspace/api-client-react";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useAdminLogin({
    mutation: {
      onSuccess(data) {
        login(data.user);
        navigate("/admin/dashboard", { replace: true });
      },
      onError(err) {
        setError("E-posta veya şifre hatalı.");
        console.error(err);
      },
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ data: { email: email.trim().toLowerCase(), password } });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020f1d] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Paneli</h1>
          <p className="mt-1 text-sm text-slate-400">Oxymed Medikal yönetim sistemi</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-300">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@oxymed.com.tr"
                className="w-full rounded-lg border border-white/15 bg-white/8 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-300">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/15 bg-white/8 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm font-semibold text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginMutation.isPending ? "Giriş yapılıyor…" : "Giriş Yap"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
