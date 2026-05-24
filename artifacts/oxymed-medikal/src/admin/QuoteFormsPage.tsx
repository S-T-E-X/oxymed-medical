import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilePlus, Pencil, Trash2, Eye, Loader2 } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type QuoteForm = {
  id: number;
  quoteNo: string;
  firmaAdi?: string | null;
  paraBirimi: string;
  createdAt: string;
};

function useQuoteForms() {
  const { token } = useAuth();
  return useQuery<{ items: QuoteForm[] }>({
    queryKey: ["quote-forms"],
    queryFn: async () => {
      const r = await fetch("/api/quote-forms", {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!r.ok) throw new Error("Yüklenemedi");
      return r.json();
    },
  });
}

function useCreateQuoteForm() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/quote-forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({}),
      });
      if (!r.ok) throw new Error("Oluşturulamadı");
      return r.json() as Promise<QuoteForm>;
    },
    onSuccess: (form) => {
      qc.invalidateQueries({ queryKey: ["quote-forms"] });
      toast.success("Teklif formu oluşturuldu");
      navigate(`/admin/teklif-formlari/${form.id}`);
    },
    onError: () => toast.error("Teklif formu oluşturulamadı"),
  });
}

function useDeleteQuoteForm() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/quote-forms/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!r.ok) throw new Error("Silinemedi");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quote-forms"] });
      toast.success("Teklif formu silindi");
    },
    onError: () => toast.error("Silinemedi"),
  });
}

export default function QuoteFormsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuoteForms();
  const createMut = useCreateQuoteForm();
  const deleteMut = useDeleteQuoteForm();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const forms = data?.items ?? [];

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Teklif Formları</h1>
          <p className="mt-1 text-sm text-slate-500">PDF çıktısı alınabilir teklif formlarını yönetin</p>
        </div>
        <button
          onClick={() => createMut.mutate()}
          disabled={createMut.isPending}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-blue-700 disabled:opacity-60"
        >
          {createMut.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FilePlus className="h-4 w-4" />
          )}
          Yeni Teklif Formu
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-20 text-center">
          <FilePlus className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="font-semibold text-slate-400">Henüz teklif formu yok</p>
          <p className="mt-1 text-sm text-slate-400">Yeni oluştur düğmesine tıklayın</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">Teklif No</th>
                <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 md:table-cell">Firma</th>
                <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 sm:table-cell">Para Birimi</th>
                <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 lg:table-cell">Tarih</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forms.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{f.quoteNo}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-slate-600 md:table-cell">
                    {f.firmaAdi ?? <span className="italic text-slate-300">—</span>}
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-slate-600 sm:table-cell">{f.paraBirimi}</td>
                  <td className="hidden px-4 py-3 text-sm text-slate-500 lg:table-cell">
                    {new Date(f.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`/teklif-goruntule/${f.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                        title="PDF Önizleme"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => navigate(`/admin/teklif-formlari/${f.id}`)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                        title="Düzenle"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(f.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50"
                        title="Sil"
                      >
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

      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900">Teklif formu silinsin mi?</h2>
            <p className="mt-1 text-sm text-slate-500">Bu işlem geri alınamaz.</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  deleteMut.mutate(confirmDelete);
                  setConfirmDelete(null);
                }}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                Evet, Sil
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
