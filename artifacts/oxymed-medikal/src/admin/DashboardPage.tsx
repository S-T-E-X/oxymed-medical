import {
  Box,
  FileText,
  Newspaper,
  Package,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useGetDashboardStats, useListQuotes } from "@workspace/api-client-react";

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

export default function DashboardPage() {
  const { data: stats } = useGetDashboardStats();
  const { data: quotesData } = useListQuotes({ status: "new", limit: 5 });

  const recentQuotes = quotesData?.items ?? [];

  return (
    <section className="flex-1 px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950">Kontrol Paneli</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">Site içerik istatistikleri</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ürünler" value={stats?.products} icon={Box} color="bg-blue-600" to="/admin/products" />
        <StatCard label="Haberler" value={stats?.news} icon={Newspaper} color="bg-violet-600" to="/admin/haberler" />
        <StatCard label="Referanslar" value={stats?.references} icon={Wrench} color="bg-emerald-600" to="/admin/referanslar" />
        <StatCard label="Bekleyen Teklifler" value={stats?.pendingQuotes} icon={FileText} color="bg-amber-500" to="/admin/teklifler" />
      </div>

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
