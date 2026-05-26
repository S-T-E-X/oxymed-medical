import { type ReactNode } from "react";
import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  Box,
  Building2,
  Eye,
  FileText,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Package,
  Settings,
  ShieldCheck,
  UserRound,
  Wrench,
  X,
  Layers,
  ClipboardList,
  Gauge,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "./AuthContext";

const navItems = [
  { label: "Kontrol Paneli", icon: LayoutDashboard, to: "/admin/dashboard" },
  { label: "Slider Yönetimi", icon: ImageIcon, to: "/admin/sliders" },
  { label: "Kataloglar", icon: BookOpen, to: "/admin/kataloglar" },
  { label: "Ürünler", icon: Box, to: "/admin/products" },
  { label: "Haberler", icon: Newspaper, to: "/admin/haberler" },
  { label: "Referanslar", icon: Wrench, to: "/admin/referanslar" },
  { label: "Kurumsal", icon: Building2, to: "/admin/kurumsal" },
  { label: "Medya", icon: Package, to: "/admin/medya" },
  { label: "Site Ayarları", icon: Settings, to: "/admin/ayarlar" },
  { label: "Kat Kontrol Panosu", icon: Gauge, to: "/admin/kat-kontrol-panosu" },
];

const warrantyNavItems = [
  { label: "Garanti Yönetimi", icon: ShieldCheck, to: "/admin/garanti" },
];

const stockNavItems = [
  { label: "Ürün Stok", icon: Layers, to: "/admin/stok/urunler" },
  { label: "Malzeme Stok", icon: ClipboardList, to: "/admin/stok/malzeme" },
];

const quoteNavItems = [
  { label: "Teklif Formları", icon: FileText, to: "/admin/teklif-formlari" },
  { label: "Teklif Talepleri", icon: UserRound, to: "/admin/teklifler" },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col overflow-y-auto bg-[#020f1d]">
      <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-white/8 px-5">
        <img src="/assets/brand/oxymed-admin-logo.webp" alt="Oxymed Admin" className="h-8 w-auto" onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }} />
        <span className="text-sm font-bold text-white lg:hidden">Oxymed Admin</span>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Ana Menü</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-white/6 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
        <p className="mb-2 mt-5 px-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Garanti &amp; Servis</p>
        {warrantyNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-white/6 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
        <p className="mb-2 mt-5 px-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Teklif Sistemi</p>
        {quoteNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-white/6 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
        <p className="mb-2 mt-5 px-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Stok Durumu</p>
        {stockNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-white/6 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-white/8 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">{user?.name ?? "Admin"}</p>
            <p className="truncate text-[11px] text-slate-500">{user?.email ?? ""}</p>
          </div>
          <button onClick={handleLogout} className="text-slate-500 transition hover:text-white" title="Çıkış">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
      <button onClick={onMenuClick} className="text-slate-600 lg:hidden">
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex flex-1 items-center justify-end gap-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 shadow-sm hover:border-blue-300 hover:text-blue-600" title="Siteyi görüntüle">
          <Eye className="h-4 w-4" />
        </a>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white" title={user?.email}>
          {user?.name?.[0]?.toUpperCase() ?? "A"}
        </div>
        <button onClick={handleLogout} className="hidden text-slate-500 transition hover:text-slate-800 sm:block" title="Çıkış">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children ? <>{children}</> : <Outlet />;
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 h-full">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
      <div className="flex min-h-screen">
        <div className="hidden lg:block">
          <div className="fixed top-0 left-0 h-full">
            <Sidebar />
          </div>
        </div>
        <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden lg:ml-[220px]">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <div className="flex-1">
            <Outlet />
          </div>
          <footer className="bg-[#020f1d] px-4 py-4 text-xs font-medium text-slate-400 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <p>© 2024 Oxymed Medikal Admin Paneli</p>
              <p className="text-slate-500">v2.0.0</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
