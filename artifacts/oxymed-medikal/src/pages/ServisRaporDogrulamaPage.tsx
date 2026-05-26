import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, ExternalLink, FileText, ShieldX, Phone } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const SERVICE_TYPE_LABELS: Record<string, string> = {
  periyodik_bakim: "Periyodik Bakım",
  ariza_mudahalesi: "Arıza Müdahalesi",
  yedek_parca: "Yedek Parça",
  genel_kontrol: "Genel Kontrol",
  devreye_alma: "Devreye Alma",
  garanti_servisi: "Garanti Servisi",
};

interface VerifyData {
  reportNo: string; serviceDate: string; serviceType: string;
  status: string; pdfUrl: string | null; verificationToken: string;
  device: { serialNumber: string; productName: string; model: string; customerFirm: string } | null;
}

function fmt(d: string) {
  try { return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" }); }
  catch { return d; }
}

export default function ServisRaporDogrulamaPage() {
  const { verificationToken } = useParams<{ verificationToken: string }>();
  const [data, setData] = useState<VerifyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!verificationToken) { setError(true); setLoading(false); return; }
    fetch(`${BASE}/api/service-reports/public/verify/${encodeURIComponent(verificationToken)}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json() as Promise<VerifyData>; })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [verificationToken]);

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <header className="bg-[#061b39] px-6 py-4 flex items-center justify-between">
        <img src="/assets/oxymedlogobeyaz.webp" alt="Oxymed Medikal" className="h-8 w-auto" />
        <span className="text-sm font-bold text-white/70">Rapor Doğrulama</span>
      </header>

      <main className="max-w-lg mx-auto px-4 py-12">
        {loading && (
          <div className="flex items-center justify-center py-20 text-slate-400">Doğrulanıyor…</div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-white shadow-sm p-8 text-center space-y-4">
            <ShieldX className="h-14 w-14 text-red-400 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">Rapor Doğrulanamadı</h2>
            <p className="text-sm text-slate-500">Bu doğrulama kodu geçersiz veya rapor bulunamadı.</p>
            <a href="tel:+902322832020" className="inline-flex items-center gap-2 rounded-full bg-[#061b39] px-6 py-3 text-sm font-bold text-white">
              <Phone className="h-4 w-4" /> Teknik Destek
            </a>
          </div>
        )}

        {!loading && data && (
          <div className="rounded-2xl border border-emerald-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-white mx-auto mb-3" />
              <h2 className="text-xl font-black text-white">Doğrulanmış Servis Raporu</h2>
              <p className="text-emerald-100 text-sm mt-1">Bu rapor Oxymed Medikal tarafından onaylanmıştır.</p>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div className="space-y-3">
                {[
                  ["Rapor No", data.reportNo],
                  ["Servis Tarihi", fmt(data.serviceDate)],
                  ["Servis Türü", SERVICE_TYPE_LABELS[data.serviceType] ?? data.serviceType],
                  ...(data.device ? [
                    ["Cihaz", `${data.device.productName} · ${data.device.model}`],
                    ["Seri Numarası", data.device.serialNumber],
                    ["Müşteri / Kurum", data.device.customerFirm],
                  ] as [string, string][] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center gap-3 text-sm border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <span className="w-32 shrink-0 font-semibold text-slate-500">{label}</span>
                    <span className="font-medium text-slate-900">{value}</span>
                  </div>
                ))}
              </div>

              {data.pdfUrl && (
                <div className="pt-2 flex gap-3">
                  <a
                    href={data.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#061b39] py-3 text-sm font-bold text-white hover:opacity-90"
                  >
                    <ExternalLink className="h-4 w-4" /> PDF Görüntüle
                  </a>
                  <a
                    href={data.pdfUrl}
                    download
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <FileText className="h-4 w-4 text-red-500" /> PDF İndir
                  </a>
                </div>
              )}
            </div>

            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 text-xs text-slate-400 text-center">
              Doğrulama Kodu: {verificationToken}
            </div>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Oxymed Medikal Gaz Sistemleri San. ve Tic. A.Ş. ·{" "}
        <Link to="/servis" className="text-blue-500 hover:underline">Servis Sayfası</Link>
      </footer>
    </div>
  );
}
