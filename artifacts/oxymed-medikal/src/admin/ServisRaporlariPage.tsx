import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, FileText, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const SERVICE_TYPE_LABELS: Record<string, string> = {
  periyodik_bakim: "Periyodik Bakım",
  ariza_mudahalesi: "Arıza Müdahalesi",
  yedek_parca: "Yedek Parça",
  genel_kontrol: "Genel Kontrol",
  devreye_alma: "Devreye Alma",
  garanti_servisi: "Garanti Servisi",
};

const STATUS_LABELS: Record<string, string> = {
  taslak: "Taslak",
  tamamlandi: "Tamamlandı",
  iptal: "İptal",
};

const STATUS_COLORS: Record<string, string> = {
  taslak: "bg-amber-100 text-amber-700",
  tamamlandi: "bg-emerald-100 text-emerald-700",
  iptal: "bg-red-100 text-red-700",
};

interface Report {
  id: number;
  reportNo: string;
  serviceDate: string;
  serviceType: string;
  priority: string;
  status: string;
  pdfUrl: string | null;
  deviceSerialNumber: string | null;
  deviceProductName: string | null;
  deviceModel: string | null;
  deviceCustomerFirm: string | null;
}

function useServiceReports(search: string, status: string) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const params = new URLSearchParams({ limit: "200" });
      if (status) params.set("status", status);
      const res = await fetch(`${BASE}/api/service-reports?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json() as { items: Report[] };
      setReports(data.items ?? []);
      setLoaded(true);
    } catch {
      toast.error("Raporlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  return { reports, loading, loaded, load, setReports };
}

export default function ServisRaporlariPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { reports, loading, loaded, load, setReports } = useServiceReports(search, statusFilter);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = reports.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.reportNo.toLowerCase().includes(q) ||
      (r.deviceSerialNumber ?? "").toLowerCase().includes(q) ||
      (r.deviceCustomerFirm ?? "").toLowerCase().includes(q) ||
      (r.deviceProductName ?? "").toLowerCase().includes(q)
    );
  });

  if (!loaded && !loading) {
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu raporu silmek istediğinize emin misiniz?")) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`${BASE}/api/service-reports/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast.success("Rapor silindi");
    } catch {
      toast.error("Rapor silinemedi");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Servis Raporları</h1>
          <p className="text-sm text-slate-500 mt-1">Tüm servis raporlarını görüntüleyin ve yönetin</p>
        </div>
        <Link
          to="/admin/servis-raporlari/yeni"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Yeni Rapor Oluştur
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rapor no, seri no, müşteri ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-9 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); }}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none"
        >
          <option value="">Tüm Durumlar</option>
          <option value="taslak">Taslak</option>
          <option value="tamamlandi">Tamamlandı</option>
          <option value="iptal">İptal</option>
        </select>
        <button
          onClick={load}
          className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Yenile
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">Yükleniyor…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
            <FileText className="h-12 w-12 text-slate-200" />
            <p className="font-medium">Henüz servis raporu yok</p>
            <Link to="/admin/servis-raporlari/yeni" className="text-blue-600 text-sm font-semibold hover:underline">
              İlk raporu oluştur →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Rapor No</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Cihaz</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Müşteri</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Tarih</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Tür</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Durum</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">PDF</th>
                  <th className="px-4 py-3 text-right text-xs font-extrabold text-slate-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 text-xs">{r.reportNo}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 text-xs">{r.deviceProductName}</div>
                      <div className="text-slate-400 text-xs">{r.deviceSerialNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{r.deviceCustomerFirm ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{r.serviceDate}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{SERVICE_TYPE_LABELS[r.serviceType] ?? r.serviceType}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_COLORS[r.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.pdfUrl ? (
                        <a href={r.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline text-xs font-semibold">
                          <FileText className="h-3.5 w-3.5 text-red-500" /> PDF
                        </a>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/servis-raporlari/${r.id}`}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-3.5 w-3.5" /> Düzenle
                        </Link>
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
