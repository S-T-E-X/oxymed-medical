import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListNewsQueryKey,
  getListAllNewsTranslationsQueryKey,
  getListNewsTranslationsQueryKey,
  useCreateNews,
  useDeleteNews,
  useListNews,
  useListSettings,
  useUpsertSetting,
  useUpdateNews,
  useListAllNewsTranslations,
  useUpsertNewsTranslation,
  useDeleteNewsTranslation,
  type NewsItem,
  type NewsTranslation,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Edit2, ImageIcon, Plus, Tag, Trash2, X } from "lucide-react";
import { useImageUpload } from "./useImageUpload";
import { LOCALES, LOCALE_META, type Locale } from "../i18n/config";

// Non-Turkish locales that can have translation rows.
const TRANSLATION_LOCALES = LOCALES.filter((l) => l !== "tr") as Exclude<Locale, "tr">[];

const DEFAULT_CATEGORIES = ["Genel", "Sektör Haberleri", "Ürün Haberleri", "Duyuru", "Blog"];
const SETTINGS_KEY = "news_categories";

// RTL languages — text inputs for these should render right-to-left.
const RTL_LOCALES = new Set<string>(["ar", "fa"]);

function useNewsCategories() {
  const { data: rawSettings } = useListSettings();
  const settings = rawSettings as Record<string, string> | undefined;
  const raw = settings?.[SETTINGS_KEY];
  try {
    if (raw) return JSON.parse(raw) as string[];
  } catch {}
  return DEFAULT_CATEGORIES;
}

type NewsForm = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  slug: string;
  published: boolean;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
};

type TranslationForm = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  slug: string;
  published: boolean;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
};

const EMPTY_NEWS: NewsForm = {
  title: "",
  excerpt: "",
  content: "",
  category: "Genel",
  imageUrl: "",
  slug: "",
  published: true,
  publishedAt: new Date().toISOString().split("T")[0],
  seoTitle: "",
  seoDescription: "",
};

const EMPTY_TRANSLATION: TranslationForm = {
  title: "",
  excerpt: "",
  content: "",
  category: "",
  slug: "",
  published: false,
  publishedAt: "",
  seoTitle: "",
  seoDescription: "",
};

/**
 * Converts a string to a URL-safe slug.
 * For Latin-based scripts uses transliteration-free lowercasing; for
 * non-Latin scripts (Arabic, Persian, Georgian, etc.) that would produce
 * an empty result, the function falls back to the supplied `fallback`
 * string so the admin always has a non-empty starting point to edit.
 */
function slugify(s: string, fallback?: string): string {
  const base = s
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  if (base) return base;
  // Non-Latin title: keep the fallback so the admin can refine it.
  return fallback ?? "";
}

/**
 * Extracts the Turkish error message from an API error when available.
 * The server always uses the `error` field in its JSON response body.
 * We duck-type on `.data` rather than using instanceof so we don't need
 * to import ApiError directly (it is not re-exported from the package root).
 */
function apiErrorMessage(err: unknown, defaultMsg: string): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data: unknown }).data as { error?: string } | null;
    if (data?.error) return data.error;
  }
  return defaultMsg;
}

// ---------------------------------------------------------------------------
// Translation status chip
// ---------------------------------------------------------------------------

type TranslationStatus = "published" | "draft" | "missing";

function localeStatus(locale: string, byLocale: Map<string, NewsTranslation>): TranslationStatus {
  const t = byLocale.get(locale);
  if (!t) return "missing";
  return t.published ? "published" : "draft";
}

function StatusChip({ status, locale }: { status: TranslationStatus; locale: string }) {
  if (status === "published") {
    return (
      <span
        title={`${locale.toUpperCase()}: Yayında`}
        className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300"
      >
        {locale.toUpperCase()}
      </span>
    );
  }
  if (status === "draft") {
    return (
      <span
        title={`${locale.toUpperCase()}: Taslak`}
        className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-300"
      >
        {locale.toUpperCase()}
      </span>
    );
  }
  return (
    <span
      title={`${locale.toUpperCase()}: Çeviri yok`}
      className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold bg-slate-50 text-slate-300 border border-slate-200"
    >
      {locale.toUpperCase()}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Category manager (unchanged from original)
// ---------------------------------------------------------------------------

function CategoryManager({ categories, onSave }: { categories: string[]; onSave: (cats: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<string[]>(categories);
  const [newCat, setNewCat] = useState("");

  function add() {
    const trimmed = newCat.trim();
    if (!trimmed || list.includes(trimmed)) return;
    setList([...list, trimmed]);
    setNewCat("");
  }

  function remove(cat: string) {
    setList(list.filter((c) => c !== cat));
  }

  function save() {
    onSave(list);
    setOpen(false);
  }

  function reset() {
    setList(categories);
    setOpen(false);
  }

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50">
      <button
        onClick={() => { setList(categories); setOpen((v) => !v); }}
        className="flex w-full items-center justify-between px-5 py-3 text-sm font-bold text-amber-800"
      >
        <span className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Kategorileri Yönet
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="border-t border-amber-200 px-5 pb-5 pt-4">
          <p className="mb-3 text-xs text-amber-700">Kategorileri ekleyip çıkarabilirsiniz. Kaydetmek için "Kaydet" butonuna basın.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {list.map((cat) => (
              <span key={cat} className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-900">
                {cat}
                <button onClick={() => remove(cat)} className="text-amber-400 hover:text-red-500 transition">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {list.length === 0 && (
              <p className="text-xs text-amber-500 italic">Kategori listesi boş</p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              className="input flex-1 text-sm"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Yeni kategori adı"
            />
            <button onClick={add} className="btn-secondary flex items-center gap-1 text-sm">
              <Plus className="h-3.5 w-3.5" /> Ekle
            </button>
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <button onClick={reset} className="btn-secondary text-sm">İptal</button>
            <button onClick={save} className="btn-primary text-sm">Kaydet</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Turkish (source) tab form
// ---------------------------------------------------------------------------

function TrTabForm({
  form,
  onChange,
  categories,
  uploading,
  onImagePick,
}: {
  form: NewsForm;
  onChange: <K extends keyof NewsForm>(field: K, value: NewsForm[K]) => void;
  categories: string[];
  uploading: boolean;
  onImagePick: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  function handleTitleChange(title: string) {
    // Auto-fill slug only when it hasn't been manually set yet.
    onChange("title", title);
    if (!form.slug) {
      const s = slugify(title);
      if (s) onChange("slug", s);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Başlık *</label>
        <input className="input" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Haber başlığı" />
      </div>
      <div>
        <label className="label">Slug (URL)</label>
        <input className="input font-mono text-sm" value={form.slug} onChange={(e) => onChange("slug", e.target.value)} placeholder="haber-url-slug" />
      </div>
      <div>
        <label className="label">Özet</label>
        <textarea className="input min-h-[80px] resize-y" value={form.excerpt} onChange={(e) => onChange("excerpt", e.target.value)} placeholder="Kısa özet" />
      </div>
      <div>
        <label className="label">İçerik</label>
        <textarea className="input min-h-[200px] resize-y" value={form.content} onChange={(e) => onChange("content", e.target.value)} placeholder="Haber içeriği" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Kategori</label>
          <select className="input" value={form.category} onChange={(e) => onChange("category", e.target.value)}>
            {form.category && !categories.includes(form.category) && (
              <option value={form.category}>{form.category} (mevcut)</option>
            )}
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Yayın Tarihi</label>
          <input type="date" className="input" value={form.publishedAt} onChange={(e) => onChange("publishedAt", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Kapak Görseli</label>
        <p className="mb-1.5 text-[11px] text-slate-400">Önerilen boyut: <span className="font-semibold text-slate-500">1200 × 630 px</span> — yatay (landscape) format, WebP veya JPG</p>
        <div className="flex gap-2">
          <input className="input flex-1" value={form.imageUrl} onChange={(e) => onChange("imageUrl", e.target.value)} placeholder="https://..." />
          <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <ImageIcon className="h-4 w-4" />
            {uploading ? "…" : "Yükle"}
            <input type="file" accept="image/*" className="hidden" onChange={onImagePick} />
          </label>
        </div>
        {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-2 h-24 w-full rounded object-cover" />}
      </div>

      {/* SEO fields — optional overrides, article title/excerpt used when empty */}
      <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-3">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">SEO (İsteğe bağlı)</p>
        <div>
          <label className="label">SEO Başlığı</label>
          <input
            className="input"
            value={form.seoTitle}
            onChange={(e) => onChange("seoTitle", e.target.value)}
            placeholder="Boş bırakılırsa haber başlığı kullanılır"
            maxLength={80}
          />
          <p className="mt-1 text-[11px] text-slate-400">Önerilen: en fazla 60 karakter ({form.seoTitle.length}/60)</p>
        </div>
        <div>
          <label className="label">SEO Açıklaması</label>
          <textarea
            className="input min-h-[70px] resize-y"
            value={form.seoDescription}
            onChange={(e) => onChange("seoDescription", e.target.value)}
            placeholder="Boş bırakılırsa özet kullanılır"
            maxLength={200}
          />
          <p className="mt-1 text-[11px] text-slate-400">Önerilen: en fazla 160 karakter ({form.seoDescription.length}/160)</p>
        </div>
      </div>

      <div>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={form.published} onChange={(e) => onChange("published", e.target.checked)} className="h-4 w-4 rounded" />
          Yayınla
        </label>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single-language translation tab form
// ---------------------------------------------------------------------------

function LangTabForm({
  locale,
  form,
  onChange,
  sourceTurkishSlug,
  isNew,
}: {
  locale: Exclude<Locale, "tr">;
  form: TranslationForm;
  onChange: <K extends keyof TranslationForm>(field: K, value: TranslationForm[K]) => void;
  sourceTurkishSlug: string;
  isNew: boolean;
}) {
  const isRtl = RTL_LOCALES.has(locale);
  const dir = isRtl ? "rtl" : "ltr";
  const meta = LOCALE_META[locale];

  function handleTitleChange(title: string) {
    onChange("title", title);
    // Auto-suggest a slug only when the slug field is still empty.
    if (!form.slug) {
      // For non-Latin titles slugify will return empty; fall back to
      // the Turkish source slug suffixed with the locale code so the
      // admin always sees a non-empty starting value to refine.
      const s = slugify(title, sourceTurkishSlug ? `${sourceTurkishSlug}-${locale}` : locale);
      if (s) onChange("slug", s);
    }
  }

  return (
    <div className="space-y-4">
      {isNew && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          Yeni çeviri. Kaydetmek için tüm zorunlu alanları doldurun.
        </div>
      )}

      <div>
        <label className="label">Başlık *</label>
        <input
          className="input"
          dir={dir}
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder={`${meta.nativeName} dilinde başlık`}
        />
      </div>
      <div>
        <label className="label">URL uzantısı (slug) *</label>
        <input
          className="input font-mono text-sm"
          value={form.slug}
          onChange={(e) => onChange("slug", e.target.value)}
          placeholder={`${locale}-haber-slug`}
        />
        <p className="mt-1 text-[11px] text-slate-400">Bu dil için benzersiz olmalı. TR kaynağından bağımsız.</p>
      </div>
      <div>
        <label className="label">Özet</label>
        <textarea
          className="input min-h-[80px] resize-y"
          dir={dir}
          value={form.excerpt}
          onChange={(e) => onChange("excerpt", e.target.value)}
          placeholder="Kısa özet"
        />
      </div>
      <div>
        <label className="label">İçerik</label>
        <textarea
          className="input min-h-[200px] resize-y"
          dir={dir}
          value={form.content}
          onChange={(e) => onChange("content", e.target.value)}
          placeholder="Haber içeriği"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Kategori</label>
          <input
            className="input"
            dir={dir}
            value={form.category}
            onChange={(e) => onChange("category", e.target.value)}
            placeholder="Boş bırakılırsa TR kategorisi gösterilir"
          />
          <p className="mt-1 text-[11px] text-slate-400">İsteğe bağlı — boş bırakılırsa Türkçe kategori kullanılır.</p>
        </div>
        <div>
          <label className="label">Yayın Tarihi</label>
          <input
            type="date"
            className="input"
            value={form.publishedAt}
            onChange={(e) => onChange("publishedAt", e.target.value)}
          />
          <p className="mt-1 text-[11px] text-slate-400">Boş bırakılırsa kaynak tarih kullanılır.</p>
        </div>
      </div>

      {/* SEO fields */}
      <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-3">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">SEO (İsteğe bağlı)</p>
        <div>
          <label className="label">SEO Başlığı</label>
          <input
            className="input"
            dir={dir}
            value={form.seoTitle}
            onChange={(e) => onChange("seoTitle", e.target.value)}
            placeholder="Boş bırakılırsa haber başlığı kullanılır"
            maxLength={80}
          />
          <p className="mt-1 text-[11px] text-slate-400">Önerilen: en fazla 60 karakter ({form.seoTitle.length}/60)</p>
        </div>
        <div>
          <label className="label">SEO Açıklaması</label>
          <textarea
            className="input min-h-[70px] resize-y"
            dir={dir}
            value={form.seoDescription}
            onChange={(e) => onChange("seoDescription", e.target.value)}
            placeholder="Boş bırakılırsa özet kullanılır"
            maxLength={200}
          />
          <p className="mt-1 text-[11px] text-slate-400">Önerilen: en fazla 160 karakter ({form.seoDescription.length}/160)</p>
        </div>
      </div>

      <div>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => onChange("published", e.target.checked)}
            className="h-4 w-4 rounded"
          />
          Yayınla
        </label>
        <p className="mt-1 ml-6 text-[11px] text-slate-400">
          Kaynak Türkçe haber de yayında olmalı, aksi takdirde bu dil görüntülenmez.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main modal — tabbed editor
// ---------------------------------------------------------------------------

type ActiveTab = "tr" | Exclude<Locale, "tr">;

function NewsModal({
  item,
  initialForm,
  onClose,
  onSaveTr,
  savingTr,
  categories,
  existingTranslations,
}: {
  item: NewsItem | null;
  initialForm: NewsForm;
  onClose: () => void;
  onSaveTr: (data: NewsForm) => void;
  savingTr: boolean;
  categories: string[];
  existingTranslations: NewsTranslation[];
}) {
  const qc = useQueryClient();
  const { uploadFile, uploading } = useImageUpload();

  const [activeTab, setActiveTab] = useState<ActiveTab>("tr");
  const [trForm, setTrForm] = useState<NewsForm>(initialForm);

  // Build a map of locale → translation for quick lookup.
  const translationsByLocale = new Map<string, NewsTranslation>(
    existingTranslations.map((t) => [t.locale, t]),
  );

  // One TranslationForm state per locale, initialised from the existing row.
  const [translationForms, setTranslationForms] = useState<Record<string, TranslationForm>>(() => {
    const result: Record<string, TranslationForm> = {};
    for (const locale of TRANSLATION_LOCALES) {
      const t = translationsByLocale.get(locale);
      result[locale] = t
        ? {
            title: t.title,
            excerpt: t.excerpt ?? "",
            content: t.content ?? "",
            category: t.category ?? "",
            slug: t.slug,
            published: t.published,
            publishedAt: t.publishedAt?.split("T")[0] ?? "",
            seoTitle: t.seoTitle ?? "",
            seoDescription: t.seoDescription ?? "",
          }
        : { ...EMPTY_TRANSLATION };
    }
    return result;
  });

  const [confirmDeleteLocale, setConfirmDeleteLocale] = useState<string | null>(null);

  const upsertTranslation = useUpsertNewsTranslation({
    mutation: {
      onSuccess: (_data, variables) => {
        toast.success(`${variables.locale.toUpperCase()} çevirisi kaydedildi`);
        void qc.invalidateQueries({ queryKey: getListAllNewsTranslationsQueryKey() });
        if (item) {
          void qc.invalidateQueries({ queryKey: getListNewsTranslationsQueryKey(item.id) });
        }
      },
      onError: (err, variables) => {
        toast.error(apiErrorMessage(err, `${variables.locale.toUpperCase()} çevirisi kaydedilemedi`));
      },
    },
  });

  const deleteTranslation = useDeleteNewsTranslation({
    mutation: {
      onSuccess: (_data, variables) => {
        toast.success(`${variables.locale.toUpperCase()} çevirisi silindi`);
        // Reset form for that locale back to empty.
        setTranslationForms((prev) => ({
          ...prev,
          [variables.locale]: { ...EMPTY_TRANSLATION },
        }));
        void qc.invalidateQueries({ queryKey: getListAllNewsTranslationsQueryKey() });
        if (item) {
          void qc.invalidateQueries({ queryKey: getListNewsTranslationsQueryKey(item.id) });
        }
        setConfirmDeleteLocale(null);
      },
      onError: (err, variables) => {
        toast.error(apiErrorMessage(err, `${variables.locale.toUpperCase()} çevirisi silinemedi`));
        setConfirmDeleteLocale(null);
      },
    },
  });

  function setTrField<K extends keyof NewsForm>(field: K, value: NewsForm[K]) {
    setTrForm((f) => ({ ...f, [field]: value }));
  }

  function setLangField<K extends keyof TranslationForm>(locale: string, field: K, value: TranslationForm[K]) {
    setTranslationForms((prev) => ({
      ...prev,
      [locale]: { ...prev[locale]!, [field]: value },
    }));
  }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { publicUrl } = await uploadFile(file);
      setTrField("imageUrl", publicUrl);
      toast.success("Görsel yüklendi");
    } catch {
      toast.error("Görsel yüklenemedi");
    }
  }

  function handleSaveTranslation(locale: string) {
    if (!item) return;
    const f = translationForms[locale];
    if (!f) return;
    if (!f.title.trim() || !f.slug.trim()) {
      toast.error("Başlık ve slug zorunludur");
      return;
    }
    upsertTranslation.mutate({
      id: item.id,
      locale,
      data: {
        title: f.title,
        excerpt: f.excerpt || null,
        content: f.content || null,
        category: f.category || null,
        slug: f.slug,
        published: f.published,
        publishedAt: f.publishedAt ? new Date(f.publishedAt).toISOString() : null,
        seoTitle: f.seoTitle || null,
        seoDescription: f.seoDescription || null,
      },
    });
  }

  function handleDeleteTranslation(locale: string) {
    if (!item) return;
    deleteTranslation.mutate({ id: item.id, locale });
  }

  const isNew = !item;

  // Tab status label for display.
  function tabStatus(locale: Exclude<Locale, "tr">): TranslationStatus {
    return localeStatus(locale, translationsByLocale);
  }

  const tabBorder: Record<TranslationStatus, string> = {
    published: "border-emerald-400 text-emerald-700",
    draft: "border-amber-400 text-amber-600",
    missing: "border-transparent text-slate-400",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
          <h2 className="text-base font-bold text-slate-900">{isNew ? "Yeni Haber" : "Haber Düzenle"}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
        </div>

        {/* Language tabs */}
        <div className="shrink-0 flex border-b border-slate-100 overflow-x-auto">
          {/* Turkish source tab */}
          <button
            onClick={() => setActiveTab("tr")}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition ${
              activeTab === "tr"
                ? "border-blue-500 text-blue-700 bg-blue-50"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            TR (Kaynak)
          </button>
          {/* One tab per translation locale */}
          {TRANSLATION_LOCALES.map((locale) => {
            const status = tabStatus(locale);
            return (
              <button
                key={locale}
                onClick={() => setActiveTab(locale)}
                className={`px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                  activeTab === locale
                    ? `border-blue-500 text-blue-700 bg-blue-50`
                    : `${tabBorder[status]} hover:text-slate-700`
                }`}
                title={
                  status === "published"
                    ? `${locale.toUpperCase()}: Yayında`
                    : status === "draft"
                    ? `${locale.toUpperCase()}: Taslak`
                    : `${locale.toUpperCase()}: Çeviri yok`
                }
              >
                {locale.toUpperCase()}
                {status === "published" && (
                  <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle" />
                )}
                {status === "draft" && (
                  <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-400 align-middle" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab body */}
        <div className="overflow-y-auto flex-1 p-6">
          {activeTab === "tr" ? (
            <TrTabForm
              form={trForm}
              onChange={setTrField}
              categories={categories}
              uploading={uploading}
              onImagePick={handleImagePick}
            />
          ) : (
            <>
              {isNew ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                  Çeviri eklemek için önce Türkçe kaynağı kaydedin.
                </div>
              ) : (
                <>
                  <LangTabForm
                    locale={activeTab}
                    form={translationForms[activeTab] ?? EMPTY_TRANSLATION}
                    onChange={(field, value) => setLangField(activeTab, field, value)}
                    sourceTurkishSlug={item?.slug ?? ""}
                    isNew={!translationsByLocale.has(activeTab)}
                  />
                  {/* Delete existing translation */}
                  {translationsByLocale.has(activeTab) && (
                    <div className="mt-6 border-t border-slate-100 pt-4">
                      {confirmDeleteLocale === activeTab ? (
                        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                          <p className="flex-1 text-xs text-red-700">
                            {activeTab.toUpperCase()} çevirisini silmek istediğinizden emin misiniz?
                          </p>
                          <button
                            onClick={() => setConfirmDeleteLocale(null)}
                            className="btn-secondary text-xs"
                          >
                            İptal
                          </button>
                          <button
                            onClick={() => handleDeleteTranslation(activeTab)}
                            disabled={deleteTranslation.isPending}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            {deleteTranslation.isPending ? "Siliniyor…" : "Sil"}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteLocale(activeTab)}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {activeTab.toUpperCase()} çevirisini sil
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="btn-secondary">İptal</button>
          {activeTab === "tr" ? (
            <button
              onClick={() => onSaveTr(trForm)}
              disabled={savingTr || !trForm.title || !trForm.slug}
              className="btn-primary"
            >
              {savingTr ? "Kaydediliyor…" : "Kaydet"}
            </button>
          ) : (
            !isNew && (
              <button
                onClick={() => handleSaveTranslation(activeTab)}
                disabled={
                  upsertTranslation.isPending ||
                  !translationForms[activeTab]?.title ||
                  !translationForms[activeTab]?.slug
                }
                className="btn-primary"
              >
                {upsertTranslation.isPending ? "Kaydediliyor…" : `${activeTab.toUpperCase()} Kaydet`}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function NewsPage() {
  const qc = useQueryClient();
  const { data: newsData, isLoading } = useListNews({ limit: 50 });
  const news = newsData?.items ?? [];

  // All translation rows for the whole table — one request covers every article.
  const { data: allTranslations } = useListAllNewsTranslations();

  const [modal, setModal] = useState<{ open: boolean; item: NewsItem | null }>({ open: false, item: null });

  const categories = useNewsCategories();

  const { data: rawSettings } = useListSettings();
  const settings = rawSettings as Record<string, string> | undefined;

  const upsertMut = useUpsertSetting({
    mutation: {
      onSuccess: () => toast.success("Kategoriler kaydedildi"),
      onError: () => toast.error("Kayıt başarısız"),
    },
  });

  function handleSaveCategories(cats: string[]) {
    upsertMut.mutate({ settingKey: SETTINGS_KEY, data: { settingValue: JSON.stringify(cats) } });
  }

  const invalidateNews = () => qc.invalidateQueries({ queryKey: getListNewsQueryKey() });

  const createMut = useCreateNews({
    mutation: {
      onSuccess: () => {
        toast.success("Haber oluşturuldu");
        invalidateNews();
        setModal({ open: false, item: null });
      },
      onError: (err) => {
        toast.error(apiErrorMessage(err, "Kayıt başarısız"));
      },
    },
  });

  const updateMut = useUpdateNews({
    mutation: {
      onSuccess: () => {
        toast.success("Haber güncellendi");
        invalidateNews();
        // Keep modal open so admin can continue editing translation tabs.
      },
      onError: (err) => {
        toast.error(apiErrorMessage(err, "Güncelleme başarısız"));
      },
    },
  });

  const deleteMut = useDeleteNews({
    mutation: {
      onSuccess: () => { toast.success("Haber silindi"); invalidateNews(); },
      onError: () => toast.error("Silme başarısız"),
    },
  });

  function handleSaveTr(data: NewsForm) {
    const payload = {
      title: data.title,
      excerpt: data.excerpt || undefined,
      content: data.content || undefined,
      category: data.category,
      imageUrl: data.imageUrl || undefined,
      slug: data.slug,
      published: data.published,
      publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : undefined,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
    };
    if (modal.item) {
      updateMut.mutate({ id: modal.item.id, data: payload });
    } else {
      createMut.mutate({ data: payload });
    }
  }

  function handleDelete(id: number) {
    if (confirm("Bu haberi silmek istediğinizden emin misiniz?")) deleteMut.mutate({ id });
  }

  void settings;

  const saving = createMut.isPending || updateMut.isPending;

  // Build per-article translation maps from the bulk fetch.
  // Key: newsId, Value: map of locale → translation row.
  const translationsByNews = new Map<number, Map<string, NewsTranslation>>();
  for (const t of allTranslations ?? []) {
    let byLocale = translationsByNews.get(t.newsId);
    if (!byLocale) {
      byLocale = new Map();
      translationsByNews.set(t.newsId, byLocale);
    }
    byLocale.set(t.locale, t);
  }

  // Translations available for the currently open item (for the modal).
  const openItemTranslations: NewsTranslation[] = modal.item
    ? [...(translationsByNews.get(modal.item.id)?.values() ?? [])]
    : [];

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Haber Yönetimi</h1>
          <p className="mt-1 text-sm text-slate-500">Haberleri oluşturun, düzenleyin ve yayınlayın</p>
        </div>
        <button onClick={() => setModal({ open: true, item: null })} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Yeni Haber
        </button>
      </div>

      <CategoryManager categories={categories} onSave={handleSaveCategories} />

      {/* Translation legend */}
      <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
        <span className="font-semibold text-slate-600">Dil durumu:</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block rounded px-1.5 py-0.5 font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">EN</span>
          Yayında
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block rounded px-1.5 py-0.5 font-bold bg-amber-50 text-amber-600 border border-amber-300">EN</span>
          Taslak
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block rounded px-1.5 py-0.5 font-bold bg-slate-50 text-slate-300 border border-slate-200">EN</span>
          Çeviri yok
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-100" />)}</div>
      ) : news.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <p className="text-slate-400">Henüz haber yok</p>
          <button onClick={() => setModal({ open: true, item: null })} className="btn-primary mt-4">İlk haberi ekle</button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">Haber</th>
                <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 md:table-cell">Kategori</th>
                <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 sm:table-cell">Tarih</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">Durum</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">Diller</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {news.map((n) => {
                const byLocale = translationsByNews.get(n.id) ?? new Map<string, NewsTranslation>();
                const missingCount = TRANSLATION_LOCALES.filter(
                  (l) => !byLocale.has(l),
                ).length;
                return (
                  <tr key={n.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {n.imageUrl ? (
                          <img src={n.imageUrl} alt={n.title} className="h-9 w-12 rounded object-cover" />
                        ) : (
                          <div className="flex h-9 w-12 items-center justify-center rounded bg-slate-100">
                            <ImageIcon className="h-4 w-4 text-slate-300" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{n.title}</p>
                          <p className="text-[11px] text-slate-400">/{n.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-slate-500 md:table-cell">{n.category}</td>
                    <td className="hidden px-4 py-3 text-sm text-slate-500 sm:table-cell">
                      {new Date(n.publishedAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${n.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {n.published ? "Yayında" : "Taslak"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {TRANSLATION_LOCALES.map((locale) => (
                          <StatusChip
                            key={locale}
                            locale={locale}
                            status={localeStatus(locale, byLocale)}
                          />
                        ))}
                      </div>
                      {missingCount > 0 && (
                        <p className="mt-1 text-[10px] text-slate-400">
                          {missingCount} dil eksik
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setModal({ open: true, item: n })}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50"
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
        </div>
      )}

      {modal.open && (
        <NewsModal
          item={modal.item}
          initialForm={
            modal.item
              ? {
                  title: modal.item.title,
                  excerpt: modal.item.excerpt ?? "",
                  content: modal.item.content ?? "",
                  category: modal.item.category?.trim() || categories[0] || "Genel",
                  imageUrl: modal.item.imageUrl ?? "",
                  slug: modal.item.slug,
                  published: modal.item.published,
                  publishedAt: modal.item.publishedAt?.split("T")[0] ?? new Date().toISOString().split("T")[0],
                  seoTitle: modal.item.seoTitle ?? "",
                  seoDescription: modal.item.seoDescription ?? "",
                }
              : EMPTY_NEWS
          }
          onClose={() => setModal({ open: false, item: null })}
          onSaveTr={handleSaveTr}
          savingTr={saving}
          categories={categories}
          existingTranslations={openItemTranslations}
        />
      )}
    </section>
  );
}
