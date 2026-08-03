import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListSettings,
  useUpsertSetting,
  useGetProductBySlug,
  useUpdateProduct,
  getListProductsQueryKey,
  getGetProductBySlugQueryKey,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { Save, Plus, Trash2, Loader2, ExternalLink, Upload, X } from "lucide-react";
import { useImageUpload } from "./useImageUpload";

const GCP_PRODUCT_SLUG = "kat-kontrol-panosu";

function ImageField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  hint?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading } = useImageUpload();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadFile(file);
      onChange(result.publicUrl);
      toast.success("Görsel yüklendi");
    } catch {
      toast.error("Görsel yüklenemedi");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label className="label">{label}</label>
        {hint && <span className="text-[10px] font-mono text-slate-400 shrink-0">{hint}</span>}
      </div>
      {value && (
        <div className="relative mb-2 overflow-hidden rounded-lg border border-slate-200">
          <img src={value} alt={label} className="h-32 w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <button type="button" onClick={() => onChange("")} className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input className="input flex-1" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://... veya /assets/..." />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50">
          <Upload className="h-3.5 w-3.5" />
          {uploading ? "…" : "Yükle"}
        </button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

type Spec = { k: string; v: string };
type Faq = { q: string; a: string };
type DetailCard = { title: string; text: string };

const DEFAULT_HERO = {
  title: "3 Gazlı Kat Kontrol Panosu",
  description: "Medikal gaz sistemleriniz için güvenli, akıllı ve kesintisiz kontrol. 3 farklı medikal gazın merkezi yönetimi tek panelde.",
};
const DEFAULT_SPECS: Spec[] = [
  { k: "Ürün Adı", v: "3 Gazlı Kat Kontrol Panosu" },
  { k: "Desteklenen Gazlar", v: "O2 (Oksijen) - VAC (Vakum) - AIR (Hava)" },
  { k: "Çalışma Basıncı", v: "4 - 6 bar" },
  { k: "Alarm Türü", v: "Görsel ve Sesli" },
  { k: "Gövde Malzemesi", v: "Elektrostatik Boyalı Metal" },
  { k: "Güç Beslemesi", v: "220 VAC - 50/60 Hz" },
  { k: "Montaj Tipi", v: "Sıva Üstü / Sıva Altı" },
  { k: "Çalışma Sıcaklığı", v: "-10 °C / +50 °C" },
  { k: "Boyutlar (YxGxD)", v: "400 x 320 x 80 mm" },
];
const DEFAULT_FAQS: Faq[] = [
  { q: "Hangi gazlar desteklenmektedir?", a: "3 Gazlı Kat Kontrol Panosu, Oksijen (O2), Vakum (VAC) ve Tıbbi Hava (AIR) gazlarını destekler." },
  { q: "Hangi alanlarda kullanılır?", a: "Hastane, yoğun bakım, ameliyathane ve klinik alanlarında kullanılır." },
  { q: "Montaj tipi nedir?", a: "Sıva üstü veya sıva altı montaj seçenekleriyle uygulanabilir." },
  { q: "Bakım ve servis ihtiyacı nasıl karşılanır?", a: "Periyodik bakım ve teknik servis ekibiyle güvenli çalışma sürdürülür." },
  { q: "Alarm sistemi nasıl çalışır?", a: "Basınç değerleri limit dışına çıktığında sesli ve görsel alarm verir." },
  { q: "Güç kesintisi durumunda sistem çalışır mı?", a: "Proje ihtiyacına göre yedek güç ve alarm senaryoları uygulanabilir." },
];
const DEFAULT_ADVANTAGES = [
  "Üç farklı gazın tek panelde merkezi kontrolü",
  "Yüksek güvenlikli alarm ve kesme sistemi",
  "Kullanıcı dostu arayüz ile kolay izleme",
  "Uzun ömürlü ve dayanıklı metal gövde",
  "Kolay montaj ve bakım avantajı",
];
const DEFAULT_DETAIL_CARDS: DetailCard[] = [
  { title: "Gaz Bağlantı Ünitesi", text: "Oksijen, vakum ve hava gaz girişleri için yüksek kaliteli vana sistemi." },
  { title: "Akıllı Kontrol Paneli", text: "Mikroişlemci kontrollü sistem ile gaz basınçları anlık olarak izlenir ve yönetilir." },
  { title: "Dayanıklı Yapı", text: "Elektrostatik boyalı metal gövdesi ile uzun ömürlü ve darbelere karşı dayanıklıdır." },
];

function parseJSON<T>(raw: string | undefined, fallback: T): T {
  try {
    if (raw) {
      const p = JSON.parse(raw) as T;
      if (Array.isArray(fallback) ? Array.isArray(p) : typeof p === "object" && p !== null) return p;
    }
  } catch {}
  return fallback;
}

function useSave(settingKey: string, onDone?: () => void) {
  return useUpsertSetting({
    mutation: {
      onSuccess: () => { toast.success("Kaydedildi"); onDone?.(); },
      onError: () => toast.error("Kayıt başarısız"),
    },
  });
}

function SectionCard({ title, dirty, onSave, saving, children }: {
  title: string;
  dirty: boolean;
  onSave: () => void;
  saving: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <button
          onClick={onSave}
          disabled={!dirty || saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-40"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Kaydet
        </button>
      </div>
      {children}
    </div>
  );
}

function HeroSection({ raw }: { raw: string }) {
  const [form, setForm] = useState(() => parseJSON(raw, DEFAULT_HERO));
  const [dirty, setDirty] = useState(false);
  const mut = useSave("gcp_hero", () => setDirty(false));

  useEffect(() => { setForm(parseJSON(raw, DEFAULT_HERO)); setDirty(false); }, [raw]);

  function set(field: keyof typeof DEFAULT_HERO, val: string) {
    setForm((p) => ({ ...p, [field]: val }));
    setDirty(true);
  }

  return (
    <SectionCard title="Hero Başlık ve Açıklama" dirty={dirty} onSave={() => mut.mutate({ settingKey: "gcp_hero", data: { settingValue: JSON.stringify(form) } })} saving={mut.isPending}>
      <div className="space-y-4">
        <div>
          <label className="label">Sayfa Başlığı</label>
          <input className="input w-full" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="3 Gazlı Kat Kontrol Panosu" />
        </div>
        <div>
          <label className="label">Açıklama Metni</label>
          <textarea className="input min-h-[80px] w-full resize-y" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Kısa açıklama..." />
        </div>
      </div>
    </SectionCard>
  );
}

function SpecsSection({ raw }: { raw: string }) {
  const [specs, setSpecs] = useState<Spec[]>(() => parseJSON(raw, DEFAULT_SPECS));
  const [dirty, setDirty] = useState(false);
  const mut = useSave("gcp_specs", () => setDirty(false));

  useEffect(() => { setSpecs(parseJSON(raw, DEFAULT_SPECS)); setDirty(false); }, [raw]);

  function update(idx: number, field: keyof Spec, val: string) {
    setSpecs((p) => p.map((s, i) => i === idx ? { ...s, [field]: val } : s));
    setDirty(true);
  }
  function add() { setSpecs((p) => [...p, { k: "", v: "" }]); setDirty(true); }
  function remove(idx: number) { setSpecs((p) => p.filter((_, i) => i !== idx)); setDirty(true); }

  return (
    <SectionCard title="Teknik Özellikler" dirty={dirty} onSave={() => mut.mutate({ settingKey: "gcp_specs", data: { settingValue: JSON.stringify(specs) } })} saving={mut.isPending}>
      <div className="space-y-2">
        {specs.map((s, idx) => (
          <div key={idx} className="flex gap-2">
            <input className="input flex-1 text-sm" placeholder="Özellik adı" value={s.k} onChange={(e) => update(idx, "k", e.target.value)} />
            <input className="input flex-1 text-sm" placeholder="Değer" value={s.v} onChange={(e) => update(idx, "v", e.target.value)} />
            <button onClick={() => remove(idx)} className="rounded-lg border border-red-100 p-2 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50">
        <Plus className="h-4 w-4" /> Satır Ekle
      </button>
    </SectionCard>
  );
}

function FaqsSection({ raw }: { raw: string }) {
  const [faqs, setFaqs] = useState<Faq[]>(() => parseJSON(raw, DEFAULT_FAQS));
  const [dirty, setDirty] = useState(false);
  const mut = useSave("gcp_faqs", () => setDirty(false));

  useEffect(() => { setFaqs(parseJSON(raw, DEFAULT_FAQS)); setDirty(false); }, [raw]);

  function update(idx: number, field: keyof Faq, val: string) {
    setFaqs((p) => p.map((f, i) => i === idx ? { ...f, [field]: val } : f));
    setDirty(true);
  }
  function add() { setFaqs((p) => [...p, { q: "", a: "" }]); setDirty(true); }
  function remove(idx: number) { setFaqs((p) => p.filter((_, i) => i !== idx)); setDirty(true); }

  return (
    <SectionCard title="Sıkça Sorulan Sorular (SSS)" dirty={dirty} onSave={() => mut.mutate({ settingKey: "gcp_faqs", data: { settingValue: JSON.stringify(faqs) } })} saving={mut.isPending}>
      <div className="space-y-4">
        {faqs.map((f, idx) => (
          <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SSS #{idx + 1}</span>
              <button onClick={() => remove(idx)} className="rounded p-1 text-red-400 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            <div className="space-y-2">
              <input className="input w-full text-sm font-semibold" placeholder="Soru" value={f.q} onChange={(e) => update(idx, "q", e.target.value)} />
              <textarea className="input min-h-[64px] w-full resize-y text-sm" placeholder="Cevap" value={f.a} onChange={(e) => update(idx, "a", e.target.value)} />
            </div>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50">
        <Plus className="h-4 w-4" /> Yeni Soru Ekle
      </button>
    </SectionCard>
  );
}

function AdvantagesSection({ raw }: { raw: string }) {
  const [items, setItems] = useState<string[]>(() => parseJSON(raw, DEFAULT_ADVANTAGES));
  const [dirty, setDirty] = useState(false);
  const mut = useSave("gcp_advantages", () => setDirty(false));

  useEffect(() => { setItems(parseJSON(raw, DEFAULT_ADVANTAGES)); setDirty(false); }, [raw]);

  function update(idx: number, val: string) {
    setItems((p) => p.map((s, i) => i === idx ? val : s));
    setDirty(true);
  }
  function add() { setItems((p) => [...p, ""]); setDirty(true); }
  function remove(idx: number) { setItems((p) => p.filter((_, i) => i !== idx)); setDirty(true); }

  return (
    <SectionCard title="Avantajlar Listesi" dirty={dirty} onSave={() => mut.mutate({ settingKey: "gcp_advantages", data: { settingValue: JSON.stringify(items) } })} saving={mut.isPending}>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <input className="input flex-1 text-sm" placeholder="Avantaj" value={item} onChange={(e) => update(idx, e.target.value)} />
            <button onClick={() => remove(idx)} className="rounded-lg border border-red-100 p-2 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50">
        <Plus className="h-4 w-4" /> Avantaj Ekle
      </button>
    </SectionCard>
  );
}

function DetailCardsSection({ raw }: { raw: string }) {
  const [cards, setCards] = useState<DetailCard[]>(() => parseJSON(raw, DEFAULT_DETAIL_CARDS));
  const [dirty, setDirty] = useState(false);
  const mut = useSave("gcp_detail_cards", () => setDirty(false));

  useEffect(() => { setCards(parseJSON(raw, DEFAULT_DETAIL_CARDS)); setDirty(false); }, [raw]);

  function update(idx: number, field: keyof DetailCard, val: string) {
    setCards((p) => p.map((c, i) => i === idx ? { ...c, [field]: val } : c));
    setDirty(true);
  }
  function add() { setCards((p) => [...p, { title: "", text: "" }]); setDirty(true); }
  function remove(idx: number) { setCards((p) => p.filter((_, i) => i !== idx)); setDirty(true); }

  return (
    <SectionCard title="Detay Kartları" dirty={dirty} onSave={() => mut.mutate({ settingKey: "gcp_detail_cards", data: { settingValue: JSON.stringify(cards) } })} saving={mut.isPending}>
      <div className="space-y-3">
        {cards.map((c, idx) => (
          <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kart #{idx + 1}</span>
              <button onClick={() => remove(idx)} className="rounded p-1 text-red-400 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            <div className="space-y-2">
              <input className="input w-full text-sm font-semibold" placeholder="Kart başlığı" value={c.title} onChange={(e) => update(idx, "title", e.target.value)} />
              <textarea className="input min-h-[64px] w-full resize-y text-sm" placeholder="Kart açıklaması" value={c.text} onChange={(e) => update(idx, "text", e.target.value)} />
            </div>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50">
        <Plus className="h-4 w-4" /> Kart Ekle
      </button>
    </SectionCard>
  );
}

function CardImageSection() {
  const qc = useQueryClient();
  const { data: product, isLoading: productLoading } = useGetProductBySlug(GCP_PRODUCT_SLUG);
  const [image, setImage] = useState("");
  const [dirty, setDirty] = useState(false);
  const updateMut = useUpdateProduct({
    mutation: {
      onSuccess: () => {
        toast.success("Kaydedildi");
        setDirty(false);
        qc.invalidateQueries({ queryKey: getListProductsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetProductBySlugQueryKey(GCP_PRODUCT_SLUG) });
      },
      onError: () => toast.error("Kayıt başarısız"),
    },
  });

  useEffect(() => {
    setImage(product?.imageUrl ?? "");
    setDirty(false);
  }, [product?.imageUrl]);

  return (
    <SectionCard
      title="Ürünler Sayfası Kart Görseli"
      dirty={dirty}
      saving={updateMut.isPending}
      onSave={() => {
        if (!product) return;
        updateMut.mutate({ id: product.id, data: { imageUrl: image || undefined } });
      }}
    >
      <p className="mb-3 text-[11px] text-slate-500">Bu görsel, <code className="rounded bg-slate-100 px-1">/urunler</code> sayfasındaki ürün kartında gösterilir.</p>
      {productLoading ? (
        <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
      ) : (
        <ImageField label="Kart Görseli" value={image} onChange={(v) => { setImage(v); setDirty(true); }} hint="Önerilen: 600 × 450 px" />
      )}
    </SectionCard>
  );
}

function HeroImageSection({ raw }: { raw: string }) {
  const [image, setImage] = useState(raw);
  const [dirty, setDirty] = useState(false);
  const mut = useSave("gcp_hero_image", () => setDirty(false));

  useEffect(() => { setImage(raw); setDirty(false); }, [raw]);

  return (
    <SectionCard title="Hero Ürün Görseli" dirty={dirty} onSave={() => mut.mutate({ settingKey: "gcp_hero_image", data: { settingValue: image } })} saving={mut.isPending}>
      <p className="mb-3 text-[11px] text-slate-500">Görsel eklendiğinde, sayfa başındaki kesikli çerçeveli görsel alanı kaybolur ve ürün fotoğrafı gösterilir.</p>
      <ImageField label="Hero Görseli" value={image} onChange={(v) => { setImage(v); setDirty(true); }} hint="Önerilen: 1080 × 960 px" />
    </SectionCard>
  );
}

function DetailImagesSection({ raw0, raw1, raw2 }: { raw0: string; raw1: string; raw2: string }) {
  const [images, setImages] = useState<string[]>([raw0, raw1, raw2]);
  const [dirty, setDirty] = useState(false);
  const upsertMut = useUpsertSetting();
  const [saving, setSaving] = useState(false);

  useEffect(() => { setImages([raw0, raw1, raw2]); setDirty(false); }, [raw0, raw1, raw2]);

  function setImg(i: number, v: string) {
    setImages((arr) => arr.map((a, idx) => (idx === i ? v : a)));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await Promise.all(images.map((url, i) => upsertMut.mutateAsync({ settingKey: `gcp_img_${i}`, data: { settingValue: url } })));
      toast.success("Detay kart görselleri kaydedildi");
      setDirty(false);
    } catch { toast.error("Kayıt başarısız"); }
    finally { setSaving(false); }
  }

  return (
    <SectionCard title="Detay Kart Görselleri (3 Adet)" dirty={dirty} onSave={handleSave} saving={saving}>
      <div className="space-y-4">
        {images.map((url, i) => (
          <ImageField key={i} label={`${i + 1}. Kart Görseli`} value={url} onChange={(v) => setImg(i, v)} hint="Önerilen: 800 × 450 px" />
        ))}
      </div>
    </SectionCard>
  );
}

function DrawingImageSection({ raw }: { raw: string }) {
  const [image, setImage] = useState(raw);
  const [dirty, setDirty] = useState(false);
  const mut = useSave("gcp_drawing_image", () => setDirty(false));

  useEffect(() => { setImage(raw); setDirty(false); }, [raw]);

  return (
    <SectionCard title="Teknik Çizim Görseli" dirty={dirty} onSave={() => mut.mutate({ settingKey: "gcp_drawing_image", data: { settingValue: image } })} saving={mut.isPending}>
      <ImageField label="Teknik Çizim / Boyutlar Görseli" value={image} onChange={(v) => { setImage(v); setDirty(true); }} hint="Önerilen: 700 × 600 px" />
    </SectionCard>
  );
}

export default function GasControlPanelAdminPage() {
  const { data: rawSettings, isLoading } = useListSettings();
  const s = (rawSettings as Record<string, string>) ?? {};

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Kat Kontrol Panosu Sayfası</h1>
          <p className="mt-1 text-sm text-slate-500">
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/urunler/kat-kontrol-panosu</code> sayfasının içeriğini yönetin.
          </p>
        </div>
        <a
          href="/urunler/kat-kontrol-panosu"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <ExternalLink className="h-4 w-4" />
          Sayfayı Görüntüle
        </a>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1,2,3,4,5].map((i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-100" />)}</div>
      ) : (
        <div className="space-y-6">
          <CardImageSection />
          <HeroSection raw={s["gcp_hero"] ?? ""} />
          <HeroImageSection raw={s["gcp_hero_image"] ?? ""} />
          <SpecsSection raw={s["gcp_specs"] ?? ""} />
          <FaqsSection raw={s["gcp_faqs"] ?? ""} />
          <AdvantagesSection raw={s["gcp_advantages"] ?? ""} />
          <DetailCardsSection raw={s["gcp_detail_cards"] ?? ""} />
          <DetailImagesSection raw0={s["gcp_img_0"] ?? ""} raw1={s["gcp_img_1"] ?? ""} raw2={s["gcp_img_2"] ?? ""} />
          <DrawingImageSection raw={s["gcp_drawing_image"] ?? ""} />
        </div>
      )}
    </section>
  );
}
