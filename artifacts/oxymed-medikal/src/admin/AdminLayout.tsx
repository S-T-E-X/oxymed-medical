import { type ReactNode } from "react";
import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  Award,
  BookOpen,
  Box,
  Building2,
  Eye,
  Factory,
  FileText,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
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
  ClipboardCheck,
  Users,
  SlidersHorizontal,
  FlaskConical,
  ChevronDown,
  ChevronRight,
  PanelBottom,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "./AuthContext";

const navItems = [
  { label: "Kontrol Paneli", icon: LayoutDashboard, to: "/admin/dashboard" },
  { label: "Slider Yönetimi", icon: ImageIcon, to: "/admin/sliders" },
  { label: "Sayfa Bannerları", icon: SlidersHorizontal, to: "/admin/sayfa-bannerlari" },
  { label: "Kataloglar", icon: BookOpen, to: "/admin/kataloglar" },
  { label: "Footer Yönetimi", icon: PanelBottom, to: "/admin/footer" },
  { label: "Ürünler", icon: Box, to: "/admin/products" },
  { label: "Amalgam Separatörü", icon: Settings, to: "/admin/urunler/amalgam-separator" },
  { label: "Medikal Vakum Santrali", icon: Settings, to: "/admin/urunler/dental-vakum-pompasi" },
  { label: "Dental Vakum Sistemi", icon: Settings, to: "/admin/urunler/dental-vakum-sistemi" },
  { label: "Haberler", icon: Newspaper, to: "/admin/haberler" },
  { label: "Referanslar", icon: Wrench, to: "/admin/referanslar" },
  { label: "Kurumsal", icon: Building2, to: "/admin/kurumsal" },
  { label: "Sertifikalar", icon: Award, to: "/admin/sertifikalar" },
  { label: "Medya", icon: Package, to: "/admin/medya" },
  { label: "Site Ayarları", icon: Settings, to: "/admin/ayarlar" },
  { label: "Kat Kontrol Panosu", icon: Gauge, to: "/admin/kat-kontrol-panosu" },
];

const warrantyNavItems = [
  { label: "Garanti Yönetimi", icon: ShieldCheck, to: "/admin/garanti" },
  { label: "Servis Raporları", icon: ClipboardCheck, to: "/admin/servis-raporlari" },
];

const stockNavItems = [
  { label: "Ürün Stok", icon: Layers, to: "/admin/stok/urunler" },
  { label: "Malzeme Stok", icon: ClipboardList, to: "/admin/stok/malzeme" },
];

const productionNavItems = [
  { label: "Üretim Emirleri", icon: Factory, to: "/admin/uretim" },
  { label: "Reçete Yönetimi", icon: FlaskConical, to: "/admin/recete" },
];

const quoteNavItems = [
  { label: "Teklif Formları", icon: FileText, to: "/admin/teklif-formlari" },
  { label: "Ürün Teklif Şablonları", icon: ClipboardList, to: "/admin/urun-teklif-sablonlari" },
  { label: "Teklif Talepleri", icon: UserRound, to: "/admin/teklifler" },
  { label: "E-posta Logları", icon: Mail, to: "/admin/eposta-loglari" },
];

const sidebarSections = [
  {
    key: "main",
    label: "Ana Menü",
    items: [
      ...navItems,
      { label: "E-posta Ayarları", icon: Mail, to: "/admin/ayarlar#smtp" },
    ],
  },
  { key: "warranty", label: "Garanti & Servis", items: warrantyNavItems },
  { key: "quotes", label: "Teklif Sistemi", items: quoteNavItems },
  { key: "production", label: "Üretim", items: productionNavItems },
  { key: "stock", label: "Stok Durumu", items: stockNavItems },
  {
    key: "system",
    label: "Sistem",
    items: [{ label: "Yönetici Hesapları", icon: Users, to: "/admin/kullanicilar" }],
  },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    main: true,
    warranty: true,
    quotes: true,
    production: true,
    stock: true,
    system: true,
  });

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
      <div className="border-b border-white/8 px-3 py-3">
        <div className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5">
          <Search className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Menüde ara..."
            aria-label="Admin menüsünde ara"
            className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-slate-500 hover:text-white"
              aria-label="Aramayı temizle"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <nav className="admin-sidebar-scroll flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {sidebarSections.map((section) => {
          const query = search.trim().toLocaleLowerCase("tr-TR");
          const visibleItems = query
            ? section.items.filter((item) => item.label.toLocaleLowerCase("tr-TR").includes(query))
            : section.items;
          if (query && visibleItems.length === 0) return null;
          const isExpanded = query ? true : expanded[section.key] ?? true;

          return (
            <div key={section.key} className="pt-1">
              <button
                type="button"
                onClick={() => setExpanded((current) => ({ ...current, [section.key]: !isExpanded }))}
                className="mb-1 flex h-8 w-full items-center gap-1.5 rounded-lg px-2 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
                aria-expanded={isExpanded}
              >
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                <span>{section.label}</span>
                <span className="ml-auto text-[9px] font-semibold tracking-normal text-slate-600">{visibleItems.length}</span>
              </button>
              {isExpanded && (
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
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
                </div>
              )}
            </div>
          );
        })}
        {search.trim() && sidebarSections.every((section) =>
          !section.items.some((item) => item.label.toLocaleLowerCase("tr-TR").includes(search.trim().toLocaleLowerCase("tr-TR"))),
        ) && (
          <p className="px-2 py-5 text-center text-xs text-slate-500">Sonuç bulunamadı</p>
        )}
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
