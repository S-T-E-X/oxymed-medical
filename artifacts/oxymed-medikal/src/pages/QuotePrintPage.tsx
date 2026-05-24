import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
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

const TOKEN_KEY = "admin_token";

export default function QuotePrintPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token: ctxToken } = useAuth();
  const token = ctxToken ?? localStorage.getItem(TOKEN_KEY);
  const [form, setForm] = useState<ApiForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/quote-forms/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (!r.ok) throw new Error("Teklif formu bulunamadı");
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
  }, [id, token]);

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
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            <Printer className="h-4 w-4" />
            Yazdır / PDF
          </button>
        </div>
      </div>
      <QuoteTemplateView data={viewData} />
    </>
  );
}
