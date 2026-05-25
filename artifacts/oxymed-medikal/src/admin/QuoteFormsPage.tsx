import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FilePlus, Pencil, Trash2, Eye, Loader2 } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type QuoteForm = {
  id: number;
  quoteNo: string;
  status: string;
  firmaAdi?: string | null;
  paraBirimi: string;
  createdAt: string;
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Taslak", cls: "bg-slate-100 text-slate-600 ring-slate-200", rowBg: "", borderLeft: "border-l-slate-300" },
  { value: "sent", label: "Gönderildi", cls: "bg-amber-50 text-amber-700 ring-amber-200", rowBg: "bg-amber-100", borderLeft: "border-l-amber-400" },
  { value: "approved", label: "Onaylandı", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", rowBg: "bg-emerald-100", borderLeft: "border-l-emerald-500" },
  { value: "rejected", label: "Reddedildi", cls: "bg-red-50 text-red-600 ring-red-200", rowBg: "bg-red-100", borderLeft: "border-l-red-500" },
];

function statusLabel(s: string) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s;
}
function statusClass(s: string) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.cls ?? "bg-slate-100 text-slate-500 ring-slate-200";
}
function statusRowBg(s: string) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.rowBg ?? "";
}
function statusBorderLeft(s: string) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.borderLeft ?? "border-l-slate-200";
}

function useQuoteForms() {
  const { authFetch } = useAuth();
  return useQuery<{ items: QuoteForm[] }>({
    queryKey: ["quote-forms"],
    queryFn: async () => {
      const r = await authFetch("/api/quote-forms");
      if (!r.ok) throw new Error("Yüklenemedi");
      return r.json();
    },
  });
}

function useCreateQuoteForm() {
  const { authFetch } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => {
      const r = await authFetch("/api/quote-forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

function useUpdateQuoteFormStatus() {
  const { authFetch } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const r = await authFetch(`/api/quote-forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) throw new Error("Güncellenemedi");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quote-forms"] });
      toast.success("Durum güncellendi");
    },
    onError: () => toast.error("Güncelleme başarısız"),
  });
}

function useDeleteQuoteForm() {
  const { authFetch } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await authFetch(`/api/quote-forms/${id}`, { method: "DELETE" });
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
  const updateStatusMut = useUpdateQuoteFormStatus();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [search, setSearch] = useState("");

  const forms = useMemo(() => {
    const all = data?.items ?? [];
    const byStatus = statusFilter ? all.filter((f) => f.status === statusFilter) : all;
    if (!search.trim()) return byStatus;
    const q = search.trim().toLowerCase();
    return byStatus.filter(
      (f) =>
        f.quoteNo.toLowerCase().includes(q) ||
        (f.firmaAdi ?? "").toLowerCase().includes(q) ||
        new Date(f.createdAt).toLocaleDateString("tr-TR").includes(q)
    );
  }, [data, statusFilter, search]);

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
          {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus className="h-4 w-4" />}
          Yeni Teklif Formu
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <input
          type="text"
          placeholder="Teklif no, firma veya tarih ara…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input h-9 min-w-0 flex-1 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter(undefined)}
            className={`rounded-full px-3 py-1 text-[11px] font-bold ring-1 transition ${!statusFilter ? "bg-slate-700 text-white ring-slate-700" : "bg-slate-100 text-slate-500 ring-slate-200 hover:opacity-80"}`}
          >
            Tümü
          </button>
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setStatusFilter(statusFilter === o.value ? undefined : o.value)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold ring-1 transition ${o.cls} ${statusFilter === o.value ? "ring-2 opacity-100" : "opacity-70 hover:opacity-100"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
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
          <p className="font-semibold text-slate-400">
            {statusFilter || search ? "Bu filtreye uyan teklif formu yok" : "Henüz teklif formu yok"}
          </p>
          {!statusFilter && !search && (
            <p className="mt-1 text-sm text-slate-400">Yeni oluştur düğmesine tıklayın</p>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">Teklif No</th>
                <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 md:table-cell">Firma</th>
                <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 sm:table-cell">Para Birimi</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">Durum</th>
                <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 lg:table-cell">Tarih</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forms.map((f) => (
                <tr key={f.id} className={`transition ${statusRowBg(f.status)} hover:brightness-90`}>
                  <td className={`border-l-4 ${statusBorderLeft(f.status)} px-4 py-3`}>
                    <p className="font-bold text-slate-900">{f.quoteNo}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-slate-600 md:table-cell">
                    {f.firmaAdi ?? <span className="italic text-slate-300">—</span>}
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-slate-600 sm:table-cell">{f.paraBirimi}</td>
                  <td className="px-4 py-3">
                    <select
                      value={f.status}
                      disabled={updateStatusMut.isPending}
                      onChange={(e) => updateStatusMut.mutate({ id: f.id, status: e.target.value })}
                      className={`cursor-pointer rounded-full border-0 py-0.5 pl-2.5 pr-6 text-[11px] font-bold ring-1 outline-none focus:ring-2 ${statusClass(f.status)}`}
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-slate-500 lg:table-cell">
                    {new Date(f.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`/teklif-goruntule/${f.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                        title="PDF Önizleme"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => navigate(`/admin/teklif-formlari/${f.id}`)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
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
                onClick={() => { deleteMut.mutate(confirmDelete); setConfirmDelete(null); }}
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
