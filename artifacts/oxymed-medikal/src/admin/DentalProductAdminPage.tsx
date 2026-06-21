import { useEffect, useRef, useState } from "react";
import { useListSettings, useUpsertSetting } from "@workspace/api-client-react";
import { toast } from "sonner";
import { Save, Upload, X } from "lucide-react";
import { useImageUpload } from "./useImageUpload";

export type DentalProductConfig = {
  heading: string;
  prefix: string;
  defaultHero: { eyebrow: string; title: string; desc1: string; desc2: string };
  galleryCount: number;
  galleryLabel: string;
  defaultSpecs: [string, string][];
};

type SettingsMap = Record<string, string>;

function ImageField({
  label,
  settingKey,
  value,
  onChange,
  hint,
}: {
  label: string;
  settingKey: string;
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
      <div className="flex items-baseline justify-between gap-2">
        <label className="label">{label}</label>
        {hint && <span className="text-[10px] font-mono text-slate-400 shrink-0">{hint}</span>}
      </div>
      {value && (
        <div className="relative mb-2 overflow-hidden rounded-lg border border-slate-200">
          <img
            src={value}
            alt={label}
            className="h-32 w-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="input flex-1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... veya /assets/..."
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          {uploading ? "…" : "Yükle"}
        </button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function Section({
  title,
  children,
  onSave,
  dirty,
  saving,
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  dirty: boolean;
  saving: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <button
          onClick={onSave}
          disabled={!dirty || saving}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm disabled:opacity-40 hover:bg-blue-700"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
      <div className="space-y-3">{children}</div>
      {dirty && <p className="mt-2 text-[11px] font-medium text-amber-600">Kaydedilmemiş değişiklikler var</p>}
    </div>
  );
}

function HeroSection({ prefix, defaults, settings }: { prefix: string; defaults: DentalProductConfig["defaultHero"]; settings: SettingsMap }) {
  const p = prefix;
  const [form, setForm] = useState({
    eyebrow: settings[`${p}_hero_eyebrow`] ?? defaults.eyebrow,
    title: settings[`${p}_hero_title`] ?? defaults.title,
    desc1: settings[`${p}_hero_desc1`] ?? defaults.desc1,
    desc2: settings[`${p}_hero_desc2`] ?? defaults.desc2,
    image: settings[`${p}_hero_image`] ?? "",
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const upsertMut = useUpsertSetting();

  useEffect(() => {
    setForm({
      eyebrow: settings[`${p}_hero_eyebrow`] ?? defaults.eyebrow,
      title: settings[`${p}_hero_title`] ?? defaults.title,
      desc1: settings[`${p}_hero_desc1`] ?? defaults.desc1,
      desc2: settings[`${p}_hero_desc2`] ?? defaults.desc2,
      image: settings[`${p}_hero_image`] ?? "",
    });
    setDirty(false);
  }, [settings[`${p}_hero_eyebrow`], settings[`${p}_hero_title`], settings[`${p}_hero_desc1`], settings[`${p}_hero_desc2`], settings[`${p}_hero_image`]]);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await Promise.all([
        upsertMut.mutateAsync({ settingKey: `${p}_hero_eyebrow`, data: { settingValue: form.eyebrow } }),
        upsertMut.mutateAsync({ settingKey: `${p}_hero_title`, data: { settingValue: form.title } }),
        upsertMut.mutateAsync({ settingKey: `${p}_hero_desc1`, data: { settingValue: form.desc1 } }),
        upsertMut.mutateAsync({ settingKey: `${p}_hero_desc2`, data: { settingValue: form.desc2 } }),
        upsertMut.mutateAsync({ settingKey: `${p}_hero_image`, data: { settingValue: form.image } }),
      ]);
      toast.success("Hero bölümü kaydedildi");
      setDirty(false);
    } catch { toast.error("Kayıt başarısız"); }
    finally { setSaving(false); }
  }

  return (
    <Section title="Hero Bölümü" onSave={handleSave} dirty={dirty} saving={saving}>
      <div>
        <label className="label">Üst Etiket (Eyebrow)</label>
        <input className="input" value={form.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} />
      </div>
      <div>
        <label className="label">Ana Başlık</label>
        <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} />
      </div>
      <div>
        <label className="label">Açıklama 1. Paragraf</label>
        <textarea className="input min-h-[72px] resize-y" value={form.desc1} onChange={(e) => set("desc1", e.target.value)} />
      </div>
      <div>
        <label className="label">Açıklama 2. Paragraf</label>
        <textarea className="input min-h-[72px] resize-y" value={form.desc2} onChange={(e) => set("desc2", e.target.value)} />
      </div>
      <ImageField label="Ana Görsel" settingKey={`${p}_hero_image`} value={form.image} onChange={(v) => { setForm((f) => ({ ...f, image: v })); setDirty(true); }} hint="Önerilen: 1200 × 800 px" />
    </Section>
  );
}

function GallerySection({ prefix, count, label, settings }: { prefix: string; count: number; label: string; settings: SettingsMap }) {
  const p = prefix;
  const makeImages = () => Array.from({ length: count }, (_, i) => settings[`${p}_img_${i}`] ?? "");
  const [images, setImages] = useState<string[]>(makeImages);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const upsertMut = useUpsertSetting();

  useEffect(() => { setImages(makeImages()); setDirty(false); }, [count, ...Array.from({ length: count }, (_, i) => settings[`${p}_img_${i}`])]);

  function setImg(i: number, v: string) {
    setImages((arr) => arr.map((a, idx) => (idx === i ? v : a)));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await Promise.all(images.map((url, i) => upsertMut.mutateAsync({ settingKey: `${p}_img_${i}`, data: { settingValue: url } })));
      toast.success(`${label} kaydedildi`);
      setDirty(false);
    } catch { toast.error("Kayıt başarısız"); }
    finally { setSaving(false); }
  }

  const labels = [`1. Görsel`, `2. Görsel`, `3. Görsel`, `4. Görsel`];

  return (
    <Section title={label} onSave={handleSave} dirty={dirty} saving={saving}>
      {images.map((url, i) => (
        <ImageField key={i} label={labels[i] ?? `${i + 1}. Görsel`} settingKey={`${p}_img_${i}`} value={url} onChange={(v) => setImg(i, v)} hint="Önerilen: 800 × 530 px" />
      ))}
    </Section>
  );
}

function SpecsSection({ prefix, defaults, settings }: { prefix: string; defaults: [string, string][]; settings: SettingsMap }) {
  const p = prefix;
  const defaultText = defaults.map(([l, v]) => `${l}::${v}`).join("\n");
  const [text, setText] = useState(settings[`${p}_specs_text`] ?? defaultText);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const upsertMut = useUpsertSetting();

  useEffect(() => {
    setText(settings[`${p}_specs_text`] ?? defaultText);
    setDirty(false);
  }, [settings[`${p}_specs_text`]]);

  async function handleSave() {
    setSaving(true);
    try {
      await upsertMut.mutateAsync({ settingKey: `${p}_specs_text`, data: { settingValue: text } });
      toast.success("Teknik özellikler kaydedildi");
      setDirty(false);
    } catch { toast.error("Kayıt başarısız"); }
    finally { setSaving(false); }
  }

  return (
    <Section title="Teknik Özellikler" onSave={handleSave} dirty={dirty} saving={saving}>
      <p className="text-[11px] text-slate-500">Her satıra bir özellik: <code className="rounded bg-slate-100 px-1">Özellik Adı::Değer</code></p>
      <textarea
        className="input min-h-[220px] resize-y font-mono text-[12px]"
        value={text}
        onChange={(e) => { setText(e.target.value); setDirty(true); }}
        spellCheck={false}
      />
    </Section>
  );
}

function DrawingSection({ prefix, settings }: { prefix: string; settings: SettingsMap }) {
  const p = prefix;
  const [image, setImage] = useState(settings[`${p}_drawing_image`] ?? "");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const upsertMut = useUpsertSetting();

  useEffect(() => { setImage(settings[`${p}_drawing_image`] ?? ""); setDirty(false); }, [settings[`${p}_drawing_image`]]);

  async function handleSave() {
    setSaving(true);
    try {
      await upsertMut.mutateAsync({ settingKey: `${p}_drawing_image`, data: { settingValue: image } });
      toast.success("Teknik çizim görseli kaydedildi");
      setDirty(false);
    } catch { toast.error("Kayıt başarısız"); }
    finally { setSaving(false); }
  }

  return (
    <Section title="Teknik Çizim Görseli" onSave={handleSave} dirty={dirty} saving={saving}>
      <ImageField label="Teknik Çizim / Boyutlar Görseli" settingKey={`${p}_drawing_image`} value={image} onChange={(v) => { setImage(v); setDirty(true); }} hint="Önerilen: 1600 × 940 px" />
    </Section>
  );
}

function CardImageSection({ prefix, settings }: { prefix: string; settings: SettingsMap }) {
  const p = prefix;
  const [image, setImage] = useState(settings[`${p}_card_image`] ?? "");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const upsertMut = useUpsertSetting();

  useEffect(() => { setImage(settings[`${p}_card_image`] ?? ""); setDirty(false); }, [settings[`${p}_card_image`]]);

  async function handleSave() {
    setSaving(true);
    try {
      await upsertMut.mutateAsync({ settingKey: `${p}_card_image`, data: { settingValue: image } });
      toast.success("Kart görseli kaydedildi");
      setDirty(false);
    } catch { toast.error("Kayıt başarısız"); }
    finally { setSaving(false); }
  }

  return (
    <Section title="Ürünler Sayfası Kart Görseli" onSave={handleSave} dirty={dirty} saving={saving}>
      <p className="text-[11px] text-slate-500">Bu görsel, <code className="rounded bg-slate-100 px-1">/urunler</code> sayfasındaki ürün kartında ve admin panelinde küçük resim olarak gösterilir.</p>
      <ImageField label="Kart Görseli" settingKey={`${p}_card_image`} value={image} onChange={(v) => { setImage(v); setDirty(true); }} hint="Önerilen: 600 × 450 px" />
    </Section>
  );
}

export default function DentalProductAdminPage({ config }: { config: DentalProductConfig }) {
  const { data: rawSettings, isLoading } = useListSettings();
  const settings = (rawSettings as Record<string, string> | undefined) ?? {};

  if (isLoading) {
    return (
      <section className="px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-6"><div className="h-8 w-48 animate-pulse rounded bg-slate-200" /></div>
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-100" />)}</div>
      </section>
    );
  }

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950">{config.heading}</h1>
        <p className="mt-1 text-sm text-slate-500">Sayfa içeriğini, görsellerini ve teknik özelliklerini düzenleyin</p>
      </div>
      <div className="space-y-6">
        <CardImageSection prefix={config.prefix} settings={settings} />
        <HeroSection prefix={config.prefix} defaults={config.defaultHero} settings={settings} />
        <GallerySection prefix={config.prefix} count={config.galleryCount} label={config.galleryLabel} settings={settings} />
        <SpecsSection prefix={config.prefix} defaults={config.defaultSpecs} settings={settings} />
        <DrawingSection prefix={config.prefix} settings={settings} />
      </div>
    </section>
  );
}
