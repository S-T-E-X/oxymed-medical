import { useState, useEffect } from "react";
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
import { ArrowLeft, ImageIcon, Lock, Plus, Save, X } from "lucide-react";
import { useImageUpload } from "./useImageUpload";

type SpecRow = { label: string; value: string };
type FeatureRow = { title: string; text: string };
type DetailCard = { title: string; text: string; imageUrl: string };
type FaqRow = { question: string; answer: string };

type ProductEditForm = {
  title: string;
  description: string;
  imageUrl: string;
  categoryId: number | null;
  sortOrder: number;
  published: boolean;
  pageSlug: string;
  specs: SpecRow[];
  heroSubtitle: string;
  heroDescription: string;
  features: FeatureRow[];
  detailCards: DetailCard[];
  useCases: string[];
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
};

const EMPTY_FORM: ProductEditForm = {
  title: "",
  description: "",
  imageUrl: "",
  categoryId: null,
  sortOrder: 0,
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
};

function productToForm(p: Product): ProductEditForm {
  const pd = p.pageData ?? {};
  const priv = p.privateData ?? {};
  return {
    title: p.title,
    description: p.description ?? "",
    imageUrl: p.imageUrl ?? "",
    categoryId: p.categoryId ?? null,
    sortOrder: p.sortOrder,
    published: p.published,
    pageSlug: p.pageSlug ?? "",
    specs: (p.specs ?? []) as SpecRow[],
    heroSubtitle: pd.heroSubtitle ?? "",
    heroDescription: pd.heroDescription ?? "",
    features: (pd.features ?? []) as FeatureRow[],
    detailCards: (pd.detailCards ?? []).map((d) => ({ title: d.title ?? "", text: d.text ?? "", imageUrl: d.imageUrl ?? "" })),
    useCases: pd.useCases ?? [],
    advantages: pd.advantages ?? [],
    featureTiles: (pd.featureTiles ?? []) as FeatureRow[],
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
  };
}

type Tab = "temel" | "sayfa" | "gizli" | "teklif";

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

function FeatureList({ label, items, onChange }: { label: string; items: FeatureRow[]; onChange: (v: FeatureRow[]) => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="label mb-0">{label}</label>
        <button type="button" onClick={() => onChange([...items, { title: "", text: "" }])} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
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

function DetailCardList({ items, onChange, uploadFile, uploading }: { items: DetailCard[]; onChange: (v: DetailCard[]) => void; uploadFile: (f: File) => Promise<{ publicUrl: string }>; uploading: boolean }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="label mb-0">Detay Kartları</label>
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

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const productId = isNew ? 0 : parseInt(id ?? "0", 10);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { uploadFile, uploading } = useImageUpload();

  const [form, setForm] = useState<ProductEditForm>(EMPTY_FORM);
  const [tab, setTab] = useState<Tab>("temel");
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
      published: form.published,
      pageSlug: form.pageSlug || undefined,
      specs: form.specs.filter((s) => s.label && s.value),
      pageData: {
        heroSubtitle: form.heroSubtitle || undefined,
        heroDescription: form.heroDescription || undefined,
        features: form.features.filter((f) => f.title),
        detailCards: form.detailCards.filter((d) => d.title),
        useCases: form.useCases.filter(Boolean),
        advantages: form.advantages.filter(Boolean),
        featureTiles: form.featureTiles.filter((f) => f.title),
        faq: form.faq.filter((f) => f.question),
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
      createMut.mutate({ data: payload });
    } else {
      updateMut.mutate({ id: productId, data: payload });
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
    { key: "gizli", label: "Gizli Bilgiler", icon: <Lock className="h-3.5 w-3.5" /> },
    { key: "teklif", label: "Teklif Formu" },
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
              <label className="label">Ürün Adı *</label>
              <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ürün adı" />
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
              <div className="flex items-end pb-1">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 rounded" />
                  Yayınla
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
            <StringList label="Kullanım Alanları" items={form.useCases} onChange={(v) => set("useCases", v)} />
            <hr className="border-slate-100" />
            <StringList label="Avantajlar" items={form.advantages} onChange={(v) => set("advantages", v)} />
            <hr className="border-slate-100" />
            <FeatureList label="Özellik Blokları (Alt Bant)" items={form.featureTiles} onChange={(v) => set("featureTiles", v)} />
            <hr className="border-slate-100" />
            <FaqList items={form.faq} onChange={(v) => set("faq", v)} />
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
