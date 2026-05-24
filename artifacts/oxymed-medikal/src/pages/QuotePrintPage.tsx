import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, ArrowLeft, Loader2, Download } from "lucide-react";
import QuoteTemplateView, { type QuoteViewData } from "./QuoteTemplateView";
import { useAuth } from "../admin/AuthContext";

type ApiForm = {
  id: number;
  quoteNo: string;
  firmaAdi?: string | null;
  firmaAdres?: string | null;
  firmaTelefon?: string | null;
  firmaEmail?: string | null;
  firmaVergiDairesi?: string | null;
  firmaVergiNo?: string | null;
  teslimatAdresi?: string | null;
  teslimatSuresi?: string | null;
  odemeSekli?: string | null;
  paraBirimi: string;
  hizmetler?: string[];
  sartlar?: string[];
  notlar?: string | null;
  iskonto?: string | null;
  kdv?: string | null;
  hazirlayan?: string | null;
  hazirlayanTelefon?: string | null;
  hazirlayanEmail?: string | null;
  onaylayan?: string | null;
  onaytayanGorev?: string | null;
  onayTarihi?: string | null;
  createdAt: string;
  items: Array<{
    id: number;
    formId: number;
    productId?: number | null;
    title: string;
    bullets?: string[];
    modelCode?: string | null;
    imageUrl?: string | null;
    quantity: number;
    unit: string;
    unitPrice?: string | null;
    sortOrder: number;
  }>;
};

function toViewData(form: ApiForm): QuoteViewData {
  const date = new Date(form.createdAt);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return {
    quoteNo: form.quoteNo,
    quoteDate: `${day}.${month}.${year}`,
    firmaAdi: form.firmaAdi ?? "",
    firmaAdres: form.firmaAdres ?? "",
    firmaTelefon: form.firmaTelefon ?? "",
    firmaEmail: form.firmaEmail ?? "",
    firmaVergiDairesi: form.firmaVergiDairesi ?? "",
    firmaVergiNo: form.firmaVergiNo ?? "",
    teslimatAdresi: form.teslimatAdresi ?? "",
    teslimatSuresi: form.teslimatSuresi ?? "",
    odemeSekli: form.odemeSekli ?? "",
    paraBirimi: form.paraBirimi ?? "EUR",
    hizmetler: form.hizmetler ?? [],
    sartlar: form.sartlar ?? [],
    notlar: form.notlar ?? "",
    iskonto: parseFloat(form.iskonto ?? "0") || 0,
    kdv: parseFloat(form.kdv ?? "20") || 0,
    hazirlayan: form.hazirlayan ?? "",
    hazirlayanTelefon: form.hazirlayanTelefon ?? "",
    hazirlayanEmail: form.hazirlayanEmail ?? "",
    onaylayan: form.onaylayan ?? "",
    onaytayanGorev: form.onaytayanGorev ?? "",
    onayTarihi: form.onayTarihi ?? "",
    items: (form.items ?? []).map((it, i) => ({
      no: i + 1,
      title: it.title,
      bullets: it.bullets ?? [],
      code: it.modelCode ?? "",
      quantity: it.quantity,
      unit: it.unit,
      unitPrice: parseFloat(it.unitPrice ?? "0") || 0,
      imageUrl: it.imageUrl,
    })),
  };
}

export default function QuotePrintPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authFetch, isAuthenticated } = useAuth();
  const [form, setForm] = useState<ApiForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    if (!isAuthenticated) {
      setError("Bu sayfayı görüntülemek için admin girişi yapmalısınız.");
      setLoading(false);
      return;
    }
    authFetch(`/api/quote-forms/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? "Teklif formu bulunamadı" : "Teklif formu yüklenemedi");
        return r.json() as Promise<ApiForm>;
      })
      .then((data) => {
        setForm(data);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated]);

  const handleDownloadPdf = async () => {
    if (!printRef.current || !form) return;
    setDownloading(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const pages = Array.from(
        printRef.current.querySelectorAll<HTMLElement>(".qt-page")
      );
      if (pages.length === 0) throw new Error("Render edilecek sayfa yok");

      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const A4_W = 210;
      const A4_H = 297;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const originalShadow = page.style.boxShadow;
        const originalMargin = page.style.margin;
        page.style.boxShadow = "none";
        page.style.margin = "0";

        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          windowWidth: page.scrollWidth,
          windowHeight: page.scrollHeight,
        });

        page.style.boxShadow = originalShadow;
        page.style.margin = originalMargin;

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        if (i > 0) pdf.addPage("a4", "portrait");
        pdf.addImage(imgData, "JPEG", 0, 0, A4_W, A4_H, undefined, "FAST");
      }

      const filename = `${form.quoteNo || "teklif-formu"}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("PDF generation failed", err);
      setError("PDF oluşturulurken bir hata oluştu.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100">
        <p className="text-red-600">{error ?? "Yüklenemedi"}</p>
        <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:underline">
          Geri dön
        </button>
      </div>
    );
  }

  const viewData = toViewData(form);

  return (
    <>
      <div
        className="print:hidden sticky top-0 z-50 flex items-center justify-between gap-4 bg-white/95 px-6 py-3 shadow-md"
        style={{ backdropFilter: "blur(4px)" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-700">{form.quoteNo}</span>
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? "Hazırlanıyor..." : "PDF İndir"}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            <Printer className="h-4 w-4" />
            Yazdır
          </button>
        </div>
      </div>
      <div ref={printRef}>
        <QuoteTemplateView data={viewData} />
      </div>
    </>
  );
}
