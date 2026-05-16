import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListProductCategoriesQueryKey,
  getListProductsQueryKey,
  useCreateProduct,
  useCreateProductCategory,
  useDeleteProduct,
  useDeleteProductCategory,
  useListProductCategories,
  useListProducts,
  useUpdateProduct,
  useUpdateProductCategory,
  type Product,
  type ProductCategory,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { ChevronDown, Edit2, ImageIcon, Plus, Trash2, X } from "lucide-react";
import { useImageUpload } from "./useImageUpload";

type SpecRow = { label: string; value: string };

type ProductForm = {
  title: string;
  description: string;
  imageUrl: string;
  categoryId: number | null;
  sortOrder: number;
  published: boolean;
  specs: SpecRow[];
};

const EMPTY_PRODUCT: ProductForm = {
  title: "",
  description: "",
  imageUrl: "",
  categoryId: null,
  sortOrder: 0,
  published: true,
  specs: [],
};

function ProductModal({
  initial,
  categories,
  onClose,
  onSave,
  saving,
}: {
  initial: ProductForm;
  categories: ProductCategory[];
  onClose: () => void;
  onSave: (data: ProductForm) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<ProductForm>(initial);
  const { uploadFile, uploading } = useImageUpload();

  function set<K extends keyof ProductForm>(field: K, value: ProductForm[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addSpec() { setForm((f) => ({ ...f, specs: [...f.specs, { label: "", value: "" }] })); }
  function removeSpec(i: number) { setForm((f) => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) })); }
  function updateSpec(i: number, field: "label" | "value", val: string) {
    setForm((f) => ({ ...f, specs: f.specs.map((s, idx) => idx === i ? { ...s, [field]: val } : s) }));
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
          <h2 className="text-base font-bold text-slate-900">{initial.title ? "Ürün Düzenle" : "Yeni Ürün"}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="label">Ürün Adı *</label>
            <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ürün adı" />
          </div>
          <div>
            <label className="label">Kategori</label>
            <select className="input" value={form.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value ? Number(e.target.value) : null)}>
              <option value="">Kategori seçin</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Açıklama</label>
            <textarea className="input min-h-[100px] resize-y" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Ürün açıklaması" />
          </div>
          <div>
            <label className="label">Görsel URL</label>
            <div className="flex gap-2">
              <input className="input flex-1" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://..." />
              <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                <ImageIcon className="h-4 w-4" />
                {uploading ? "…" : "Yükle"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
              </label>
            </div>
            {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-2 h-20 w-full rounded object-cover" />}
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="label mb-0">Teknik Özellikler</label>
              <button onClick={addSpec} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"><Plus className="h-3 w-3" />Ekle</button>
            </div>
            {form.specs.map((s, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input className="input flex-1" value={s.label} onChange={(e) => updateSpec(i, "label", e.target.value)} placeholder="Özellik adı" />
                <input className="input flex-1" value={s.value} onChange={(e) => updateSpec(i, "value", e.target.value)} placeholder="Değer" />
                <button onClick={() => removeSpec(i)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50"><X className="h-4 w-4" /></button>
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

export default function ProductsPage() {
  const qc = useQueryClient();
  const { data: categories = [] } = useListProductCategories();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const { data: productsData, isLoading } = useListProducts({ categoryId: selectedCategory, limit: 50 });
  const products = productsData?.items ?? [];

  const [modal, setModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [catName, setCatName] = useState("");
  const [editCat, setEditCat] = useState<{ id: number; name: string } | null>(null);

  const invalidateProd = () => qc.invalidateQueries({ queryKey: getListProductsQueryKey() });
  const invalidateCat = () => qc.invalidateQueries({ queryKey: getListProductCategoriesQueryKey() });

  const createMut = useCreateProduct({ mutation: { onSuccess: () => { toast.success("Ürün oluşturuldu"); invalidateProd(); setModal({ open: false, product: null }); }, onError: () => toast.error("Kayıt başarısız") } });
  const updateMut = useUpdateProduct({ mutation: { onSuccess: () => { toast.success("Ürün güncellendi"); invalidateProd(); setModal({ open: false, product: null }); }, onError: () => toast.error("Güncelleme başarısız") } });
  const deleteMut = useDeleteProduct({ mutation: { onSuccess: () => { toast.success("Ürün silindi"); invalidateProd(); }, onError: () => toast.error("Silme başarısız") } });
  const createCatMut = useCreateProductCategory({ mutation: { onSuccess: () => { toast.success("Kategori oluşturuldu"); invalidateCat(); setCatName(""); }, onError: () => toast.error("Kategori eklenemedi") } });
  const deleteCatMut = useDeleteProductCategory({ mutation: { onSuccess: () => { toast.success("Kategori silindi"); invalidateCat(); }, onError: () => toast.error("Silme başarısız") } });
  const updateCatMut = useUpdateProductCategory({ mutation: { onSuccess: () => { toast.success("Kategori güncellendi"); invalidateCat(); setEditCat(null); }, onError: () => toast.error("Güncelleme başarısız") } });

  function handleSaveCat() {
    if (!editCat || !editCat.name.trim()) return;
    const slug = editCat.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    updateCatMut.mutate({ id: editCat.id, data: { name: editCat.name.trim(), slug } });
  }

  function handleSave(data: ProductForm) {
    const payload = {
      title: data.title,
      description: data.description || undefined,
      imageUrl: data.imageUrl || undefined,
      categoryId: data.categoryId ?? undefined,
      sortOrder: data.sortOrder,
      published: data.published,
      specs: data.specs.filter((s) => s.label && s.value),
    };
    if (modal.product) {
      updateMut.mutate({ id: modal.product.id, data: payload });
    } else {
      createMut.mutate({ data: payload });
    }
  }

  function handleDelete(id: number) {
    if (confirm("Bu ürünü silmek istediğinizden emin misiniz?")) deleteMut.mutate({ id });
  }

  function handleDeleteCat(id: number) {
    if (confirm("Kategoriyi silmek istediğinizden emin misiniz?")) deleteCatMut.mutate({ id });
  }

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Ürün Yönetimi</h1>
          <p className="mt-1 text-sm text-slate-500">Ürün kategorileri ve ürün listesi</p>
        </div>
        <button onClick={() => setModal({ open: true, product: null })} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Yeni Ürün
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-slate-900">Kategoriler</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            editCat?.id === c.id ? (
              <div key={c.id} className="flex items-center gap-1">
                <input
                  className="input h-8 w-40 text-sm"
                  value={editCat.name}
                  onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveCat(); if (e.key === "Escape") setEditCat(null); }}
                  autoFocus
                />
                <button onClick={handleSaveCat} disabled={updateCatMut.isPending} className="btn-primary h-8 px-2.5 text-xs">
                  {updateCatMut.isPending ? "…" : "Kaydet"}
                </button>
                <button onClick={() => setEditCat(null)} className="btn-secondary h-8 px-2.5 text-xs">İptal</button>
              </div>
            ) : (
              <div key={c.id} className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 pl-3 pr-1.5 py-1 text-sm font-semibold text-slate-700">
                {c.name}
                <button onClick={() => setEditCat({ id: c.id, name: c.name })} className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-blue-100 hover:text-blue-500">
                  <Edit2 className="h-2.5 w-2.5" />
                </button>
                <button onClick={() => handleDeleteCat(c.id)} className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )
          ))}
          <div className="flex gap-1">
            <input className="input h-8 w-36 text-sm" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Yeni kategori" onKeyDown={(e) => e.key === "Enter" && catName && createCatMut.mutate({ data: { name: catName, slug: catName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") } })} />
            <button onClick={() => catName && createCatMut.mutate({ data: { name: catName, slug: catName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") } })} className="btn-primary h-8 px-3 text-sm">Ekle</button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-semibold text-slate-600">Kategoriye göre filtrele:</label>
        <select className="input h-9 w-48 text-sm" value={selectedCategory ?? ""} onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}>
          <option value="">Tümü</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />)}</div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <p className="text-slate-400">Bu kategoride ürün yok</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">Ürün</th>
                <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 sm:table-cell">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">Durum</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.title} className="h-9 w-12 rounded object-cover" />
                      ) : (
                        <div className="flex h-9 w-12 items-center justify-center rounded bg-slate-100">
                          <ImageIcon className="h-4 w-4 text-slate-300" />
                        </div>
                      )}
                      <p className="font-semibold text-slate-900">{p.title}</p>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-slate-500 sm:table-cell">
                    {categories.find((c) => c.id === p.categoryId)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${p.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {p.published ? "Yayında" : "Taslak"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setModal({ open: true, product: p })} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50">
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
        <ProductModal
          initial={modal.product ? {
            title: modal.product.title,
            description: modal.product.description ?? "",
            imageUrl: modal.product.imageUrl ?? "",
            categoryId: modal.product.categoryId ?? null,
            sortOrder: modal.product.sortOrder,
            published: modal.product.published,
            specs: (modal.product.specs ?? []) as SpecRow[],
          } : EMPTY_PRODUCT}
          categories={categories}
          onClose={() => setModal({ open: false, product: null })}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </section>
  );
}
