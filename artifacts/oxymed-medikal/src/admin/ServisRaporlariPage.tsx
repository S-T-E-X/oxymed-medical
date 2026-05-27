import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, FileText, Trash2, Eye, Download, Mail, Loader2, X } from "lucide-react";
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
  deviceCustomerEmail: string | null;
}

function useServiceReports(search: string, status: string) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
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

  // PDF download state
  const [generatingPdfId, setGeneratingPdfId] = useState<number | null>(null);

  // Email dialog state
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailTarget, setEmailTarget] = useState("");
  const [emailDefaultAddress, setEmailDefaultAddress] = useState<string>("");
  const [emailReportId, setEmailReportId] = useState<number | null>(null);
  const [emailReportNo, setEmailReportNo] = useState<string>("");
  const [emailReportDate, setEmailReportDate] = useState<string>("");
  const [sendingEmail, setSendingEmail] = useState(false);

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
      const token = localStorage.getItem("admin_token");
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

  async function handleDownloadPdf(report: Report) {
    setGeneratingPdfId(report.id);
    toast.info("PDF oluşturuluyor...");
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${BASE}/api/service-reports/${report.id}/generate-pdf`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string; detail?: string };
        throw new Error(body.detail ?? body.error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.reportNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF indirildi");
    } catch (err) {
      toast.error(`PDF oluşturulamadı: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setGeneratingPdfId(null);
    }
  }

  function openEmailDialog(report: Report) {
    setEmailReportId(report.id);
    setEmailReportNo(report.reportNo);
    setEmailReportDate(report.serviceDate);
    const defaultEmail = report.deviceCustomerEmail ?? "";
    setEmailDefaultAddress(defaultEmail);
    setEmailTarget(defaultEmail);
    setShowEmailDialog(true);
  }

  async function handleSendEmail() {
    if (!emailReportId) return;
    const target = emailTarget.trim();
    if (!target) { toast.error("Lütfen bir e-posta adresi girin"); return; }
    setSendingEmail(true);
    toast.info("Rapor PDF olarak oluşturulup gönderiliyor...");
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${BASE}/api/service-reports/${emailReportId}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: target }),
      });
      const body = await res.json().catch(() => ({})) as { error?: string; detail?: string; success?: boolean };
      if (!res.ok) {
        throw new Error(body.detail ?? body.error ?? `HTTP ${res.status}`);
      }
      toast.success(`Rapor ${target} adresine gönderildi`);
      setShowEmailDialog(false);
    } catch (err) {
      toast.error(`Gönderilemedi: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSendingEmail(false);
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
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status === "tamamlandi" && (
                          <>
                            <button
                              onClick={() => handleDownloadPdf(r)}
                              disabled={generatingPdfId === r.id}
                              title="PDF İndir"
                              className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-red-600 hover:border-red-200 disabled:opacity-40 transition-colors"
                            >
                              {generatingPdfId === r.id
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <Download className="h-3.5 w-3.5" />
                              }
                            </button>
                            <button
                              onClick={() => openEmailDialog(r)}
                              title="E-posta ile Gönder"
                              className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
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

      {/* Email dialog */}
      {showEmailDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Raporu E-posta ile Gönder</h2>
                  <p className="text-xs text-slate-500">PDF eki olarak gönderilecek</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailDialog(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Alıcı E-posta Adresi
                  </label>
                  {emailDefaultAddress && emailTarget.trim() !== emailDefaultAddress && (
                    <button
                      type="button"
                      onClick={() => setEmailTarget(emailDefaultAddress)}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      Müşteri adresine dön ↩
                    </button>
                  )}
                </div>
                <input
                  type="email"
                  value={emailTarget}
                  onChange={(e) => setEmailTarget(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
                  placeholder="ornek@hastane.com"
                  autoFocus
                  className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-500 space-y-1">
                <p><span className="font-bold text-slate-700">Rapor No:</span> {emailReportNo}</p>
                <p><span className="font-bold text-slate-700">Tarih:</span> {emailReportDate}</p>
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowEmailDialog(false)}
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sendingEmail || !emailTarget.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {sendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                {sendingEmail ? "Gönderiliyor..." : "Gönder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
