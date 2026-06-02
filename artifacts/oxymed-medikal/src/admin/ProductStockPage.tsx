import { useState } from "react";
import { Package, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

interface ProductStockItem {
  productId: number;
  title: string;
  imageUrl: string | null;
  quantity: number;
  location: string | null;
  notes: string | null;
}

export default function ProductStockPage() {
  const { authFetch } = useAuth();
  const [data, setData] = useState<ProductStockItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [edits, setEdits] = useState<Record<number, { quantity: string; location: string; notes: string }>>({});
  const [saving, setSaving] = useState<Set<number>>(new Set());

  const load = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await authFetch("/api/stock/products");
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (data === null && !isLoading && !error) {
    load();
  }

  function getEdit(item: ProductStockItem) {
    return edits[item.productId] ?? {
      quantity: String(item.quantity),
      location: item.location ?? "",
      notes: item.notes ?? "",
    };
  }

  function setField(productId: number, field: string, value: string) {
    setEdits((prev) => ({
      ...prev,
      [productId]: { ...getEditById(productId), [field]: value },
    }));
  }

  function getEditById(productId: number) {
    const item = data?.find((d) => d.productId === productId);
    return edits[productId] ?? {
      quantity: String(item?.quantity ?? 0),
      location: item?.location ?? "",
      notes: item?.notes ?? "",
    };
  }

  async function handleSave(productId: number) {
    const edit = getEditById(productId);
    const qty = parseInt(edit.quantity, 10);
    if (isNaN(qty) || qty < 0) { toast.error("Geçersiz miktar"); return; }

    setSaving((s) => new Set(s).add(productId));
    try {
      const res = await authFetch(`/api/stock/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: qty, location: edit.location || undefined, notes: edit.notes || undefined }),
      });
      if (!res.ok) throw new Error();
      toast.success("Stok güncellendi");
      load();
    } catch {
      toast.error("Güncelleme başarısız");
    } finally {
      setSaving((s) => { const ns = new Set(s); ns.delete(productId); return ns; });
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Package className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-xl font-bold text-slate-900">Ürün Stok</h1>
          <p className="text-sm text-slate-500">Ürün bazlı stok miktarlarını yönetin</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          Veriler yüklenemedi. Sayfayı yenileyin.
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      )}

      {data && !isLoading && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Ürün</th>
                <th className="px-4 py-3 w-28">Stok Adedi</th>
                <th className="px-4 py-3 w-40">Konum</th>
                <th className="px-4 py-3">Notlar</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item) => {
                const edit = getEdit(item);
                const isSaving = saving.has(item.productId);
                return (
                  <tr key={item.productId} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl ?? "/assets/images/product-bed-head-unit.png"}
                          alt={item.title}
                          className="h-[180px] w-[180px] rounded-lg object-contain bg-slate-50"
                        />
                        <span className="font-semibold text-slate-900">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={edit.quantity}
                        onChange={(e) => setField(item.productId, "quantity", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="Depo, raf..."
                        value={edit.location}
                        onChange={(e) => setField(item.productId, "location", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="Not ekle..."
                        value={edit.notes}
                        onChange={(e) => setField(item.productId, "notes", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleSave(item.productId)}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {isSaving ? "..." : "Kaydet"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-400">Henüz ürün bulunmuyor.</div>
          )}
        </div>
      )}
    </div>
  );
}
