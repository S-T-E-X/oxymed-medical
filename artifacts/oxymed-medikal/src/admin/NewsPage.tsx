import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListNewsQueryKey,
  useCreateNews,
  useDeleteNews,
  useListNews,
  useUpdateNews,
  type NewsItem,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { Edit2, ImageIcon, Plus, Trash2, X } from "lucide-react";
import { useImageUpload } from "./useImageUpload";

type NewsForm = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  slug: string;
  published: boolean;
  publishedAt: string;
};

const EMPTY: NewsForm = {
  title: "",
  excerpt: "",
  content: "",
  category: "Genel",
  imageUrl: "",
  slug: "",
  published: true,
  publishedAt: new Date().toISOString().split("T")[0],
};

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9ğüşıöç-]/g, "").replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c");
}

function NewsModal({
  initial,
  onClose,
  onSave,
  saving,
}: {
  initial: NewsForm;
  onClose: () => void;
  onSave: (data: NewsForm) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<NewsForm>(initial);
  const { uploadFile, uploading } = useImageUpload();

  function set<K extends keyof NewsForm>(field: K, value: NewsForm[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleTitleChange(title: string) {
    setForm((f) => ({ ...f, title, slug: f.slug || slugify(title) }));
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

  const categories = ["Genel", "Sektör Haberleri", "Ürün Haberleri", "Duyuru", "Blog"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">{initial.title ? "Haber Düzenle" : "Yeni Haber"}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="label">Başlık *</label>
            <input className="input" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Haber başlığı" />
          </div>
          <div>
            <label className="label">Slug (URL)</label>
            <input className="input font-mono text-sm" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="haber-url-slug" />
          </div>
          <div>
            <label className="label">Özet</label>
            <textarea className="input min-h-[80px] resize-y" value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="Kısa özet" />
          </div>
          <div>
            <label className="label">İçerik</label>
            <textarea className="input min-h-[200px] resize-y" value={form.content} onChange={(e) => set("content", e.target.value)} placeholder="Haber içeriği" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Kategori</label>
              <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Yayın Tarihi</label>
              <input type="date" className="input" value={form.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Kapak Görseli</label>
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
          <div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 rounded" />
              Yayınla
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="btn-secondary">İptal</button>
          <button onClick={() => onSave(form)} disabled={saving || !form.title || !form.slug} className="btn-primary">
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewsPage() {
  const qc = useQueryClient();
  const { data: newsData, isLoading } = useListNews({ limit: 50 });
  const news = newsData?.items ?? [];
  const [modal, setModal] = useState<{ open: boolean; item: NewsItem | null }>({ open: false, item: null });

  const invalidate = () => qc.invalidateQueries({ queryKey: getListNewsQueryKey() });
  const createMut = useCreateNews({ mutation: { onSuccess: () => { toast.success("Haber oluşturuldu"); invalidate(); setModal({ open: false, item: null }); }, onError: () => toast.error("Kayıt başarısız") } });
  const updateMut = useUpdateNews({ mutation: { onSuccess: () => { toast.success("Haber güncellendi"); invalidate(); setModal({ open: false, item: null }); }, onError: () => toast.error("Güncelleme başarısız") } });
  const deleteMut = useDeleteNews({ mutation: { onSuccess: () => { toast.success("Haber silindi"); invalidate(); }, onError: () => toast.error("Silme başarısız") } });

  function handleSave(data: NewsForm) {
    const payload = {
      title: data.title,
      excerpt: data.excerpt || undefined,
      content: data.content || undefined,
      category: data.category,
      imageUrl: data.imageUrl || undefined,
      slug: data.slug,
      published: data.published,
      publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : undefined,
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

  const saving = createMut.isPending || updateMut.isPending;

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
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {news.map((n) => (
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
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setModal({ open: true, item: n })} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(n.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <NewsModal
          initial={modal.item ? {
            title: modal.item.title,
            excerpt: modal.item.excerpt ?? "",
            content: modal.item.content ?? "",
            category: modal.item.category,
            imageUrl: modal.item.imageUrl ?? "",
            slug: modal.item.slug,
            published: modal.item.published,
            publishedAt: modal.item.publishedAt?.split("T")[0] ?? new Date().toISOString().split("T")[0],
          } : EMPTY}
          onClose={() => setModal({ open: false, item: null })}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </section>
  );
}
