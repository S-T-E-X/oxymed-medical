import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  Save,
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Upload,
  Layers,
  BookOpen,
  BookmarkPlus,
  SeparatorHorizontal,
  ArrowUpToLine,
} from "lucide-react";
import { toast } from "sonner";
import { useListSettings } from "@workspace/api-client-react";
import { useAuth } from "./AuthContext";
import { useImageUpload } from "./useImageUpload";

const UNITS = ["ADET", "SET", "METRE", "MT", "M2", "KG", "PAKET", "KUTU", "TAKIM"] as const;

type Preparer = {
  id: string;
  ad: string;
  telefon: string;
  email: string;
  imzaUrl: string;
};

function parsePreparers(raw: string | undefined): Preparer[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((p) => p && typeof p === "object" && typeof p.ad === "string")
      .map((p) => ({
        id: String(p.id ?? crypto.randomUUID()),
        ad: String(p.ad ?? ""),
        telefon: String(p.telefon ?? ""),
        email: String(p.email ?? ""),
        imzaUrl: String(p.imzaUrl ?? ""),
      }));
  } catch {
    return [];
  }
}

type Product = {
  id: number;
  title: string;
  imageUrl?: string | null;
  quoteTitle?: string | null;
  quoteBullets?: string[];
  quoteModelCode?: string | null;
  quoteImageUrl?: string | null;
  quoteUnit?: string | null;
  quoteUnitPrice?: string | null;
};

type ChildItemDraft = {
  id?: number;
  title: string;
  modelCode: string;
  quantity: number;
  unit: string;
  unitPrice: string;
  showInPdf: boolean;
};

type ItemDraft = {
  id?: number;
  productId?: number | null;
  itemType: "single" | "group";
  title: string;
  bulletsText: string;
  modelCode: string;
  imageUrl: string;
  quantity: number;
  unit: string;
  unitPrice: string;
  sortOrder: number;
  expanded: boolean;
  pageBreakBefore: boolean;
  keepWithPrevious: boolean;
  children: ChildItemDraft[];
};

type GroupTemplate = {
  id: number;
  name: string;
  description?: string | null;
  modelCode?: string | null;
  imageUrl?: string | null;
  children: Array<{
    title: string;
    modelCode?: string;
    unit?: string;
    bullets?: string[];
    unitPrice?: string;
    quantity?: number;
    imageUrl?: string;
  }>;
};

type FormDraft = {
  status: string;
  firmaAdi: string;
  firmaAdres: string;
  firmaTelefon: string;
  firmaEmail: string;
  firmaVergiDairesi: string;
  firmaVergiNo: string;
  teslimatAdresi: string;
  teslimatSuresi: string;
  odemeSekli: string;
  paraBirimi: string;
  iskonto: string;
  iskontoTipi: "yuzde" | "tutar";
  kdv: string;
  showKdv: boolean;
  showGenelToplam: boolean;
  hizmetlerText: string;
  sartlarText: string;
  notlar: string;
  hazirlayan: string;
  hazirlayanTelefon: string;
  hazirlayanEmail: string;
  hazirlayanImzaUrl: string;
  onaylayan: string;
  onaytayanGorev: string;
  onayTarihi: string;
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Taslak", cls: "bg-slate-100 text-slate-600 ring-slate-300" },
  { value: "sent", label: "Gönderildi", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  { value: "approved", label: "Onaylandı", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { value: "rejected", label: "Reddedildi", cls: "bg-red-50 text-red-600 ring-red-200" },
];

const DEFAULT_HIZMETLER = [
  "Projeye özel teknik keşif ve mühendislik desteği",
  "Montaj ve devreye alma hizmeti",
  "Kullanıcı eğitimi",
  "Garanti kapsamındaki yedek parça ve işçilik",
  "Periyodik bakım ve teknik destek",
  "7/24 teknik destek ve danışmanlık",
].join("\n");

const DEFAULT_SARTLAR = [
  "Bu teklif formu 30 gün süreyle geçerlidir.",
  "Fiyatlara KDV dahil değildir.",
  "Teslimat süresi, sipariş onayının ardından belirtilecektir.",
  "Ödeme, belirtilen vade ve koşullarda yapılacaktır.",
  "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.",
  "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır.",
].join("\n");

function newChildItem(): ChildItemDraft {
  return { title: "", modelCode: "", quantity: 1, unit: "METRE", unitPrice: "0", showInPdf: true };
}

function newItem(sortOrder: number): ItemDraft {
  return {
    itemType: "single",
    title: "",
    bulletsText: "",
    modelCode: "",
    imageUrl: "",
    quantity: 1,
    unit: "ADET",
    unitPrice: "0",
    sortOrder,
    expanded: true,
    pageBreakBefore: false,
    keepWithPrevious: false,
    children: [],
  };
}

function newGroup(sortOrder: number): ItemDraft {
  return {
    itemType: "group",
    title: "",
    bulletsText: "",
    modelCode: "",
    imageUrl: "",
    quantity: 0,
    unit: "ADET",
    unitPrice: "0",
    sortOrder,
    expanded: true,
    pageBreakBefore: false,
    keepWithPrevious: false,
    children: [newChildItem()],
  };
}

type ApiItem = {
  id: number;
  productId?: number | null;
  itemType?: string | null;
  title: string;
  bullets?: string[];
  modelCode?: string | null;
  imageUrl?: string | null;
  quantity: number;
  unit: string;
  unitPrice?: string | null;
  sortOrder: number;
  showInPdf?: boolean | null;
  pageBreakBefore?: boolean | null;
  keepWithPrevious?: boolean | null;
};

function apiItemToDraft(it: ApiItem): ItemDraft {
  return {
    id: it.id,
    productId: it.productId,
    itemType: "single",
    title: it.title,
    bulletsText: (it.bullets ?? []).join("\n"),
    modelCode: it.modelCode ?? "",
    imageUrl: it.imageUrl ?? "",
    quantity: it.quantity,
    unit: it.unit,
    unitPrice: it.unitPrice ?? "0",
    sortOrder: it.sortOrder,
    expanded: false,
    pageBreakBefore: it.pageBreakBefore ?? false,
    keepWithPrevious: it.keepWithPrevious ?? false,
    children: [],
  };
}

function apiItemsToHierarchical(apiItems: ApiItem[]): ItemDraft[] {
  const result: ItemDraft[] = [];
  let currentGroup: ItemDraft | null = null;
  for (const it of apiItems) {
    const itype = it.itemType ?? "single";
    if (itype === "group") {
      currentGroup = {
        id: it.id,
        itemType: "group",
        title: it.title,
        bulletsText: (it.bullets ?? []).join("\n"),
        modelCode: it.modelCode ?? "",
        imageUrl: it.imageUrl ?? "",
        quantity: 0,
        unit: "ADET",
        unitPrice: "0",
        sortOrder: it.sortOrder,
        expanded: false,
        pageBreakBefore: it.pageBreakBefore ?? false,
        keepWithPrevious: it.keepWithPrevious ?? false,
        children: [],
      };
      result.push(currentGroup);
    } else if (itype === "child" && currentGroup) {
      currentGroup.children.push({
        id: it.id,
        title: it.title,
        modelCode: it.modelCode ?? "",
        quantity: it.quantity,
        unit: it.unit,
        unitPrice: it.unitPrice ?? "0",
        showInPdf: it.showInPdf ?? true,
      });
    } else {
      currentGroup = null;
      result.push(apiItemToDraft(it));
    }
  }
  return result;
}

// ── Product Selector Modal (unchanged) ──────────────────────────────────────

function ProductSelectorModal({
  authFetch,
  onSelect,
  onClose,
}: {
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  onSelect: (p: Product) => void;
  onClose: () => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    authFetch("/api/products?limit=200&published=true")
      .then((r) => r.json())
      .then((d: { items: Product[] }) => {
        setProducts(d.items ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authFetch]);

  const filtered = products.filter((p) =>
    (p.quoteTitle ?? p.title).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[80vh] w-full max-w-xl flex-col rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Ürün Seç</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
        </div>
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün adı ara…"
              className="input w-full pl-9 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Ürün bulunamadı</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelect(p)}
                  className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition hover:border-blue-200 hover:bg-blue-50"
                >
                  {p.imageUrl && (
                    <img src={p.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded object-contain" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {p.quoteTitle ?? p.title}
                    </p>
                    {p.quoteModelCode && (
                      <p className="text-xs text-slate-400">{p.quoteModelCode}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Single Item Template Picker Modal ────────────────────────────────────────

function SingleItemTemplatePickerModal({
  authFetch,
  onApply,
  onClose,
}: {
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  onApply: (draft: Omit<ItemDraft, "sortOrder" | "expanded" | "children" | "id" | "productId">) => void;
  onClose: () => void;
}) {
  const [templates, setTemplates] = useState<GroupTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    authFetch("/api/quote-group-templates")
      .then((r) => r.json())
      .then((data: GroupTemplate[]) => {
        setTemplates(data.filter((t) => t.description === "__single_item_template"));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authFetch]);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await authFetch(`/api/quote-group-templates/${id}`, { method: "DELETE" });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Şablon silindi");
    } catch {
      toast.error("Silinemedi");
    } finally {
      setDeleting(null);
    }
  };

  const handleApply = (t: GroupTemplate) => {
    const src = t.children[0];
    onApply({
      itemType: "single",
      title: src?.title ?? t.name,
      bulletsText: (src?.bullets ?? []).join("\n"),
      modelCode: src?.modelCode ?? "",
      imageUrl: src?.imageUrl ?? "",
      quantity: 0,
      unit: src?.unit ?? "ADET",
      unitPrice: src?.unitPrice ?? "0",
      pageBreakBefore: false,
      keepWithPrevious: false,
    });
    onClose();
    toast.success(`"${t.name}" şablonu eklendi`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[70vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Tekli Ürün Şablonları</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
            </div>
          ) : templates.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Henüz tekli şablon yok. Bir kalemin içindeki "Şablon Olarak Kaydet" butonunu kullanın.
            </p>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => {
                const src = t.children[0];
                return (
                  <div key={t.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{t.name}</p>
                      {src && (
                        <p className="text-xs text-slate-400 truncate">
                          {src.modelCode && <span className="mr-2 font-semibold">{src.modelCode}</span>}
                          {src.unit} · {src.unitPrice} · ×{src.quantity ?? 1}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleApply(t)}
                      className="shrink-0 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      Ekle
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={deleting === t.id}
                      className="shrink-0 flex h-7 w-7 items-center justify-center rounded text-red-400 hover:bg-red-50 disabled:opacity-40"
                    >
                      {deleting === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-400">
            Şablon oluşturmak için tekli bir kalemin içindeki "Şablon Olarak Kaydet" butonunu kullanın.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Template Picker Modal ────────────────────────────────────────────────────

function TemplatePickerModal({
  authFetch,
  onApply,
  onClose,
}: {
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  onApply: (children: ChildItemDraft[]) => void;
  onClose: () => void;
}) {
  const [templates, setTemplates] = useState<GroupTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    authFetch("/api/quote-group-templates")
      .then((r) => r.json())
      .then((data: GroupTemplate[]) => { setTemplates(data.filter((t) => t.description !== "__single_item_template")); setLoading(false); })
      .catch(() => setLoading(false));
  }, [authFetch]);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await authFetch(`/api/quote-group-templates/${id}`, { method: "DELETE" });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Şablon silindi");
    } catch {
      toast.error("Silinemedi");
    } finally {
      setDeleting(null);
    }
  };

  const handleApply = (t: GroupTemplate) => {
    const children: ChildItemDraft[] = (t.children ?? []).map((c) => ({
      title: c.title,
      modelCode: c.modelCode ?? "",
      quantity: 0,
      unit: c.unit ?? "METRE",
      unitPrice: c.unitPrice ?? "0",
      showInPdf: false,
    }));
    onApply(children);
    onClose();
    toast.success(`"${t.name}" şablonu uygulandı`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[70vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Grup Şablonları</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
            </div>
          ) : templates.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Henüz şablon yok. Bir grubun içindeki "Şablon Olarak Kaydet" butonunu kullanın.
            </p>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{t.name}</p>
                    <p className="text-xs text-slate-400">{(t.children ?? []).length} alt kalem</p>
                    {t.description && (
                      <p className="text-xs text-slate-500 truncate">{t.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleApply(t)}
                    className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    Uygula
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deleting === t.id}
                    className="shrink-0 flex h-7 w-7 items-center justify-center rounded text-red-400 hover:bg-red-50 disabled:opacity-40"
                  >
                    {deleting === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-400">
            Şablon oluşturmak için bir grubun içindeki "Şablon Olarak Kaydet" butonunu kullanın.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Group Template Add Modal ─────────────────────────────────────────────────
// Adds a WHOLE GROUP (header + children) from a saved group template.

function GroupTemplateAddModal({
  authFetch,
  onApply,
  onClose,
}: {
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  onApply: (draft: ItemDraft) => void;
  onClose: () => void;
}) {
  const [templates, setTemplates] = useState<GroupTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    authFetch("/api/quote-group-templates")
      .then((r) => r.json())
      .then((data: GroupTemplate[]) => {
        setTemplates(data.filter((t) => t.description !== "__single_item_template"));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authFetch]);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await authFetch(`/api/quote-group-templates/${id}`, { method: "DELETE" });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Şablon silindi");
    } catch {
      toast.error("Silinemedi");
    } finally {
      setDeleting(null);
    }
  };

  const handleApply = (t: GroupTemplate) => {
    const draft: ItemDraft = {
      itemType: "group",
      title: t.name,
      bulletsText: t.description ?? "",
      modelCode: t.modelCode ?? "",
      imageUrl: t.imageUrl ?? "",
      quantity: 0,
      unit: "ADET",
      unitPrice: "0",
      sortOrder: 0,
      expanded: true,
      pageBreakBefore: false,
      keepWithPrevious: false,
      children: (t.children ?? []).map((c) => ({
        title: c.title,
        modelCode: c.modelCode ?? "",
        quantity: 0,
        unit: c.unit ?? "METRE",
        unitPrice: c.unitPrice ?? "0",
        showInPdf: false,
      })),
    };
    onApply(draft);
    onClose();
    toast.success(`"${t.name}" grubu eklendi`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[70vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Grup Şablonları</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
            </div>
          ) : templates.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Henüz grup şablonu yok. Bir grubun içindeki "Şablon Olarak Kaydet" butonunu kullanın.
            </p>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
                  {t.imageUrl && (
                    <img src={t.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded object-contain" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{t.name}</p>
                    <p className="text-xs text-slate-400">{(t.children ?? []).length} alt kalem</p>
                  </div>
                  <button
                    onClick={() => handleApply(t)}
                    className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    Ekle
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deleting === t.id}
                    className="shrink-0 flex h-7 w-7 items-center justify-center rounded text-red-400 hover:bg-red-50 disabled:opacity-40"
                  >
                    {deleting === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-400">
            Şablon oluşturmak için bir grubun içindeki "Şablon Olarak Kaydet" butonunu kullanın.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Child Item Row ───────────────────────────────────────────────────────────

function ChildItemRow({
  child,
  subNo,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  child: ChildItemDraft;
  subNo: string;
  onChange: (field: keyof ChildItemDraft, value: ChildItemDraft[keyof ChildItemDraft]) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const total = child.quantity * parseFloat(child.unitPrice || "0");

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
      <div className="flex items-start gap-2 mb-2">
        <span className="mt-1 flex h-5 min-w-[2.2rem] items-center justify-center rounded bg-blue-100 px-1 text-[10px] font-bold text-blue-700 shrink-0">
          {subNo}
        </span>
        <input
          value={child.title}
          onChange={(e) => onChange("title", e.target.value)}
          className="input flex-1 text-xs"
          placeholder="Alt kalem açıklaması *"
        />
        <input
          value={child.modelCode}
          onChange={(e) => onChange("modelCode", e.target.value)}
          className="input w-28 text-xs shrink-0"
          placeholder="Model/Kod"
        />
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-200 disabled:opacity-30"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-200 disabled:opacity-30"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onRemove}
            className="flex h-6 w-6 items-center justify-center rounded text-red-400 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-9 flex-wrap">
        <div className="flex items-center gap-1">
          <label className="text-[10px] text-slate-500 shrink-0">Miktar</label>
          <input
            type="number"
            min={0}
            value={child.quantity}
            onChange={(e) => onChange("quantity", parseFloat(e.target.value) || 0)}
            className="input w-16 text-xs"
          />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-[10px] text-slate-500 shrink-0">Birim</label>
          <select
            value={child.unit}
            onChange={(e) => onChange("unit", e.target.value)}
            className="input w-20 text-xs"
          >
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <label className="text-[10px] text-slate-500 shrink-0">Birim Fiyat</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={child.unitPrice}
            onChange={(e) => onChange("unitPrice", e.target.value)}
            className="input w-24 text-xs"
          />
        </div>
        <div className="text-xs font-bold text-slate-600 min-w-[4rem]">
          = {total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
        </div>
        <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer select-none ml-auto">
          <input
            type="checkbox"
            checked={child.showInPdf}
            onChange={(e) => onChange("showInPdf", e.target.checked)}
            className="h-3 w-3"
          />
          PDF'te göster
        </label>
      </div>
    </div>
  );
}

// ── Group Item Row ───────────────────────────────────────────────────────────

function GroupItemRow({
  item,
  groupNo,
  onChange,
  onChildChange,
  onChildRemove,
  onChildAdd,
  onChildMove,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  authFetch,
}: {
  item: ItemDraft;
  groupNo: number;
  onChange: (field: keyof ItemDraft, value: ItemDraft[keyof ItemDraft]) => void;
  onChildChange: (childIdx: number, field: keyof ChildItemDraft, value: ChildItemDraft[keyof ChildItemDraft]) => void;
  onChildRemove: (childIdx: number) => void;
  onChildAdd: () => void;
  onChildMove: (childIdx: number, dir: -1 | 1) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}) {
  const groupTotal = item.children.reduce(
    (s, c) => s + c.quantity * parseFloat(c.unitPrice || "0"),
    0
  );
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  const handleSaveAsTemplate = async () => {
    if (!saveTemplateName.trim()) return;
    setSavingTemplate(true);
    try {
      const children = item.children.map((c) => ({
        title: c.title || "—",
        modelCode: c.modelCode || undefined,
        unit: c.unit,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
      }));
      const r = await authFetch("/api/quote-group-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: saveTemplateName.trim(),
          modelCode: item.modelCode || undefined,
          description: item.bulletsText || undefined,
          imageUrl: item.imageUrl || undefined,
          children,
        }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => null) as { error?: string } | null;
        throw new Error(e?.error ?? `Sunucu hatası (${r.status})`);
      }
      toast.success(`"${saveTemplateName.trim()}" şablon olarak kaydedildi`);
      setSaveTemplateName("");
      setShowSaveForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Şablon kaydedilemedi");
    } finally {
      setSavingTemplate(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div
        className="flex cursor-pointer items-center gap-3 bg-blue-50 px-4 py-3 hover:bg-blue-100"
        onClick={() => onChange("expanded", !item.expanded)}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          {groupNo}
        </span>
        <Layers className="h-4 w-4 shrink-0 text-blue-400" />
        <p className="flex-1 truncate text-sm font-bold text-blue-900">
          {item.title || <span className="italic font-normal text-blue-400">Grup adı giriniz…</span>}
        </p>
        <span className="shrink-0 text-xs text-slate-500">
          {item.children.length} alt kalem
        </span>
        {groupTotal > 0 && (
          <span className="shrink-0 text-xs font-bold text-slate-600">
            {groupTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </span>
        )}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-blue-200 disabled:opacity-30"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-blue-200 disabled:opacity-30"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              onChange("keepWithPrevious", !item.keepWithPrevious);
              if (!item.keepWithPrevious && item.pageBreakBefore) onChange("pageBreakBefore", false);
            }}
            title={item.keepWithPrevious ? "Önceki sayfaya sıkıştırılıyor — kaldır" : "Bu grubu önceki (üst) sayfaya sıkıştır"}
            className={`flex h-6 w-6 items-center justify-center rounded ${
              item.keepWithPrevious
                ? "bg-sky-600 text-white hover:bg-sky-700"
                : "text-slate-400 hover:bg-blue-200"
            }`}
          >
            <ArrowUpToLine className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              onChange("pageBreakBefore", !item.pageBreakBefore);
              if (!item.pageBreakBefore && item.keepWithPrevious) onChange("keepWithPrevious", false);
            }}
            title={item.pageBreakBefore ? "Yeni sayfada başlıyor — kaldır" : "Bu grubu yeni (alt) sayfaya taşı"}
            className={`flex h-6 w-6 items-center justify-center rounded ${
              item.pageBreakBefore
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "text-slate-400 hover:bg-blue-200"
            }`}
          >
            <SeparatorHorizontal className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onRemove}
            className="flex h-6 w-6 items-center justify-center rounded text-red-400 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        {item.expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-blue-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-blue-400" />
        )}
      </div>

      {item.expanded && (
        <div className="border-t border-blue-100 px-4 py-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="label">Grup Adı *</label>
              <input
                value={item.title}
                onChange={(e) => onChange("title", e.target.value)}
                className="input w-full text-sm"
                placeholder="Medikal Gaz Boruları, İstasyon Ekipmanları…"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div>
              <label className="label">Model / Kod</label>
              <input
                value={item.modelCode}
                onChange={(e) => onChange("modelCode", e.target.value)}
                className="input w-full text-sm"
                placeholder="OXM-GRP-01"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="sm:col-span-3">
              <label className="label">Açıklama (isteğe bağlı)</label>
              <textarea
                value={item.bulletsText}
                onChange={(e) => onChange("bulletsText", e.target.value)}
                className="input w-full text-sm"
                rows={2}
                placeholder="Gruba ait kısa açıklama veya notlar…"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="sm:col-span-3">
              <label className="label">Grup Görseli URL (isteğe bağlı)</label>
              <input
                value={item.imageUrl}
                onChange={(e) => onChange("imageUrl", e.target.value)}
                className="input w-full text-sm"
                placeholder="https://…"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowTemplatePicker(true)}
              className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Şablondan Yükle
            </button>
            {!showSaveForm ? (
              <button
                onClick={() => { setShowSaveForm(true); setSaveTemplateName(item.title || ""); }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <BookmarkPlus className="h-3.5 w-3.5" />
                Şablon Olarak Kaydet
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  value={saveTemplateName}
                  onChange={(e) => setSaveTemplateName(e.target.value)}
                  className="input text-xs"
                  placeholder="Şablon adı…"
                  style={{ width: "160px" }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveAsTemplate(); }}
                  autoFocus
                />
                <button
                  onClick={handleSaveAsTemplate}
                  disabled={savingTemplate || !saveTemplateName.trim()}
                  className="flex items-center gap-1 rounded-lg bg-slate-700 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {savingTemplate ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  Kaydet
                </button>
                <button
                  onClick={() => { setShowSaveForm(false); setSaveTemplateName(""); }}
                  className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Alt Kalemler ({item.children.length})
              </span>
            </div>
            {item.children.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-blue-100 py-6 text-center text-xs text-slate-400">
                Alt kalem yok. Aşağıdan ekleyin.
              </div>
            ) : (
              <div className="space-y-2">
                {item.children.map((child, j) => (
                  <ChildItemRow
                    key={j}
                    child={child}
                    subNo={`${groupNo}.${j + 1}`}
                    onChange={(field, value) => onChildChange(j, field, value)}
                    onRemove={() => onChildRemove(j)}
                    onMoveUp={() => onChildMove(j, -1)}
                    onMoveDown={() => onChildMove(j, 1)}
                    isFirst={j === 0}
                    isLast={j === item.children.length - 1}
                  />
                ))}
              </div>
            )}
            <button
              onClick={onChildAdd}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-blue-200 py-2 text-xs font-semibold text-blue-600 hover:border-blue-400 hover:bg-blue-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Alt Kalem Ekle
            </button>
          </div>
        </div>
      )}

      {showTemplatePicker && (
        <TemplatePickerModal
          authFetch={authFetch}
          onApply={(children) => onChange("children", children)}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
    </div>
  );
}

// ── Single Item Row ──────────────────────────────────────────────────────────

function ItemRow({
  item,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  authFetch,
}: {
  item: ItemDraft;
  index: number;
  onChange: (field: keyof ItemDraft, value: ItemDraft[keyof ItemDraft]) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}) {
  const total = item.quantity * parseFloat(item.unitPrice || "0");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  const handleSaveAsTemplate = async () => {
    if (!saveTemplateName.trim()) return;
    setSavingTemplate(true);
    try {
      const bullets = item.bulletsText.split("\n").map((s) => s.trim()).filter(Boolean);
      const r = await authFetch("/api/quote-group-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: saveTemplateName.trim(),
          description: "__single_item_template",
          children: [{
            title: item.title || "—",
            modelCode: item.modelCode || undefined,
            unit: item.unit,
            bullets,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            imageUrl: item.imageUrl || undefined,
          }],
        }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => null) as { error?: string } | null;
        throw new Error(e?.error ?? `Sunucu hatası (${r.status})`);
      }
      toast.success(`"${saveTemplateName.trim()}" şablon olarak kaydedildi`);
      setSaveTemplateName("");
      setShowSaveForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Şablon kaydedilemedi");
    } finally {
      setSavingTemplate(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div
        className="flex cursor-pointer items-center gap-3 bg-blue-50 px-4 py-3 hover:bg-blue-100"
        onClick={() => onChange("expanded", !item.expanded)}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
          {index + 1}
        </span>
        <p className="flex-1 truncate text-sm font-semibold text-slate-800">
          {item.title || <span className="italic text-slate-300">Başlıksız kalem</span>}
        </p>
        <span className="text-xs font-bold text-slate-500">
          {total.toLocaleString("tr-TR")}
        </span>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              onChange("keepWithPrevious", !item.keepWithPrevious);
              if (!item.keepWithPrevious && item.pageBreakBefore) onChange("pageBreakBefore", false);
            }}
            title={item.keepWithPrevious ? "Önceki sayfaya sıkıştırılıyor — kaldır" : "Bu kalemi önceki (üst) sayfaya sıkıştır"}
            className={`flex h-6 w-6 items-center justify-center rounded ${
              item.keepWithPrevious
                ? "bg-sky-600 text-white hover:bg-sky-700"
                : "text-slate-400 hover:bg-slate-100"
            }`}
          >
            <ArrowUpToLine className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              onChange("pageBreakBefore", !item.pageBreakBefore);
              if (!item.pageBreakBefore && item.keepWithPrevious) onChange("keepWithPrevious", false);
            }}
            title={item.pageBreakBefore ? "Yeni sayfada başlıyor — kaldır" : "Bu kalemi yeni (alt) sayfaya taşı"}
            className={`flex h-6 w-6 items-center justify-center rounded ${
              item.pageBreakBefore
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "text-slate-400 hover:bg-slate-100"
            }`}
          >
            <SeparatorHorizontal className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onRemove}
            className="flex h-6 w-6 items-center justify-center rounded text-red-400 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        {item.expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </div>

      {item.expanded && (
        <div className="border-t border-slate-100 px-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Ürün / Hizmet Başlığı *</label>
              <input
                value={item.title}
                onChange={(e) => onChange("title", e.target.value)}
                className="input w-full text-sm"
                placeholder="Ürün adı"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Özellikler (her satır bir madde)</label>
              <textarea
                value={item.bulletsText}
                onChange={(e) => onChange("bulletsText", e.target.value)}
                className="input w-full text-sm"
                rows={4}
                placeholder="CE sertifikalı&#10;Sesli alarm sistemi&#10;..."
              />
            </div>

            <div>
              <label className="label">Model / Kod</label>
              <input
                value={item.modelCode}
                onChange={(e) => onChange("modelCode", e.target.value)}
                className="input w-full text-sm"
                placeholder="OXM-XXX-00"
              />
            </div>

            <div>
              <label className="label">Görsel URL</label>
              <input
                value={item.imageUrl}
                onChange={(e) => onChange("imageUrl", e.target.value)}
                className="input w-full text-sm"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="label">Miktar</label>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => onChange("quantity", parseInt(e.target.value) || 1)}
                className="input w-full text-sm"
              />
            </div>

            <div>
              <label className="label">Birim</label>
              <select
                value={item.unit}
                onChange={(e) => onChange("unit", e.target.value)}
                className="input w-full text-sm"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Birim Fiyat</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={item.unitPrice}
                onChange={(e) => onChange("unitPrice", e.target.value)}
                className="input w-full text-sm"
                placeholder="0"
              />
            </div>

            <div>
              <label className="label">Toplam Fiyat</label>
              <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700">
                {total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            {!showSaveForm ? (
              <button
                onClick={() => { setShowSaveForm(true); setSaveTemplateName(item.title || ""); }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <BookmarkPlus className="h-3.5 w-3.5" />
                Şablon Olarak Kaydet
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  value={saveTemplateName}
                  onChange={(e) => setSaveTemplateName(e.target.value)}
                  className="input text-xs"
                  placeholder="Şablon adı…"
                  style={{ width: "160px" }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveAsTemplate(); }}
                  autoFocus
                />
                <button
                  onClick={handleSaveAsTemplate}
                  disabled={savingTemplate || !saveTemplateName.trim()}
                  className="flex items-center gap-1 rounded-lg bg-slate-700 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {savingTemplate ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  Kaydet
                </button>
                <button
                  onClick={() => { setShowSaveForm(false); setSaveTemplateName(""); }}
                  className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function QuoteFormEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const { uploadFile, uploading } = useImageUpload();
  const imzaInputRef = useRef<HTMLInputElement>(null);
  const { data: settings } = useListSettings();
  const preparers = parsePreparers((settings as Record<string, string> | undefined)?.["hazirlayan_kisiler"]);

  const [quoteNo, setQuoteNo] = useState("");
  const [tab, setTab] = useState<"items" | "info">("items");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<ItemDraft[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSingleTemplatePicker, setShowSingleTemplatePicker] = useState(false);
  const [showGroupTemplatePicker, setShowGroupTemplatePicker] = useState(false);
  const [form, setForm] = useState<FormDraft>({
    status: "draft",
    firmaAdi: "",
    firmaAdres: "",
    firmaTelefon: "",
    firmaEmail: "",
    firmaVergiDairesi: "",
    firmaVergiNo: "",
    teslimatAdresi: "",
    teslimatSuresi: "Sipariş onayından sonra 21 iş günü",
    odemeSekli: "%40 sipariş, %60 teslimat öncesi",
    paraBirimi: "EUR",
    iskonto: "0",
    iskontoTipi: "yuzde",
    kdv: "20",
    showKdv: true,
    showGenelToplam: true,
    hizmetlerText: DEFAULT_HIZMETLER,
    sartlarText: DEFAULT_SARTLAR,
    notlar: "",
    hazirlayan: "",
    hazirlayanTelefon: "",
    hazirlayanEmail: "",
    hazirlayanImzaUrl: "",
    onaylayan: "",
    onaytayanGorev: "",
    onayTarihi: "",
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    authFetch(`/api/quote-forms/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data) => {
        setQuoteNo(data.quoteNo ?? "");
        setItems(apiItemsToHierarchical(data.items ?? []));
        setForm((prev) => ({
          ...prev,
          status: data.status ?? "draft",
          firmaAdi: data.firmaAdi ?? "",
          firmaAdres: data.firmaAdres ?? "",
          firmaTelefon: data.firmaTelefon ?? "",
          firmaEmail: data.firmaEmail ?? "",
          firmaVergiDairesi: data.firmaVergiDairesi ?? "",
          firmaVergiNo: data.firmaVergiNo ?? "",
          teslimatAdresi: data.teslimatAdresi ?? "",
          teslimatSuresi: data.teslimatSuresi ?? prev.teslimatSuresi,
          odemeSekli: data.odemeSekli ?? prev.odemeSekli,
          paraBirimi: data.paraBirimi ?? "EUR",
          iskonto: data.iskonto ?? "0",
          iskontoTipi: (data.iskontoTipi === "tutar" ? "tutar" : "yuzde") as "yuzde" | "tutar",
          kdv: data.kdv ?? "20",
          showKdv: data.showKdv ?? true,
          showGenelToplam: data.showGenelToplam ?? true,
          hizmetlerText:
            (data.hizmetler ?? []).length > 0
              ? (data.hizmetler as string[]).join("\n")
              : DEFAULT_HIZMETLER,
          sartlarText:
            (data.sartlar ?? []).length > 0
              ? (data.sartlar as string[]).join("\n")
              : DEFAULT_SARTLAR,
          notlar: data.notlar ?? "",
          hazirlayan: data.hazirlayan ?? "",
          hazirlayanTelefon: data.hazirlayanTelefon ?? "",
          hazirlayanEmail: data.hazirlayanEmail ?? "",
          hazirlayanImzaUrl: data.hazirlayanImzaUrl ?? "",
          onaylayan: data.onaylayan ?? "",
          onaytayanGorev: data.onaytayanGorev ?? "",
          onayTarihi: data.onayTarihi ?? "",
        }));
      })
      .catch((err: Error) => {
        if (err.message !== "401") {
          toast.error("Teklif formu yüklenemedi");
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Item callbacks ──

  const updateItem = useCallback((index: number, field: keyof ItemDraft, value: ItemDraft[keyof ItemDraft]) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveItem = useCallback((index: number, dir: -1 | 1) => {
    setItems((prev) => {
      const arr = [...prev];
      const target = index + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target]!, arr[index]!];
      return arr;
    });
  }, []);

  // ── Group child callbacks ──

  const updateGroupChild = useCallback((groupIdx: number, childIdx: number, field: keyof ChildItemDraft, value: ChildItemDraft[keyof ChildItemDraft]) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== groupIdx) return it;
        return { ...it, children: it.children.map((c, j) => j === childIdx ? { ...c, [field]: value } : c) };
      })
    );
  }, []);

  const removeGroupChild = useCallback((groupIdx: number, childIdx: number) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== groupIdx) return it;
        return { ...it, children: it.children.filter((_, j) => j !== childIdx) };
      })
    );
  }, []);

  const addGroupChild = useCallback((groupIdx: number) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== groupIdx) return it;
        return { ...it, children: [...it.children, newChildItem()] };
      })
    );
  }, []);

  const moveGroupChild = useCallback((groupIdx: number, childIdx: number, dir: -1 | 1) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== groupIdx) return it;
        const arr = [...it.children];
        const target = childIdx + dir;
        if (target < 0 || target >= arr.length) return it;
        [arr[childIdx], arr[target]] = [arr[target]!, arr[childIdx]!];
        return { ...it, children: arr };
      })
    );
  }, []);

  // ── Add actions ──

  const addBlankItem = () => {
    setItems((prev) => [...prev, newItem(prev.length)]);
  };

  const addBlankGroup = () => {
    setItems((prev) => [...prev, newGroup(prev.length)]);
  };

  const addFromSingleTemplate = (draft: Omit<ItemDraft, "sortOrder" | "expanded" | "children" | "id" | "productId">) => {
    const item: ItemDraft = {
      ...draft,
      productId: null,
      sortOrder: items.length,
      expanded: false,
      children: [],
    };
    setItems((prev) => [...prev, item]);
  };

  const addFromGroupTemplate = (draft: ItemDraft) => {
    setItems((prev) => [...prev, { ...draft, sortOrder: prev.length }]);
  };

  const addFromProduct = (p: Product) => {
    const draft: ItemDraft = {
      productId: p.id,
      itemType: "single",
      title: p.quoteTitle ?? p.title,
      bulletsText: (p.quoteBullets ?? []).join("\n"),
      modelCode: p.quoteModelCode ?? "",
      imageUrl: p.quoteImageUrl ?? p.imageUrl ?? "",
      quantity: 1,
      unit: p.quoteUnit ?? "ADET",
      unitPrice: p.quoteUnitPrice ?? "0",
      sortOrder: items.length,
      expanded: false,
      pageBreakBefore: false,
      keepWithPrevious: false,
      children: [],
    };
    setItems((prev) => [...prev, draft]);
    setShowProductModal(false);
    toast.success(`"${draft.title}" eklendi`);
  };

  // ── Save ──

  const saveItems = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const body: Array<Record<string, unknown>> = [];
      let sortOrder = 0;
      for (const item of items) {
        if (item.itemType === "group") {
          body.push({
            productId: null,
            itemType: "group",
            parentItemId: null,
            title: item.title || "Grup",
            bullets: item.bulletsText.split("\n").map((s) => s.trim()).filter(Boolean),
            modelCode: item.modelCode || null,
            imageUrl: item.imageUrl || null,
            quantity: 0,
            unit: "ADET",
            unitPrice: "0",
            sortOrder: sortOrder++,
            showInPdf: true,
            pageBreakBefore: item.pageBreakBefore,
            keepWithPrevious: item.pageBreakBefore ? false : item.keepWithPrevious,
          });
          for (const child of item.children) {
            body.push({
              productId: null,
              itemType: "child",
              parentItemId: null,
              title: child.title || "—",
              bullets: [],
              modelCode: child.modelCode || null,
              imageUrl: null,
              quantity: child.quantity,
              unit: child.unit,
              unitPrice: child.unitPrice,
              sortOrder: sortOrder++,
              showInPdf: child.showInPdf,
            });
          }
        } else {
          body.push({
            productId: item.productId ?? null,
            itemType: "single",
            parentItemId: null,
            title: item.title,
            bullets: item.bulletsText
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            modelCode: item.modelCode || null,
            imageUrl: item.imageUrl || null,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            sortOrder: sortOrder++,
            showInPdf: true,
            pageBreakBefore: item.pageBreakBefore,
            keepWithPrevious: item.pageBreakBefore ? false : item.keepWithPrevious,
          });
        }
      }

      const r = await authFetch(`/api/quote-forms/${id}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error();
      const saved = (await r.json()) as ApiItem[];
      // Reload with new IDs
      setItems(apiItemsToHierarchical(saved));
      toast.success("Kalemler kaydedildi");
    } catch {
      toast.error("Kalemler kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  const saveInfo = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const body = {
        status: form.status,
        firmaAdi: form.firmaAdi || null,
        firmaAdres: form.firmaAdres || null,
        firmaTelefon: form.firmaTelefon || null,
        firmaEmail: form.firmaEmail || null,
        firmaVergiDairesi: form.firmaVergiDairesi || null,
        firmaVergiNo: form.firmaVergiNo || null,
        teslimatAdresi: form.teslimatAdresi || null,
        teslimatSuresi: form.teslimatSuresi || null,
        odemeSekli: form.odemeSekli || null,
        paraBirimi: form.paraBirimi,
        iskonto: form.iskonto,
        iskontoTipi: form.iskontoTipi,
        kdv: form.kdv,
        showKdv: form.showKdv,
        showGenelToplam: form.showGenelToplam,
        hizmetler: form.hizmetlerText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        sartlar: form.sartlarText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        notlar: form.notlar || null,
        hazirlayan: form.hazirlayan || null,
        hazirlayanTelefon: form.hazirlayanTelefon || null,
        hazirlayanEmail: form.hazirlayanEmail || null,
        hazirlayanImzaUrl: form.hazirlayanImzaUrl || null,
        onaylayan: form.onaylayan || null,
        onaytayanGorev: form.onaytayanGorev || null,
        onayTarihi: form.onayTarihi || null,
      };
      const r = await authFetch(`/api/quote-forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error();
      toast.success("Bilgiler kaydedildi");
    } catch {
      toast.error("Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  const setField = (key: keyof FormDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    );
  }

  const araTopam = items.reduce((sum, item) => {
    if (item.itemType === "group") {
      return sum + item.children.reduce((cs, c) => cs + c.quantity * parseFloat(c.unitPrice || "0"), 0);
    }
    return sum + item.quantity * parseFloat(item.unitPrice || "0");
  }, 0);

  const totalItemCount = items.reduce((n, item) => n + (item.itemType === "group" ? item.children.length : 1), 0);

  // Compute top-level display numbers (both singles and groups count together)
  let topNoCounter = 0;
  const itemsWithNo = items.map((item) => {
    topNoCounter++;
    return { item, topNo: topNoCounter };
  });

  return (
    <div className="flex flex-col">
      <div className="sticky top-[60px] z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">
        <button
          onClick={() => navigate("/admin/teklif-formlari")}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Geri
        </button>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-700">{quoteNo}</p>
          <p className="text-xs text-slate-400">Teklif Formu Düzenle</p>
        </div>
        <select
          value={form.status}
          onChange={setField("status")}
          className={`rounded-full px-3 py-1 text-[11px] font-bold ring-1 outline-none ${STATUS_OPTIONS.find((o) => o.value === form.status)?.cls ?? "bg-slate-100 text-slate-500 ring-slate-200"}`}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <a
          href={`/teklif-goruntule/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <Eye className="h-3.5 w-3.5" />
          PDF Önizleme
        </a>
        <button
          onClick={tab === "items" ? saveItems : saveInfo}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Kaydet
        </button>
      </div>

      <div className="px-4 pt-5 sm:px-6">
        <div className="flex gap-1 border-b border-slate-200">
          {(["items", "info"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-t-lg px-5 py-2.5 text-sm font-bold transition ${
                tab === t
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t === "items" ? "Kalemler" : "Bilgiler"}
            </button>
          ))}
        </div>
      </div>

      {tab === "items" && (
        <div className="px-4 py-5 sm:px-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-sm font-semibold text-slate-700">{totalItemCount} kalem</span>
              {totalItemCount > 0 && (
                <span className="ml-3 text-sm text-slate-500">
                  Ara Toplam: {araTopam.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {form.paraBirimi}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => setShowProductModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Search className="h-3.5 w-3.5" />
                Ürün Seç
              </button>
              <button
                onClick={addBlankItem}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Tekli Ürün
              </button>
              <button
                onClick={() => setShowSingleTemplatePicker(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <BookmarkPlus className="h-3.5 w-3.5" />
                Tekli Şablondan
              </button>
              <button
                onClick={addBlankGroup}
                className="flex items-center gap-1.5 rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                <Layers className="h-3.5 w-3.5" />
                Gruplu Ürün
              </button>
              <button
                onClick={() => setShowGroupTemplatePicker(true)}
                className="flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Grup Şablondan
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
              <p className="text-slate-400">Henüz kalem yok. Ürün seç, tekli ya da gruplu ekle.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {itemsWithNo.map(({ item, topNo }, i) => {
                const breakDivider = item.pageBreakBefore && i > 0 ? (
                  <div className="flex items-center gap-2 px-1 py-1 text-amber-600" key={`brk-${i}`}>
                    <span className="h-px flex-1 border-t border-dashed border-amber-300" />
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide">
                      <SeparatorHorizontal className="h-3 w-3" />
                      Yeni (alt) sayfa
                    </span>
                    <span className="h-px flex-1 border-t border-dashed border-amber-300" />
                  </div>
                ) : item.keepWithPrevious && i > 0 ? (
                  <div className="flex items-center gap-2 px-1 py-1 text-sky-600" key={`brk-${i}`}>
                    <span className="h-px flex-1 border-t border-dashed border-sky-300" />
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide">
                      <ArrowUpToLine className="h-3 w-3" />
                      Önceki (üst) sayfaya sıkıştır
                    </span>
                    <span className="h-px flex-1 border-t border-dashed border-sky-300" />
                  </div>
                ) : null;
                if (item.itemType === "group") {
                  return (
                    <div key={i}>
                      {breakDivider}
                      <GroupItemRow
                        item={item}
                        groupNo={topNo}
                        onChange={(field, value) => updateItem(i, field, value)}
                        onChildChange={(ci, field, value) => updateGroupChild(i, ci, field, value)}
                        onChildRemove={(ci) => removeGroupChild(i, ci)}
                        onChildAdd={() => addGroupChild(i)}
                        onChildMove={(ci, dir) => moveGroupChild(i, ci, dir)}
                        onRemove={() => removeItem(i)}
                        onMoveUp={() => moveItem(i, -1)}
                        onMoveDown={() => moveItem(i, 1)}
                        isFirst={i === 0}
                        isLast={i === items.length - 1}
                        authFetch={authFetch}
                      />
                    </div>
                  );
                }
                return (
                  <div key={i}>
                    {breakDivider}
                    <ItemRow
                      item={item}
                      index={i}
                      onChange={(field, value) => updateItem(i, field, value)}
                      onRemove={() => removeItem(i)}
                      onMoveUp={() => moveItem(i, -1)}
                      onMoveDown={() => moveItem(i, 1)}
                      isFirst={i === 0}
                      isLast={i === items.length - 1}
                      authFetch={authFetch}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={saveItems}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Kalemleri Kaydet
            </button>
          </div>
        </div>
      )}

      {tab === "info" && (
        <div className="px-4 py-5 sm:px-6">
          <div className="space-y-6 max-w-3xl">
            <section>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-slate-400">Firma Bilgileri</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Kurum / Firma Adı</label>
                  <input value={form.firmaAdi} onChange={setField("firmaAdi")} className="input w-full text-sm" placeholder="Ankara Şehir Hastanesi" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Adres</label>
                  <input value={form.firmaAdres} onChange={setField("firmaAdres")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">Telefon</label>
                  <input value={form.firmaTelefon} onChange={setField("firmaTelefon")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">E-posta</label>
                  <input value={form.firmaEmail} onChange={setField("firmaEmail")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">Vergi Dairesi</label>
                  <input value={form.firmaVergiDairesi} onChange={setField("firmaVergiDairesi")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">Vergi No</label>
                  <input value={form.firmaVergiNo} onChange={setField("firmaVergiNo")} className="input w-full text-sm" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-slate-400">Teslimat ve Ödeme</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Teslimat Adresi</label>
                  <input value={form.teslimatAdresi} onChange={setField("teslimatAdresi")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">Teslimat Süresi</label>
                  <input value={form.teslimatSuresi} onChange={setField("teslimatSuresi")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">Ödeme Şekli</label>
                  <input value={form.odemeSekli} onChange={setField("odemeSekli")} className="input w-full text-sm" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-slate-400">Fiyatlandırma</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label">Para Birimi</label>
                  <select value={form.paraBirimi} onChange={setField("paraBirimi")} className="input w-full text-sm">
                    {["EUR", "USD", "TRY", "GBP"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">İskonto ({form.iskontoTipi === "tutar" ? form.paraBirimi : "%"})</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      max={form.iskontoTipi === "yuzde" ? 100 : undefined}
                      step={form.iskontoTipi === "tutar" ? "0.01" : "1"}
                      value={form.iskonto}
                      onChange={setField("iskonto")}
                      className="input w-full text-sm"
                    />
                    <select
                      value={form.iskontoTipi}
                      onChange={(e) => setForm((p) => ({ ...p, iskontoTipi: e.target.value as "yuzde" | "tutar" }))}
                      className="input w-24 text-sm"
                    >
                      <option value="yuzde">%</option>
                      <option value="tutar">Tutar</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">KDV (%)</label>
                  <input type="number" min={0} max={100} value={form.kdv} onChange={setField("kdv")} className="input w-full text-sm" />
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-slate-500">PDF'te Gösterilecek Toplam Kutucukları</p>
                <div className="flex flex-wrap gap-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 bg-white">
                      <svg className="h-2.5 w-2.5 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
                    </div>
                    <span className="text-sm font-semibold text-slate-600">Ara Toplam</span>
                    <span className="text-[10px] text-slate-400">(her zaman gösterilir)</span>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.showKdv}
                      onChange={(e) => setForm((p) => ({ ...p, showKdv: e.target.checked }))}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600"
                    />
                    <span className="text-sm font-semibold text-slate-700">KDV Satırı</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.showGenelToplam}
                      onChange={(e) => setForm((p) => ({ ...p, showGenelToplam: e.target.checked }))}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600"
                    />
                    <span className="text-sm font-semibold text-slate-700">Genel Toplam Satırı</span>
                  </label>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-slate-400">Dahil Hizmetler</h2>
              <textarea
                value={form.hizmetlerText}
                onChange={setField("hizmetlerText")}
                className="input w-full text-sm"
                rows={7}
                placeholder="Her satır bir hizmet maddesi"
              />
              <p className="mt-1 text-xs text-slate-400">Her satır PDF'te ayrı madde olarak görünür</p>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-slate-400">Genel Şartlar</h2>
              <textarea
                value={form.sartlarText}
                onChange={setField("sartlarText")}
                className="input w-full text-sm"
                rows={7}
                placeholder="Her satır bir şart maddesi"
              />
            </section>

            <section>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-slate-400">Notlar</h2>
              <textarea
                value={form.notlar}
                onChange={setField("notlar")}
                className="input w-full text-sm"
                rows={3}
                placeholder="Ek açıklamalar..."
              />
            </section>

            <section>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-slate-400">Teklifi Hazırlayan</h2>
              {preparers.length > 0 && (
                <div className="mb-4">
                  <label className="label">Kayıtlı Kişi Seç</label>
                  <select
                    value=""
                    onChange={(e) => {
                      const p = preparers.find((x) => x.id === e.target.value);
                      if (!p) return;
                      setForm((prev) => ({
                        ...prev,
                        hazirlayan: p.ad,
                        hazirlayanTelefon: p.telefon,
                        hazirlayanEmail: p.email,
                        hazirlayanImzaUrl: p.imzaUrl,
                      }));
                      toast.success(`"${p.ad}" bilgileri yüklendi`);
                    }}
                    className="input w-full text-sm"
                  >
                    <option value="">— Kayıtlı kişiden seç (otomatik doldur) —</option>
                    {preparers.map((p) => (
                      <option key={p.id} value={p.id}>{p.ad}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-400">Site Ayarları → Hazırlayan Kişiler bölümünden yönetebilirsiniz</p>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label">Ad Soyad</label>
                  <input value={form.hazirlayan} onChange={setField("hazirlayan")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">Telefon</label>
                  <input value={form.hazirlayanTelefon} onChange={setField("hazirlayanTelefon")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">E-posta</label>
                  <input value={form.hazirlayanEmail} onChange={setField("hazirlayanEmail")} className="input w-full text-sm" />
                </div>
              </div>
              <div className="mt-4">
                <label className="label">İmza / Kaşe Görseli</label>
                <div className="flex items-center gap-3">
                  {form.hazirlayanImzaUrl ? (
                    <div className="relative">
                      <img src={form.hazirlayanImzaUrl} alt="İmza" className="h-16 w-auto rounded border border-slate-200 bg-white object-contain px-2" />
                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, hazirlayanImzaUrl: "" }))}
                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
                        title="Kaldır"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-16 w-32 items-center justify-center rounded border border-dashed border-slate-300 text-xs text-slate-400">Görsel yok</div>
                  )}
                  <input
                    ref={imzaInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const { publicUrl } = await uploadFile(file);
                        setForm((p) => ({ ...p, hazirlayanImzaUrl: publicUrl }));
                        toast.success("İmza yüklendi");
                      } catch {
                        toast.error("Yükleme başarısız");
                      } finally {
                        if (imzaInputRef.current) imzaInputRef.current.value = "";
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => imzaInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {form.hazirlayanImzaUrl ? "Değiştir" : "Yükle"}
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-400">Önerilen: 260×55 px PNG/WEBP. Boş bırakılırsa PDF'te imza alanı tamamen gizlenir.</p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-slate-400">Teklifi Onaylayan</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label">Ad Soyad</label>
                  <input value={form.onaylayan} onChange={setField("onaylayan")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">Görev</label>
                  <input value={form.onaytayanGorev} onChange={setField("onaytayanGorev")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">Onay Tarihi</label>
                  <input value={form.onayTarihi} onChange={setField("onayTarihi")} className="input w-full text-sm" placeholder="24.05.2026" />
                </div>
              </div>
            </section>

            <div className="flex justify-end pb-6">
              <button
                onClick={saveInfo}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Bilgileri Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {showProductModal && (
        <ProductSelectorModal
          authFetch={authFetch}
          onSelect={addFromProduct}
          onClose={() => setShowProductModal(false)}
        />
      )}
      {showSingleTemplatePicker && (
        <SingleItemTemplatePickerModal
          authFetch={authFetch}
          onApply={addFromSingleTemplate}
          onClose={() => setShowSingleTemplatePicker(false)}
        />
      )}
      {showGroupTemplatePicker && (
        <GroupTemplateAddModal
          authFetch={authFetch}
          onApply={addFromGroupTemplate}
          onClose={() => setShowGroupTemplatePicker(false)}
        />
      )}
    </div>
  );
}
