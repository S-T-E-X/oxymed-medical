import { useRef, useState } from "react";
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
import { Edit2, EyeOff, ImageIcon, Plus, Settings, Trash2, Upload, X } from "lucide-react";
import { useImageUpload } from "./useImageUpload";

const LOCALE_LABELS: { code: string; label: string; nameField: string; descField: string }[] = [
  { code: "en", label: "English", nameField: "nameEn", descField: "descriptionEn" },
  { code: "de", label: "Deutsch", nameField: "nameDe", descField: "descriptionDe" },
  { code: "fr", label: "Français", nameField: "nameFr", descField: "descriptionFr" },
  { code: "it", label: "Italiano", nameField: "nameIt", descField: "descriptionIt" },
  { code: "ar", label: "العربية", nameField: "nameAr", descField: "descriptionAr" },
  { code: "ru", label: "Русский", nameField: "nameRu", descField: "descriptionRu" },
  { code: "fa", label: "فارسی", nameField: "nameFa", descField: "descriptionFa" },
  { code: "ka", label: "ქართული", nameField: "nameKa", descField: "descriptionKa" },
  { code: "bg", label: "Български", nameField: "nameBg", descField: "descriptionBg" },
  { code: "az", label: "Azərbaycan", nameField: "nameAz", descField: "descriptionAz" },
];

type CategoryFields = Record<string, string | number | boolean | null>;

/** Empty strings must clear a column, not store "" — hence the null. */
function trimmedOrNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function slugify(value: string): string {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i" };
  return value
    .toLowerCase()
    .replace(/[çğıöşüİ]/g, (ch) => map[ch] ?? ch)
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface CategoryEditModalProps {
  category: ProductCategory;
  onClose: () => void;
  onSave: (data: CategoryFields) => void;
  isPending: boolean;
}

function CategoryEditModal({ category, onClose, onSave, isPending }: CategoryEditModalProps) {
  const record = category as unknown as Record<string, string | number | boolean | null>;
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description ?? "");
  const [imageUrl, setImageUrl] = useState(category.imageUrl ?? "");
  const [sortOrder, setSortOrder] = useState<number>(category.sortOrder ?? 0);
  const [visible, setVisible] = useState(category.visible !== false);
  const [showOnHome, setShowOnHome] = useState(category.showOnHome !== false);
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const lc of LOCALE_LABELS) {
      init[lc.nameField] = (record[lc.nameField] as string | null) ?? "";
      init[lc.descField] = (record[lc.descField] as string | null) ?? "";
    }
    return init;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading } = useImageUpload();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadFile(file);
      setImageUrl(result.publicUrl);
      toast.success("Görsel yüklendi");
    } catch {
      toast.error("Görsel yüklenemedi");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleSave() {
    if (!name.trim()) return;
    // The slug is part of public URLs, so an existing one is never rewritten
    // just because the display name changed.
    const slug = category.slug || slugify(name);
    const localeData: CategoryFields = {};
    for (const lc of LOCALE_LABELS) {
      localeData[lc.nameField] = trimmedOrNull(fields[lc.nameField]);
      localeData[lc.descField] = trimmedOrNull(fields[lc.descField]);
    }
    onSave({
      name: name.trim(),
      slug,
      description: trimmedOrNull(description),
      imageUrl: trimmedOrNull(imageUrl),
      sortOrder,
      visible,
      showOnHome,
      ...localeData,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Kategori Düzenle</h3>
          <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Kategori Adı — Türkçe (zorunlu)</label>
              <input
                className="input w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kategori adı"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Sıra</label>
              <input
                type="number"
                className="input w-full"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
              <p className="mt-1 text-[11px] text-slate-400">Küçük sayı önce gösterilir.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Kart Açıklaması — Türkçe</label>
            <textarea
              className="input min-h-[70px] w-full resize-y text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ana sayfadaki kategori kartında görünen kısa açıklama"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Kart Görseli</label>
            {imageUrl && (
              <img
                src={imageUrl}
                alt={name}
                className="mb-2 h-32 w-full rounded-lg border border-slate-200 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div className="flex gap-2">
              <input
                className="input flex-1 text-sm"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Yükleniyor…" : "Yükle"}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Boş bırakılırsa varsayılan görsel kullanılır. Önerilen: 600 × 450 px</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
              Sitede görünsün
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={showOnHome} onChange={(e) => setShowOnHome(e.target.checked)} />
              Ana sayfada gösterilsin
            </label>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Diğer Diller (boş bırakılırsa Türkçe gösterilir)
            </p>
            {LOCALE_LABELS.map((lc) => (
              <div key={lc.code} className="rounded-lg bg-white p-2.5">
                <p className="mb-1.5 text-xs font-bold text-slate-600">{lc.label}</p>
                <input
                  className="input mb-1.5 w-full text-sm"
                  value={fields[lc.nameField] ?? ""}
                  onChange={(e) => setFields((prev) => ({ ...prev, [lc.nameField]: e.target.value }))}
                  placeholder={`${lc.label} kategori adı`}
                />
                <textarea
                  className="input min-h-[52px] w-full resize-y text-sm"
                  value={fields[lc.descField] ?? ""}
                  onChange={(e) => setFields((prev) => ({ ...prev, [lc.descField]: e.target.value }))}
                  placeholder={`${lc.label} kart açıklaması`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">İptal</button>
          <button onClick={handleSave} disabled={isPending || !name.trim()} className="btn-primary px-4 py-2 text-sm">
            {isPending ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: categories = [] } = useListProductCategories();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const { data: productsData, isLoading } = useListProducts({ categoryId: selectedCategory, limit: 50 });
  const products = productsData?.items ?? [];

  const [catName, setCatName] = useState("");
  const [editCat, setEditCat] = useState<ProductCategory | null>(null);

  const invalidateProd = () => qc.invalidateQueries({ queryKey: getListProductsQueryKey() });
  const invalidateCat = () => qc.invalidateQueries({ queryKey: getListProductCategoriesQueryKey() });

  const deleteMut = useDeleteProduct({ mutation: { onSuccess: () => { toast.success("Ürün silindi"); invalidateProd(); }, onError: () => toast.error("Silme başarısız") } });
  const createCatMut = useCreateProductCategory({ mutation: { onSuccess: () => { toast.success("Kategori oluşturuldu"); invalidateCat(); setCatName(""); }, onError: () => toast.error("Kategori eklenemedi") } });
  const deleteCatMut = useDeleteProductCategory({ mutation: { onSuccess: () => { toast.success("Kategori silindi"); invalidateCat(); }, onError: () => toast.error("Silme başarısız") } });
  const updateCatMut = useUpdateProductCategory({ mutation: { onSuccess: () => { toast.success("Kategori güncellendi"); invalidateCat(); setEditCat(null); }, onError: () => toast.error("Güncelleme başarısız") } });

  function handleSaveCat(data: CategoryFields) {
    if (!editCat) return;
    updateCatMut.mutate({ id: editCat.id, data });
  }

  function handleDelete(id: number) {
    if (confirm("Bu ürünü silmek istediğinizden emin misiniz?")) deleteMut.mutate({ id });
  }

  function handleDeleteCat(id: number) {
    if (confirm("Kategoriyi silmek istediğinizden emin misiniz?")) deleteCatMut.mutate({ id });
  }

  function addCat() {
    if (!catName.trim()) return;
    const slug = slugify(catName);
    if (!slug) {
      toast.error("Kategori adından geçerli bir adres oluşturulamadı");
      return;
    }
    // New categories land at the end rather than colliding on sortOrder 0,
    // which would otherwise reshuffle the existing card order.
    const nextSort = categories.reduce((max, c) => Math.max(max, c.sortOrder ?? 0), 0) + 1;
    createCatMut.mutate({ data: { name: catName.trim(), slug, sortOrder: nextSort } });
  }

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      {editCat && (
        <CategoryEditModal
          category={editCat}
          onClose={() => setEditCat(null)}
          onSave={handleSaveCat}
          isPending={updateCatMut.isPending}
        />
      )}

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
        <h2 className="mb-1 text-sm font-bold text-slate-900">Kategoriler</h2>
        <p className="mb-4 text-xs text-slate-500">
          Sıralama, görsel, açıklama ve çevirileri düzenlemek için kalem simgesine tıklayın. Kategoriler sıra numarasına göre listelenir.
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c: ProductCategory) => (
            <div
              key={c.id}
              className={`flex items-center gap-1 rounded-full border py-1 pl-3 pr-1.5 text-sm font-semibold ${
                c.visible === false
                  ? "border-slate-200 bg-slate-100 text-slate-400"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              <span className="mr-0.5 font-mono text-[10px] text-slate-400">{c.sortOrder ?? 0}</span>
              {c.name}
              {c.visible === false && <EyeOff className="h-3 w-3 text-slate-400" aria-label="Sitede gizli" />}
              <button onClick={() => setEditCat(c)} className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-blue-100 hover:text-blue-500" title="Sıra, görsel, açıklama ve çevirileri düzenle">
                <Edit2 className="h-2.5 w-2.5" />
              </button>
              <button onClick={() => handleDeleteCat(c.id)} className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
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
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                    {selectedCategory ? "Bu kategoride ürün yok." : "Henüz ürün eklenmemiş."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
