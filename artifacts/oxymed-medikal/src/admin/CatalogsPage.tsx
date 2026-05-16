import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListCatalogsQueryKey,
  useCreateCatalog,
  useDeleteCatalog,
  useListCatalogs,
  useUpdateCatalog,
  type Catalog,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { BookOpen, Edit2, Plus, Trash2, X } from "lucide-react";

const LANGUAGES = ["TR", "EN", "DE", "FR", "AR"];

type CatalogFormData = {
  title: string;
  language: string;
  category: string;
  pdfUrl: string;
  sortOrder: number;
  isActive: boolean;
};

const EMPTY: CatalogFormData = {
  title: "",
  language: "TR",
  category: "",
  pdfUrl: "",
  sortOrder: 0,
  isActive: true,
};

function CatalogModal({
  initial,
  onClose,
  onSave,
  saving,
}: {
  initial: CatalogFormData;
  onClose: () => void;
  onSave: (data: CatalogFormData) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<CatalogFormData>(initial);

  function set(field: keyof CatalogFormData, value: string | boolean | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">
            {initial.title ? "Katalogu Düzenle" : "Yeni Katalog"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="label">Başlık *</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ürün Kataloğu 2024"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Dil *</label>
              <select className="input" value={form.language} onChange={(e) => set("language", e.target.value)}>
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Kategori</label>
              <input
                className="input"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="Yatak Başı Üniteleri"
              />
            </div>
          </div>
          <div>
            <label className="label">PDF Dosya URL *</label>
            <input
              className="input"
              value={form.pdfUrl}
              onChange={(e) => set("pdfUrl", e.target.value)}
              placeholder="https://... veya /assets/katalog.pdf"
            />
            {form.pdfUrl && (
              <a
                href={form.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs text-blue-600 underline"
              >
                Önizle →
              </a>
            )}
          </div>
          <div>
            <label className="label">Sıra</label>
            <input
              className="input"
              type="number"
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Aktif
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="btn-secondary">İptal</button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.title || !form.pdfUrl}
            className="btn-primary"
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

const LANG_LABELS: Record<string, string> = {
  TR: "Türkçe",
  EN: "İngilizce",
  DE: "Almanca",
  FR: "Fransızca",
  AR: "Arapça",
};

export default function CatalogsPage() {
  const qc = useQueryClient();
  const { data: catalogs = [], isLoading } = useListCatalogs();
  const [modal, setModal] = useState<{ open: boolean; catalog: Catalog | null }>({ open: false, catalog: null });

  const invalidate = () => qc.invalidateQueries({ queryKey: getListCatalogsQueryKey() });

  const createMut = useCreateCatalog({
    mutation: {
      onSuccess: () => { toast.success("Katalog oluşturuldu"); invalidate(); setModal({ open: false, catalog: null }); },
      onError: () => toast.error("Kayıt başarısız"),
    },
  });

  const updateMut = useUpdateCatalog({
    mutation: {
      onSuccess: () => { toast.success("Katalog güncellendi"); invalidate(); setModal({ open: false, catalog: null }); },
      onError: () => toast.error("Güncelleme başarısız"),
    },
  });

  const deleteMut = useDeleteCatalog({
    mutation: {
      onSuccess: () => { toast.success("Katalog silindi"); invalidate(); },
      onError: () => toast.error("Silme başarısız"),
    },
  });

  function handleSave(data: CatalogFormData) {
    const payload = {
      title: data.title,
      language: data.language,
      category: data.category || undefined,
      pdfUrl: data.pdfUrl,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    };
    if (modal.catalog) {
      updateMut.mutate({ id: modal.catalog.id, data: payload });
    } else {
      createMut.mutate({ data: payload });
    }
  }

  function handleDelete(id: number) {
    if (confirm("Bu katalogu silmek istediğinizden emin misiniz?")) {
      deleteMut.mutate({ id });
    }
  }

  function toggleActive(c: Catalog) {
    updateMut.mutate({ id: c.id, data: { isActive: !c.isActive } });
    invalidate();
  }

  const grouped = catalogs.reduce<Record<string, Catalog[]>>((acc, c) => {
    const key = c.language;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Katalog Yönetimi</h1>
          <p className="mt-1 text-sm text-slate-500">
            İndirilabilir ürün kataloglarını dile ve kategoriye göre yönetin
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, catalog: null })}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Yeni Katalog
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      ) : catalogs.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-slate-400">Henüz katalog yok</p>
          <button
            onClick={() => setModal({ open: true, catalog: null })}
            className="btn-primary mt-4"
          >
            İlk katalogu ekle
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([lang, items]) => (
            <div key={lang}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-slate-500">
                <span className="rounded bg-slate-100 px-2 py-0.5">{lang}</span>
                {LANG_LABELS[lang] && <span className="font-normal normal-case tracking-normal text-slate-400">— {LANG_LABELS[lang]}</span>}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.sort((a, b) => a.sortOrder - b.sortOrder).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-oxynavy-50 text-oxynavy-700">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">{c.title}</p>
                      {c.category && (
                        <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{c.category}</p>
                      )}
                      <a
                        href={c.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block truncate text-[11px] text-blue-500 hover:underline max-w-[180px]"
                      >
                        {c.pdfUrl}
                      </a>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                        {c.isActive ? "Aktif" : "Pasif"}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => toggleActive(c)}
                          className="rounded p-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100"
                          title={c.isActive ? "Deaktif Et" : "Aktif Et"}
                        >
                          {c.isActive ? "Kapat" : "Aç"}
                        </button>
                        <button
                          onClick={() => setModal({ open: true, catalog: c })}
                          className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="flex h-7 w-7 items-center justify-center rounded border border-red-100 text-red-400 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <CatalogModal
          initial={
            modal.catalog
              ? {
                  title: modal.catalog.title,
                  language: modal.catalog.language,
                  category: modal.catalog.category ?? "",
                  pdfUrl: modal.catalog.pdfUrl,
                  sortOrder: modal.catalog.sortOrder,
                  isActive: modal.catalog.isActive,
                }
              : EMPTY
          }
          onClose={() => setModal({ open: false, catalog: null })}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </section>
  );
}
