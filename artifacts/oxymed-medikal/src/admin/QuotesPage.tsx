import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListQuotesQueryKey,
  useGetQuote,
  useListQuotes,
  useUpdateQuoteStatus,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { Eye, X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "new", label: "Yeni", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { value: "in_progress", label: "İncelendi", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  { value: "resolved", label: "Teklif Hazır", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  { value: "archived", label: "Arşiv", cls: "bg-slate-100 text-slate-600 ring-slate-200" },
];

function statusLabel(s: string) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s;
}

function statusClass(s: string) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.cls ?? "bg-slate-100 text-slate-500";
}

function QuoteDetailModal({ id, onClose }: { id: number; onClose: () => void }) {
  const { data: quote, isLoading } = useGetQuote(id);
  const qc = useQueryClient();

  const updateMut = useUpdateQuoteStatus({
    mutation: {
      onSuccess: () => {
        toast.success("Durum güncellendi");
        qc.invalidateQueries({ queryKey: getListQuotesQueryKey() });
      },
      onError: () => toast.error("Güncelleme başarısız"),
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Teklif Talebi Detayı</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
        </div>

        {isLoading || !quote ? (
          <div className="p-8 text-center text-slate-400">Yükleniyor…</div>
        ) : (
          <div className="p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1">Mevcut Durum</p>
                <span className={`rounded-full px-3 py-1 text-[12px] font-bold ring-1 ${statusClass(quote.status)}`}>
                  {statusLabel(quote.status)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1">Durumu Güncelle</p>
                <div className="flex gap-1 flex-wrap justify-end">
                  {STATUS_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => updateMut.mutate({ id, data: { status: o.value } })}
                      disabled={o.value === quote.status || updateMut.isPending}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 transition ${o.cls} ${o.value === quote.status ? "opacity-40 cursor-default" : "hover:opacity-80 cursor-pointer"}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
              {STATUS_OPTIONS.map((o, i) => (
                <span key={o.value} className="flex items-center gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${o.cls} ${quote.status === o.value ? "ring-2" : "opacity-50"}`}>{o.label}</span>
                  {i < STATUS_OPTIONS.length - 1 && <span className="text-slate-300">→</span>}
                </span>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Ad Soyad" value={quote.fullName} />
              <Field label="E-posta" value={quote.email} />
              <Field label="Telefon" value={quote.phone} />
              <Field label="Şirket" value={quote.company} />
              <Field label="Unvan" value={quote.jobTitle} />
              <Field label="Şehir" value={quote.city} />
              <Field label="Proje Türü" value={quote.projectType} />
              <Field label="Uygulama Alanı" value={quote.applicationArea} />
            </div>
            {quote.notes && (
              <div className="mt-4">
                <p className="label">Notlar</p>
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}
            <p className="mt-4 text-[11px] text-slate-400">
              Gönderim: {new Date(quote.createdAt).toLocaleString("tr-TR")}
            </p>
          </div>
        )}

        <div className="border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="btn-secondary w-full">Kapat</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

export default function QuotesPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const { data: quotesData, isLoading } = useListQuotes({ status: statusFilter, limit: 50 });
  const quotes = quotesData?.items ?? [];
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const counts = {
    new: quotes.filter((q) => q.status === "new").length,
  };

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Teklif Talepleri</h1>
          <p className="mt-1 text-sm text-slate-500">Gelen teklif taleplerini görüntüleyin ve yönetin</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-600">Filtrele:</label>
          <select className="input h-9 w-44 text-sm" value={statusFilter ?? ""} onChange={(e) => setStatusFilter(e.target.value || undefined)}>
            <option value="">Tümü</option>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => setStatusFilter(statusFilter === o.value ? undefined : o.value)}
            className={`rounded-full px-3 py-1 text-[11px] font-bold ring-1 transition ${o.cls} ${statusFilter === o.value ? "ring-2" : "opacity-70 hover:opacity-100"}`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4,5].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />)}</div>
      ) : quotes.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <p className="text-slate-400">Bu filtrede teklif talebi yok</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">Ad Soyad</th>
                <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 md:table-cell">Şirket</th>
                <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 sm:table-cell">Telefon</th>
                <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 lg:table-cell">Tarih</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">Durum</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{q.fullName}</p>
                    <p className="text-xs text-slate-400">{q.email}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-slate-600 md:table-cell">{q.company ?? "—"}</td>
                  <td className="hidden px-4 py-3 text-sm text-slate-600 sm:table-cell">{q.phone}</td>
                  <td className="hidden px-4 py-3 text-sm text-slate-500 lg:table-cell">
                    {new Date(q.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${statusClass(q.status)}`}>
                      {statusLabel(q.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelectedId(q.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 ml-auto">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedId !== null && (
        <QuoteDetailModal id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </section>
  );
}
