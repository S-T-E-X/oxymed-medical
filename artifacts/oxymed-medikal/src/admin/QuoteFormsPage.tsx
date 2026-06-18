import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FilePlus, Pencil, Trash2, Eye, Loader2, Mail, X } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type QuoteForm = {
  id: number;
  quoteNo: string;
  status: string;
  firmaAdi?: string | null;
  firmaEmail?: string | null;
  paraBirimi: string;
  createdAt: string;
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Taslak", cls: "bg-slate-100 text-slate-600 ring-slate-200", rowBg: "", borderLeft: "border-l-slate-300" },
  { value: "sent", label: "Gönderildi", cls: "bg-amber-50 text-amber-700 ring-amber-200", rowBg: "bg-amber-100", borderLeft: "border-l-amber-400" },
  { value: "approved", label: "Onaylandı", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", rowBg: "bg-emerald-100", borderLeft: "border-l-emerald-500" },
  { value: "rejected", label: "Reddedildi", cls: "bg-red-50 text-red-600 ring-red-200", rowBg: "bg-red-100", borderLeft: "border-l-red-500" },
];

function statusClass(s: string) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.cls ?? "bg-slate-100 text-slate-500 ring-slate-200";
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildEmailPreviewHtml(quoteNo: string, firmaAdi: string, konu: string, bodyText: string): string {
  const dateStr = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
  const greet = firmaAdi
    ? `Sayın <strong style="color:#1e293b">${escHtml(firmaAdi)}</strong>,`
    : "Sayın İlgili,";
  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:20px 12px">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
        <tr>
          <td style="background:linear-gradient(135deg,#08265f 0%,#0e3a8a 100%);padding:20px 24px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="font-size:17px;font-weight:800;color:#ffffff;letter-spacing:0.5px">OXYMED MEDİKAL</div>
                  <div style="font-size:11px;color:#93c5fd;margin-top:2px">Medikal Gaz Sistemleri &amp; Hastane Ekipmanları</div>
                </td>
                <td align="right">
                  <div style="background:rgba(255,255,255,0.12);border-radius:8px;padding:6px 12px;display:inline-block;text-align:right">
                    <div style="font-size:10px;color:#93c5fd;text-transform:uppercase;letter-spacing:1px">Teklif No</div>
                    <div style="font-size:14px;font-weight:700;color:#ffffff;margin-top:2px">${escHtml(quoteNo)}</div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 22px;background:#f8fafc;border-bottom:1px solid #e2e8f0">
            <p style="margin:0;font-size:12px;color:#64748b"><span style="font-weight:700;color:#1e293b">Konu:</span> ${escHtml(konu)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 24px 20px">
            <p style="margin:0 0 10px;font-size:14px;color:#475569">${greet}</p>
            <p style="margin:0;font-size:14px;color:#475569;line-height:1.7">${escHtml(bodyText)}</p>
            <p style="margin:14px 0 0;font-size:13px;color:#64748b">Teklifinizin detaylı PDF'i bu e-postaya eklenmiştir.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:14px 24px;text-align:center">
            <p style="margin:0;font-size:11px;color:#94a3b8">
              Bu e-posta Oxymed Medikal Gaz Sistemleri tarafından otomatik olarak gönderilmiştir.<br>
              Teklif No: ${escHtml(quoteNo)} | Tarih: ${dateStr}<br>
              <a href="https://www.oxymedmedical.com" style="color:#64748b;text-decoration:none">www.oxymedmedical.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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
  const { authFetch } = useAuth();
  const { data, isLoading } = useQuoteForms();
  const createMut = useCreateQuoteForm();
  const deleteMut = useDeleteQuoteForm();
  const updateStatusMut = useUpdateQuoteFormStatus();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [search, setSearch] = useState("");

  // Email dialog state
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailTarget, setEmailTarget] = useState("");
  const [emailDefaultAddress, setEmailDefaultAddress] = useState("");
  const [emailFormId, setEmailFormId] = useState<number | null>(null);
  const [emailFormNo, setEmailFormNo] = useState("");
  const [emailFirmaAdi, setEmailFirmaAdi] = useState("");
  const [emailKonu, setEmailKonu] = useState("");
  const [emailBodyText, setEmailBodyText] = useState("");
  const [emailTab, setEmailTab] = useState<"form" | "preview">("form");
  const [sendingEmail, setSendingEmail] = useState(false);

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

  function openEmailDialog(form: QuoteForm) {
    setEmailFormId(form.id);
    setEmailFormNo(form.quoteNo);
    setEmailFirmaAdi(form.firmaAdi ?? "");
    const defaultEmail = form.firmaEmail ?? "";
    setEmailDefaultAddress(defaultEmail);
    setEmailTarget(defaultEmail);
    setEmailKonu(`Teklif - ${form.quoteNo}${form.firmaAdi ? ` | ${form.firmaAdi}` : ""}`);
    setEmailBodyText("Tarafınıza sunmakta olduğumuz teklif aşağıda yer almaktadır. Herhangi bir sorunuz için bizimle iletişime geçebilirsiniz.");
    setEmailTab("form");
    setShowEmailDialog(true);
  }

  async function handleSendEmail() {
    if (!emailFormId) return;
    const target = emailTarget.trim();
    if (!target) { toast.error("Lütfen bir e-posta adresi girin"); return; }
    setSendingEmail(true);
    toast.info("Teklif e-posta olarak gönderiliyor...");
    try {
      const res = await authFetch(`${BASE}/api/quote-forms/${emailFormId}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: target, subject: emailKonu.trim(), bodyText: emailBodyText.trim() }),
      });
      const body = await res.json().catch(() => ({})) as { error?: string; detail?: string; success?: boolean };
      if (!res.ok) {
        throw new Error(body.detail ?? body.error ?? `HTTP ${res.status}`);
      }
      toast.success(`Teklif ${target} adresine gönderildi`);
      setShowEmailDialog(false);
    } catch (err) {
      toast.error(`Gönderilemedi: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSendingEmail(false);
    }
  }

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
                      {(f.status === "sent" || f.status === "approved") && (
                        <button
                          onClick={() => openEmailDialog(f)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 text-blue-500 hover:bg-blue-50"
                          title="E-posta ile Gönder"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </button>
                      )}
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

      {/* Delete confirmation dialog */}
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

      {/* Email dialog */}
      {showEmailDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl flex flex-col" style={{ maxHeight: "90vh" }}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Teklifi E-posta ile Gönder</h2>
                  <p className="text-xs text-slate-500">{emailFormNo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailDialog(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-6 shrink-0">
              <button
                type="button"
                onClick={() => setEmailTab("form")}
                className={`px-1 py-3 mr-6 text-sm font-semibold border-b-2 transition-colors ${emailTab === "form" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
              >
                Mesaj
              </button>
              <button
                type="button"
                onClick={() => setEmailTab("preview")}
                className={`px-1 py-3 text-sm font-semibold border-b-2 transition-colors ${emailTab === "preview" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
              >
                Önizleme
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {emailTab === "form" ? (
                <div className="px-6 py-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        Alıcı E-posta Adresi
                      </label>
                      {emailDefaultAddress && emailTarget.trim() !== emailDefaultAddress && (
                        <button
                          type="button"
                          onClick={() => setEmailTarget(emailDefaultAddress)}
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          Firma adresine dön ↩
                        </button>
                      )}
                    </div>
                    <input
                      type="email"
                      value={emailTarget}
                      onChange={(e) => setEmailTarget(e.target.value)}
                      placeholder="ornek@firma.com"
                      autoFocus
                      className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      Konu
                    </label>
                    <input
                      type="text"
                      value={emailKonu}
                      onChange={(e) => setEmailKonu(e.target.value)}
                      placeholder="E-posta konusu"
                      className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      Mesaj
                    </label>
                    <textarea
                      value={emailBodyText}
                      onChange={(e) => setEmailBodyText(e.target.value)}
                      rows={4}
                      placeholder="E-posta mesajı..."
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <p className="text-xs text-slate-400">PDF teklif formu otomatik olarak eke eklenir.</p>
                </div>
              ) : (
                <div className="p-4">
                  <iframe
                    srcDoc={buildEmailPreviewHtml(emailFormNo, emailFirmaAdi, emailKonu, emailBodyText)}
                    title="E-posta önizlemesi"
                    className="w-full rounded-lg border border-slate-200"
                    style={{ height: "440px" }}
                    sandbox="allow-same-origin"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4 shrink-0">
              <button
                type="button"
                onClick={() => setShowEmailDialog(false)}
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sendingEmail || !emailTarget.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {sendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                {sendingEmail ? "Gönderiliyor..." : "Gönder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
