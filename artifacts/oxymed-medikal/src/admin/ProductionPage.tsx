import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Factory, Plus, AlertCircle, ChevronRight, Package,
  CheckCircle2, Clock, Truck, X, Save, BarChart3, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

const STATUS_LABELS: Record<string, string> = {
  bekliyor: "Bekliyor",
  stok_kontrolunde: "Stok Kontrolünde",
  stoktan_karsilanabilir: "Stoktan Karşılanabilir",
  malzeme_kontrolunde: "Malzeme Kontrolünde",
  malzeme_eksik: "Malzeme Eksik",
  uretime_hazir: "Üretime Hazır",
  uretimde: "Üretimde",
  kalite_kontrolde: "Kalite Kontrolde",
  tamamlandi: "Tamamlandı",
  stokta: "Stokta",
  sevkiyata_hazir: "Sevkiyata Hazır",
  sevk_edildi: "Sevk Edildi",
  kurulum_bekliyor: "Kurulum Bekliyor",
  garanti_baslatildi: "Garanti Başlatıldı",
  iptal: "İptal",
};

const STATUS_COLORS: Record<string, string> = {
  bekliyor: "bg-slate-100 text-slate-700",
  stok_kontrolunde: "bg-blue-100 text-blue-700",
  stoktan_karsilanabilir: "bg-amber-100 text-amber-700",
  malzeme_kontrolunde: "bg-blue-100 text-blue-700",
  malzeme_eksik: "bg-red-100 text-red-700",
  uretime_hazir: "bg-amber-100 text-amber-700",
  uretimde: "bg-purple-100 text-purple-700",
  kalite_kontrolde: "bg-indigo-100 text-indigo-700",
  tamamlandi: "bg-emerald-100 text-emerald-700",
  stokta: "bg-emerald-100 text-emerald-700",
  sevkiyata_hazir: "bg-teal-100 text-teal-700",
  sevk_edildi: "bg-teal-100 text-teal-700",
  kurulum_bekliyor: "bg-orange-100 text-orange-700",
  garanti_baslatildi: "bg-green-100 text-green-700",
  iptal: "bg-red-100 text-red-600",
};

const STATUS_FILTERS = [
  { value: "", label: "Tümü" },
  { value: "bekliyor", label: "Bekliyor" },
  { value: "uretimde", label: "Üretimde" },
  { value: "kalite_kontrolde", label: "Kalite Kontrol" },
  { value: "tamamlandi", label: "Tamamlandı" },
  { value: "sevk_edildi", label: "Sevk Edildi" },
  { value: "iptal", label: "İptal" },
];

interface DashboardData {
  counts: Record<string, number>;
  total: number;
  lowMaterials: { id: number; name: string; quantity: number; minStock: number; unit: string }[];
}

interface Order {
  id: number;
  orderNo: string;
  productTitle: string;
  productCode: string | null;
  quantity: number;
  status: string;
  customerName: string | null;
  quoteFormId: number | null;
  itemCount: number;
  createdAt: string;
}

const EMPTY_FORM = {
  productTitle: "",
  productCode: "",
  quantity: "1",
  customerName: "",
  notes: "",
};

export default function ProductionPage() {
  const { authFetch } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    setSelectedIds(new Set());
    try {
      const [dashRes, ordersRes] = await Promise.all([
        authFetch("/api/production/dashboard"),
        authFetch(`/api/production/orders${statusFilter ? `?status=${statusFilter}` : ""}`),
      ]);
      if (!dashRes.ok || !ordersRes.ok) throw new Error();
      setDashboard(await dashRes.json());
      const data = await ordersRes.json();
      setOrders(data.items ?? []);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [authFetch, statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.productTitle.trim()) { toast.error("Ürün adı zorunludur"); return; }
    setSubmitting(true);
    try {
      const res = await authFetch("/api/production/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productTitle: form.productTitle.trim(),
          productCode: form.productCode.trim() || null,
          quantity: parseInt(form.quantity, 10) || 1,
          customerName: form.customerName.trim() || null,
          notes: form.notes.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Üretim emri oluşturuldu");
      setShowCreate(false);
      setForm(EMPTY_FORM);
      load();
    } catch {
      toast.error("İşlem başarısız");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteOne(id: number) {
    if (!confirm("Bu üretim emrini silmek istediğinizden emin misiniz?")) return;
    setDeleting(true);
    try {
      const res = await authFetch(`/api/production/orders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Üretim emri silindi");
      load();
    } catch {
      toast.error("Silme işlemi başarısız");
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteSelected() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`${ids.length} üretim emrini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) return;
    setDeleting(true);
    try {
      const res = await authFetch("/api/production/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${ids.length} üretim emri silindi`);
      load();
    } catch {
      toast.error("Silme işlemi başarısız");
    } finally {
      setDeleting(false);
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === orders.length && orders.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    }
  }

  const allSelected = orders.length > 0 && selectedIds.size === orders.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < orders.length;

  const totalActive = dashboard
    ? (dashboard.counts["uretimde"] ?? 0) +
      (dashboard.counts["kalite_kontrolde"] ?? 0) +
      (dashboard.counts["uretime_hazir"] ?? 0)
    : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Factory className="h-6 w-6 text-purple-600" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">Üretim Yönetimi</h1>
            <p className="text-sm text-slate-500">Üretim emirleri, BOM ve kalite kontrol</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          Yeni Üretim Emri
        </button>
      </div>

      {/* Dashboard cards */}
      {dashboard && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">
              <BarChart3 className="h-3.5 w-3.5" /> Toplam Emir
            </div>
            <p className="text-2xl font-bold text-slate-900">{dashboard.total}</p>
          </div>
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-purple-600 text-xs font-semibold uppercase tracking-wide mb-1">
              <Factory className="h-3.5 w-3.5" /> Aktif Üretim
            </div>
            <p className="text-2xl font-bold text-purple-700">{totalActive}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wide mb-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Tamamlandı
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              {(dashboard.counts["tamamlandi"] ?? 0) + (dashboard.counts["sevk_edildi"] ?? 0) + (dashboard.counts["garanti_baslatildi"] ?? 0)}
            </p>
          </div>
          <div className={`rounded-xl border p-4 shadow-sm ${dashboard.lowMaterials.length > 0 ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"}`}>
            <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-1 ${dashboard.lowMaterials.length > 0 ? "text-red-600" : "text-slate-500"}`}>
              <AlertCircle className="h-3.5 w-3.5" /> Kritik Malzeme
            </div>
            <p className={`text-2xl font-bold ${dashboard.lowMaterials.length > 0 ? "text-red-700" : "text-slate-900"}`}>
              {dashboard.lowMaterials.length}
            </p>
          </div>
        </div>
      )}

      {/* Low material alert */}
      {dashboard && dashboard.lowMaterials.length > 0 && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="mb-2 text-sm font-bold text-red-700">Kritik Stok Seviyesindeki Malzemeler</p>
          <div className="flex flex-wrap gap-2">
            {dashboard.lowMaterials.map((m) => (
              <span key={m.id} className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                {m.name}: {m.quantity}/{m.minStock} {m.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Status filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === f.value
                ? "bg-purple-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-700"
            }`}
          >
            {f.label}
            {f.value && dashboard?.counts[f.value] ? (
              <span className="ml-1.5 opacity-70">({dashboard.counts[f.value]})</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Bulk action toolbar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5">
          <span className="text-sm font-semibold text-red-700">
            {selectedIds.size} üretim emri seçildi
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Seçimi Temizle
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? "Siliniyor..." : `${selectedIds.size} Emri Sil`}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" /> Veriler yüklenemedi.
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      )}

      {!isLoading && !error && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 accent-purple-600 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3">Emir No</th>
                <th className="px-4 py-3">Ürün</th>
                <th className="px-4 py-3 hidden sm:table-cell">Müşteri</th>
                <th className="px-4 py-3 text-center w-20">Adet</th>
                <th className="px-4 py-3 text-center w-24 hidden sm:table-cell">Kalemler</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => {
                const isSelected = selectedIds.has(order.id);
                return (
                  <tr
                    key={order.id}
                    className={`transition ${isSelected ? "bg-purple-50" : "hover:bg-slate-50"}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(order.id)}
                        className="h-4 w-4 rounded border-slate-300 accent-purple-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-semibold text-slate-700">{order.orderNo}</p>
                      {order.quoteFormId && (
                        <p className="text-[10px] text-slate-400">Teklif #{order.quoteFormId}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 line-clamp-1">{order.productTitle}</p>
                      {order.productCode && <p className="text-xs text-slate-500">{order.productCode}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">
                      {order.customerName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">{order.quantity}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${order.itemCount > 0 ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500"}`}>
                        {order.itemCount}/{order.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[order.status] ?? "bg-slate-100 text-slate-700"}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteOne(order.id)}
                          disabled={deleting}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          title="Sil"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <Link
                          to={`/admin/uretim/${order.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-purple-300 hover:text-purple-600"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-400">
              {statusFilter ? "Bu durumda üretim emri yok." : "Henüz üretim emri oluşturulmamış."}
            </div>
          )}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Yeni Üretim Emri</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Ürün Adı *</label>
                <input
                  value={form.productTitle}
                  onChange={(e) => setForm((f) => ({ ...f, productTitle: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none"
                  placeholder="Ürün adını girin"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Ürün Kodu</label>
                  <input
                    value={form.productCode}
                    onChange={(e) => setForm((f) => ({ ...f, productCode: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none"
                    placeholder="OXY-XXX-000"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Miktar</label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Müşteri / Proje</label>
                <input
                  value={form.customerName}
                  onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none"
                  placeholder="Müşteri adı veya proje"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Notlar</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none"
                  placeholder="Ek notlar..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {submitting ? "Oluşturuluyor..." : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
