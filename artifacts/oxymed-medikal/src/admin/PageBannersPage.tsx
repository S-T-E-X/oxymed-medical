import { useEffect, useRef, useState } from "react";
import { useListSettings, useUpsertSetting } from "@workspace/api-client-react";
import { toast } from "sonner";
import { Save, Upload, X } from "lucide-react";
import { useImageUpload } from "./useImageUpload";

type BannerForm = {
  title: string;
  description: string;
  imageUrl: string;
};

function BannerSection({
  heading,
  subheading,
  titleKey,
  descriptionKey,
  imageKey,
  initialTitle,
  initialDescription,
  initialImageUrl,
}: {
  heading: string;
  subheading: string;
  titleKey: string;
  descriptionKey: string;
  imageKey: string;
  initialTitle: string;
  initialDescription: string;
  initialImageUrl: string;
}) {
  const [form, setForm] = useState<BannerForm>({
    title: initialTitle,
    description: initialDescription,
    imageUrl: initialImageUrl,
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading } = useImageUpload();

  useEffect(() => {
    setForm({ title: initialTitle, description: initialDescription, imageUrl: initialImageUrl });
    setDirty(false);
  }, [initialTitle, initialDescription, initialImageUrl]);

  const upsertMut = useUpsertSetting();

  function set<K extends keyof BannerForm>(field: K, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
    setDirty(true);
  }

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

  async function handleSave() {
    setSaving(true);
    try {
      await Promise.all([
        upsertMut.mutateAsync({ settingKey: titleKey, data: { settingValue: form.title } }),
        upsertMut.mutateAsync({ settingKey: descriptionKey, data: { settingValue: form.description } }),
        upsertMut.mutateAsync({ settingKey: imageKey, data: { settingValue: form.imageUrl } }),
      ]);
      toast.success(`${heading} kaydedildi`);
      setDirty(false);
    } catch {
      toast.error("Kayıt başarısız");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{heading}</h2>
          <p className="mt-1 text-xs text-slate-500">{subheading}</p>
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

      <div className="space-y-4">
        <div>
          <label className="label">Başlık</label>
          <input
            className="input"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Banner başlığı"
          />
        </div>

        <div>
          <label className="label">Açıklama</label>
          <textarea
            className="input min-h-[80px] resize-y"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Banner açıklama metni"
          />
        </div>

        <div>
          <label className="label">Arka Plan Görseli</label>
          {form.imageUrl && (
            <div className="relative mb-2 overflow-hidden rounded-lg border border-slate-200">
              <img
                src={form.imageUrl}
                alt="Banner görseli"
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
          <p className="mt-1.5 text-[11px] text-slate-400">
            Boş bırakılırsa varsayılan görsel kullanılır.
          </p>
        </div>
      </div>

      {dirty && (
        <p className="mt-3 text-[11px] font-medium text-amber-600">Kaydedilmemiş değişiklikler var</p>
      )}
    </div>
  );
}

export default function PageBannersPage() {
  const { data: rawSettings, isLoading } = useListSettings();
  const settings = rawSettings as Record<string, string> | undefined;

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950">Sayfa Bannerları</h1>
        <p className="mt-1 text-sm text-slate-500">
          İç sayfaların (Ürünler, vb.) üst banner alanlarını buradan düzenleyin
        </p>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      ) : (
        <div className="space-y-6">
          <BannerSection
            heading="Ürünler Sayfası Banner"
            subheading="Ürünler sayfasının üst kısmındaki başlık, açıklama ve arka plan görseli"
            titleKey="products_banner_title"
            descriptionKey="products_banner_description"
            imageKey="products_banner_image_url"
            initialTitle={settings?.["products_banner_title"] ?? ""}
            initialDescription={settings?.["products_banner_description"] ?? ""}
            initialImageUrl={settings?.["products_banner_image_url"] ?? ""}
          />
        </div>
      )}
    </section>
  );
}
