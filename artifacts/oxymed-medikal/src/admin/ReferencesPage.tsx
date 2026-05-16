import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListReferencesQueryKey,
  useCreateReference,
  useDeleteReference,
  useListReferences,
  useUpdateReference,
  type ReferenceItem,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { Edit2, ImageIcon, Plus, Star, Trash2, X } from "lucide-react";
import { useImageUpload } from "./useImageUpload";

type RefForm = {
  title: string;
  projectType: string;
  capacity: string;
  city: string;
  imageUrl: string;
  logoUrl: string;
  showInMarquee: boolean;
  category: string;
};

const EMPTY: RefForm = {
  title: "",
  projectType: "",
  capacity: "",
  city: "",
  imageUrl: "",
  logoUrl: "",
  showInMarquee: false,
  category: "Hastane",
};

const PROJECT_TYPES = ["Hastane", "Klinik", "Sağlık Merkezi", "Endüstriyel", "Diğer"];
const CATEGORIES = ["Hastane", "Klinik", "Sağlık Merkezi", "Endüstriyel", "Diğer"];

function RefModal({
  initial,
  onClose,
  onSave,
  saving,
}: {
  initial: RefForm;
  onClose: () => void;
  onSave: (data: RefForm) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<RefForm>(initial);
  const { uploadFile, uploading } = useImageUpload();
  const [uploadingLogo, setUploadingLogo] = useState(false);

  function set<K extends keyof RefForm>(field: K, value: RefForm[K]) {
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

  async function handleLogoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const { publicUrl } = await uploadFile(file);
      set("logoUrl", publicUrl);
      toast.success("Logo yüklendi");
    } catch {
      toast.error("Logo yüklenemedi");
    } finally {
      setUploadingLogo(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">{initial.title ? "Referans Düzenle" : "Yeni Referans"}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="label">Proje Adı *</label>
            <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Hastane veya tesis adı" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Proje Türü *</label>
              <select className="input" value={form.projectType} onChange={(e) => set("projectType", e.target.value)}>
                <option value="">Seçin…</option>
                {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Kategori</label>
              <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Şehir</label>
              <input className="input" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="İstanbul" />
            </div>
            <div>
              <label className="label">Kapasite</label>
              <input className="input" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="500 Yatak" />
            </div>
          </div>

          <div>
            <label className="label">Proje Görseli</label>
            <div className="flex gap-2">
              <input className="input flex-1" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://..." />
              <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                <ImageIcon className="h-4 w-4" />
                {uploading ? "…" : "Yükle"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
              </label>
            </div>
            {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-2 h-24 w-full rounded object-cover" />}
          </div>

          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-bold text-amber-800">Marquee Şerit Ayarları</span>
            </div>

            <label className="mb-3 flex cursor-pointer items-center gap-3">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={form.showInMarquee}
                  onChange={(e) => set("showInMarquee", e.target.checked)}
                />
                <div className={`h-6 w-11 rounded-full transition-colors ${form.showInMarquee ? "bg-amber-500" : "bg-slate-200"}`} />
                <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.showInMarquee ? "translate-x-5" : ""}`} />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {form.showInMarquee ? "Ana sayfa şeridinde göster" : "Şeritte gösterme"}
              </span>
            </label>

            {form.showInMarquee && (
              <div>
                <label className="label text-xs">
                  Logo (opsiyonel) — logo yoksa proje adı metin olarak gösterilir
                </label>
                <p className="mb-2 text-[11px] text-slate-500">
                  Önerilen: <strong>200 × 160 px</strong>, şeffaf arka plan (WebP/PNG)
                </p>
                {form.logoUrl ? (
                  <div className="relative flex h-24 items-center justify-center rounded-lg border border-slate-200 bg-white p-3">
                    <img src={form.logoUrl} alt="Logo önizleme" className="max-h-20 max-w-[168px] object-contain" />
                    <button
                      type="button"
                      onClick={() => set("logoUrl", "")}
                      className="absolute top-2 right-2 rounded-full bg-white p-0.5 text-slate-400 shadow hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-amber-200 bg-white text-slate-400 transition hover:border-amber-400 hover:text-amber-500">
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-xs font-medium">{uploadingLogo ? "Yükleniyor…" : "Logo seç veya sürükle"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoPick} disabled={uploadingLogo} />
                  </label>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="btn-secondary">İptal</button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.title || !form.projectType}
            className="btn-primary"
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReferencesPage() {
  const qc = useQueryClient();
  const { data: refData, isLoading } = useListReferences({ limit: 100 });
  const refs = refData?.items ?? [];
  const [modal, setModal] = useState<{ open: boolean; item: ReferenceItem | null }>({ open: false, item: null });

  const invalidate = () => qc.invalidateQueries({ queryKey: getListReferencesQueryKey() });
  const createMut = useCreateReference({ mutation: { onSuccess: () => { toast.success("Referans oluşturuldu"); invalidate(); setModal({ open: false, item: null }); }, onError: () => toast.error("Kayıt başarısız") } });
  const updateMut = useUpdateReference({ mutation: { onSuccess: () => { toast.success("Referans güncellendi"); invalidate(); setModal({ open: false, item: null }); }, onError: () => toast.error("Güncelleme başarısız") } });
  const deleteMut = useDeleteReference({ mutation: { onSuccess: () => { toast.success("Referans silindi"); invalidate(); }, onError: () => toast.error("Silme başarısız") } });

  function handleSave(data: RefForm) {
    const payload = {
      title: data.title,
      projectType: data.projectType,
      capacity: data.capacity || undefined,
      city: data.city || undefined,
      imageUrl: data.imageUrl || undefined,
      logoUrl: data.logoUrl || undefined,
      showInMarquee: data.showInMarquee,
      category: data.category || undefined,
    };
    if (modal.item) {
      updateMut.mutate({ id: modal.item.id, data: payload });
    } else {
      createMut.mutate({ data: payload });
    }
  }

  function handleDelete(id: number) {
    if (confirm("Bu referansı silmek istediğinizden emin misiniz?")) deleteMut.mutate({ id });
  }

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Referanslar & Projeler</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tamamlanan proje referanslarını yönetin ({refs.length} proje,{" "}
            <span className="font-semibold text-amber-600">
              {refs.filter((r) => r.showInMarquee).length} şeritte
            </span>
            )
          </p>
        </div>
        <button onClick={() => setModal({ open: true, item: null })} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Yeni Referans
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map((i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-100" />)}</div>
      ) : refs.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <p className="text-slate-400">Henüz referans yok</p>
          <button onClick={() => setModal({ open: true, item: null })} className="btn-primary mt-4">İlk referansı ekle</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {refs.map((r) => (
            <div key={r.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {r.imageUrl ? (
                <img src={r.imageUrl} alt={r.title} className="h-32 w-full object-cover" />
              ) : (
                <div className="flex h-32 w-full items-center justify-center bg-slate-100">
                  <ImageIcon className="h-8 w-8 text-slate-300" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-slate-900 line-clamp-2">{r.title}</p>
                  {r.showInMarquee && (
                    <span title="Marquee şeridinde gösteriliyor" className="shrink-0">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">{r.projectType}</p>
                {r.city && <p className="text-xs text-slate-400">{r.city}{r.capacity ? ` · ${r.capacity}` : ""}</p>}
                {r.showInMarquee && r.logoUrl && (
                  <div className="mt-2 flex h-10 items-center justify-center rounded border border-amber-100 bg-amber-50 px-2">
                    <img src={r.logoUrl} alt="" className="max-h-8 max-w-full object-contain" />
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setModal({ open: true, item: r })} className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    <Edit2 className="h-3.5 w-3.5" /> Düzenle
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <RefModal
          initial={modal.item ? {
            title: modal.item.title,
            projectType: modal.item.projectType,
            capacity: modal.item.capacity ?? "",
            city: modal.item.city ?? "",
            imageUrl: modal.item.imageUrl ?? "",
            logoUrl: modal.item.logoUrl ?? "",
            showInMarquee: modal.item.showInMarquee,
            category: modal.item.category,
          } : EMPTY}
          onClose={() => setModal({ open: false, item: null })}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </section>
  );
}
