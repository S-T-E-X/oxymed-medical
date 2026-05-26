import { useState, useEffect } from "react";
import { Wrench, Plus, Pencil, Trash2, X, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

interface Material {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  productCode: string | null;
  supplier: string | null;
  price: string | null;
  quantity: number;
  minStock: number;
  unit: string;
  notes: string | null;
}

const EMPTY_FORM = { name: "", description: "", category: "", productCode: "", supplier: "", price: "", quantity: "0", minStock: "0", unit: "adet", notes: "" };

export default function MaterialStockPage() {
  const { authFetch } = useAuth();
  const [items, setItems] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function load() {
    setIsLoading(true);
    setError(false);
    try {
      const res = await authFetch("/api/stock/materials");
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(item: Material) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description ?? "",
      category: item.category ?? "",
      productCode: item.productCode ?? "",
      supplier: item.supplier ?? "",
      price: item.price ?? "",
      quantity: String(item.quantity),
      minStock: String(item.minStock),
      unit: item.unit,
      notes: item.notes ?? "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Malzeme adı zorunludur"); return; }

    const body = {
      name: form.name.trim(),
      description: form.description || undefined,
      category: form.category.trim() || null,
      productCode: form.productCode.trim() || null,
      supplier: form.supplier || undefined,
      price: form.price || undefined,
      quantity: parseInt(form.quantity, 10) || 0,
      minStock: parseInt(form.minStock, 10) || 0,
      unit: form.unit || "adet",
      notes: form.notes || undefined,
    };

    setSubmitting(true);
    try {
      const res = editingId !== null
        ? await authFetch(`/api/stock/materials/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await authFetch("/api/stock/materials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      toast.success(editingId !== null ? "Malzeme güncellendi" : "Malzeme eklendi");
      setShowForm(false);
      load();
    } catch {
      toast.error("İşlem başarısız");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu malzemeyi silmek istediğinizden emin misiniz?")) return;
    setDeletingId(id);
    try {
      const res = await authFetch(`/api/stock/materials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Malzeme silindi");
      load();
    } catch {
      toast.error("Silme başarısız");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Wrench className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">Malzeme Stok</h1>
            <p className="text-sm text-slate-500">Tedarik malzemeleri ve stok takibi</p>
          </div>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Yeni Malzeme
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          Veriler yüklenemedi.
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
                <th className="px-5 py-3">Malzeme Adı</th>
                <th className="px-4 py-3 hidden sm:table-cell">Kategori</th>
                <th className="px-4 py-3 hidden md:table-cell">Tedarikçi</th>
                <th className="px-4 py-3 w-28 text-right hidden sm:table-cell">Fiyat</th>
                <th className="px-4 py-3 w-32 text-center">Stok / Min</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const isLow = item.quantity <= item.minStock;
                return (
                  <tr key={item.id} className={`hover:bg-slate-50 ${item.quantity === 0 ? "bg-red-50/30" : ""}`}>
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        {item.productCode && <p className="text-xs text-slate-400 font-mono">{item.productCode}</p>}
                        {item.description && <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">
                      {item.category ? (
                        <span className="rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">{item.category}</span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{item.supplier ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 hidden sm:table-cell">
                      {item.price ? `${Number(item.price).toLocaleString("tr-TR")} ₺` : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                          item.quantity === 0
                            ? "bg-red-100 text-red-700"
                            : isLow
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {item.quantity} {item.unit}
                        </span>
                        {item.minStock > 0 && (
                          <span className="text-[10px] text-slate-400">min: {item.minStock}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-300 hover:text-blue-600"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-400">
              Henüz malzeme eklenmemiş. "Yeni Malzeme" ile başlayın.
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">
                {editingId !== null ? "Malzeme Düzenle" : "Yeni Malzeme"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Malzeme Adı *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Örn: Oksijen Regülatörü"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Kategori</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="Örn: Elektronik"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Malzeme Kodu</label>
                  <input
                    value={form.productCode}
                    onChange={(e) => setForm((f) => ({ ...f, productCode: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="MLZ-001"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Açıklama</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Kısa açıklama"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Tedarikçi</label>
                <input
                  value={form.supplier}
                  onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Tedarikçi firma adı"
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Fiyat (₺)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-1">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Stok</label>
                  <input
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-1">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Min. Stok</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minStock}
                    onChange={(e) => setForm((f) => ({ ...f, minStock: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-1">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Birim</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {["adet", "kg", "lt", "m", "m²", "kutu", "paket", "rulo", "mt"].map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Notlar</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Ek notlar..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {submitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
