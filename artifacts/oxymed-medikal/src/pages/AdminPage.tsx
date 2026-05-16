import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bell,
  Box,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  ClipboardList,
  Cloud,
  Database,
  Edit3,
  Eye,
  FileText,
  Folder,
  Gauge,
  Home,
  ImageIcon,
  Languages,
  LayoutDashboard,
  LineChart,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Package,
  RefreshCw,
  Server,
  Settings,
  ShieldCheck,
  Star,
  TrendingUp,
  UserRound,
  UsersRound,
  Wrench
} from "lucide-react";

type NavItem = { label: string; icon: LucideIcon; active?: boolean };
type StatItem = { label: string; value: string; change: string; icon: LucideIcon; tone: string };
type OfferItem = { title: string; subtitle: string; date: string; status: string; statusClass: string };

const mainNav: NavItem[] = [
  { label: "Kontrol Paneli", icon: LayoutDashboard, active: true },
  { label: "Anasayfa Yönetimi", icon: Home },
  { label: "Kurumsal Yönetimi", icon: Building2 },
  { label: "Ürünler Yönetimi", icon: Box },
  { label: "Referanslar / Projeler", icon: Wrench },
  { label: "Haberler Yönetimi", icon: Newspaper },
  { label: "Medya Yönetimi", icon: ImageIcon },
  { label: "Teklifler", icon: UserRound },
  { label: "Form & Mesajlar", icon: Mail },
  { label: "Kullanıcılar", icon: UsersRound },
  { label: "SEO Yönetimi", icon: ClipboardList },
  { label: "Ayarlar", icon: Settings }
];

const otherNav: NavItem[] = [
  { label: "Yönlendirmeler", icon: RefreshCw },
  { label: "Çoklu Dil Yönetimi", icon: Languages },
  { label: "Yedekleme", icon: Cloud },
  { label: "Sistem Güncellemeleri", icon: Gauge },
  { label: "Log Kayıtları", icon: FileText }
];

const statItems: StatItem[] = [
  { label: "Toplam Ziyaretçi", value: "12.540", change: "18.2%", icon: Activity, tone: "from-blue-500 to-blue-700" },
  { label: "Teklif Talepleri", value: "86", change: "12.7%", icon: CircleUserRound, tone: "from-emerald-500 to-green-700" },
  { label: "Form / Mesajlar", value: "54", change: "8.6%", icon: Mail, tone: "from-amber-400 to-orange-500" },
  { label: "Haberler", value: "24", change: "14.3%", icon: Newspaper, tone: "from-violet-500 to-purple-700" },
  { label: "Projeler", value: "170", change: "5.5%", icon: Folder, tone: "from-sky-500 to-blue-700" },
  { label: "Ürünler", value: "48", change: "9.1%", icon: Package, tone: "from-rose-500 to-red-600" }
];

const topPages = [
  { label: "Anasayfa", value: "3.842", icon: Home },
  { label: "Ürünler", value: "2.450", icon: Activity },
  { label: "Kurumsal", value: "1.986", icon: Building2 },
  { label: "Yatak Başı Üniteleri", value: "1.540", icon: LineChart },
  { label: "Pendant Sistemleri", value: "1.245", icon: Folder },
  { label: "Teklif Al", value: "1.102", icon: TrendingUp }
];

const offers: OfferItem[] = [
  { title: "Başakşehir Çam ve Sakura Hastanesi", subtitle: "Yatak Başı Ünitesi", date: "24.05.2024 14:32", status: "Yeni", statusClass: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { title: "İstanbul Eğitim ve Araştırma Hastanesi", subtitle: "Pendant Sistemi", date: "24.05.2024 11:15", status: "Yeni", statusClass: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { title: "İzmir Şehir Hastanesi", subtitle: "Medikal Gaz Sistemi", date: "23.05.2024 16:20", status: "İncelendi", statusClass: "bg-amber-50 text-amber-700 ring-amber-200" },
  { title: "Bursa Yüksek İhtisas Hastanesi", subtitle: "Alarm & İzleme Sistemi", date: "23.05.2024 10:05", status: "Teklif Hazır", statusClass: "bg-blue-50 text-blue-700 ring-blue-200" },
  { title: "Konya Numune Hastanesi", subtitle: "Elektrik & Data Sistemleri", date: "22.05.2024 15:45", status: "Arşivlendi", statusClass: "bg-slate-50 text-slate-700 ring-slate-200" }
];

const quickActions = [
  { label: "Yeni Ürün Ekle", icon: Box },
  { label: "Yeni Proje Ekle", icon: Folder },
  { label: "Yeni Haber Ekle", icon: Newspaper },
  { label: "Slider Düzenle", icon: ImageIcon },
  { label: "Referans Ekle", icon: Star },
  { label: "Sayfa Düzenle", icon: Edit3 },
  { label: "SEO Ayarları", icon: LineChart },
  { label: "Site Ayarları", icon: Settings }
];

const recentContent = [
  { title: "Premium Yatak Başı Ünitesi", date: "24.05.2024 12:40", image: "/assets/images/product-bed-head-unit.png" },
  { title: "Delüks Yatak Başı Ünitesi", date: "23.05.2024 09:15", image: "/assets/images/product-pendant-system.png" },
  { title: "Medikal Gaz Alarm Paneli", date: "22.05.2024 16:30", image: "/assets/images/product-medical-gas.png" },
  { title: "Ameliyathane Pendant Sistemi", date: "21.05.2024 11:20", image: "/assets/images/corporate-production-floor.png" }
];

const systemStatus = [
  { label: "Web Sitesi", value: "Çevrimiçi", icon: ShieldCheck },
  { label: "Sunucu", value: "Çevrimiçi", icon: Server },
  { label: "Veritabanı", value: "Çevrimiçi", icon: Database },
  { label: "SSL Sertifikası", value: "Aktif", icon: CheckCircle2 },
  { label: "Yedekleme", value: "Güncel", icon: Gauge, detail: "Son yedekleme: 24.05.2024 03:00" },
  { label: "Güvenlik Duvarı", value: "Aktif", icon: ShieldCheck }
];

const siteStructure = [
  { label: "Anasayfa", meta: "28 bölüm", icon: FileText },
  { label: "Kurumsal", meta: "6 sayfa", icon: Building2 },
  { label: "Ürünler", meta: "6 kategori", icon: Package },
  { label: "Referanslar", meta: "170 proje", icon: UsersRound },
  { label: "Haberler", meta: "24 haber", icon: Newspaper },
  { label: "İletişim", meta: "1 sayfa", icon: Mail }
];

const chartPoints = [
  [22, 170], [65, 125], [108, 146], [151, 162], [194, 140],
  [237, 124], [280, 144], [323, 161], [366, 140], [409, 151],
  [452, 157], [495, 132], [538, 108], [581, 120], [624, 89],
  [667, 104], [710, 121], [753, 111], [796, 96], [839, 84], [882, 157]
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          <AdminTopbar />
          <section className="flex-1 px-4 py-7 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <h1 className="text-[26px] font-bold tracking-normal text-slate-950">Kontrol Paneli</h1>
                  <p className="mt-1 text-sm font-medium text-slate-500">Genel istatistikler ve site performansı</p>
                </div>
                <button className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm shadow-slate-200/50 sm:w-auto">
                  <CalendarDays className="h-4 w-4 text-slate-600" />
                  01 Mayıs 2024 - 24 Mayıs 2024
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
                {statItems.map((item) => <StatCard key={item.label} item={item} />)}
              </div>

              <div className="mt-6 grid gap-5 xl:grid-cols-[1.62fr_0.9fr_1fr]">
                <VisitorChart />
                <TopPages />
                <OffersPanel />
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_0.85fr_0.75fr_1fr]">
                <QuickActions />
                <RecentContent />
                <SystemStatus />
                <StorageUsage />
              </div>

              <SiteStructure />
            </div>
          </section>
          <footer className="bg-[#020f1d] px-4 py-5 text-xs font-medium text-slate-300 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p>© 2024 Oxymed Medikal Admin Paneli. Tüm hakları saklıdır.</p>
              <p className="text-slate-500">v2.4.1 — Son güncelleme: 24.05.2024</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

function AdminSidebar() {
  return (
    <aside className="hidden w-[220px] shrink-0 flex-col overflow-y-auto bg-[#020f1d] lg:flex">
      <div className="flex h-[60px] shrink-0 items-center border-b border-white/8 px-5">
        <img src="/assets/brand/oxymed-admin-logo.webp" alt="Oxymed Admin" className="h-8 w-auto" />
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        <p className="mb-2 px-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Ana Menü</p>
        {mainNav.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href="#"
              className={`flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold transition ${
                item.active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-white/6 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </a>
          );
        })}
        <p className="mb-2 mt-5 px-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Sistem</p>
        {otherNav.map((item) => {
          const Icon = item.icon;
          return (
            <a key={item.label} href="#" className="flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold text-slate-400 transition hover:bg-white/6 hover:text-white">
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </a>
          );
        })}
      </nav>
      <div className="border-t border-white/8 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">A</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">Admin</p>
            <p className="truncate text-[11px] text-slate-500">admin@oxymed.com.tr</p>
          </div>
          <button className="text-slate-500 transition hover:text-white">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function AdminTopbar() {
  return (
    <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
      <button className="text-slate-600 lg:hidden">
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex flex-1 items-center justify-end gap-3">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 shadow-sm">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 shadow-sm">
          <Eye className="h-4 w-4" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">A</div>
      </div>
    </header>
  );
}

function StatCard({ item }: { item: StatItem }) {
  const Icon = item.icon;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600">{item.label}</p>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${item.tone} text-white shadow-sm`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-950">{item.value}</p>
      <p className="mt-1.5 text-[12px] font-semibold text-emerald-600">+{item.change} bu ay</p>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <h2 className="text-sm font-bold text-slate-950">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function VisitorChart() {
  const polyline = chartPoints.map((p) => p.join(",")).join(" ");
  const area = `M ${chartPoints[0].join(",")} ${chartPoints.slice(1).map((p) => `L ${p.join(",")}`).join(" ")} L 882,230 L 22,230 Z`;

  return (
    <Panel title="Ziyaretçi Trafiği" action={
      <div className="flex items-center gap-2">
        {["7G", "30G", "90G"].map((period, index) => (
          <button key={period} className={`h-7 rounded px-3 text-xs font-bold ${index === 1 ? "bg-blue-600 text-white" : "text-slate-600"}`}>{period}</button>
        ))}
      </div>
    }>
      <div className="px-5 py-3">
        <svg viewBox="0 0 905 235" className="w-full" aria-hidden="true">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#areaGrad)" />
          <polyline points={polyline} fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinejoin="round" />
          {chartPoints.map((p, i) => (i % 4 === 0 ? <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#2563eb" /> : null))}
        </svg>
      </div>
    </Panel>
  );
}

function TopPages() {
  return (
    <Panel title="En Çok Ziyaret Edilen Sayfalar">
      <div className="space-y-2 px-5 py-3">
        {topPages.map((page) => {
          const Icon = page.icon;
          return (
            <div key={page.label} className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3 text-sm font-semibold text-slate-700">
                <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                <span className="truncate">{page.label}</span>
              </div>
              <span className="font-bold text-slate-950">{page.value}</span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function OffersPanel() {
  return (
    <Panel title="Son Teklif Talepleri" action={<button className="text-xs font-bold text-blue-600">Tümü</button>}>
      <div className="px-5 py-3">
        {offers.map((offer) => (
          <div key={`${offer.title}-${offer.date}`} className="flex gap-3 border-b border-slate-100 py-3 last:border-b-0">
            <FileText className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h3 className="truncate text-sm font-bold text-slate-900">{offer.title}</h3>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${offer.statusClass}`}>{offer.status}</span>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-600">{offer.subtitle}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{offer.date}</p>
            </div>
          </div>
        ))}
        <button className="mt-3 h-10 w-full rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm">Tüm Teklifleri Görüntüle</button>
      </div>
    </Panel>
  );
}

function QuickActions() {
  return (
    <Panel title="Hızlı İşlemler">
      <div className="grid grid-cols-2 gap-3 p-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button key={action.label} className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-left text-xs font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50">
              <Icon className="h-5 w-5 shrink-0 text-blue-600" />
              <span className="truncate">{action.label}</span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

function RecentContent() {
  return (
    <Panel title="Son Eklenen İçerikler">
      <div className="px-4 pb-4">
        <div className="mb-3 flex gap-5 border-b border-slate-100">
          {["Ürünler", "Haberler", "Projeler"].map((tab, index) => (
            <button key={tab} className={`h-10 text-xs font-bold ${index === 0 ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-600"}`}>{tab}</button>
          ))}
        </div>
        <div className="space-y-3">
          {recentContent.map((content) => (
            <div key={content.title} className="flex items-center gap-3">
              <img src={content.image} alt="" className="h-9 w-14 rounded object-cover ring-1 ring-slate-200" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-900">{content.title}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{content.date}</p>
              </div>
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">Aktif</span>
            </div>
          ))}
        </div>
        <button className="mt-4 h-10 w-full rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm">Tümünü Görüntüle</button>
      </div>
    </Panel>
  );
}

function SystemStatus() {
  return (
    <Panel title="Sistem Durumu">
      <div className="space-y-4 p-5">
        {systemStatus.map((status) => {
          const Icon = status.icon;
          return (
            <div key={status.label} className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <Icon className="h-4 w-4 text-slate-600" />
                <div>
                  <p>{status.label}</p>
                  {status.detail ? <p className="mt-1 text-[11px] font-semibold text-slate-500">{status.detail}</p> : null}
                </div>
              </div>
              <span className="text-sm font-bold text-emerald-600">{status.value}</span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function StorageUsage() {
  return (
    <Panel title="Depolama Kullanımı">
      <div className="grid items-center gap-5 p-5 sm:grid-cols-[150px_1fr] xl:grid-cols-1 2xl:grid-cols-[150px_1fr]">
        <div className="relative mx-auto h-[142px] w-[142px]">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="48" fill="none" stroke="#e9edf3" strokeWidth="13" />
            <circle cx="60" cy="60" r="48" fill="none" stroke="#1683f7" strokeDasharray="145 302" strokeLinecap="butt" strokeWidth="13" />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-3xl font-bold leading-none text-slate-950">48%</p>
              <p className="mt-1 text-xs font-bold text-slate-600">Kullanılıyor</p>
            </div>
          </div>
        </div>
        <div className="space-y-4 text-sm">
          <StorageLegend color="bg-blue-400" label="Kullanılan Alan" value="9.62 GB" />
          <StorageLegend color="bg-slate-300" label="Boş Alan" value="10.38 GB" />
          <div className="flex justify-between font-bold text-slate-700">
            <span>Toplam Alan</span>
            <span>20 GB</span>
          </div>
        </div>
        <button className="h-10 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm sm:col-span-2 xl:col-span-1 2xl:col-span-2">Dosya Yöneticisi</button>
      </div>
    </Panel>
  );
}

function StorageLegend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 font-semibold text-slate-700">
      <span className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
}

function SiteStructure() {
  return (
    <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
      <h2 className="mb-5 text-base font-bold text-slate-950">Site Yapısı & Sayfa Yönetimi</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {siteStructure.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{item.label}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">{item.meta}</p>
                </div>
              </div>
              <button className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-bold text-slate-700 shadow-sm">Düzenle</button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
