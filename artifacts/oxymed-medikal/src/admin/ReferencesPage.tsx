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
import { Edit2, ImageIcon, Plus, Trash2, X } from "lucide-react";
import { useImageUpload } from "./useImageUpload";

type RefForm = {
  title: string;
  projectType: string;
  capacity: string;
  city: string;
  imageUrl: string;
  category: string;
};

const EMPTY: RefForm = {
  title: "",
  projectType: "",
  capacity: "",
  city: "",
  imageUrl: "",
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
            <label className="label">Görsel</label>
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
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="btn-secondary">İptal</button>
          <button onClick={() => onSave(form)} disabled={saving || !form.title || !form.projectType} className="btn-primary">
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
          <p className="mt-1 text-sm text-slate-500">Tamamlanan proje referanslarını yönetin ({refs.length} proje)</p>
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
                <p className="font-bold text-slate-900 line-clamp-2">{r.title}</p>
                <p className="mt-1 text-xs text-slate-500">{r.projectType}</p>
                {r.city && <p className="text-xs text-slate-400">{r.city}{r.capacity ? ` · ${r.capacity}` : ""}</p>}
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
