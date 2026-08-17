import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

const SINGLE_TEMPLATE_MARKER = "__single_item_template";
const UNITS = ["ADET", "SET", "METRE", "MT", "M2", "KG", "PAKET", "KUTU", "TAKIM"] as const;

type TemplateKind = "single" | "group";

type TemplateChild = {
  title: string;
  titleEn?: string;
  modelCode?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: string;
  bullets?: string[];
  bulletsEn?: string[];
  imageUrl?: string;
};

type QuoteTemplate = {
  id: number;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  modelCode?: string | null;
  imageUrl?: string | null;
  adminNotes?: string | null;
  children: TemplateChild[];
  sortOrder?: number;
};

type DraftChild = {
  title: string;
  titleEn: string;
  modelCode: string;
  unit: string;
  quantity: number;
  unitPrice: string;
  bulletsText: string;
  bulletsTextEn: string;
  imageUrl: string;
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

type AuthFetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

function blankChild(): DraftChild {
  return {
    title: "",
    titleEn: "",
    modelCode: "",
    unit: "ADET",
    quantity: 1,
    unitPrice: "0",
    bulletsText: "",
    bulletsTextEn: "",
    imageUrl: "",
  };
}

function childToDraft(child: TemplateChild | undefined): DraftChild {
  return {
    title: child?.title ?? "",
    titleEn: child?.titleEn ?? "",
    modelCode: child?.modelCode ?? "",
    unit: child?.unit ?? "ADET",
    quantity: child?.quantity ?? 1,
    unitPrice: child?.unitPrice ?? "0",
    bulletsText: (child?.bullets ?? []).join("\n"),
    bulletsTextEn: (child?.bulletsEn ?? []).join("\n"),
    imageUrl: child?.imageUrl ?? "",
  };
}

function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function nullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function templateKind(template: QuoteTemplate): TemplateKind {
  return template.description === SINGLE_TEMPLATE_MARKER ? "single" : "group";
}

async function errorMessage(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => null) as { error?: string } | null;
  return body?.error ?? fallback;
}

function ChildEditor({
  child,
  index,
  single,
  onChange,
  onRemove,
}: {
  child: DraftChild;
  index: number;
  single: boolean;
  onChange: (field: keyof DraftChild, value: string | number) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
          {single ? "Teklif kalemi" : `Alt ürün ${index + 1}`}
        </p>
        {!single && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-red-400 hover:bg-red-50"
            title="Alt ürünü sil"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Ürün / kalem adı (TR) *</label>
          <input
            value={child.title}
            onChange={(event) => onChange("title", event.target.value)}
            className="input w-full text-sm"
            placeholder="Teklifte görünecek ürün adı"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Ürün / kalem adı (EN)</label>
          <input
            value={child.titleEn}
            onChange={(event) => onChange("titleEn", event.target.value)}
            className="input w-full text-sm"
            placeholder="English item title (optional)"
          />
        </div>
        <div>
          <label className="label">Model / Kod</label>
          <input
            value={child.modelCode}
            onChange={(event) => onChange("modelCode", event.target.value)}
            className="input w-full text-sm"
            placeholder="OXM-XXX-01"
          />
        </div>
        <div>
          <label className="label">Birim</label>
          <select
            value={child.unit}
            onChange={(event) => onChange("unit", event.target.value)}
            className="input w-full text-sm"
          >
            {UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Varsayılan miktar</label>
          <input
            type="number"
            min={0}
            step="any"
            value={child.quantity}
            onChange={(event) => onChange("quantity", Number(event.target.value) || 0)}
            className="input w-full text-sm"
          />
        </div>
        <div>
          <label className="label">Varsayılan birim fiyat</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={child.unitPrice}
            onChange={(event) => onChange("unitPrice", event.target.value)}
            className="input w-full text-sm"
            placeholder="0"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Görsel URL</label>
          <input
            value={child.imageUrl}
            onChange={(event) => onChange("imageUrl", event.target.value)}
            className="input w-full text-sm"
            placeholder="https://…"
          />
        </div>
        <div>
          <label className="label">Özellikler (TR, satır satır)</label>
          <textarea
            value={child.bulletsText}
            onChange={(event) => onChange("bulletsText", event.target.value)}
            rows={4}
            className="input w-full resize-y text-sm"
            placeholder="CE sertifikalı&#10;Kolay kurulum"
          />
        </div>
        <div>
          <label className="label">Özellikler (EN, satır satır)</label>
          <textarea
            value={child.bulletsTextEn}
            onChange={(event) => onChange("bulletsTextEn", event.target.value)}
            rows={4}
            className="input w-full resize-y text-sm"
            placeholder="One bullet per line (optional)"
          />
        </div>
      </div>
    </div>
  );
}

function TemplateEditorModal({
  template,
  kind,
  authFetch,
  onClose,
  onSaved,
}: {
  template: QuoteTemplate | null;
  kind: TemplateKind;
  authFetch: AuthFetch;
  onClose: () => void;
  onSaved: (template: QuoteTemplate) => void;
}) {
  const existingChild = template?.children?.[0];
  const [name, setName] = useState(template?.name ?? "");
  const [nameEn, setNameEn] = useState(template?.nameEn ?? "");
  const [description, setDescription] = useState(
    kind === "single" ? "" : (template?.description ?? ""),
  );
  const [descriptionEn, setDescriptionEn] = useState(template?.descriptionEn ?? "");
  const [modelCode, setModelCode] = useState(
    kind === "single" ? (existingChild?.modelCode ?? "") : (template?.modelCode ?? ""),
  );
  const [imageUrl, setImageUrl] = useState(
    kind === "single"
      ? (existingChild?.imageUrl ?? template?.imageUrl ?? "")
      : (template?.imageUrl ?? ""),
  );
  const [adminNotes, setAdminNotes] = useState(template?.adminNotes ?? "");
  const [children, setChildren] = useState<DraftChild[]>(() => {
    if (template?.children?.length) return template.children.map(childToDraft);
    return [blankChild()];
  });
  const [saving, setSaving] = useState(false);

  const updateChild = (index: number, field: keyof DraftChild, value: string | number) => {
    setChildren((current) => current.map((child, childIndex) =>
      childIndex === index ? { ...child, [field]: value } : child,
    ));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Şablon adı boş olamaz");
      return;
    }
    if (kind === "group" && children.every((child) => !child.title.trim())) {
      toast.error("Grup için en az bir alt ürün ekleyin");
      return;
    }

    setSaving(true);
    try {
      const cleanChildren = children
        .filter((child) => kind === "single" || child.title.trim())
        .map((child) => ({
          title: child.title.trim() || name.trim(),
          titleEn: nullable(child.titleEn) ?? undefined,
          modelCode: nullable(child.modelCode) ?? undefined,
          unit: child.unit || "ADET",
          quantity: Math.max(0, child.quantity),
          unitPrice: child.unitPrice.trim() || "0",
          bullets: linesToArray(child.bulletsText),
          bulletsEn: linesToArray(child.bulletsTextEn),
          imageUrl: nullable(child.imageUrl) ?? undefined,
        }));

      const body = {
        name: name.trim(),
        nameEn: nullable(nameEn),
        description: kind === "single" ? SINGLE_TEMPLATE_MARKER : nullable(description),
        descriptionEn: nullable(descriptionEn),
        modelCode: kind === "single"
          ? nullable(cleanChildren[0]?.modelCode ?? "")
          : nullable(modelCode),
        imageUrl: kind === "single"
          ? nullable(cleanChildren[0]?.imageUrl ?? "")
          : nullable(imageUrl),
        adminNotes: nullable(adminNotes),
        children: cleanChildren,
        sortOrder: template?.sortOrder ?? 0,
      };

      const response = await authFetch(
        template
          ? `/api/quote-group-templates/${template.id}`
          : "/api/quote-group-templates",
        {
          method: template ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (!response.ok) {
        throw new Error(await errorMessage(response, "Şablon kaydedilemedi"));
      }

      const saved = await response.json() as QuoteTemplate;
      onSaved(saved);
      toast.success(template ? "Şablon güncellendi" : "Şablon oluşturuldu");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Şablon kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
              {kind === "single" ? "Tekli ürün şablonu" : "Grup ürün şablonu"}
            </p>
            <h2 className="text-lg font-bold text-slate-900">
              {template ? "Şablonu düzenle" : "Yeni şablon oluştur"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Şablon adı (TR) *</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="input w-full text-sm"
                placeholder={kind === "single" ? "Dental Vakum Pompası" : "Medikal Gaz Sistemi"}
                autoFocus
              />
            </div>
            <div>
              <label className="label">Şablon adı (EN)</label>
              <input
                value={nameEn}
                onChange={(event) => setNameEn(event.target.value)}
                className="input w-full text-sm"
                placeholder="Template name (optional)"
              />
            </div>
            {kind === "group" && (
              <>
                <div>
                  <label className="label">Grup model / kod</label>
                  <input
                    value={modelCode}
                    onChange={(event) => setModelCode(event.target.value)}
                    className="input w-full text-sm"
                    placeholder="OXM-GRP-01"
                  />
                </div>
                <div>
                  <label className="label">Grup görsel URL</label>
                  <input
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    className="input w-full text-sm"
                    placeholder="https://…"
                  />
                </div>
                <div>
                  <label className="label">Grup açıklaması (TR)</label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={3}
                    className="input w-full resize-y text-sm"
                    placeholder="Teklifte grup başlığının altında gösterilecek açıklama"
                  />
                </div>
                <div>
                  <label className="label">Grup açıklaması (EN)</label>
                  <textarea
                    value={descriptionEn}
                    onChange={(event) => setDescriptionEn(event.target.value)}
                    rows={3}
                    className="input w-full resize-y text-sm"
                    placeholder="English description (optional)"
                  />
                </div>
              </>
            )}
            <div className="sm:col-span-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <StickyNote className="h-3.5 w-3.5 text-amber-500" />
                Admin notu
                <span className="font-normal text-slate-400">— yalnızca bu admin sayfasında görünür</span>
              </label>
              <textarea
                value={adminNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
                rows={3}
                className="input mt-1.5 w-full resize-y text-sm"
                placeholder="Maliyet, satış ekibi veya üretim için iç not…"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {kind === "single" ? "Tekli ürün ayarları" : `Grup alt ürünleri (${children.length})`}
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Bu alanlar teklif formunda şablon seçildiğinde otomatik doldurulur.
                </p>
              </div>
              {kind === "group" && (
                <button
                  type="button"
                  onClick={() => setChildren((current) => [...current, blankChild()])}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Yeni ürün ekle
                </button>
              )}
            </div>
            <div className="space-y-3">
              {children.map((child, index) => (
                <ChildEditor
                  key={index}
                  child={child}
                  index={index}
                  single={kind === "single"}
                  onChange={(field, value) => updateChild(index, field, value)}
                  onRemove={kind === "group" ? () => setChildren((current) => current.filter((_, i) => i !== index)) : undefined}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplateBomPanel({
  templateId,
  authFetch,
  materials,
}: {
  templateId: number;
  authFetch: AuthFetch;
  materials: Material[];
}) {
  const [rows, setRows] = useState<BomRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [materialSearch, setMaterialSearch] = useState("");
  const [materialId, setMaterialId] = useState<number | "">("");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    let active = true;
    setLoading(true);
    authFetch(`/api/template-bom/${templateId}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("BOM yüklenemedi");
        return response.json() as Promise<BomRow[]>;
      })
      .then((data) => {
        if (active) setRows(data ?? []);
      })
      .catch(() => {
        if (active) toast.error("BOM listesi yüklenemedi");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authFetch, templateId]);

  const filteredMaterials = useMemo(() => {
    const query = materialSearch.trim().toLocaleLowerCase("tr-TR");
    return materials.filter((material) =>
      !query ||
      material.name.toLocaleLowerCase("tr-TR").includes(query) ||
      (material.productCode ?? "").toLocaleLowerCase("tr-TR").includes(query),
    );
  }, [materialSearch, materials]);

  const totalCost = rows.reduce((sum, row) => {
    const price = Number(row.price ?? 0);
    const requiredQty = Number(row.requiredQty) || 0;
    return sum + (Number.isFinite(price) ? price : 0) * requiredQty;
  }, 0);

  const addMaterial = () => {
    if (!materialId) {
      toast.error("Malzeme seçin");
      return;
    }
    const selected = materials.find((material) => material.id === materialId);
    const requiredQty = Number(quantity);
    if (!selected || !Number.isFinite(requiredQty) || requiredQty <= 0) {
      toast.error("Geçerli bir malzeme ve miktar seçin");
      return;
    }
    if (rows.some((row) => row.materialId === selected.id)) {
      toast.error("Bu malzeme zaten BOM listesinde");
      return;
    }
    setRows((current) => [...current, {
      materialId: selected.id,
      materialName: selected.name,
      productCode: selected.productCode,
      unit: selected.unit,
      price: selected.price,
      inStock: selected.quantity,
      requiredQty: String(requiredQty),
    }]);
    setMaterialId("");
    setQuantity("1");
    setMaterialSearch("");
  };

  const saveBom = async () => {
    const payload = rows
      .map((row) => ({ materialId: row.materialId, requiredQty: Number(row.requiredQty) }))
      .filter((row) => Number.isFinite(row.requiredQty) && row.requiredQty > 0);
    if (payload.length !== rows.length) {
      toast.error("BOM miktarları sıfırdan büyük olmalı");
      return;
    }
    setSaving(true);
    try {
      const response = await authFetch(`/api/template-bom/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await errorMessage(response, "BOM kaydedilemedi"));
      const refreshed = await authFetch(`/api/template-bom/${templateId}`);
      if (refreshed.ok) setRows(await refreshed.json() as BomRow[]);
      toast.success("BOM listesi kaydedildi");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "BOM kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-24 items-center justify-center border-t border-slate-100">
        <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-600">
            <FlaskConical className="h-3.5 w-3.5 text-emerald-600" />
            BOM listesi
          </p>
          <p className="mt-1 text-xs text-slate-400">Bu liste yalnızca admin panelinde görüntülenir.</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-slate-500">{rows.length} malzeme</p>
          <p className="text-sm font-bold text-emerald-700">
            Maliyet: {totalCost.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-white py-5 text-center text-xs text-slate-400">
          Henüz BOM malzemesi eklenmedi.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[680px] text-xs">
            <thead className="bg-slate-50 text-left font-bold text-slate-500">
              <tr>
                <th className="px-3 py-2">Malzeme</th>
                <th className="px-3 py-2">Kod</th>
                <th className="px-3 py-2 text-center">Birim</th>
                <th className="px-3 py-2 text-center">Miktar</th>
                <th className="px-3 py-2 text-right">Satır maliyeti</th>
                <th className="w-10 px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                const lineCost = (Number(row.price ?? 0) || 0) * (Number(row.requiredQty) || 0);
                return (
                  <tr key={row.materialId}>
                    <td className="px-3 py-2 font-semibold text-slate-800">{row.materialName}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-400">{row.productCode ?? "—"}</td>
                    <td className="px-3 py-2 text-center text-slate-600">{row.unit}</td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min={0.001}
                        step="any"
                        value={row.requiredQty}
                        onChange={(event) => setRows((current) => current.map((item) =>
                          item.materialId === row.materialId
                            ? { ...item, requiredQty: event.target.value }
                            : item,
                        ))}
                        className="input h-8 w-20 text-center text-xs"
                        aria-label={`${row.materialName} BOM miktarı`}
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-slate-700">
                      {lineCost > 0 ? `${lineCost.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺` : "—"}
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => setRows((current) => current.filter((item) => item.materialId !== row.materialId))}
                        className="flex h-7 w-7 items-center justify-center rounded text-red-400 hover:bg-red-50"
                        title="BOM satırını sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-white p-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">BOM'a malzeme ekle</p>
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[190px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={materialSearch}
              onChange={(event) => setMaterialSearch(event.target.value)}
              className="input h-9 w-full pl-8 text-xs"
              placeholder="Malzeme ara…"
            />
          </div>
          <select
            value={materialId}
            onChange={(event) => setMaterialId(event.target.value ? Number(event.target.value) : "")}
            className="input h-9 min-w-[190px] flex-1 text-xs"
          >
            <option value="">Malzeme seç…</option>
            {filteredMaterials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.name}{material.productCode ? ` (${material.productCode})` : ""} — {material.unit}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0.001}
            step="any"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="input h-9 w-24 text-center text-xs"
            placeholder="Miktar"
          />
          <button
            type="button"
            onClick={addMaterial}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Ekle
          </button>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={saveBom}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          BOM'u kaydet
        </button>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  authFetch,
  materials,
  onEdit,
  onDelete,
}: {
  template: QuoteTemplate;
  authFetch: AuthFetch;
  materials: Material[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [bomOpen, setBomOpen] = useState(false);
  const kind = templateKind(template);
  const firstChild = template.children?.[0];
  const imageUrl = kind === "single"
    ? (firstChild?.imageUrl ?? template.imageUrl)
    : template.imageUrl;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-5">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 bg-white object-contain p-1" />
        ) : (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${kind === "single" ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-600"}`}>
            {kind === "single" ? <BookOpen className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-sm font-bold text-slate-900">{template.name}</h2>
            {template.modelCode && (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                {template.modelCode}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {kind === "single" ? "Tekli ürün" : `${template.children?.length ?? 0} alt ürün`}
            {firstChild?.unit ? ` · ${firstChild.unit}` : ""}
            {firstChild?.unitPrice ? ` · ${firstChild.unitPrice}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {template.adminNotes && (
            <span className="hidden items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 sm:flex">
              <StickyNote className="h-3 w-3" />
              Not var
            </span>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Düzenle
          </button>
          <button
            type="button"
            onClick={() => setBomOpen((open) => !open)}
            className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold ${
              bomOpen
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            BOM
            {bomOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50"
            title="Şablonu sil"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {template.adminNotes && (
        <div className="border-t border-amber-100 bg-amber-50/50 px-4 py-2.5 text-xs text-amber-900 sm:px-5">
          <span className="font-bold">Admin notu:</span>{" "}
          {template.adminNotes}
        </div>
      )}

      {bomOpen && (
        <TemplateBomPanel
          templateId={template.id}
          authFetch={authFetch}
          materials={materials}
        />
      )}
    </article>
  );
}

export default function QuoteProductTemplatesPage() {
  const { authFetch } = useAuth();
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeKind, setActiveKind] = useState<TemplateKind>("single");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<{ template: QuoteTemplate | null; kind: TemplateKind } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templateResponse, materialResponse] = await Promise.all([
        authFetch("/api/quote-group-templates"),
        authFetch("/api/stock/materials"),
      ]);
      if (!templateResponse.ok) throw new Error("Şablonlar yüklenemedi");
      if (!materialResponse.ok) throw new Error("Malzemeler yüklenemedi");
      const templateData = await templateResponse.json() as QuoteTemplate[];
      const materialData = await materialResponse.json() as Material[] | { items?: Material[] };
      setTemplates(templateData ?? []);
      setMaterials(Array.isArray(materialData) ? materialData : (materialData.items ?? []));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Veriler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // authFetch is stable for the lifetime of the auth provider.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleTemplates = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");
    return templates
      .filter((template) => templateKind(template) === activeKind)
      .filter((template) => {
        if (!query) return true;
        return [
          template.name,
          template.nameEn ?? "",
          template.modelCode ?? "",
          ...(template.children ?? []).map((child) => `${child.title} ${child.modelCode ?? ""}`),
        ]
          .join(" ")
          .toLocaleLowerCase("tr-TR")
          .includes(query);
      })
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name, "tr"));
  }, [activeKind, search, templates]);

  const countFor = (kind: TemplateKind) => templates.filter((template) => templateKind(template) === kind).length;

  const upsertTemplate = (saved: QuoteTemplate) => {
    setTemplates((current) => {
      const exists = current.some((template) => template.id === saved.id);
      return exists
        ? current.map((template) => template.id === saved.id ? saved : template)
        : [...current, saved];
    });
  };

  const deleteTemplate = async (template: QuoteTemplate) => {
    const kindLabel = templateKind(template) === "single" ? "tekli" : "grup";
    if (!window.confirm(`"${template.name}" ${kindLabel} şablonunu ve bağlı BOM listesini silmek istediğinize emin misiniz?`)) {
      return;
    }
    try {
      const response = await authFetch(`/api/quote-group-templates/${template.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await errorMessage(response, "Şablon silinemedi"));
      setTemplates((current) => current.filter((item) => item.id !== template.id));
      toast.success("Şablon silindi");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Şablon silinemedi");
    }
  };

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-950">Ürün Teklif Şablonları</h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  Teklif formundaki tekli ve grup ürünlerini merkezi olarak yönetin
                </p>
              </div>
            </div>
            <p className="max-w-3xl text-xs leading-5 text-slate-500">
              Buradaki ürün ayarları, teklif oluştururken “Tekli Şablondan” ve “Grup Şablondan” seçeneklerine otomatik yansır.
              BOM listeleri ve admin notları yalnızca yönetici hesabıyla bu sayfada görüntülenir; müşteriye gösterilen teklife aktarılmaz.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setEditor({ template: null, kind: "single" })}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs font-bold text-white hover:bg-slate-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Yeni tekli ürün
            </button>
            <button
              type="button"
              onClick={() => setEditor({ template: null, kind: "group" })}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
            >
              <Layers className="h-3.5 w-3.5" />
              Yeni grup
            </button>
          </div>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          {(["single", "group"] as const).map((kind) => {
            const active = activeKind === kind;
            return (
              <button
                type="button"
                key={kind}
                onClick={() => setActiveKind(kind)}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-blue-300 bg-blue-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                }`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {kind === "single" ? <BookOpen className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${active ? "text-blue-900" : "text-slate-800"}`}>
                    {kind === "single" ? "Tekli ürün şablonları" : "Grup ürün şablonları"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {kind === "single" ? "Tek kalem olarak eklenen ürünler" : "Birden fazla alt üründen oluşan gruplar"}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {countFor(kind)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="input h-11 w-full pl-9 text-sm"
            placeholder="Şablon, ürün adı veya model kodu ara…"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}
          </div>
        ) : visibleTemplates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              {activeKind === "single" ? <BookOpen className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-600">
              {search ? "Aramanızla eşleşen şablon yok" : "Henüz şablon oluşturulmadı"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {activeKind === "single"
                ? "Yeni tekli ürün butonuyla teklif kalemi ayarlarını oluşturun."
                : "Yeni grup butonuyla alt ürünleri olan bir teklif grubu oluşturun."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                authFetch={authFetch}
                materials={materials}
                onEdit={() => setEditor({ template, kind: templateKind(template) })}
                onDelete={() => void deleteTemplate(template)}
              />
            ))}
          </div>
        )}
      </div>

      {editor && (
        <TemplateEditorModal
          key={`${editor.kind}-${editor.template?.id ?? "new"}`}
          template={editor.template}
          kind={editor.kind}
          authFetch={authFetch}
          onClose={() => setEditor(null)}
          onSaved={upsertTemplate}
        />
      )}
    </section>
  );
}