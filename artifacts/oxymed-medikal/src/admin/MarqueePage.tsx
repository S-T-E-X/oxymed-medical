import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListMarqueeItemsQueryKey,
  useCreateMarqueeItem,
  useDeleteMarqueeItem,
  useListMarqueeItems,
  useUpdateMarqueeItem,
  type MarqueeItem,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { GripVertical, ImageIcon, Plus, ToggleLeft, ToggleRight, Trash2, Type, X } from "lucide-react";
import { useImageUpload } from "./useImageUpload";

type Mode = "logo" | "text";

type FormData = {
  mode: Mode;
  logoUrl: string;
  text: string;
  sortOrder: number;
  isActive: boolean;
};

const EMPTY: FormData = {
  mode: "text",
  logoUrl: "",
  text: "",
  sortOrder: 0,
  isActive: true,
};

function ItemModal({
  initial,
  onClose,
  onSave,
  saving,
}: {
  initial: FormData;
  onClose: () => void;
  onSave: (data: FormData) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormData>(initial);
  const { uploadFile, uploading } = useImageUpload();

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleLogoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { publicUrl } = await uploadFile(file);
      set("logoUrl", publicUrl);
      toast.success("Logo yüklendi");
    } catch {
      toast.error("Logo yüklenemedi");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.mode === "logo" && !form.logoUrl) {
      toast.error("Lütfen bir logo yükleyin");
      return;
    }
    if (form.mode === "text" && !form.text.trim()) {
      toast.error("Lütfen bir metin girin");
      return;
    }
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">
            {initial.text || initial.logoUrl ? "Öğeyi Düzenle" : "Yeni Öğe Ekle"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="label">İçerik Türü</label>
            <div className="mt-1.5 flex gap-2">
              <button
                type="button"
                onClick={() => set("mode", "text")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition ${
                  form.mode === "text"
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Type className="h-4 w-4" />
                Metin
              </button>
              <button
                type="button"
                onClick={() => set("mode", "logo")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition ${
                  form.mode === "logo"
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                Logo
              </button>
            </div>
          </div>

          {form.mode === "text" ? (
            <div>
              <label className="label">Metin *</label>
              <input
                className="input mt-1.5"
                value={form.text}
                onChange={(e) => set("text", e.target.value)}
                placeholder="örn. İzmir Şehir Hastanesi"
                required
              />
            </div>
          ) : (
            <div>
              <label className="label">Logo Görseli *</label>
              <p className="mb-2 text-[11px] text-slate-500">
                Önerilen boyut: <strong>200 × 64 px</strong>, şeffaf arka plan (WebP veya PNG)
              </p>
              {form.logoUrl ? (
                <div className="relative flex h-20 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <img src={form.logoUrl} alt="Logo önizleme" className="max-h-14 max-w-[160px] object-contain" />
                  <button
                    type="button"
                    onClick={() => set("logoUrl", "")}
                    className="absolute top-2 right-2 rounded-full bg-white p-0.5 text-slate-400 shadow hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition hover:border-blue-300 hover:text-blue-500">
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-xs font-medium">{uploading ? "Yükleniyor…" : "Logo seç veya sürükle"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoPick} disabled={uploading} />
                </label>
              )}
            </div>
          )}

          <div>
            <label className="label">Sıra</label>
            <input
              type="number"
              className="input mt-1.5"
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set("isActive", !form.isActive)}
              className={`transition ${form.isActive ? "text-blue-600" : "text-slate-300"}`}
            >
              {form.isActive ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
            </button>
            <span className="text-sm font-medium text-slate-700">
              {form.isActive ? "Aktif" : "Pasif"}
            </span>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              İptal
            </button>
            <button type="submit" disabled={saving || uploading} className="btn-primary">
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MarqueePage() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useListMarqueeItems();
  const createMutation = useCreateMarqueeItem();
  const updateMutation = useUpdateMarqueeItem();
  const deleteMutation = useDeleteMarqueeItem();

  const [modal, setModal] = useState<{ open: boolean; item: MarqueeItem | null }>({
    open: false,
    item: null,
  });

  function openNew() {
    setModal({ open: true, item: null });
  }

  function openEdit(item: MarqueeItem) {
    setModal({ open: true, item });
  }

  function closeModal() {
    setModal({ open: false, item: null });
  }

  function invalidate() {
    qc.invalidateQueries({ queryKey: getListMarqueeItemsQueryKey() });
  }

  async function handleSave(form: FormData) {
    const payload = {
      logoUrl: form.mode === "logo" ? form.logoUrl : null,
      text: form.mode === "text" ? form.text : null,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    };

    try {
      if (modal.item) {
        await updateMutation.mutateAsync({ id: modal.item.id, data: payload });
        toast.success("Öğe güncellendi");
      } else {
        await createMutation.mutateAsync({ data: payload });
        toast.success("Öğe eklendi");
      }
      invalidate();
      closeModal();
    } catch {
      toast.error("İşlem başarısız oldu");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Öğe silindi");
      invalidate();
    } catch {
      toast.error("Silinemedi");
    }
  }

  async function handleToggle(item: MarqueeItem) {
    try {
      await updateMutation.mutateAsync({ id: item.id, data: { isActive: !item.isActive } });
      invalidate();
    } catch {
      toast.error("Güncellenemedi");
    }
  }

  const editInitial = (item: MarqueeItem): FormData => ({
    mode: item.logoUrl ? "logo" : "text",
    logoUrl: item.logoUrl ?? "",
    text: item.text ?? "",
    sortOrder: item.sortOrder,
    isActive: item.isActive,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Marquee Yönetimi</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Ana sayfadaki kayan şerit — logo veya metin öğeleri ekleyin.
          </p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni Öğe
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3.5 text-xs font-extrabold uppercase tracking-widest text-slate-500">
          Öğeler ({items.length})
        </div>

        {isLoading ? (
          <div className="space-y-px p-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <ImageIcon className="h-10 w-10" />
            <p className="text-sm font-medium">Henüz öğe yok</p>
            <button onClick={openNew} className="btn-primary text-xs">
              İlk öğeyi ekle
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />

                <div className="flex h-12 w-[120px] shrink-0 items-center justify-center rounded border border-slate-100 bg-slate-50">
                  {item.logoUrl ? (
                    <img src={item.logoUrl} alt="" className="max-h-10 max-w-[108px] object-contain" />
                  ) : (
                    <span className="px-2 text-center text-[11px] font-bold leading-tight text-oxynavy-800">
                      {item.text}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {item.logoUrl ? "Logo" : item.text}
                  </p>
                  <p className="text-[11px] text-slate-400">Sıra: {item.sortOrder}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => handleToggle(item)}
                    className={`transition ${item.isActive ? "text-blue-600" : "text-slate-300"}`}
                    title={item.isActive ? "Pasife al" : "Aktife al"}
                  >
                    {item.isActive ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-400 transition hover:border-red-300 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
        <strong>Logo önerilen boyut:</strong> 200 × 64 px, şeffaf arka plan (WebP veya PNG).
        Logo varsa metin gösterilmez; yalnızca logo gösterilir.
      </div>

      {modal.open && (
        <ItemModal
          initial={modal.item ? editInitial(modal.item) : EMPTY}
          onClose={closeModal}
          onSave={handleSave}
          saving={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
