import { useState } from "react";
import {
  Activity,
  Box,
  Eye,
  FileText,
  MonitorSmartphone,
  Newspaper,
  Package,
  TrendingDown,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useGetAnalyticsSummary,
  useGetDashboardStats,
  useListQuotes,
} from "@workspace/api-client-react";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  to,
}: {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  color: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-blue-200"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color} text-white shadow-sm`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-950">
        {value === undefined ? (
          <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate-100" />
        ) : (
          value.toLocaleString("tr-TR")
        )}
      </p>
    </Link>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  hint,
  trend,
}: {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  color: string;
  hint?: string;
  trend?: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color} text-white shadow-sm`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-950">
        {value === undefined ? (
          <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate-100" />
        ) : (
          value.toLocaleString("tr-TR")
        )}
      </p>
      {trend !== undefined ? (
        <p
          className={`mt-1 flex items-center gap-1 text-xs font-bold ${
            trend >= 0 ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          %{Math.abs(trend).toLocaleString("tr-TR")}
          <span className="font-medium text-slate-400">önceki döneme göre</span>
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs font-medium text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

function QuickActionCard({ label, to, icon: Icon }: { label: string; to: string; icon: React.ElementType }) {
  return (
    <Link
      to={to}
      className="flex h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    >
      <Icon className="h-4 w-4 shrink-0 text-blue-600" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function ChartCard({
  title,
  icon: Icon,
  children,
  isEmpty,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isEmpty?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <Icon className="h-4 w-4 text-blue-600" />
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      </div>
      <div className="p-4">
        {isEmpty ? (
          <div className="flex h-64 items-center justify-center text-sm font-medium text-slate-400">
            Henüz veri yok
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

const DEVICE_LABELS: Record<string, string> = {
  desktop: "Masaüstü",
  mobile: "Mobil",
  tablet: "Tablet",
};

const PIE_COLORS = ["#1c5a77", "#2f8fb3", "#7cc4dc", "#0f3a52", "#a9d8e8"];

function trShortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
}

export default function DashboardPage() {
  const { data: stats } = useGetDashboardStats();
  const { data: quotesData } = useListQuotes({ status: "new", limit: 5 });
  const [days, setDays] = useState(7);
  const { data: analytics, isLoading: analyticsLoading } = useGetAnalyticsSummary({ days });

  const recentQuotes = quotesData?.items ?? [];

  const timeSeries =
    analytics?.timeSeries.map((p) => ({
      ...p,
      label: trShortDate(p.date),
    })) ?? [];
  const hasSeriesData = timeSeries.some((p) => p.pageViews > 0 || p.visitors > 0);

  const topPages =
    analytics?.topPages.map((p) => ({
      label: p.label === "/" ? "Ana Sayfa" : p.label,
      count: p.count,
    })) ?? [];

  const deviceData =
    analytics?.deviceBreakdown.map((d) => ({
      label: DEVICE_LABELS[d.label] ?? d.label,
      count: d.count,
    })) ?? [];

  const referrerData = analytics?.referrerBreakdown ?? [];

  return (
    <section className="flex-1 px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950">Kontrol Paneli</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">Site istatistikleri ve ziyaretçi analizi</p>
      </div>

      {/* Content stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ürünler" value={stats?.products} icon={Box} color="bg-blue-600" to="/admin/products" />
        <StatCard label="Haberler" value={stats?.news} icon={Newspaper} color="bg-violet-600" to="/admin/haberler" />
        <StatCard label="Referanslar" value={stats?.references} icon={Wrench} color="bg-emerald-600" to="/admin/referanslar" />
        <StatCard label="Bekleyen Teklifler" value={stats?.pendingQuotes} icon={FileText} color="bg-amber-500" to="/admin/teklifler" />
      </div>

      {/* Analytics header + range selector */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
            <Activity className="h-5 w-5 text-blue-600" />
            Ziyaretçi Analizi
          </h2>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Yalnızca çerez onayı veren ziyaretçilerden anonim olarak toplanır
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {[7, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-md px-4 py-1.5 text-xs font-bold transition ${
                days === d ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-blue-700"
              }`}
            >
              Son {d} Gün
            </button>
          ))}
        </div>
      </div>

      {/* Analytics metric cards */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Bugünkü Ziyaretçi"
          value={analyticsLoading ? undefined : analytics?.todayVisitors ?? 0}
          icon={Users}
          color="bg-blue-600"
          hint="Bugün gelen tekil ziyaretçi"
        />
        <MetricCard
          label="Bugünkü Görüntüleme"
          value={analyticsLoading ? undefined : analytics?.todayPageViews ?? 0}
          icon={Eye}
          color="bg-cyan-600"
          hint="Bugünkü sayfa görüntüleme"
        />
        <MetricCard
          label={`Ziyaretçi (${days} gün)`}
          value={analyticsLoading ? undefined : analytics?.totalVisitors ?? 0}
          icon={Users}
          color="bg-indigo-600"
          trend={analytics?.visitorChangePct}
        />
        <MetricCard
          label={`Görüntüleme (${days} gün)`}
          value={analyticsLoading ? undefined : analytics?.totalPageViews ?? 0}
          icon={Eye}
          color="bg-teal-600"
          hint="Toplam sayfa görüntüleme"
        />
      </div>

      {/* Traffic trend */}
      <div className="mt-6">
        <ChartCard title="Ziyaretçi ve Görüntüleme Trendi" icon={TrendingUp} isEmpty={!analyticsLoading && !hasSeriesData}>
          <ResponsiveContainer width="100%" height={288}>
            <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1c5a77" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#1c5a77" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2f8fb3" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2f8fb3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
                formatter={(value: number, name) => [value, name === "visitors" ? "Ziyaretçi" : "Görüntüleme"]}
              />
              <Legend
                formatter={(value) => (value === "visitors" ? "Ziyaretçi" : "Görüntüleme")}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Area type="monotone" dataKey="pageViews" stroke="#2f8fb3" strokeWidth={2} fill="url(#gp)" />
              <Area type="monotone" dataKey="visitors" stroke="#1c5a77" strokeWidth={2} fill="url(#gv)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top pages + device breakdown */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="En Çok Ziyaret Edilen Sayfalar" icon={FileText} isEmpty={!analyticsLoading && topPages.length === 0}>
            <ResponsiveContainer width="100%" height={288}>
              <BarChart data={topPages} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={150}
                  tick={{ fontSize: 12, fill: "#334155" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
                  formatter={(value: number) => [value, "Görüntüleme"]}
                />
                <Bar dataKey="count" fill="#1c5a77" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="Cihaz Dağılımı" icon={MonitorSmartphone} isEmpty={!analyticsLoading && deviceData.length === 0}>
          <ResponsiveContainer width="100%" height={288}>
            <PieChart>
              <Pie
                data={deviceData}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {deviceData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
                formatter={(value: number, name) => [value, name]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Referrer sources */}
      <div className="mt-6">
        <ChartCard title="Trafik Kaynakları" icon={Activity} isEmpty={!analyticsLoading && referrerData.length === 0}>
          <div className="space-y-3">
            {referrerData.map((r, i) => {
              const max = Math.max(...referrerData.map((x) => x.count), 1);
              const pct = Math.round((r.count / max) * 100);
              const label =
                r.label === "direct" ? "Doğrudan" : r.label === "internal" ? "Site İçi" : r.label;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-xs font-semibold text-slate-600">{label}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs font-bold text-slate-900">
                    {r.count.toLocaleString("tr-TR")}
                  </span>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* Quick actions + recent quotes */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-900">Hızlı İşlemler</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            <QuickActionCard label="Slider Ekle" to="/admin/sliders" icon={Package} />
            <QuickActionCard label="Ürün Ekle" to="/admin/products" icon={Box} />
            <QuickActionCard label="Haber Ekle" to="/admin/haberler" icon={Newspaper} />
            <QuickActionCard label="Referans Ekle" to="/admin/referanslar" icon={Wrench} />
            <QuickActionCard label="Kurumsal Düzenle" to="/admin/kurumsal" icon={TrendingUp} />
            <QuickActionCard label="Site Ayarları" to="/admin/ayarlar" icon={Package} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-900">Yeni Teklif Talepleri</h2>
            <Link to="/admin/teklifler" className="text-xs font-bold text-blue-600 hover:underline">Tümü</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentQuotes.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">Yeni teklif talebi yok</p>
            ) : (
              recentQuotes.map((q) => (
                <div key={q.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{q.fullName}</p>
                    <p className="truncate text-xs text-slate-500">{q.company ?? q.email}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                    Yeni
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
