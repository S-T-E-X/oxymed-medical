import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  X,
  FlaskConical,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

type Template = {
  id: number;
  name: string;
  description?: string | null;
  modelCode?: string | null;
  imageUrl?: string | null;
};

type Material = {
  id: number;
  name: string;
  productCode?: string | null;
  unit: string;
  price?: string | null;
  quantity: number;
};

type BomRow = {
  id?: number;
  materialId: number;
  materialName: string;
  productCode?: string | null;
  unit: string;
  price?: string | null;
  inStock?: number | null;
  requiredQty: string;
};

export default function RecetePage() {
  const { authFetch } = useAuth();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [bomMap, setBomMap] = useState<Record<number, BomRow[]>>({});
  const [loadingBom, setLoadingBom] = useState<number | null>(null);
  const [savingBom, setSavingBom] = useState<number | null>(null);

  const [matSearch, setMatSearch] = useState("");
  const [addMatId, setAddMatId] = useState<number | "">("");
  const [addQty, setAddQty] = useState("1");

  const [tmplSearch, setTmplSearch] = useState("");

  useEffect(() => {
    Promise.all([
      authFetch("/api/quote-group-templates").then((r) => r.json()),
      authFetch("/api/stock/materials").then((r) => r.json()),
    ])
      .then(([tmplData, matData]: [Template[], Material[]]) => {
        setTemplates(
          (tmplData ?? [])
            .filter((t) => t.description === "__single_item_template")
            .sort((a, b) => a.name.localeCompare(b.name, "tr")),
        );
        setMaterials(matData ?? []);
      })
      .catch(() => toast.error("Yükleme hatası"))
      .finally(() => setLoadingTemplates(false));
  }, [authFetch]);

  const loadBom = useCallback(
    async (templateId: number) => {
      if (bomMap[templateId] !== undefined) return;
      setLoadingBom(templateId);
      try {
        const res = await authFetch(`/api/template-bom/${templateId}`);
        const data = (await res.json()) as BomRow[];
        setBomMap((prev) => ({ ...prev, [templateId]: data }));
      } catch {
        toast.error("Reçete yüklenemedi");
      } finally {
        setLoadingBom(null);
      }
    },
    [authFetch, bomMap],
  );

  const toggleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      loadBom(id);
      setMatSearch("");
      setAddMatId("");
      setAddQty("1");
    }
  };

  const addMaterial = (templateId: number) => {
    if (!addMatId) { toast.error("Malzeme seçin"); return; }
    const qty = parseFloat(addQty);
    if (isNaN(qty) || qty <= 0) { toast.error("Geçerli bir miktar girin"); return; }
    const mat = materials.find((m) => m.id === addMatId);
    if (!mat) return;
    const current = bomMap[templateId] ?? [];
    if (current.some((r) => r.materialId === mat.id)) {
      toast.error("Bu malzeme zaten reçetede var");
      return;
    }
    setBomMap((prev) => ({
      ...prev,
      [templateId]: [
        ...current,
        {
          materialId: mat.id,
          materialName: mat.name,
          productCode: mat.productCode,
          unit: mat.unit,
          price: mat.price,
          inStock: mat.quantity,
          requiredQty: String(qty),
        },
      ],
    }));
    setAddMatId("");
    setAddQty("1");
    setMatSearch("");
  };

  const removeRow = (templateId: number, materialId: number) => {
    setBomMap((prev) => ({
      ...prev,
      [templateId]: (prev[templateId] ?? []).filter((r) => r.materialId !== materialId),
    }));
  };

  const updateQty = (templateId: number, materialId: number, val: string) => {
    setBomMap((prev) => ({
      ...prev,
      [templateId]: (prev[templateId] ?? []).map((r) =>
        r.materialId === materialId ? { ...r, requiredQty: val } : r,
      ),
    }));
  };

  const saveBom = async (templateId: number) => {
    const rows = bomMap[templateId] ?? [];
    const payload = rows.map((r) => ({
      materialId: r.materialId,
      requiredQty: parseFloat(r.requiredQty) || 1,
    }));
    setSavingBom(templateId);
    try {
      const res = await authFetch(`/api/template-bom/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Kayıt hatası");
      // Re-fetch to get joined material info (name, unit, price)
      const fresh = await authFetch(`/api/template-bom/${templateId}`);
      const freshData = (await fresh.json()) as BomRow[];
      setBomMap((prev) => ({ ...prev, [templateId]: freshData }));
      toast.success("Reçete kaydedildi");
    } catch {
      toast.error("Kaydedilemedi");
    } finally {
      setSavingBom(null);
    }
  };

  const calcCost = (rows: BomRow[]) => {
    let total = 0;
    for (const r of rows) {
      const price = parseFloat(r.price ?? "0") || 0;
      const qty = parseFloat(r.requiredQty) || 0;
      total += price * qty;
    }
    return total;
  };

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(tmplSearch.toLowerCase()) ||
    (t.modelCode ?? "").toLowerCase().includes(tmplSearch.toLowerCase()),
  );

  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(matSearch.toLowerCase()) ||
      (m.productCode ?? "").toLowerCase().includes(matSearch.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Reçete Yönetimi</h1>
            <p className="text-sm text-slate-500">
              Teklif şablonlarına malzeme reçetesi tanımlayın ve maliyet hesaplama yapın
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={tmplSearch}
          onChange={(e) => setTmplSearch(e.target.value)}
          placeholder="Şablon ara…"
          className="input w-full pl-9 text-sm"
        />
      </div>

      {loadingTemplates ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-sm text-slate-400">
            {tmplSearch ? "Eşleşen şablon bulunamadı" : "Henüz tekli ürün şablonu yok"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Teklif form editöründe kalem şablonu oluşturun
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTemplates.map((t) => {
            const isOpen = expandedId === t.id;
            const rows = bomMap[t.id] ?? [];
            const totalCost = calcCost(rows);
            const img = t.imageUrl;

            return (
              <div
                key={t.id}
                className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(t.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 transition"
                >
                  {img && (
                    <img
                      src={img}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 object-contain"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{t.name}</p>
                    {t.modelCode && (
                      <p className="text-xs text-slate-400 mt-0.5">{t.modelCode}</p>
                    )}
                  </div>
                  {bomMap[t.id] !== undefined && (
                    <div className="flex items-center gap-2 shrink-0">
                      {rows.length > 0 && (
                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <TrendingUp className="h-3 w-3" />
                          {totalCost.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                        </div>
                      )}
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        {rows.length} malzeme
                      </span>
                    </div>
                  )}
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 px-5 pb-5">
                    {loadingBom === t.id ? (
                      <div className="flex h-20 items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                      </div>
                    ) : (
                      <>
                        {rows.length === 0 ? (
                          <p className="py-6 text-center text-sm text-slate-400">
                            Henüz malzeme eklenmemiş
                          </p>
                        ) : (
                          <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  <th className="pb-2">Malzeme</th>
                                  <th className="pb-2">Kod</th>
                                  <th className="pb-2 text-center">Birim</th>
                                  <th className="pb-2 text-center">Birim Fiyat</th>
                                  <th className="pb-2 text-center">Gereken Miktar</th>
                                  <th className="pb-2 text-right">Satır Maliyeti</th>
                                  <th className="pb-2 w-8"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {rows.map((r) => {
                                  const price = parseFloat(r.price ?? "0") || 0;
                                  const qty = parseFloat(r.requiredQty) || 0;
                                  const lineCost = price * qty;
                                  return (
                                    <tr key={r.materialId}>
                                      <td className="py-2 font-semibold text-slate-800">
                                        {r.materialName}
                                      </td>
                                      <td className="py-2 font-mono text-xs text-slate-400">
                                        {r.productCode ?? "—"}
                                      </td>
                                      <td className="py-2 text-center text-slate-600">
                                        {r.unit}
                                      </td>
                                      <td className="py-2 text-center text-slate-600">
                                        {price > 0
                                          ? price.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺"
                                          : "—"}
                                      </td>
                                      <td className="py-2 text-center">
                                        <input
                                          type="number"
                                          min={0.001}
                                          step="any"
                                          value={r.requiredQty}
                                          onChange={(e) =>
                                            updateQty(t.id, r.materialId, e.target.value)
                                          }
                                          className="input w-20 text-center text-sm"
                                        />
                                      </td>
                                      <td className="py-2 text-right font-bold text-slate-800">
                                        {lineCost > 0
                                          ? lineCost.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺"
                                          : "—"}
                                      </td>
                                      <td className="py-2">
                                        <button
                                          onClick={() => removeRow(t.id, r.materialId)}
                                          className="flex h-7 w-7 items-center justify-center rounded text-red-400 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              {rows.length > 0 && (
                                <tfoot>
                                  <tr className="border-t-2 border-slate-200">
                                    <td colSpan={5} className="pt-2 text-right text-sm font-bold text-slate-600">
                                      Toplam Malzeme Maliyeti
                                    </td>
                                    <td className="pt-2 text-right text-base font-bold text-emerald-700">
                                      {totalCost.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                                    </td>
                                    <td />
                                  </tr>
                                </tfoot>
                              )}
                            </table>
                          </div>
                        )}

                        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                            Malzeme Ekle
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            <div className="relative flex-1 min-w-[200px]">
                              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                              <input
                                value={matSearch}
                                onChange={(e) => setMatSearch(e.target.value)}
                                placeholder="Malzeme ara…"
                                className="input w-full pl-8 text-sm"
                              />
                              {matSearch && (
                                <button
                                  onClick={() => setMatSearch("")}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                            <select
                              value={addMatId}
                              onChange={(e) => setAddMatId(e.target.value ? Number(e.target.value) : "")}
                              className="input flex-1 min-w-[160px] text-sm"
                            >
                              <option value="">Malzeme seç…</option>
                              {filteredMaterials.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name}
                                  {m.productCode ? ` (${m.productCode})` : ""}
                                  {" — "}
                                  {m.unit}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              min={0.001}
                              step="any"
                              value={addQty}
                              onChange={(e) => setAddQty(e.target.value)}
                              placeholder="Miktar"
                              className="input w-24 text-sm text-center"
                            />
                            <button
                              onClick={() => addMaterial(t.id)}
                              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                            >
                              <Plus className="h-4 w-4" /> Ekle
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => saveBom(t.id)}
                            disabled={savingBom === t.id}
                            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {savingBom === t.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            Reçeteyi Kaydet
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
