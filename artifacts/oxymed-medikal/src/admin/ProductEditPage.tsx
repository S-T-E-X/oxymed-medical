import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListProductsQueryKey,
  useCreateProduct,
  useGetProduct,
  useListProductCategories,
  useUpdateProduct,
  type Product,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { ArrowLeft, ArrowUp, ArrowDown, Box, Check, Eye, EyeOff, ImageIcon, Languages, Loader2, Lock, Plus, Save, Sparkles, X } from "lucide-react";
import { PRODUCT_ICON_OPTIONS, type ProductIconKey } from "../data/productPageIcons";
import { useImageUpload } from "./useImageUpload";
import { useAuth } from "./AuthContext";

type SpecRow = { label: string; value: string };
type FeatureRow = { title: string; text: string; icon?: ProductIconKey };
type DetailCard = { title: string; text: string; imageUrl: string };
type FaqRow = { question: string; answer: string };
type UseCaseRow = { text: string; icon: ProductIconKey };
type LocalizedPageContent = {
  heroSubtitle: string;
  heroDescription: string;
  features: FeatureRow[];
  detailCards: DetailCard[];
  specs: SpecRow[];
  useCases: UseCaseRow[];
  advantages: string[];
  featureTiles: FeatureRow[];
  faq: FaqRow[];
};

const EMPTY_LOCALIZED_CONTENT: LocalizedPageContent = {
  heroSubtitle: "", heroDescription: "", features: [], detailCards: [], specs: [],
  useCases: [], advantages: [], featureTiles: [], faq: [],
};

const PRODUCT_ICON_KEY_SET = new Set<string>(PRODUCT_ICON_OPTIONS.map((option) => option.key));

function normalizeIcon(value: unknown, fallback: ProductIconKey): ProductIconKey {
  return typeof value === "string" && PRODUCT_ICON_KEY_SET.has(value)
    ? value as ProductIconKey
    : fallback;
}

function normalizeFeature(value: { title?: string; text?: string; icon?: string }): FeatureRow {
  return {
    title: value.title ?? "",
    text: value.text ?? "",
    icon: normalizeIcon(value.icon, "sparkles"),
  };
}

function normalizeUseCase(value: unknown): UseCaseRow {
  if (typeof value === "string") return { text: value, icon: "layers" };
  if (value && typeof value === "object") {
    const item = value as { text?: unknown; icon?: unknown };
    return {
      text: typeof item.text === "string" ? item.text : "",
      icon: normalizeIcon(item.icon, "layers"),
    };
  }
  return { text: "", icon: "layers" };
}

const TITLE_LOCALES = [
  { code: "en", label: "English", field: "titleEn" },
  { code: "de", label: "Deutsch", field: "titleDe" },
  { code: "fr", label: "Français", field: "titleFr" },
  { code: "it", label: "Italiano", field: "titleIt" },
  { code: "ar", label: "العربية", field: "titleAr" },
  { code: "ru", label: "Русский", field: "titleRu" },
  { code: "fa", label: "فارسی", field: "titleFa" },
  { code: "ka", label: "ქართული", field: "titleKa" },
  { code: "bg", label: "Български", field: "titleBg" },
  { code: "az", label: "Azərbaycan", field: "titleAz" },
  { code: "es", label: "Español", field: "titleEs" },
] as const;

type TitleLocaleField = typeof TITLE_LOCALES[number]["field"];

type SectionKey = "detailCards" | "technical" | "useCases" | "featureTiles" | "faq";

const ALL_SECTIONS: SectionKey[] = ["detailCards", "technical", "useCases", "featureTiles", "faq"];

const SECTION_LABELS: Record<SectionKey, string> = {
  detailCards: "Detay Kartları",
  technical: "Teknik Özellikler & Avantajlar",
  useCases: "Kullanım Alanları",
  featureTiles: "Özellik Blokları",
  faq: "SSS",
};

function normalizeSectionOrder(order: string[] | undefined): SectionKey[] {
  const known = (order ?? []).filter((s): s is SectionKey => (ALL_SECTIONS as string[]).includes(s));
  const deduped = Array.from(new Set(known));
  return [...deduped, ...ALL_SECTIONS.filter((s) => !deduped.includes(s))];
}

function hasLocalizedContent(c: LocalizedPageContent | undefined): boolean {
  if (!c) return false;
  return Boolean(
    c.heroSubtitle.trim() || c.heroDescription.trim() ||
    c.features.length || c.detailCards.length || c.specs.length ||
    c.useCases.length || c.advantages.length || c.featureTiles.length || c.faq.length,
  );
}

function cleanLocalizedContent(c: LocalizedPageContent) {
  const specs = c.specs.filter((s) => s.label && s.value);
  const out = {
    heroSubtitle: c.heroSubtitle.trim() || undefined,
    heroDescription: c.heroDescription.trim() || undefined,
    features: c.features.filter((f) => f.title).map((f) => ({ title: f.title, text: f.text, icon: f.icon })),
    detailCards: c.detailCards.filter((d) => d.title),
    specs,
    useCases: c.useCases.filter((item) => item.text).map((item) => ({ text: item.text, icon: item.icon })),
    advantages: c.advantages.filter(Boolean),
    featureTiles: c.featureTiles.filter((f) => f.title).map((f) => ({ title: f.title, text: f.text })),
    faq: c.faq.filter((f) => f.question),
  };
  const isEmpty =
    !out.heroSubtitle && !out.heroDescription && out.features.length === 0 &&
    out.detailCards.length === 0 && out.specs.length === 0 && out.useCases.length === 0 &&
    out.advantages.length === 0 && out.featureTiles.length === 0 && out.faq.length === 0;
  return isEmpty ? null : out;
}

type ProductEditForm = {
  title: string;
  titleEn: string;
  titleDe: string;
  titleFr: string;
  titleIt: string;
  titleAr: string;
  titleRu: string;
  titleFa: string;
  titleKa: string;
  titleBg: string;
  titleAz: string;
  titleEs: string;
  description: string;
  imageUrl: string;
  categoryId: number | null;
  sortOrder: number;
  showOnHome: boolean;
  homeSortOrder: number;
  published: boolean;
  pageSlug: string;
  specs: SpecRow[];
  heroSubtitle: string;
  heroDescription: string;
  features: FeatureRow[];
  detailCards: DetailCard[];
  useCases: UseCaseRow[];
  advantages: string[];
  featureTiles: FeatureRow[];
  faq: FaqRow[];
  costPrice: string;
  salePrice: string;
  materials: string[];
  quoteTitle: string;
  quoteBullets: string[];
  quoteModelCode: string;
  quoteImageUrl: string;
  quoteUnit: string;
  quoteUnitPrice: string;
  localePageData: Record<string, LocalizedPageContent>;
  sectionOrder: SectionKey[];
  hiddenSections: SectionKey[];
};

const EMPTY_FORM: ProductEditForm = {
  title: "",
  titleEn: "",
  titleDe: "",
  titleFr: "",
  titleIt: "",
  titleAr: "",
  titleRu: "",
  titleFa: "",
  titleKa: "",
  titleBg: "",
  titleAz: "",
  titleEs: "",
  description: "",
  imageUrl: "",
  categoryId: null,
  sortOrder: 0,
  showOnHome: false,
  homeSortOrder: 0,
  published: true,
  pageSlug: "",
  specs: [],
  heroSubtitle: "",
  heroDescription: "",
  features: [],
  detailCards: [],
  useCases: [],
  advantages: [],
  featureTiles: [],
  faq: [],
  costPrice: "",
  salePrice: "",
  materials: [],
  quoteTitle: "",
  quoteBullets: [],
  quoteModelCode: "",
  quoteImageUrl: "",
  quoteUnit: "ADET",
  quoteUnitPrice: "",
  localePageData: {},
  sectionOrder: [...ALL_SECTIONS],
  hiddenSections: [],
};

function productToForm(p: Product): ProductEditForm {
  const pd = p.pageData ?? {};
  const priv = p.privateData ?? {};
  return {
    title: p.title,
    titleEn: p.titleEn ?? "",
    titleDe: p.titleDe ?? "",
    titleFr: p.titleFr ?? "",
    titleIt: p.titleIt ?? "",
    titleAr: p.titleAr ?? "",
    titleRu: p.titleRu ?? "",
    titleFa: p.titleFa ?? "",
    titleKa: p.titleKa ?? "",
    titleBg: p.titleBg ?? "",
    titleAz: p.titleAz ?? "",
    titleEs: p.titleEs ?? "",
    description: p.description ?? "",
    imageUrl: p.imageUrl ?? "",
    categoryId: p.categoryId ?? null,
    sortOrder: p.sortOrder,
    showOnHome: p.showOnHome === true,
    homeSortOrder: p.homeSortOrder ?? 0,
    published: p.published,
    pageSlug: p.pageSlug ?? "",
    specs: (p.specs ?? []) as SpecRow[],
    heroSubtitle: pd.heroSubtitle ?? "",
    heroDescription: pd.heroDescription ?? "",
    features: (pd.features ?? []).map((item) => normalizeFeature(item)),
    detailCards: (pd.detailCards ?? []).map((d) => ({ title: d.title ?? "", text: d.text ?? "", imageUrl: d.imageUrl ?? "" })),
    useCases: (pd.useCases ?? []).map((item) => normalizeUseCase(item)),
    advantages: pd.advantages ?? [],
    featureTiles: (pd.featureTiles ?? []).map((item) => ({ title: item.title ?? "", text: item.text ?? "" })),
    faq: (pd.faq ?? []) as FaqRow[],
    costPrice: priv.costPrice ?? "",
    salePrice: priv.salePrice ?? "",
    materials: priv.materials ?? [],
    quoteTitle: p.quoteTitle ?? "",
    quoteBullets: (p.quoteBullets ?? []) as string[],
    quoteModelCode: p.quoteModelCode ?? "",
    quoteImageUrl: p.quoteImageUrl ?? "",
    quoteUnit: p.quoteUnit ?? "ADET",
    quoteUnitPrice: p.quoteUnitPrice ?? "",
    localePageData: Object.fromEntries(
      Object.entries(pd.locales ?? {}).map(([locale, content]) => [locale, {
        heroSubtitle: content.heroSubtitle ?? "",
        heroDescription: content.heroDescription ?? "",
         features: (content.features ?? []).map((item) => normalizeFeature(item)),
        detailCards: (content.detailCards ?? []).map((d) => ({ title: d.title ?? "", text: d.text ?? "", imageUrl: d.imageUrl ?? "" })),
        specs: (content.specs ?? []) as SpecRow[],
         useCases: (content.useCases ?? []).map((item) => normalizeUseCase(item)),
        advantages: content.advantages ?? [],
         featureTiles: (content.featureTiles ?? []).map((item) => ({ title: item.title ?? "", text: item.text ?? "" })),
        faq: (content.faq ?? []) as FaqRow[],
      }]),
    ),
    sectionOrder: normalizeSectionOrder(pd.sectionOrder),
    hiddenSections: (pd.hiddenSections ?? []).filter((s): s is SectionKey => (ALL_SECTIONS as string[]).includes(s)),
  };
}

type Tab = "temel" | "sayfa" | "diller" | "gizli" | "teklif" | "bom";

function StringList({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="label mb-0">{label}</label>
        <button type="button" onClick={() => onChange([...items, ""])} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
          <Plus className="h-3 w-3" /> Ekle
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="mb-2 flex gap-2">
          <input className="input flex-1" value={item} onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n); }} placeholder="Metin" />
          <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50"><X className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  );
}

function IconPicker({ value, fallback, onChange }: { value: ProductIconKey; fallback: ProductIconKey; onChange: (value: ProductIconKey) => void }) {
  const selected = PRODUCT_ICON_OPTIONS.find((option) => option.key === value)
    ?? PRODUCT_ICON_OPTIONS.find((option) => option.key === fallback)
    ?? PRODUCT_ICON_OPTIONS[0];
  const SelectedIcon = selected.Icon;

  return (
    <details className="relative mt-2">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
        <SelectedIcon className="h-4 w-4 text-oxynavy-700" />
        <span>İkon: {selected.label}</span>
        <span className="ml-auto text-[11px] text-slate-400">Seç</span>
      </summary>
      <div className="absolute left-0 top-full z-30 mt-1 grid w-full min-w-[300px] grid-cols-5 gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-xl sm:grid-cols-7">
        {PRODUCT_ICON_OPTIONS.map((option) => {
          const Icon = option.Icon;
          const active = option.key === value;
          return (
            <button
              key={option.key}
              type="button"
              title={option.label}
              aria-label={`${option.label} ikonunu seç`}
              onClick={(event) => {
                onChange(option.key);
                (event.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open");
              }}
              className={`flex h-10 items-center justify-center rounded-md border transition-colors ${
                active
                  ? "border-oxynavy-700 bg-oxynavy-700 text-white"
                  : "border-slate-100 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-oxynavy-700"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </details>
  );
}

function FeatureList({ label, items, onChange, withIcon = true }: { label: string; items: FeatureRow[]; onChange: (v: FeatureRow[]) => void; withIcon?: boolean }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="label mb-0">{label}</label>
        <button type="button" onClick={() => onChange([...items, { title: "", text: "", ...(withIcon ? { icon: "sparkles" as const } : {}) }])} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
          <Plus className="h-3 w-3" /> Ekle
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="mb-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">#{i + 1}</span>
            <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="flex h-6 w-6 items-center justify-center rounded text-red-400 hover:bg-red-50"><X className="h-3.5 w-3.5" /></button>
          </div>
          <input className="input mb-2" value={item.title} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; onChange(n); }} placeholder="Başlık" />
          <textarea className="input min-h-[60px] resize-y" value={item.text} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], text: e.target.value }; onChange(n); }} placeholder="Açıklama" />
          {withIcon && <IconPicker value={item.icon ?? "sparkles"} fallback="sparkles" onChange={(icon) => { const n = [...items]; n[i] = { ...n[i], icon }; onChange(n); }} />}
        </div>
      ))}
    </div>
  );
}

function UseCaseList({ label, items, onChange }: { label: string; items: UseCaseRow[]; onChange: (v: UseCaseRow[]) => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="label mb-0">{label}</label>
        <button type="button" onClick={() => onChange([...items, { text: "", icon: "layers" }])} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
          <Plus className="h-3 w-3" /> Ekle
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="mb-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">#{i + 1}</span>
            <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="flex h-6 w-6 items-center justify-center rounded text-red-400 hover:bg-red-50"><X className="h-3.5 w-3.5" /></button>
          </div>
          <input className="input" value={item.text} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], text: e.target.value }; onChange(n); }} placeholder="Kullanım alanı" />
          <IconPicker value={item.icon} fallback="layers" onChange={(icon) => { const n = [...items]; n[i] = { ...n[i], icon }; onChange(n); }} />
        </div>
      ))}
    </div>
  );
}

function FaqList({ items, onChange }: { items: FaqRow[]; onChange: (v: FaqRow[]) => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="label mb-0">SSS (Sıkça Sorulan Sorular)</label>
        <button type="button" onClick={() => onChange([...items, { question: "", answer: "" }])} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
          <Plus className="h-3 w-3" /> Ekle
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="mb-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Soru #{i + 1}</span>
            <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="flex h-6 w-6 items-center justify-center rounded text-red-400 hover:bg-red-50"><X className="h-3.5 w-3.5" /></button>
          </div>
          <input className="input mb-2" value={item.question} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], question: e.target.value }; onChange(n); }} placeholder="Soru" />
          <textarea className="input min-h-[60px] resize-y" value={item.answer} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], answer: e.target.value }; onChange(n); }} placeholder="Cevap" />
        </div>
      ))}
    </div>
  );
}

function DetailCardList({ items, onChange, uploadFile, uploading, label = "Detay Kartları" }: { items: DetailCard[]; onChange: (v: DetailCard[]) => void; uploadFile: (f: File) => Promise<{ publicUrl: string }>; uploading: boolean; label?: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="label mb-0">{label}</label>
        <button type="button" onClick={() => onChange([...items, { title: "", text: "", imageUrl: "" }])} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
          <Plus className="h-3 w-3" /> Ekle
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="mb-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Kart #{i + 1}</span>
            <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="flex h-6 w-6 items-center justify-center rounded text-red-400 hover:bg-red-50"><X className="h-3.5 w-3.5" /></button>
          </div>
          <input className="input mb-2" value={item.title} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; onChange(n); }} placeholder="Başlık" />
          <textarea className="input mb-2 min-h-[60px] resize-y" value={item.text} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], text: e.target.value }; onChange(n); }} placeholder="Açıklama" />
          <div className="flex gap-2">
            <input className="input flex-1" value={item.imageUrl} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], imageUrl: e.target.value }; onChange(n); }} placeholder="Görsel URL" />
            <label className="flex h-10 cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
              <ImageIcon className="h-3.5 w-3.5" />
              {uploading ? "…" : "Yükle"}
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                try { const { publicUrl } = await uploadFile(file); const n = [...items]; n[i] = { ...n[i], imageUrl: publicUrl }; onChange(n); toast.success("Görsel yüklendi"); } catch { toast.error("Yüklenemedi"); }
              }} />
            </label>
          </div>
          {item.imageUrl && <img src={item.imageUrl} alt="" className="mt-2 h-16 w-full rounded object-cover" />}
        </div>
      ))}
    </div>
  );
}

function LocalizedContentEditor({
  localeLabel, value, onChange, uploadFile, uploading,
}: {
  localeLabel: string;
  value: LocalizedPageContent;
  onChange: (next: LocalizedPageContent) => void;
  uploadFile: (f: File) => Promise<{ publicUrl: string }>;
  uploading: boolean;
}) {
  const set = <K extends keyof LocalizedPageContent>(key: K, next: LocalizedPageContent[K]) =>
    onChange({ ...value, [key]: next });
  return (
    <div className="space-y-5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
      <div>
        <p className="text-sm font-bold text-indigo-950">{localeLabel} sayfa içeriği</p>
        <p className="mt-1 text-xs text-indigo-700">Bu dilde boş bırakılan detay bölümleri ziyaretçiye gösterilmez; Türkçe içerik otomatik kopyalanmaz.</p>
      </div>
      <div><label className="label">Hero alt başlığı</label><input className="input" value={value.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} /></div>
      <div><label className="label">Hero açıklaması</label><textarea className="input min-h-[90px] resize-y" value={value.heroDescription} onChange={(e) => set("heroDescription", e.target.value)} /></div>
      <FeatureList label="Hero özellikleri" items={value.features} onChange={(v) => set("features", v)} />
      <DetailCardList label="Detay kartları" items={value.detailCards} onChange={(v) => set("detailCards", v)} uploadFile={uploadFile} uploading={uploading} />
      <div>
        <div className="mb-2 flex items-center justify-between"><label className="label mb-0">Teknik özellikler</label><button type="button" onClick={() => set("specs", [...value.specs, { label: "", value: "" }])} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"><Plus className="h-3 w-3" /> Ekle</button></div>
        {value.specs.map((row, index) => <div key={index} className="mb-2 flex gap-2"><input className="input flex-1" value={row.label} onChange={(e) => { const rows = [...value.specs]; rows[index] = { ...row, label: e.target.value }; set("specs", rows); }} placeholder="Özellik" /><input className="input flex-1" value={row.value} onChange={(e) => { const rows = [...value.specs]; rows[index] = { ...row, value: e.target.value }; set("specs", rows); }} placeholder="Değer" /><button type="button" onClick={() => set("specs", value.specs.filter((_, i) => i !== index))} className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-100 text-red-400"><X className="h-4 w-4" /></button></div>)}
      </div>
      <UseCaseList label="Kullanım alanları" items={value.useCases} onChange={(v) => set("useCases", v)} />
      <StringList label="Avantajlar" items={value.advantages} onChange={(v) => set("advantages", v)} />
      <FeatureList label="Özellik blokları" items={value.featureTiles} onChange={(v) => set("featureTiles", v)} withIcon={false} />
      <FaqList items={value.faq} onChange={(v) => set("faq", v)} />
    </div>
  );
}

interface BomMaterial { id: number; name: string; unit: string; quantity: number | null; }
interface BomEntry { id: number; materialId: number; requiredQty: number; materialName: string | null; unit: string | null; inStock: number | null; }

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const productId = isNew ? 0 : parseInt(id ?? "0", 10);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { uploadFile, uploading } = useImageUpload();
  const { authFetch } = useAuth();

  // BOM state
  const [bom, setBom] = useState<BomEntry[] | null>(null);
  const [bomMaterials, setBomMaterials] = useState<BomMaterial[]>([]);
  const [newBomMaterialId, setNewBomMaterialId] = useState<number | "">("");
  const [newBomQty, setNewBomQty] = useState(1);
  const [bomSaving, setBomSaving] = useState(false);

  const loadBom = useCallback(async () => {
    if (!productId) return;
    const res = await authFetch(`/api/production/bom/${productId}`);
    if (res.ok) setBom(await res.json());
  }, [authFetch, productId]);

  const loadBomMaterials = useCallback(async () => {
    const res = await authFetch("/api/stock/materials");
    if (res.ok) { const d = await res.json(); setBomMaterials(d.items ?? d); }
  }, [authFetch]);

  async function saveBom(items: { materialId: number; requiredQty: number }[]) {
    if (!productId) return;
    setBomSaving(true);
    try {
      const res = await authFetch(`/api/production/bom/${productId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(items),
      });
      if (!res.ok) throw new Error();
      setBom(await res.json());
      toast.success("BOM güncellendi");
    } catch { toast.error("BOM kaydedilemedi"); }
    finally { setBomSaving(false); }
  }

  async function addBomItem() {
    if (!newBomMaterialId || newBomQty < 1) return;
    const existing = bom ?? [];
    if (existing.some((b) => b.materialId === newBomMaterialId)) { toast.error("Bu malzeme zaten BOM'da var"); return; }
    await saveBom([...existing.map((b) => ({ materialId: b.materialId, requiredQty: b.requiredQty })), { materialId: Number(newBomMaterialId), requiredQty: newBomQty }]);
    setNewBomMaterialId(""); setNewBomQty(1);
  }

  async function removeBomItem(materialId: number) {
    const existing = bom ?? [];
    await saveBom(existing.filter((b) => b.materialId !== materialId).map((b) => ({ materialId: b.materialId, requiredQty: b.requiredQty })));
  }

  const [form, setForm] = useState<ProductEditForm>(EMPTY_FORM);
  const [tab, setTab] = useState<Tab>("temel");
  const [activeLocale, setActiveLocale] = useState<string>(TITLE_LOCALES[0].code);
  const [translating, setTranslating] = useState(false);
  const [initialized, setInitialized] = useState(isNew);

  const { data: categories = [] } = useListProductCategories();
  const { data: product, isLoading } = useGetProduct(productId);

  useEffect(() => {
    if (product && !initialized) {
      setForm(productToForm(product));
      setInitialized(true);
    }
  }, [product, initialized]);

  const invalidateProd = () => qc.invalidateQueries({ queryKey: getListProductsQueryKey() });

  const createMut = useCreateProduct({
    mutation: {
      onSuccess: () => { toast.success("Ürün oluşturuldu"); invalidateProd(); navigate("/admin/products"); },
      onError: () => toast.error("Kayıt başarısız"),
    },
  });

  const updateMut = useUpdateProduct({
    mutation: {
      onSuccess: () => { toast.success("Ürün güncellendi"); invalidateProd(); navigate("/admin/products"); },
      onError: () => toast.error("Güncelleme başarısız"),
    },
  });

  const saving = createMut.isPending || updateMut.isPending;

  function set<K extends keyof ProductEditForm>(field: K, value: ProductEditForm[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSave() {
    if (!form.title.trim()) { toast.error("Ürün adı zorunlu"); return; }
    const payload = {
      title: form.title,
      description: form.description || undefined,
      imageUrl: form.imageUrl || undefined,
      categoryId: form.categoryId ?? undefined,
      sortOrder: form.sortOrder,
      showOnHome: form.showOnHome,
      homeSortOrder: form.homeSortOrder,
      published: form.published,
      pageSlug: form.pageSlug || undefined,
      specs: form.specs.filter((s) => s.label && s.value),
      pageData: {
        templateVersion: 1 as const,
        heroSubtitle: form.heroSubtitle || undefined,
        heroDescription: form.heroDescription || undefined,
         features: form.features.filter((f) => f.title).map((f) => ({ title: f.title, text: f.text, icon: f.icon })),
        detailCards: form.detailCards.filter((d) => d.title),
         useCases: form.useCases.filter((item) => item.text).map((item) => ({ text: item.text, icon: item.icon })),
        advantages: form.advantages.filter(Boolean),
         featureTiles: form.featureTiles.filter((f) => f.title).map((f) => ({ title: f.title, text: f.text })),
        faq: form.faq.filter((f) => f.question),
        specs: form.specs.filter((s) => s.label && s.value),
        sectionOrder: normalizeSectionOrder(form.sectionOrder),
        hiddenSections: form.hiddenSections,
        // Locale content is edited per language in the "Diller" tab. A locale
        // whose editor is left empty is dropped entirely so the public page
        // fails closed instead of inheriting Turkish copy.
        locales: Object.fromEntries(
          Object.entries(form.localePageData).flatMap(([locale, content]) => {
            const cleaned = cleanLocalizedContent(content);
            return cleaned ? [[locale, cleaned] as const] : [];
          }),
        ),
      },
      privateData: {
        costPrice: form.costPrice || undefined,
        salePrice: form.salePrice || undefined,
        materials: form.materials.filter(Boolean),
      },
      quoteTitle: form.quoteTitle || undefined,
      quoteBullets: form.quoteBullets.filter(Boolean),
      quoteModelCode: form.quoteModelCode || undefined,
      quoteImageUrl: form.quoteImageUrl || undefined,
      quoteUnit: form.quoteUnit || undefined,
      quoteUnitPrice: form.quoteUnitPrice || undefined,
    };
    if (isNew) {
      createMut.mutate({
        data: {
          ...payload,
          titleEn: form.titleEn.trim() || undefined,
          titleDe: form.titleDe.trim() || undefined,
          titleFr: form.titleFr.trim() || undefined,
          titleIt: form.titleIt.trim() || undefined,
          titleAr: form.titleAr.trim() || undefined,
          titleRu: form.titleRu.trim() || undefined,
          titleFa: form.titleFa.trim() || undefined,
          titleKa: form.titleKa.trim() || undefined,
          titleBg: form.titleBg.trim() || undefined,
          titleAz: form.titleAz.trim() || undefined,
          titleEs: form.titleEs.trim() || undefined,
        },
      });
    } else {
      updateMut.mutate({
        id: productId,
        data: {
          ...payload,
          titleEn: form.titleEn.trim() || null,
          titleDe: form.titleDe.trim() || null,
          titleFr: form.titleFr.trim() || null,
          titleIt: form.titleIt.trim() || null,
          titleAr: form.titleAr.trim() || null,
          titleRu: form.titleRu.trim() || null,
          titleFa: form.titleFa.trim() || null,
          titleKa: form.titleKa.trim() || null,
          titleBg: form.titleBg.trim() || null,
          titleAz: form.titleAz.trim() || null,
        },
      });
    }
  }

  function turkishSourceContent(): LocalizedPageContent {
    return {
      heroSubtitle: form.heroSubtitle,
      heroDescription: form.heroDescription,
      features: form.features.filter((f) => f.title),
      detailCards: form.detailCards.filter((d) => d.title),
      specs: form.specs.filter((s) => s.label && s.value),
      useCases: form.useCases.filter((item) => item.text),
      advantages: form.advantages.filter(Boolean),
      featureTiles: form.featureTiles.filter((f) => f.title),
      faq: form.faq.filter((f) => f.question),
    };
  }

  async function handleAiTranslate() {
    const localeLabel = TITLE_LOCALES.find((l) => l.code === activeLocale)?.label ?? activeLocale;
    const source = turkishSourceContent();
    if (!hasLocalizedContent(source)) {
      toast.error("Çevrilecek Türkçe sayfa içeriği yok — önce 'Sayfa İçeriği' sekmesini doldurun");
      return;
    }
    if (hasLocalizedContent(form.localePageData[activeLocale])) {
      const ok = window.confirm(`${localeLabel} için mevcut içerik var. AI çevirisi bu içeriğin ÜZERİNE YAZILACAK. Devam edilsin mi?`);
      if (!ok) return;
    }
    setTranslating(true);
    try {
      const res = await authFetch("/api/products/translate-page-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLocale: activeLocale, content: source }),
      });
      if (!res.ok) {
        let message = "Çeviri başarısız oldu";
        try {
          const data = await res.json();
          if (typeof data?.error === "string") message = data.error;
        } catch { /* keep generic message */ }
        toast.error(message);
        return;
      }
      const data = await res.json();
      const c = data.content ?? {};
      const next: LocalizedPageContent = {
        heroSubtitle: c.heroSubtitle ?? "",
        heroDescription: c.heroDescription ?? "",
        features: (c.features ?? []).map((item: { title?: string; text?: string; icon?: string }) => normalizeFeature(item)),
        detailCards: ((c.detailCards ?? []) as DetailCard[]).map((d) => ({ title: d.title ?? "", text: d.text ?? "", imageUrl: d.imageUrl ?? "" })),
        specs: (c.specs ?? []) as SpecRow[],
        useCases: (c.useCases ?? []).map((item: unknown) => normalizeUseCase(item)),
        advantages: c.advantages ?? [],
        featureTiles: (c.featureTiles ?? []).map((item: { title?: string; text?: string; icon?: string }) => normalizeFeature(item)),
        faq: (c.faq ?? []) as FaqRow[],
      };
      set("localePageData", { ...form.localePageData, [activeLocale]: next });
      toast.success(`${localeLabel} çevirisi hazır — kontrol edip Kaydet'e basmayı unutmayın`);
    } catch {
      toast.error("Çeviri servisine ulaşılamadı");
    } finally {
      setTranslating(false);
    }
  }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>, field: "imageUrl" | "quoteImageUrl") {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { publicUrl } = await uploadFile(file);
      set(field, publicUrl);
      toast.success("Görsel yüklendi");
    } catch {
      toast.error("Görsel yüklenemedi");
    }
  }

  useEffect(() => {
    if (tab === "bom" && !isNew) {
      if (bom === null) loadBom();
      if (bomMaterials.length === 0) loadBomMaterials();
    }
  }, [tab, isNew, bom, bomMaterials.length, loadBom, loadBomMaterials]);

  if (!isNew && isLoading) {
    return (
      <section className="px-4 py-7 sm:px-6 lg:px-8">
        <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}</div>
      </section>
    );
  }

  const tabs: { key: Tab; label: string; icon?: React.ReactNode }[] = [
    { key: "temel", label: "Temel Bilgiler" },
    { key: "sayfa", label: "Sayfa İçeriği" },
    { key: "diller", label: "Diller", icon: <Languages className="h-3.5 w-3.5" /> },
    { key: "gizli", label: "Gizli Bilgiler", icon: <Lock className="h-3.5 w-3.5" /> },
    { key: "teklif", label: "Teklif Formu" },
    ...(!isNew ? [{ key: "bom" as Tab, label: "Malzeme (BOM)", icon: <Box className="h-3.5 w-3.5" /> }] : []),
  ];

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/products")} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-950">{isNew ? "Yeni Ürün" : "Ürün Düzenle"}</h1>
            {!isNew && <p className="mt-0.5 text-sm text-slate-500">{form.title}</p>}
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>

      <div className="mb-6 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-oxynavy-700 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {tab === "temel" && (
          <div className="space-y-5">
            <div>
              <label className="label">Ürün Adı (Türkçe) *</label>
              <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ürün adı" />
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Ürün Adı — Diğer Diller <span className="font-normal normal-case text-slate-400">(boş bırakılırsa Türkçe gösterilir)</span></p>
              <div className="grid gap-3 sm:grid-cols-2">
                {TITLE_LOCALES.map((lc) => (
                  <div key={lc.code}>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{lc.label}</label>
                    <input
                      className="input text-sm"
                      value={form[lc.field as TitleLocaleField]}
                      onChange={(e) => set(lc.field as TitleLocaleField, e.target.value)}
                      placeholder={`${lc.label} adı`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Sayfa URL Slug</label>
              <input className="input font-mono" value={form.pageSlug} onChange={(e) => set("pageSlug", e.target.value)} placeholder="kat-kontrol-panosu" />
              <p className="mt-1 text-xs text-slate-400">Ürün detay sayfasının URL yolu (örn: kat-kontrol-panosu)</p>
            </div>
            <div>
              <label className="label">Kategori</label>
              <select className="input" value={form.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value ? Number(e.target.value) : null)}>
                <option value="">Kategori seçin</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Kısa Açıklama</label>
              <textarea className="input min-h-[100px] resize-y" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Ürün kartlarında görünen kısa açıklama" />
            </div>
            <div>
              <label className="label">Ana Görsel URL</label>
              <div className="flex gap-2">
                <input className="input flex-1" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://..." />
                <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  <ImageIcon className="h-4 w-4" />
                  {uploading ? "…" : "Yükle"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick(e, "imageUrl")} />
                </label>
              </div>
              {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-2 h-24 w-full rounded object-cover" />}
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="label mb-0">Teknik Özellikler</label>
                <button type="button" onClick={() => set("specs", [...form.specs, { label: "", value: "" }])} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                  <Plus className="h-3 w-3" /> Ekle
                </button>
              </div>
              {form.specs.map((s, i) => (
                <div key={i} className="mb-2 flex gap-2">
                  <input className="input flex-1" value={s.label} onChange={(e) => { const n = [...form.specs]; n[i] = { ...n[i], label: e.target.value }; set("specs", n); }} placeholder="Özellik adı" />
                  <input className="input flex-1" value={s.value} onChange={(e) => { const n = [...form.specs]; n[i] = { ...n[i], value: e.target.value }; set("specs", n); }} placeholder="Değer" />
                  <button type="button" onClick={() => set("specs", form.specs.filter((_, idx) => idx !== i))} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Sıra</label>
                <input type="number" className="input" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Ana sayfa sırası</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={form.homeSortOrder}
                  onChange={(e) => set("homeSortOrder", Number(e.target.value))}
                  disabled={!form.showOnHome}
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 rounded" />
                  Yayınla
                </label>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={form.showOnHome} onChange={(e) => set("showOnHome", e.target.checked)} className="h-4 w-4 rounded" />
                  Ana sayfada göster
                </label>
              </div>
            </div>
          </div>
        )}

        {tab === "sayfa" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-800">Hero Bölümü</p>
              <p className="mt-0.5 text-xs text-blue-600">Ürün detay sayfasının üst kısmında görünen başlık ve açıklama</p>
            </div>
            <div>
              <label className="label">Hero Alt Başlığı</label>
              <input className="input" value={form.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} placeholder="örn: 3 Gazlı" />
            </div>
            <div>
              <label className="label">Hero Açıklaması</label>
              <textarea className="input min-h-[100px] resize-y" value={form.heroDescription} onChange={(e) => set("heroDescription", e.target.value)} placeholder="Hero bölümünde gösterilecek uzun açıklama" />
            </div>
            <hr className="border-slate-100" />
            <FeatureList label="Hero Özellik Kartları (maks. 4)" items={form.features} onChange={(v) => set("features", v)} />
            <hr className="border-slate-100" />
            <DetailCardList items={form.detailCards} onChange={(v) => set("detailCards", v)} uploadFile={uploadFile} uploading={uploading} />
            <hr className="border-slate-100" />
            <UseCaseList label="Kullanım Alanları" items={form.useCases} onChange={(v) => set("useCases", v)} />
            <hr className="border-slate-100" />
            <StringList label="Avantajlar" items={form.advantages} onChange={(v) => set("advantages", v)} />
            <hr className="border-slate-100" />
            <FeatureList label="Özellik Blokları (Alt Bant)" items={form.featureTiles} onChange={(v) => set("featureTiles", v)} withIcon={false} />
            <hr className="border-slate-100" />
            <FaqList items={form.faq} onChange={(v) => set("faq", v)} />
            <hr className="border-slate-100" />
            <div>
              <p className="text-sm font-bold text-slate-800">Bölüm Sırası ve Görünürlüğü</p>
              <p className="mt-0.5 mb-3 text-xs text-slate-500">Detay sayfasındaki bölümlerin sırasını değiştirin veya gizleyin. Boş bölümler zaten gösterilmez.</p>
              <div className="space-y-2">
                {form.sectionOrder.map((section, i) => {
                  const hidden = form.hiddenSections.includes(section);
                  return (
                    <div key={section} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="w-5 text-xs font-bold text-slate-400">{i + 1}</span>
                      <span className={`flex-1 text-sm font-semibold ${hidden ? "text-slate-400 line-through" : "text-slate-700"}`}>{SECTION_LABELS[section]}</span>
                      <button type="button" title="Yukarı taşı" disabled={i === 0} onClick={() => { const n = [...form.sectionOrder]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; set("sectionOrder", n); }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                      <button type="button" title="Aşağı taşı" disabled={i === form.sectionOrder.length - 1} onClick={() => { const n = [...form.sectionOrder]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; set("sectionOrder", n); }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
                      <button type="button" title={hidden ? "Göster" : "Gizle"} onClick={() => set("hiddenSections", hidden ? form.hiddenSections.filter((s) => s !== section) : [...form.hiddenSections, section])} className={`flex h-8 w-8 items-center justify-center rounded-lg border bg-white ${hidden ? "border-amber-200 text-amber-500" : "border-slate-200 text-slate-500"} hover:bg-slate-100`}>{hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "diller" && (
          <div className="space-y-5">
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-sm font-semibold text-indigo-900">Dil Bazlı Sayfa İçeriği</p>
              <p className="mt-0.5 text-xs text-indigo-700">Her dil için hero, detay kartları, teknik özellikler ve diğer bölümler ayrı düzenlenir. Bir dilde boş bırakılan bölüm o dilde <strong>gösterilmez</strong> — Türkçe içerik diğer dillere kopyalanmaz.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {TITLE_LOCALES.map((lc) => {
                const filled = hasLocalizedContent(form.localePageData[lc.code]);
                const active = activeLocale === lc.code;
                return (
                  <button
                    key={lc.code}
                    type="button"
                    onClick={() => setActiveLocale(lc.code)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                      active ? "border-oxynavy-700 bg-oxynavy-700 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {lc.label}
                    {filled
                      ? <Check className={`h-3.5 w-3.5 ${active ? "text-white" : "text-emerald-500"}`} />
                      : <span className={`h-2 w-2 rounded-full ${active ? "bg-amber-300" : "bg-amber-400"}`} title="İçerik eksik" />}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-500" /> içerik girilmiş</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> içerik eksik</span>
              <button
                type="button"
                onClick={() => {
                  const base: LocalizedPageContent = {
                    heroSubtitle: form.heroSubtitle,
                    heroDescription: form.heroDescription,
                    features: form.features.map((f) => ({ ...f })),
                    detailCards: form.detailCards.map((d) => ({ ...d })),
                    specs: form.specs.map((s) => ({ ...s })),
                    useCases: [...form.useCases],
                    advantages: [...form.advantages],
                    featureTiles: form.featureTiles.map((f) => ({ ...f })),
                    faq: form.faq.map((f) => ({ ...f })),
                  };
                  set("localePageData", { ...form.localePageData, [activeLocale]: base });
                  toast.success("Türkçe içerik bu dile kopyalandı — çevirmeyi unutmayın");
                }}
                className="ml-auto rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-100"
              >
                Türkçe içeriği bu dile kopyala
              </button>
              <button
                type="button"
                onClick={handleAiTranslate}
                disabled={translating}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 py-1 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {translating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {translating ? "Çevriliyor…" : "AI ile Türkçeden çevir"}
              </button>
            </div>
            <LocalizedContentEditor
              key={activeLocale}
              localeLabel={TITLE_LOCALES.find((l) => l.code === activeLocale)?.label ?? activeLocale}
              value={form.localePageData[activeLocale] ?? EMPTY_LOCALIZED_CONTENT}
              onChange={(next) => set("localePageData", { ...form.localePageData, [activeLocale]: next })}
              uploadFile={uploadFile}
              uploading={uploading}
            />
          </div>
        )}

        {tab === "gizli" && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-bold text-amber-800">Yalnızca Admin Görebilir</p>
                <p className="mt-0.5 text-xs text-amber-700">Bu bilgiler hiçbir zaman kullanıcılara gösterilmez. Sadece admin panelinde görünür.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Maliyet Fiyatı</label>
                <input className="input" value={form.costPrice} onChange={(e) => set("costPrice", e.target.value)} placeholder="0,00 ₺" />
              </div>
              <div>
                <label className="label">Satış Fiyatı</label>
                <input className="input" value={form.salePrice} onChange={(e) => set("salePrice", e.target.value)} placeholder="0,00 ₺" />
              </div>
            </div>
            <StringList label="Malzeme Listesi" items={form.materials} onChange={(v) => set("materials", v)} />
          </div>
        )}

        {tab === "bom" && !isNew && (
          <div className="space-y-4">
            <div className="rounded-lg border border-purple-100 bg-purple-50 p-4">
              <p className="text-sm font-semibold text-purple-800">Malzeme Listesi (BOM)</p>
              <p className="mt-0.5 text-xs text-purple-600">Bu ürünün üretiminde kullanılan malzemeler. Üretim emirlerinde stok kontrolü için kullanılır.</p>
            </div>

            {bom === null ? (
              <div className="animate-pulse h-20 rounded-lg bg-slate-100" />
            ) : bom.length === 0 ? (
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Henüz malzeme eklenmemiş.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="pb-2">Malzeme</th>
                    <th className="pb-2 text-center">Birim Gereksinim</th>
                    <th className="pb-2 text-right">Mevcut Stok</th>
                    <th className="pb-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bom.map((b) => (
                    <tr key={b.id}>
                      <td className="py-2.5 font-semibold text-slate-800">{b.materialName ?? `#${b.materialId}`}</td>
                      <td className="py-2.5 text-center text-slate-700">{b.requiredQty} {b.unit}</td>
                      <td className="py-2.5 text-right">
                        <span className={`font-bold ${(b.inStock ?? 0) >= b.requiredQty ? "text-emerald-600" : "text-red-600"}`}>
                          {b.inStock ?? 0} {b.unit}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => removeBomItem(b.materialId)} disabled={bomSaving} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Malzeme Ekle</p>
              <div className="flex flex-wrap gap-2">
                <select
                  value={newBomMaterialId}
                  onChange={(e) => setNewBomMaterialId(e.target.value ? Number(e.target.value) : "")}
                  className="flex-1 min-w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Malzeme seçin...</option>
                  {bomMaterials.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                  ))}
                </select>
                <input
                  type="number" min={1} value={newBomQty}
                  onChange={(e) => setNewBomQty(parseInt(e.target.value) || 1)}
                  className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm text-center focus:border-purple-500 focus:outline-none"
                  placeholder="Adet"
                />
                <button
                  onClick={addBomItem} disabled={!newBomMaterialId || bomSaving}
                  className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" /> Ekle
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "teklif" && (
          <div className="space-y-5">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Teklif Formunda Kullanılacak Bilgiler</p>
              <p className="mt-0.5 text-xs text-slate-500">Bu bilgiler teklif şablonunda otomatik olarak kullanılır.</p>
            </div>
            <div>
              <label className="label">Ürün / Hizmet Açıklaması</label>
              <input className="input" value={form.quoteTitle} onChange={(e) => set("quoteTitle", e.target.value)} placeholder="Kat Kontrol Panosu - 3 Gazlı Sistem" />
            </div>
            <StringList label="Açıklama Maddeleri (bullet points)" items={form.quoteBullets} onChange={(v) => set("quoteBullets", v)} />
            <div>
              <label className="label">Model / Kod</label>
              <input className="input font-mono" value={form.quoteModelCode} onChange={(e) => set("quoteModelCode", e.target.value)} placeholder="KKP-3G-001" />
            </div>
            <div>
              <label className="label">Ürün Görseli (190×105 px) URL</label>
              <div className="flex gap-2">
                <input className="input flex-1" value={form.quoteImageUrl} onChange={(e) => set("quoteImageUrl", e.target.value)} placeholder="https://..." />
                <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  <ImageIcon className="h-4 w-4" />
                  {uploading ? "…" : "Yükle"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick(e, "quoteImageUrl")} />
                </label>
              </div>
              {form.quoteImageUrl && <img src={form.quoteImageUrl} alt="" className="mt-2 h-20 rounded object-cover" style={{ width: "190px", height: "105px", objectFit: "cover" }} />}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Birim</label>
                <input className="input" value={form.quoteUnit} onChange={(e) => set("quoteUnit", e.target.value)} placeholder="ADET" />
              </div>
              <div>
                <label className="label">Birim Fiyat</label>
                <input className="input" value={form.quoteUnitPrice} onChange={(e) => set("quoteUnitPrice", e.target.value)} placeholder="0,00 ₺" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button onClick={() => navigate("/admin/products")} className="btn-secondary">İptal</button>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </section>
  );
}
