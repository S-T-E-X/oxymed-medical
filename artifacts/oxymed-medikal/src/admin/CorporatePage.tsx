import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListCorporateSectionsQueryKey,
  useListCorporateSections,
  useUpsertCorporateSection,
  useListSettings,
  useUpsertSetting,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { Save, Upload, X } from "lucide-react";
import { useImageUpload } from "./useImageUpload";

const SECTION_LABELS: Record<string, string> = {
  about: "Hakkımızda",
};

const DEFAULT_ABOUT_TITLE = "Sağlık İçin Güvenilir Sistemler";
const DEFAULT_ABOUT_CONTENT = `1999 yılında kurulan firmamız, medikal gaz sistemleri ve tıbbi cihazların üretimi, satışı, projelendirilmesi ve uygulaması alanlarında faaliyet göstermektedir. Kurulduğumuz günden bu yana sağlık sektörünün ihtiyaçlarını doğru analiz eden, güvenilir ve sürdürülebilir çözümler geliştiren bir anlayışla çalışmalarımızı sürdürmekteyiz.

Faaliyetlerimizin ilk yıllarından itibaren üretimini gerçekleştirdiğimiz medikal gaz sistemi ekipmanları ve hayata geçirdiğimiz sağlık tesisi projeleriyle kalite, güvenilirlik ve teknik yeterlilik konularında sektörde güçlü bir konum elde ettik. Hastaneler, klinikler ve çeşitli sağlık kuruluşlarında tamamladığımız uygulamalar sayesinde markamız, yüksek ürün kalitesi ve mühendislik yaklaşımıyla anılan bir yapıya kavuşmuştur.

Yıllar içerisinde üretim ve proje faaliyetlerimizin yanı sıra ithalat ve ihracat alanlarında da faaliyet göstererek hizmet ağımızı genişlettik. Ulusal ve uluslararası pazarlarda geliştirdiğimiz iş birlikleriyle ürün ve çözümlerimizi farklı coğrafyalardaki sağlık projelerine ulaştırmaya devam ediyoruz.

Teknik bilgi birikimimiz, deneyimli ekibimiz ve yıllar içerisinde başarıyla tamamladığımız projeler, bugün sahip olduğumuz mühendislik gücünün temelini oluşturmaktadır. Üretimden projelendirmeye, montajdan devreye almaya, satış sonrası teknik destekten periyodik bakım hizmetlerine kadar tüm süreçlerde kalite ve sürekliliği ön planda tutuyoruz.

Amacımız; geçmişten gelen tecrübemizi günümüz teknolojileriyle birleştirerek sağlık sektörüne güvenilir, verimli ve uzun ömürlü çözümler sunmaktır. Sürekli gelişimi esas alan yaklaşımımızla ürün kalitemizi, mühendislik kabiliyetimizi ve hizmet standartlarımızı her geçen gün daha ileriye taşımayı hedefliyoruz.

25 yılı aşkın tecrübemizle, sağlık tesisleri için güvenilir sistemler geliştiriyor; iş ortaklarımıza yalnızca ürün değil, uzun vadeli çözüm ortaklığı sunuyoruz.`;

type SectionForm = {
  title: string;
  subtitle: string;
  content: string;
  imageUrl: string;
};

function SectionCard({ sectionKey, initialData }: { sectionKey: string; initialData: SectionForm }) {
  const [form, setForm] = useState<SectionForm>(initialData);
  const [dirty, setDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading } = useImageUpload();
  const qc = useQueryClient();

  useEffect(() => {
    setForm(initialData);
    setDirty(false);
  }, [initialData.title, initialData.subtitle, initialData.content, initialData.imageUrl]);

  function set<K extends keyof SectionForm>(field: K, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
    setDirty(true);
  }

  const upsertMut = useUpsertCorporateSection({
    mutation: {
      onSuccess: () => {
        toast.success(`${SECTION_LABELS[sectionKey] ?? sectionKey} kaydedildi`);
        setDirty(false);
        qc.invalidateQueries({ queryKey: getListCorporateSectionsQueryKey() });
      },
      onError: () => toast.error("Kayıt başarısız"),
    },
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadFile(file);
      set("imageUrl", result.publicUrl);
      toast.success("Görsel yüklendi");
    } catch {
      toast.error("Görsel yüklenemedi");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleSave() {
    upsertMut.mutate({
      sectionKey,
      data: {
        title: form.title || undefined,
        subtitle: form.subtitle || undefined,
        content: form.content || undefined,
        imageUrl: form.imageUrl || undefined,
      },
    });
  }

  const label = SECTION_LABELS[sectionKey] ?? sectionKey;
  const showImage = false;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">{label}</h2>
        <button
          onClick={handleSave}
          disabled={!dirty || upsertMut.isPending}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm disabled:opacity-40 hover:bg-blue-700"
        >
          <Save className="h-3.5 w-3.5" />
          {upsertMut.isPending ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="label">Başlık</label>
          <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder={`${label} başlığı`} />
        </div>
        <div>
          <label className="label">Alt Başlık</label>
          <input className="input" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="Alt başlık" />
        </div>
        <div>
          <label className="label">İçerik</label>
          <textarea
            className="input min-h-[120px] resize-y"
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
            placeholder={`${label} içerik metni`}
          />
        </div>
        {showImage && (
          <div>
            <label className="label">Görsel</label>
            {form.imageUrl && (
              <div className="relative mb-2 overflow-hidden rounded-lg border border-slate-200">
                <img
                  src={form.imageUrl}
                  alt="Bölüm görseli"
                  className="h-40 w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => set("imageUrl", "")}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  title="Görseli kaldır"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="https://... veya /assets/..."
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                {uploading ? "Yükleniyor…" : "Yükle"}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>
      {dirty && <p className="mt-2 text-[11px] text-amber-600 font-medium">Kaydedilmemiş değişiklikler var</p>}
    </div>
  );
}

type SettingsForm = {
  [key: string]: string;
};

function SettingsSection({
  heading,
  subheading,
  fields,
  initialValues,
}: {
  heading: string;
  subheading: string;
  fields: { key: string; label: string; placeholder?: string; type?: "text" | "textarea" | "image" }[];
  initialValues: Record<string, string>;
}) {
  const [form, setForm] = useState<SettingsForm>(initialValues);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeImageKeyRef = useRef<string | null>(null);
  const { uploadFile, uploading } = useImageUpload();
  const upsertMut = useUpsertSetting();

  useEffect(() => {
    setForm(initialValues);
    setDirty(false);
  }, [JSON.stringify(initialValues)]);

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
    setDirty(true);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const key = activeImageKeyRef.current;
    if (!file || !key) return;
    try {
      const result = await uploadFile(file);
      set(key, result.publicUrl);
      toast.success("Görsel yüklendi");
    } catch {
      toast.error("Görsel yüklenemedi");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      activeImageKeyRef.current = null;
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await Promise.all(
        fields.map((f) =>
          upsertMut.mutateAsync({ settingKey: f.key, data: { settingValue: form[f.key] ?? "" } })
        )
      );
      toast.success(`${heading} kaydedildi`);
      setDirty(false);
    } catch {
      toast.error("Kayıt başarısız");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{heading}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{subheading}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm disabled:opacity-40 hover:bg-blue-700"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
      <div className="space-y-3">
        {fields.map((f) => {
          if (f.type === "image") {
            return (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                {form[f.key] && (
                  <div className="relative mb-2 overflow-hidden rounded-lg border border-slate-200">
                    <img
                      src={form[f.key]}
                      alt={f.label}
                      className="h-36 w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <button
                      type="button"
                      onClick={() => set(f.key, "")}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    value={form[f.key] ?? ""}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder ?? "https://..."}
                  />
                  <button
                    type="button"
                    onClick={() => { activeImageKeyRef.current = f.key; fileInputRef.current?.click(); }}
                    disabled={uploading}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {uploading ? "…" : "Yükle"}
                  </button>
                </div>
              </div>
            );
          }
          if (f.type === "textarea") {
            return (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <textarea
                  className="input min-h-[80px] resize-y"
                  value={form[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                />
              </div>
            );
          }
          return (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              <input
                className="input"
                value={form[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            </div>
          );
        })}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {dirty && <p className="mt-2 text-[11px] font-medium text-amber-600">Kaydedilmemiş değişiklikler var</p>}
    </div>
  );
}

export default function CorporatePage() {
  const { data: sections = [], isLoading } = useListCorporateSections();
  const { data: rawSettings } = useListSettings();
  const settings = rawSettings as Record<string, string> | undefined;

  // Kurumsal sayfasında yalnızca "Hakkımızda" bölümü yayınlanıyor.
  // Yönetim panelinde de sadece bu bölüm düzenlenebilir olmalı ki
  // yöneticinin gördüğü içerik ziyaretçinin gördüğüyle birebir aynı olsun.
  const EDITABLE_KEYS = ["about"];
  const sectionMap = Object.fromEntries(sections.map((s) => [s.sectionKey, s]));

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950">Kurumsal İçerik</h1>
        <p className="mt-1 text-sm text-slate-500">Kurumsal sayfa hero banner, istatistikler ve hakkımızda bölümünü düzenleyin</p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-slate-400">Hero Banner</h2>
          {settings !== undefined && (
            <SettingsSection
              heading="Kurumsal Hero Banner"
              subheading="Kurumsal sayfasının en üstündeki büyük banner alanı"
              fields={[
                { key: "corporate_hero_title", label: "Başlık", placeholder: "KURUMSAL" },
                { key: "corporate_hero_description", label: "Açıklama", type: "textarea", placeholder: "Kısa kurumsal açıklama..." },
                { key: "corporate_hero_image_url", label: "Arka Plan Görseli", type: "image", placeholder: "/assets/images/corporate-hero-facility.png" },
              ]}
              initialValues={{
                corporate_hero_title: settings?.["corporate_hero_title"] ?? "",
                corporate_hero_description: settings?.["corporate_hero_description"] ?? "",
                corporate_hero_image_url: settings?.["corporate_hero_image_url"] ?? "",
              }}
            />
          )}
        </div>

        <div>
          <h2 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-slate-400">İstatistikler</h2>
          {settings !== undefined && (
            <SettingsSection
              heading="Kurumsal İstatistikler"
              subheading="Kurumsal sayfasında gösterilen dört bilgi kartı"
              fields={[
                { key: "corporate_years_experience", label: "Yıllık Tecrübe", placeholder: "15+" },
                { key: "corporate_completed_projects", label: "Tamamlanan Proje", placeholder: "200+" },
                { key: "corporate_expert_team", label: "Uzman Ekip", placeholder: "100+" },
                { key: "corporate_export_countries", label: "Ülkeye İhracat", placeholder: "10+" },
              ]}
              initialValues={{
                corporate_years_experience: settings?.["corporate_years_experience"] ?? "15+",
                corporate_completed_projects: settings?.["corporate_completed_projects"] ?? "200+",
                corporate_expert_team: settings?.["corporate_expert_team"] ?? "100+",
                corporate_export_countries: settings?.["corporate_export_countries"] ?? "10+",
              }}
            />
          )}
        </div>

        <div>
          <h2 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-slate-400">İçerik Bölümleri</h2>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-100" />)}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {EDITABLE_KEYS.map((key) => {
                const sec = sectionMap[key];
                return (
                  <SectionCard
                    key={key}
                    sectionKey={key}
                    initialData={{
                      title: sec?.title ?? (key === "about" ? DEFAULT_ABOUT_TITLE : ""),
                      subtitle: sec?.subtitle ?? "",
                      content: sec?.content ?? (key === "about" ? DEFAULT_ABOUT_CONTENT : ""),
                      imageUrl: sec?.imageUrl ?? "",
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
