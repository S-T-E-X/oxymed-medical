import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FileText, Download, ShieldCheck, CalendarClock, Wrench, Phone, Mail, ExternalLink } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const SERVICE_TYPE_LABELS: Record<string, string> = {
  periyodik_bakim: "Periyodik Bakım",
  ariza_mudahalesi: "Arıza Müdahalesi",
  yedek_parca: "Yedek Parça",
  genel_kontrol: "Genel Kontrol",
  devreye_alma: "Devreye Alma",
  garanti_servisi: "Garanti Servisi",
};

const WARRANTY_STATUS_LABELS: Record<string, string> = {
  aktif_garanti: "Aktif Garanti",
  yakin_bitis: "Yakında Bitecek",
  garanti_disi: "Garanti Dışı",
  bakim_riskli: "Bakım Gerekiyor",
  yetkisiz_askida: "Askıda",
  uzatilmis_garanti: "Uzatılmış Garanti",
  bakim_anlasmasi: "Bakım Anlaşması",
  taslak: "Taslak",
};

interface Device {
  id: number; productName: string; model: string; serialNumber: string;
  customerFirm: string; status: string; warrantyEndDate?: string | null;
  lastMaintenanceDate?: string | null; nextMaintenanceDate?: string | null;
  installDate?: string | null; imageUrl?: string | null;
}

interface Report {
  id: number; reportNo: string; serviceDate: string; serviceType: string;
  priority: string; status: string; pdfUrl: string | null; verificationToken: string;
  createdBy?: string | null;
}

interface PublicDeviceData { device: Device; reports: Report[]; }

function fmt(d?: string | null) {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" }); }
  catch { return d; }
}

export default function ServisCihazPage() {
  const { qrToken } = useParams<{ qrToken: string }>();
  const [data, setData] = useState<PublicDeviceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!qrToken) { setError(true); setLoading(false); return; }
    fetch(`${BASE}/api/service-reports/public/device/${encodeURIComponent(qrToken)}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json() as Promise<PublicDeviceData>; })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [qrToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Yükleniyor…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] flex flex-col items-center justify-center gap-4 p-6">
        <ShieldCheck className="h-14 w-14 text-slate-200" />
        <h2 className="text-lg font-bold text-slate-700">Cihaz Bulunamadı</h2>
        <p className="text-sm text-slate-500 text-center max-w-xs">Bu bağlantıya ait cihaz bilgisi bulunamadı. Lütfen QR kodu kontrol edin.</p>
        <a href="tel:+902322832020" className="flex items-center gap-2 rounded-full bg-[#061b39] px-6 py-3 text-sm font-bold text-white">
          <Phone className="h-4 w-4" /> Teknik Destek
        </a>
      </div>
    );
  }

  const { device, reports } = data;
  const isActiveWarranty = ["aktif_garanti", "uzatilmis_garanti", "bakim_anlasmasi"].includes(device.status);

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      {/* Header */}
      <header className="bg-[#061b39] px-6 py-4 flex items-center justify-between">
        <img src="/assets/oxymedlogobeyaz.webp" alt="Oxymed Medikal" className="h-8 w-auto" />
        <span className="text-sm font-bold text-white/70">Servis Geçmişi</span>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {/* Device card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#061b39] to-[#0a2f5a] px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-black text-white">{device.productName}</h1>
                <p className="text-white/70 text-sm mt-1">{device.model}</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                isActiveWarranty ? "bg-emerald-400/20 text-emerald-300" : "bg-slate-500/20 text-slate-300"
              }`}>
                {WARRANTY_STATUS_LABELS[device.status] ?? device.status}
              </span>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Seri Numarası", device.serialNumber],
                ["Müşteri / Kurum", device.customerFirm],
                ["Kurulum Tarihi", fmt(device.installDate)],
                ["Garanti Bitiş", fmt(device.warrantyEndDate)],
                ["Son Bakım", fmt(device.lastMaintenanceDate)],
                ["Sonraki Bakım", fmt(device.nextMaintenanceDate)],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <span className="w-32 shrink-0 font-semibold text-slate-500">{label}</span>
                  <span className="font-medium text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Service history */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-blue-600" />
              Servis Geçmişi
            </h2>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-black text-blue-600">{reports.length} rapor</span>
          </div>

          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <FileText className="h-10 w-10 text-slate-200" />
              <p className="text-sm">Henüz tamamlanmış servis raporu bulunmuyor.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((r) => (
                <div key={r.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-500">{r.reportNo}</span>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                          {SERVICE_TYPE_LABELS[r.serviceType] ?? r.serviceType}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2 text-sm text-slate-600">
                        <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{fmt(r.serviceDate) ?? r.serviceDate}</span>
                        {r.createdBy && <span className="text-slate-400">· {r.createdBy}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {r.pdfUrl ? (
                        <>
                          <a
                            href={r.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Görüntüle
                          </a>
                          <a
                            href={r.pdfUrl}
                            download
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                          >
                            <Download className="h-3.5 w-3.5" /> İndir
                          </a>
                        </>
                      ) : (
                        <span className="text-xs text-slate-300">PDF yok</span>
                      )}
                      <Link
                        to={`/servis/rapor/${r.verificationToken}`}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
                        title="Raporu doğrula"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="flex gap-3">
          <a href="tel:+902322832020" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#061b39] py-3.5 text-sm font-bold text-white">
            <Phone className="h-4 w-4" /> +90 232 283 20 20
          </a>
          <a href="mailto:info@oxymed.com.tr" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
            <Mail className="h-4 w-4" /> E-posta
          </a>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Oxymed Medikal Gaz Sistemleri San. ve Tic. A.Ş.
      </footer>
    </div>
  );
}
