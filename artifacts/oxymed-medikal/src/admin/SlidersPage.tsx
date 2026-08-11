import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListSlidersQueryKey,
  useCreateSlider,
  useDeleteSlider,
  useListSliders,
  useUpdateSlider,
  type Slider,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { Edit2, GripVertical, ImageIcon, Plus, ToggleLeft, ToggleRight, Trash2, X } from "lucide-react";
import { useImageUpload } from "./useImageUpload";

// Locales supported for slider text (TR is the base/fallback)
const SLIDER_LOCALES = [
  { code: "tr", label: "TR" },
  { code: "en", label: "EN" },
  { code: "de", label: "DE" },
  { code: "fr", label: "FR" },
  { code: "it", label: "IT" },
  { code: "ar", label: "AR" },
  { code: "ru", label: "RU" },
  { code: "fa", label: "FA" },
  { code: "ka", label: "KA" },
  { code: "bg", label: "BG" },
  { code: "az", label: "AZ" },
] as const;

type SliderLocale = (typeof SLIDER_LOCALES)[number]["code"];

// Locale-specific text fields (excluding TR which uses the base fields)
type LocaleFields = {
  titleEn: string; titleDe: string; titleFr: string; titleIt: string; titleAr: string;
  titleRu: string; titleFa: string; titleKa: string; titleBg: string; titleAz: string;
  subtitleEn: string; subtitleDe: string; subtitleFr: string; subtitleIt: string; subtitleAr: string;
  subtitleRu: string; subtitleFa: string; subtitleKa: string; subtitleBg: string; subtitleAz: string;
  descriptionEn: string; descriptionDe: string; descriptionFr: string; descriptionIt: string; descriptionAr: string;
  descriptionRu: string; descriptionFa: string; descriptionKa: string; descriptionBg: string; descriptionAz: string;
  ctaPrimaryTextEn: string; ctaPrimaryTextDe: string; ctaPrimaryTextFr: string; ctaPrimaryTextIt: string; ctaPrimaryTextAr: string;
  ctaPrimaryTextRu: string; ctaPrimaryTextFa: string; ctaPrimaryTextKa: string; ctaPrimaryTextBg: string; ctaPrimaryTextAz: string;
  ctaSecondaryTextEn: string; ctaSecondaryTextDe: string; ctaSecondaryTextFr: string; ctaSecondaryTextIt: string; ctaSecondaryTextAr: string;
  ctaSecondaryTextRu: string; ctaSecondaryTextFa: string; ctaSecondaryTextKa: string; ctaSecondaryTextBg: string; ctaSecondaryTextAz: string;
};

type SliderFormData = {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  ctaPrimaryText: string;
  ctaPrimaryHref: string;
  ctaSecondaryText: string;
  ctaSecondaryHref: string;
  sortOrder: number;
  isActive: boolean;
  showCatalogButton: boolean;
  overlayEnabled: boolean;
  overlayColor: string;
  overlayFromOpacity: number;
  overlayToOpacity: number;
  textColor: string;
  ctaPrimaryBg: string;
  ctaSecondaryBg: string;
} & LocaleFields;

const EMPTY_LOCALE_FIELDS: LocaleFields = {
  titleEn: "", titleDe: "", titleFr: "", titleIt: "", titleAr: "",
  titleRu: "", titleFa: "", titleKa: "", titleBg: "", titleAz: "",
  subtitleEn: "", subtitleDe: "", subtitleFr: "", subtitleIt: "", subtitleAr: "",
  subtitleRu: "", subtitleFa: "", subtitleKa: "", subtitleBg: "", subtitleAz: "",
  descriptionEn: "", descriptionDe: "", descriptionFr: "", descriptionIt: "", descriptionAr: "",
  descriptionRu: "", descriptionFa: "", descriptionKa: "", descriptionBg: "", descriptionAz: "",
  ctaPrimaryTextEn: "", ctaPrimaryTextDe: "", ctaPrimaryTextFr: "", ctaPrimaryTextIt: "", ctaPrimaryTextAr: "",
  ctaPrimaryTextRu: "", ctaPrimaryTextFa: "", ctaPrimaryTextKa: "", ctaPrimaryTextBg: "", ctaPrimaryTextAz: "",
  ctaSecondaryTextEn: "", ctaSecondaryTextDe: "", ctaSecondaryTextFr: "", ctaSecondaryTextIt: "", ctaSecondaryTextAr: "",
  ctaSecondaryTextRu: "", ctaSecondaryTextFa: "", ctaSecondaryTextKa: "", ctaSecondaryTextBg: "", ctaSecondaryTextAz: "",
};

const EMPTY: SliderFormData = {
  title: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  ctaPrimaryText: "",
  ctaPrimaryHref: "",
  ctaSecondaryText: "",
  ctaSecondaryHref: "",
  sortOrder: 0,
  isActive: true,
  showCatalogButton: false,
  overlayEnabled: true,
  overlayColor: "#021423",
  overlayFromOpacity: 92,
  overlayToOpacity: 12,
  textColor: "#ffffff",
  ctaPrimaryBg: "#021423",
  ctaSecondaryBg: "#ffffff",
  ...EMPTY_LOCALE_FIELDS,
};

/** Build locale-keyed field name, e.g. localeField("title", "en") => "titleEn" */
function localeField(base: string, locale: SliderLocale): keyof SliderFormData {
  if (locale === "tr") return base as keyof SliderFormData;
  const suffix = locale.charAt(0).toUpperCase() + locale.slice(1);
  return (base + suffix) as keyof SliderFormData;
}

function ColorField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {hint && <p className="mb-1 text-[11px] text-slate-400">{hint}</p>}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value.startsWith("#") ? value : "#021423"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded border border-slate-200 p-0.5"
        />
        <input
          className="input flex-1 font-mono text-xs"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#rrggbb"
        />
      </div>
    </div>
  );
}

function RangeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="label mb-0">{label}</label>
        <span className="text-xs font-bold text-slate-600">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="mt-1 w-full accent-blue-600"
      />
    </div>
  );
}

function SliderModal({
  initial,
  onClose,
  onSave,
  saving,
}: {
  initial: SliderFormData;
  onClose: () => void;
  onSave: (data: SliderFormData) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<SliderFormData>(initial);
  const [activeLang, setActiveLang] = useState<SliderLocale>("tr");
  const { uploadFile, uploading } = useImageUpload();

  function set(field: keyof SliderFormData, value: string | boolean | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { publicUrl } = await uploadFile(file);
      set("imageUrl", publicUrl);
      toast.success("Görsel yüklendi");
    } catch {
      toast.error("Görsel yüklenemedi");
    }
  }

  const titleKey = localeField("title", activeLang);
  const subtitleKey = localeField("subtitle", activeLang);
  const descriptionKey = localeField("description", activeLang);
  const ctaPrimaryTextKey = localeField("ctaPrimaryText", activeLang);
  const ctaSecondaryTextKey = localeField("ctaSecondaryText", activeLang);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">{initial.title ? "Slider Düzenle" : "Yeni Slider"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4 p-6">
          {/* Language tabs */}
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Dil / Language</p>
            <div className="flex flex-wrap gap-1">
              {SLIDER_LOCALES.map(({ code, label }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setActiveLang(code)}
                  className={`rounded px-2.5 py-1 text-xs font-bold transition ${
                    activeLang === code
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {activeLang !== "tr" && (
              <p className="mt-1.5 text-[11px] text-slate-400">
                Boş bırakılan alanlar Türkçe içeriğe düşer.
              </p>
            )}
          </div>

          {/* Translatable text fields */}
          <div>
            <label className="label">
              {activeLang === "tr" ? "Başlık *" : "Başlık"}
            </label>
            <input
              className="input"
              value={(form[titleKey] as string) ?? ""}
              onChange={(e) => set(titleKey, e.target.value)}
              placeholder={activeLang === "tr" ? "Slider başlığı" : `Başlık (${activeLang.toUpperCase()}) — boş = TR`}
            />
          </div>
          <div>
            <label className="label">Alt Başlık</label>
            <input
              className="input"
              value={(form[subtitleKey] as string) ?? ""}
              onChange={(e) => set(subtitleKey, e.target.value)}
              placeholder={activeLang === "tr" ? "Alt başlık" : `Alt başlık (${activeLang.toUpperCase()}) — boş = TR`}
            />
          </div>
          <div>
            <label className="label">Açıklama</label>
            <textarea
              className="input min-h-[80px] resize-y"
              value={(form[descriptionKey] as string) ?? ""}
              onChange={(e) => set(descriptionKey, e.target.value)}
              placeholder={activeLang === "tr" ? "Açıklama metni" : `Açıklama (${activeLang.toUpperCase()}) — boş = TR`}
            />
          </div>

          {/* Image URL — only on TR tab */}
          {activeLang === "tr" && (
            <div>
              <label className="label">Görsel URL</label>
              <div className="flex gap-2">
                <input className="input flex-1" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://... veya dosya yükle" />
                <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  <ImageIcon className="h-4 w-4" />
                  {uploading ? "…" : "Yükle"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                </label>
              </div>
              {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-2 h-24 w-full rounded object-cover" />}
            </div>
          )}

          {/* CTA buttons */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Birincil Buton Metni</label>
              <input
                className="input"
                value={(form[ctaPrimaryTextKey] as string) ?? ""}
                onChange={(e) => set(ctaPrimaryTextKey, e.target.value)}
                placeholder={activeLang === "tr" ? "Detaylar" : `(${activeLang.toUpperCase()}) — boş = TR`}
              />
            </div>
            {activeLang === "tr" && (
              <div>
                <label className="label">Birincil Buton Linki</label>
                <input className="input" value={form.ctaPrimaryHref} onChange={(e) => set("ctaPrimaryHref", e.target.value)} placeholder="/urunler" />
              </div>
            )}
            <div>
              <label className="label">İkincil Buton Metni</label>
              <input
                className="input"
                value={(form[ctaSecondaryTextKey] as string) ?? ""}
                onChange={(e) => set(ctaSecondaryTextKey, e.target.value)}
                placeholder={activeLang === "tr" ? "İletişim" : `(${activeLang.toUpperCase()}) — boş = TR`}
              />
            </div>
            {activeLang === "tr" && (
              <div>
                <label className="label">İkincil Buton Linki</label>
                <input className="input" value={form.ctaSecondaryHref} onChange={(e) => set("ctaSecondaryHref", e.target.value)} placeholder="/teklif-al" />
              </div>
            )}
          </div>

          {/* Settings (only on TR tab) */}
          {activeLang === "tr" && (
            <>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                  Aktif
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={form.showCatalogButton} onChange={(e) => set("showCatalogButton", e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                  Katalog İndir Butonu Göster
                </label>
              </div>

              <div className="rounded-lg border border-slate-200 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">Overlay (Renk Örtüsü)</p>
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={form.overlayEnabled}
                      onChange={(e) => set("overlayEnabled", e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    {form.overlayEnabled ? "Açık" : "Kapalı"}
                  </label>
                </div>
                {form.overlayEnabled && (
                  <div className="space-y-4">
                    <ColorField
                      label="Overlay Rengi"
                      value={form.overlayColor}
                      onChange={(v) => set("overlayColor", v)}
                      hint="Soldan sağa doğru uygulanacak renk"
                    />
                    <RangeField
                      label="Sol taraf opaklığı (başlangıç)"
                      value={form.overlayFromOpacity}
                      onChange={(v) => set("overlayFromOpacity", v)}
                    />
                    <RangeField
                      label="Sağ taraf opaklığı (bitiş)"
                      value={form.overlayToOpacity}
                      onChange={(v) => set("overlayToOpacity", v)}
                    />
                    <div className="h-6 rounded" style={{
                      background: form.overlayColor.startsWith("#")
                        ? `linear-gradient(to right, ${form.overlayColor}${Math.round(form.overlayFromOpacity * 2.55).toString(16).padStart(2, "0")}, ${form.overlayColor}${Math.round(form.overlayToOpacity * 2.55).toString(16).padStart(2, "0")})`
                        : "linear-gradient(to right, #021423ea, #02142320)"
                    }} />
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 p-4 space-y-4">
                <p className="text-sm font-bold text-slate-800">Metin &amp; Buton Renkleri</p>
                <ColorField
                  label="Metin rengi"
                  value={form.textColor}
                  onChange={(v) => set("textColor", v)}
                  hint="Başlık ve açıklama metinlerine uygulanır"
                />
                <ColorField
                  label="Birincil buton arka planı"
                  value={form.ctaPrimaryBg}
                  onChange={(v) => set("ctaPrimaryBg", v)}
                />
                <ColorField
                  label="İkincil buton arka planı"
                  value={form.ctaSecondaryBg}
                  onChange={(v) => set("ctaSecondaryBg", v)}
                />
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="btn-secondary">İptal</button>
          <button onClick={() => onSave(form)} disabled={saving || !form.title} className="btn-primary">
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SlidersPage() {
  const qc = useQueryClient();
  const { data: sliders = [], isLoading } = useListSliders();
  const [modal, setModal] = useState<{ open: boolean; slider: Slider | null }>({ open: false, slider: null });

  const [orderedSliders, setOrderedSliders] = useState<Slider[]>([]);
  const dragId = useRef<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const displaySliders = orderedSliders.length > 0 ? orderedSliders : [...sliders].sort((a, b) => a.sortOrder - b.sortOrder);

  const invalidate = () => {
    setOrderedSliders([]);
    qc.invalidateQueries({ queryKey: getListSlidersQueryKey() });
  };

  const updateMut = useUpdateSlider({
    mutation: {
      onSuccess: () => { },
      onError: () => toast.error("Güncelleme başarısız"),
    },
  });
  const createMut = useCreateSlider({ mutation: { onSuccess: () => { toast.success("Slider oluşturuldu"); invalidate(); setModal({ open: false, slider: null }); }, onError: () => toast.error("Kayıt başarısız") } });
  const deleteMut = useDeleteSlider({ mutation: { onSuccess: () => { toast.success("Slider silindi"); invalidate(); }, onError: () => toast.error("Silme başarısız") } });

  const updateMutEdit = useUpdateSlider({ mutation: { onSuccess: () => { toast.success("Slider güncellendi"); invalidate(); setModal({ open: false, slider: null }); }, onError: () => toast.error("Güncelleme başarısız") } });

  function openNew() { setModal({ open: true, slider: null }); }
  function openEdit(s: Slider) { setModal({ open: true, slider: s }); }

  function sliderToForm(s: Slider): SliderFormData {
    return {
      title: s.title,
      subtitle: s.subtitle ?? "",
      description: s.description ?? "",
      imageUrl: s.imageUrl ?? "",
      ctaPrimaryText: s.ctaPrimaryText ?? "",
      ctaPrimaryHref: s.ctaPrimaryHref ?? "",
      ctaSecondaryText: s.ctaSecondaryText ?? "",
      ctaSecondaryHref: s.ctaSecondaryHref ?? "",
      sortOrder: s.sortOrder,
      isActive: s.isActive,
      showCatalogButton: s.showCatalogButton ?? false,
      overlayEnabled: s.overlayEnabled ?? true,
      overlayColor: s.overlayColor ?? "#021423",
      overlayFromOpacity: s.overlayFromOpacity ?? 92,
      overlayToOpacity: s.overlayToOpacity ?? 12,
      textColor: s.textColor ?? "#ffffff",
      ctaPrimaryBg: s.ctaPrimaryBg ?? "#021423",
      ctaSecondaryBg: s.ctaSecondaryBg ?? "#ffffff",
      titleEn: s.titleEn ?? "", titleDe: s.titleDe ?? "", titleFr: s.titleFr ?? "", titleIt: s.titleIt ?? "", titleAr: s.titleAr ?? "",
      titleRu: s.titleRu ?? "", titleFa: s.titleFa ?? "", titleKa: s.titleKa ?? "", titleBg: s.titleBg ?? "", titleAz: s.titleAz ?? "",
      subtitleEn: s.subtitleEn ?? "", subtitleDe: s.subtitleDe ?? "", subtitleFr: s.subtitleFr ?? "", subtitleIt: s.subtitleIt ?? "", subtitleAr: s.subtitleAr ?? "",
      subtitleRu: s.subtitleRu ?? "", subtitleFa: s.subtitleFa ?? "", subtitleKa: s.subtitleKa ?? "", subtitleBg: s.subtitleBg ?? "", subtitleAz: s.subtitleAz ?? "",
      descriptionEn: s.descriptionEn ?? "", descriptionDe: s.descriptionDe ?? "", descriptionFr: s.descriptionFr ?? "", descriptionIt: s.descriptionIt ?? "", descriptionAr: s.descriptionAr ?? "",
      descriptionRu: s.descriptionRu ?? "", descriptionFa: s.descriptionFa ?? "", descriptionKa: s.descriptionKa ?? "", descriptionBg: s.descriptionBg ?? "", descriptionAz: s.descriptionAz ?? "",
      ctaPrimaryTextEn: s.ctaPrimaryTextEn ?? "", ctaPrimaryTextDe: s.ctaPrimaryTextDe ?? "", ctaPrimaryTextFr: s.ctaPrimaryTextFr ?? "", ctaPrimaryTextIt: s.ctaPrimaryTextIt ?? "", ctaPrimaryTextAr: s.ctaPrimaryTextAr ?? "",
      ctaPrimaryTextRu: s.ctaPrimaryTextRu ?? "", ctaPrimaryTextFa: s.ctaPrimaryTextFa ?? "", ctaPrimaryTextKa: s.ctaPrimaryTextKa ?? "", ctaPrimaryTextBg: s.ctaPrimaryTextBg ?? "", ctaPrimaryTextAz: s.ctaPrimaryTextAz ?? "",
      ctaSecondaryTextEn: s.ctaSecondaryTextEn ?? "", ctaSecondaryTextDe: s.ctaSecondaryTextDe ?? "", ctaSecondaryTextFr: s.ctaSecondaryTextFr ?? "", ctaSecondaryTextIt: s.ctaSecondaryTextIt ?? "", ctaSecondaryTextAr: s.ctaSecondaryTextAr ?? "",
      ctaSecondaryTextRu: s.ctaSecondaryTextRu ?? "", ctaSecondaryTextFa: s.ctaSecondaryTextFa ?? "", ctaSecondaryTextKa: s.ctaSecondaryTextKa ?? "", ctaSecondaryTextBg: s.ctaSecondaryTextBg ?? "", ctaSecondaryTextAz: s.ctaSecondaryTextAz ?? "",
    };
  }

  function handleSave(data: SliderFormData) {
    // Build payload converting empty strings to undefined for optional locale fields
    const localePayload: Record<string, string | undefined> = {};
    for (const { code } of SLIDER_LOCALES) {
      if (code === "tr") continue;
      for (const base of ["title", "subtitle", "description", "ctaPrimaryText", "ctaSecondaryText"]) {
        const key = localeField(base, code);
        const val = (data[key] as string) || undefined;
        localePayload[key] = val;
      }
    }

    const payload = {
      title: data.title,
      subtitle: data.subtitle || undefined,
      description: data.description || undefined,
      imageUrl: data.imageUrl || undefined,
      ctaPrimaryText: data.ctaPrimaryText || undefined,
      ctaPrimaryHref: data.ctaPrimaryHref || undefined,
      ctaSecondaryText: data.ctaSecondaryText || undefined,
      ctaSecondaryHref: data.ctaSecondaryHref || undefined,
      isActive: data.isActive,
      showCatalogButton: data.showCatalogButton,
      overlayEnabled: data.overlayEnabled,
      overlayColor: data.overlayColor || undefined,
      overlayFromOpacity: data.overlayFromOpacity,
      overlayToOpacity: data.overlayToOpacity,
      textColor: data.textColor || undefined,
      ctaPrimaryBg: data.ctaPrimaryBg || undefined,
      ctaSecondaryBg: data.ctaSecondaryBg || undefined,
      ...localePayload,
    };
    if (modal.slider) {
      updateMutEdit.mutate({ id: modal.slider.id, data: payload });
    } else {
      createMut.mutate({ data: payload });
    }
  }

  function handleToggleActive(s: Slider) {
    updateMut.mutate({ id: s.id, data: { isActive: !s.isActive } });
    invalidate();
  }

  function handleDelete(id: number) {
    if (confirm("Bu slider'ı silmek istediğinizden emin misiniz?")) {
      deleteMut.mutate({ id });
    }
  }

  function onDragStart(id: number) {
    dragId.current = id;
  }

  function onDragOver(e: React.DragEvent, id: number) {
    e.preventDefault();
    setDragOverId(id);
  }

  function onDragLeave() {
    setDragOverId(null);
  }

  async function onDrop(targetId: number) {
    setDragOverId(null);
    const fromId = dragId.current;
    if (fromId === null || fromId === targetId) return;
    dragId.current = null;

    const base = displaySliders;
    const fromIdx = base.findIndex((s) => s.id === fromId);
    const toIdx = base.findIndex((s) => s.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const reordered = [...base];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    const withNewOrder = reordered.map((s, i) => ({ ...s, sortOrder: i }));
    setOrderedSliders(withNewOrder);

    try {
      await Promise.all(
        withNewOrder.map((s, i) =>
          base[i]?.sortOrder !== i || base.find((b) => b.id === s.id)?.sortOrder !== i
            ? updateMut.mutateAsync({ id: s.id, data: { sortOrder: i } })
            : Promise.resolve()
        )
      );
      toast.success("Sıralama kaydedildi");
      invalidate();
    } catch {
      toast.error("Sıralama kaydedilemedi");
      setOrderedSliders([]);
    }
  }

  const saving = createMut.isPending || updateMutEdit.isPending;

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Slider Yönetimi</h1>
          <p className="mt-1 text-sm text-slate-500">Ana sayfa hero slider'larını yönetin · Kartları sürükleyerek sıralayın</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Yeni Slider
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      ) : displaySliders.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <p className="text-slate-400">Henüz slider yok</p>
          <button onClick={openNew} className="btn-primary mt-4">İlk slider'ı ekle</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displaySliders.map((s, idx) => (
            <div
              key={s.id}
              draggable
              onDragStart={() => onDragStart(s.id)}
              onDragOver={(e) => onDragOver(e, s.id)}
              onDragLeave={onDragLeave}
              onDrop={() => onDrop(s.id)}
              className={`overflow-hidden rounded-xl border-2 bg-white shadow-sm transition select-none ${
                dragOverId === s.id ? "border-blue-400 shadow-lg scale-[1.02]" : "border-slate-200"
              }`}
            >
              <div className="relative">
                {s.imageUrl ? (
                  <img src={s.imageUrl} alt={s.title} className="h-36 w-full object-cover" />
                ) : (
                  <div className="flex h-36 w-full items-center justify-center bg-slate-100">
                    <ImageIcon className="h-10 w-10 text-slate-300" />
                  </div>
                )}
                <div className="absolute left-2 top-2 flex h-7 w-7 cursor-grab items-center justify-center rounded-lg bg-white/80 text-slate-500 shadow backdrop-blur-sm active:cursor-grabbing">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="absolute right-2 top-2 flex h-7 items-center justify-center rounded-lg bg-white/80 px-2 text-[11px] font-bold text-slate-600 shadow backdrop-blur-sm">
                  #{idx + 1}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900">{s.title}</p>
                    {s.subtitle && <p className="mt-0.5 truncate text-xs text-slate-500">{s.subtitle}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${s.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {s.isActive ? "Aktif" : "Pasif"}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => handleToggleActive(s)} className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    {s.isActive ? <ToggleRight className="h-4 w-4 text-emerald-500" /> : <ToggleLeft className="h-4 w-4" />}
                    {s.isActive ? "Deaktif Et" : "Aktif Et"}
                  </button>
                  <button onClick={() => openEdit(s)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <SliderModal
          initial={modal.slider ? sliderToForm(modal.slider) : EMPTY}
          onClose={() => setModal({ open: false, slider: null })}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </section>
  );
}
