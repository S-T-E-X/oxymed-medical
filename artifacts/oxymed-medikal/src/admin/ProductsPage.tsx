import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListProductCategoriesQueryKey,
  getListProductsQueryKey,
  useCreateProductCategory,
  useDeleteProduct,
  useDeleteProductCategory,
  useListProductCategories,
  useListProducts,
  useUpdateProductCategory,
  type ProductCategory,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { Edit2, ImageIcon, Plus, Settings, Trash2, X } from "lucide-react";

export default function ProductsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: categories = [] } = useListProductCategories();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const { data: productsData, isLoading } = useListProducts({ categoryId: selectedCategory, limit: 50 });
  const products = productsData?.items ?? [];

  const [catName, setCatName] = useState("");
  const [editCat, setEditCat] = useState<{ id: number; name: string } | null>(null);

  const invalidateProd = () => qc.invalidateQueries({ queryKey: getListProductsQueryKey() });
  const invalidateCat = () => qc.invalidateQueries({ queryKey: getListProductCategoriesQueryKey() });

  const deleteMut = useDeleteProduct({ mutation: { onSuccess: () => { toast.success("Ürün silindi"); invalidateProd(); }, onError: () => toast.error("Silme başarısız") } });
  const createCatMut = useCreateProductCategory({ mutation: { onSuccess: () => { toast.success("Kategori oluşturuldu"); invalidateCat(); setCatName(""); }, onError: () => toast.error("Kategori eklenemedi") } });
  const deleteCatMut = useDeleteProductCategory({ mutation: { onSuccess: () => { toast.success("Kategori silindi"); invalidateCat(); }, onError: () => toast.error("Silme başarısız") } });
  const updateCatMut = useUpdateProductCategory({ mutation: { onSuccess: () => { toast.success("Kategori güncellendi"); invalidateCat(); setEditCat(null); }, onError: () => toast.error("Güncelleme başarısız") } });

  function handleSaveCat() {
    if (!editCat || !editCat.name.trim()) return;
    const slug = editCat.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    updateCatMut.mutate({ id: editCat.id, data: { name: editCat.name.trim(), slug } });
  }

  function handleDelete(id: number) {
    if (confirm("Bu ürünü silmek istediğinizden emin misiniz?")) deleteMut.mutate({ id });
  }

  function handleDeleteCat(id: number) {
    if (confirm("Kategoriyi silmek istediğinizden emin misiniz?")) deleteCatMut.mutate({ id });
  }

  function addCat() {
    if (!catName.trim()) return;
    const slug = catName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    createCatMut.mutate({ data: { name: catName.trim(), slug } });
  }

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Ürün Yönetimi</h1>
          <p className="mt-1 text-sm text-slate-500">Ürün kategorileri ve ürün listesi</p>
        </div>
        <button onClick={() => navigate("/admin/products/new")} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Yeni Ürün
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-slate-900">Kategoriler</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((c: ProductCategory) =>
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
          )}
          <div className="flex gap-1">
            <input
              className="input h-8 w-36 text-sm"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="Yeni kategori"
              onKeyDown={(e) => e.key === "Enter" && addCat()}
            />
            <button onClick={addCat} className="btn-primary h-8 px-3 text-sm">Ekle</button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-semibold text-slate-600">Kategoriye göre filtrele:</label>
        <select className="input h-9 w-48 text-sm" value={selectedCategory ?? ""} onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}>
          <option value="">Tümü</option>
          {categories.map((c: ProductCategory) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 w-52">Ürün</th>
                <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 sm:table-cell">Kategori</th>
                <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 md:table-cell">Slug</th>
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
                        <img src={p.imageUrl} alt={p.title} className="h-[180px] w-[180px] shrink-0 rounded-lg object-contain bg-slate-50" />
                      ) : (
                        <div className="flex h-[180px] w-[180px] shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <ImageIcon className="h-8 w-8 text-slate-300" />
                        </div>
                      )}
                      <p className="font-semibold text-slate-900">{p.title}</p>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-slate-500 sm:table-cell">
                    {categories.find((c: ProductCategory) => c.id === p.categoryId)?.name ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {p.pageSlug ? (
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">{p.pageSlug}</span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${p.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {p.published ? "Yayında" : "Taslak"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => navigate(`/admin/products/${p.id}`)}
                        className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        <Settings className="h-3.5 w-3.5" />
                        Ayarlar
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
    </section>
  );
}
