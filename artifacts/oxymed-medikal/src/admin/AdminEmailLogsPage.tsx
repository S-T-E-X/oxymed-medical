import { useState } from "react";
import { Mail, CheckCircle, XCircle, RefreshCw, Filter, Search } from "lucide-react";
import { useAuth } from "./AuthContext";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const EMAIL_TYPE_LABELS: Record<string, string> = {
  quote_form: "Teklif Formu",
  service_report: "Servis Raporu",
};

const EMAIL_TYPE_COLORS: Record<string, string> = {
  quote_form: "bg-blue-100 text-blue-700",
  service_report: "bg-purple-100 text-purple-700",
};

interface EmailLog {
  id: number;
  emailType: string;
  recipientEmail: string;
  subject: string | null;
  relatedId: number | null;
  relatedRef: string | null;
  status: string;
  errorMessage: string | null;
  sentBy: string | null;
  sentAt: string;
}

export default function AdminEmailLogsPage() {
  const { authFetch } = useAuth();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [expandedError, setExpandedError] = useState<number | null>(null);

  async function load(search?: string, emailType?: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (emailType ?? typeFilter) params.set("emailType", emailType ?? typeFilter);
      if (search ?? appliedSearch) params.set("search", search ?? appliedSearch);
      const res = await authFetch(`${BASE}/api/email-logs?${params}`);
      if (!res.ok) throw new Error("Yüklenemedi");
      const data = await res.json() as { items: EmailLog[] };
      setLogs(data.items ?? []);
      setLoaded(true);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  if (!loaded && !loading) {
    load();
  }

  const handleTypeFilter = (v: string) => {
    setTypeFilter(v);
    setLoaded(false);
  };

  const handleSearch = () => {
    setAppliedSearch(searchInput);
    setLoaded(false);
  };

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setAppliedSearch("");
    setLoaded(false);
  };

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">E-posta Logları</h1>
          <p className="mt-1 text-sm text-slate-500">Sistemden gönderilen tüm e-postalar</p>
        </div>
        <button
          onClick={() => { setLoaded(false); }}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Yenile
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKey}
            placeholder="Alıcı, konu, belge no veya gönderen..."
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-oxynavy-500"
          />
        </div>
        <button
          onClick={handleSearch}
          className="rounded-lg bg-oxynavy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-oxynavy-800"
        >
          Ara
        </button>
        {appliedSearch && (
          <button
            onClick={handleClearSearch}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
          >
            Temizle
          </button>
        )}
      </div>

      {/* Type Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-slate-400" />
        <button
          onClick={() => handleTypeFilter("")}
          className={`rounded-full px-3 py-1 text-[11px] font-bold ring-1 transition ${!typeFilter ? "bg-slate-700 text-white ring-slate-700" : "bg-slate-100 text-slate-500 ring-slate-200 hover:opacity-80"}`}
        >
          Tümü
        </button>
        {Object.entries(EMAIL_TYPE_LABELS).map(([val, label]) => (
          <button
            key={val}
            onClick={() => handleTypeFilter(typeFilter === val ? "" : val)}
            className={`rounded-full px-3 py-1 text-[11px] font-bold ring-1 transition ${EMAIL_TYPE_COLORS[val] ?? "bg-slate-100 text-slate-500 ring-slate-200"} ${typeFilter === val ? "ring-2 opacity-100" : "opacity-70 hover:opacity-100"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-20 text-center">
          <Mail className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="font-semibold text-slate-400">
            {typeFilter || appliedSearch ? "Bu filtreye uyan e-posta logu yok" : "Henüz e-posta gönderilmemiş"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 whitespace-nowrap">Gönderim Zamanı</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">Tür</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">Alıcı</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 md:table-cell">Konu</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 lg:table-cell">İlgili Belge</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 xl:table-cell">Gönderen</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-500">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <>
                    <tr
                      key={log.id}
                      className={`transition hover:bg-slate-50 ${log.status === "failed" ? "bg-red-50/40" : ""}`}
                      onClick={() => log.errorMessage ? setExpandedError(expandedError === log.id ? null : log.id) : undefined}
                      style={{ cursor: log.errorMessage ? "pointer" : "default" }}
                    >
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(log.sentAt).toLocaleString("tr-TR", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${EMAIL_TYPE_COLORS[log.emailType] ?? "bg-slate-100 text-slate-600"}`}>
                          {EMAIL_TYPE_LABELS[log.emailType] ?? log.emailType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700 font-medium">{log.recipientEmail}</td>
                      <td className="hidden px-4 py-3 text-xs text-slate-600 md:table-cell max-w-[200px] truncate">
                        {log.subject ? (
                          <span title={log.subject}>{log.subject}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-slate-600 lg:table-cell">
                        {log.relatedRef ? (
                          <span className="font-mono font-bold text-slate-700">{log.relatedRef}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-slate-500 xl:table-cell">
                        {log.sentBy ?? <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {log.status === "success" ? (
                          <CheckCircle className="mx-auto h-4 w-4 text-emerald-500" />
                        ) : (
                          <span title={log.errorMessage ?? "Hata"}><XCircle className="mx-auto h-4 w-4 text-red-500" /></span>
                        )}
                      </td>
                    </tr>
                    {expandedError === log.id && log.errorMessage && (
                      <tr key={`err-${log.id}`} className="bg-red-50">
                        <td colSpan={7} className="px-4 py-3 text-xs text-red-700 font-mono">
                          <strong>Hata:</strong> {log.errorMessage}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-400">
            {logs.length} kayıt{appliedSearch ? ` — "${appliedSearch}" için` : ""}
          </div>
        </div>
      )}
    </section>
  );
}
