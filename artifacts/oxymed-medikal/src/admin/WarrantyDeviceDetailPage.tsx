import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetWarrantyDevice,
  useUpdateWarrantyDevice,
  useListServiceRecords,
  useCreateServiceRecord,
  useUpdateServiceRecord,
  useDeleteServiceRecord,
  useListWarrantyClaims,
  useUpdateWarrantyClaim,
  getGetWarrantyDeviceQueryKey,
  getListServiceRecordsQueryKey,
  getListWarrantyClaimsQueryKey,
  getListWarrantyDevicesQueryKey,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ClipboardList,
  Copy,
  FileText,
  Link2,
  Pencil,
  Plus,
  Printer,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import QRCode from "react-qr-code";
import jsPDF from "jspdf";

// ─── QR label PDF helper ────────────────────────────────────────────────────

async function svgToPng(svgEl: SVGElement, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

async function generateQrLabelPdf(params: {
  qrUrl: string;
  productName: string;
  serialNumber: string;
  model: string;
  customerFirm?: string | null;
  warrantyEndDate?: string | null;
  qrSvgId: string;
}) {
  const svgEl = document.getElementById(params.qrSvgId) as SVGElement | null;
  if (!svgEl) { toast.error("QR kodu oluşturulamadı"); return; }

  let qrPng: string;
  try {
    qrPng = await svgToPng(svgEl, 300);
  } catch {
    toast.error("QR görseli oluşturulamadı");
    return;
  }

  const W = 90, H = 60;
  const doc = new jsPDF({ unit: "mm", format: [W, H], orientation: "landscape" });

  doc.setFillColor(6, 27, 57);
  doc.rect(0, 0, W, 14, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text("OXYMED MEDİKAL", 5, 9);

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text("Medikal Gaz Sistemleri", 5, 12.5);

  const qrSize = 40;
  const qrX = W - qrSize - 4;
  const qrY = 16;
  doc.addImage(qrPng, "PNG", qrX, qrY, qrSize, qrSize);

  doc.setDrawColor(220, 230, 240);
  doc.setLineWidth(0.3);
  doc.line(qrX - 2, 16, qrX - 2, H - 3);

  const textX = 5;
  let y = 21;
  const lineH = 5.5;

  doc.setTextColor(7, 27, 56);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  const name = params.productName.length > 26 ? params.productName.slice(0, 24) + "…" : params.productName;
  doc.text(name, textX, y); y += lineH;

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`Model: ${params.model || "—"}`, textX, y); y += lineH;
  doc.text(`Seri No: ${params.serialNumber}`, textX, y); y += lineH;
  if (params.customerFirm) {
    const firm = params.customerFirm.length > 28 ? params.customerFirm.slice(0, 26) + "…" : params.customerFirm;
    doc.text(firm, textX, y); y += lineH;
  }
  if (params.warrantyEndDate) {
    doc.text(`Garanti Bitiş: ${params.warrantyEndDate}`, textX, y); y += lineH;
  }

  doc.setFontSize(5.5);
  doc.setTextColor(130, 145, 165);
  doc.text("Garanti bilgileri için QR kodu okutunuz", textX, H - 3);

  doc.save(`QR-Etiket-${params.serialNumber}.pdf`);
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "aktif_garanti",     label: "Aktif Garanti",          cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { value: "yakin_bitis",       label: "Yakında Bitecek",        cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  { value: "garanti_disi",      label: "Garanti Dışı",           cls: "bg-red-50 text-red-700 ring-red-200" },
  { value: "bakim_riskli",      label: "Bakım Riskli",           cls: "bg-orange-50 text-orange-700 ring-orange-200" },
  { value: "yetkisiz_askida",   label: "Yetkisiz — Askıda",      cls: "bg-purple-50 text-purple-700 ring-purple-200" },
  { value: "uzatilmis_garanti", label: "Uzatılmış Garanti",      cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  { value: "bakim_anlasmasi",   label: "Bakım Anlaşması",        cls: "bg-teal-50 text-teal-700 ring-teal-200" },
  { value: "talep_incelemede",  label: "Talep İncelemede",       cls: "bg-yellow-50 text-yellow-700 ring-yellow-200" },
  { value: "talep_onaylandi",   label: "Talep Onaylandı",        cls: "bg-green-50 text-green-700 ring-green-200" },
  { value: "talep_reddedildi",  label: "Talep Reddedildi",       cls: "bg-rose-50 text-rose-700 ring-rose-200" },
];

const SERVICE_TYPE_LABELS: Record<string, string> = {
  periyodik_bakim:   "Periyodik Bakım",
  ariza_mudahalesi:  "Arıza Müdahalesi",
  yedek_parca:       "Yedek Parça",
  genel_kontrol:     "Genel Kontrol",
  devreye_alma:      "Devreye Alma",
  garanti_servisi:   "Garanti Servisi",
};

const CLAIM_STATUS_OPTIONS = [
  { value: "incelemede",  label: "İncelemede",    cls: "bg-yellow-50 text-yellow-700 ring-yellow-200" },
  { value: "onaylandi",   label: "Onaylandı",     cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { value: "reddedildi",  label: "Reddedildi",    cls: "bg-red-50 text-red-700 ring-red-200" },
];

function statusCls(v: string) {
  return STATUS_OPTIONS.find((o) => o.value === v)?.cls ?? "bg-slate-100 text-slate-500 ring-slate-200";
}
function statusLabel(v: string) {
  return STATUS_OPTIONS.find((o) => o.value === v)?.label ?? v;
}
function claimCls(v: string) {
  return CLAIM_STATUS_OPTIONS.find((o) => o.value === v)?.cls ?? "bg-slate-100 text-slate-500 ring-slate-200";
}
function claimLabel(v: string) {
  return CLAIM_STATUS_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

// ─── Field helpers ─────────────────────────────────────────────────────────────

function InfoField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

// ─── Service Record Modal ──────────────────────────────────────────────────────

type KitRow = { kitName: string; kitCode: string; quantity: string; unit: string };
type ServiceFormState = {
  serviceDate: string; serviceType: string; servicePersonnel: string;
  description: string; workHours: string; notes: string; reportNo: string;
  kits: KitRow[];
};

const EMPTY_SVC: ServiceFormState = {
  serviceDate: "", serviceType: "periyodik_bakim", servicePersonnel: "",
  description: "", workHours: "", notes: "", reportNo: "", kits: [],
};

function ServiceRecordModal({
  initial,
  onClose,
  onSave,
  saving,
}: {
  initial?: Partial<ServiceFormState>;
  onClose: () => void;
  onSave: (data: ServiceFormState) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<ServiceFormState>({ ...EMPTY_SVC, ...initial });
  const set = (k: keyof Omit<ServiceFormState, "kits">) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  function addKit() {
    setForm((p) => ({ ...p, kits: [...p.kits, { kitName: "", kitCode: "", quantity: "", unit: "" }] }));
  }
  function removeKit(i: number) {
    setForm((p) => ({ ...p, kits: p.kits.filter((_, j) => j !== i) }));
  }
  function setKit(i: number, k: keyof KitRow, v: string) {
    setForm((p) => ({ ...p, kits: p.kits.map((r, j) => j === i ? { ...r, [k]: v } : r) }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Servis Kaydı</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">Servis Tarihi *</label>
              <input className="input" type="date" value={form.serviceDate} onChange={set("serviceDate")} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">Servis Türü *</label>
              <select className="input" value={form.serviceType} onChange={set("serviceType")}>
                {Object.entries(SERVICE_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">Servis Personeli</label>
              <input className="input" value={form.servicePersonnel} onChange={set("servicePersonnel")} placeholder="Ad Soyad" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">Çalışma Saati</label>
              <input className="input" value={form.workHours} onChange={set("workHours")} placeholder="2.5 saat" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">Rapor No</label>
              <input className="input" value={form.reportNo} onChange={set("reportNo")} placeholder="OXM-SRV-2026-001" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">Açıklama</label>
            <textarea className="input min-h-[68px] resize-y" value={form.description} onChange={set("description")} placeholder="Yapılan işlemler…" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">Personel Notu (Admin)</label>
            <textarea className="input min-h-[56px] resize-y" value={form.notes} onChange={set("notes")} placeholder="İç not…" />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500">Kullanılan Bakım Kitleri</p>
              <button className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline" onClick={addKit}>
                <Plus className="h-3.5 w-3.5" /> Kit Ekle
              </button>
            </div>
            {form.kits.length === 0 ? (
              <p className="text-xs text-slate-400">Henüz kit eklenmedi.</p>
            ) : (
              <div className="space-y-2">
                {form.kits.map((kit, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-2">
                    <input className="input text-xs" value={kit.kitName} onChange={(e) => setKit(i, "kitName", e.target.value)} placeholder="Kit adı *" />
                    <input className="input w-24 text-xs" value={kit.kitCode} onChange={(e) => setKit(i, "kitCode", e.target.value)} placeholder="Kod" />
                    <input className="input w-16 text-xs" value={kit.quantity} onChange={(e) => setKit(i, "quantity", e.target.value)} placeholder="Adet" />
                    <input className="input w-16 text-xs" value={kit.unit} onChange={(e) => setKit(i, "unit", e.target.value)} placeholder="Birim" />
                    <button onClick={() => removeKit(i)} className="text-red-400 hover:text-red-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button className="btn-secondary" onClick={onClose}>İptal</button>
          <button className="btn-primary" disabled={saving || !form.serviceDate} onClick={() => onSave(form)}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Claim Decision Modal ──────────────────────────────────────────────────────

function ClaimDecisionModal({
  claimId,
  deviceId,
  current,
  onClose,
}: {
  claimId: number;
  deviceId: number;
  current: { decisionStatus: string; outOfWarrantyReason?: string | null; adminNote?: string | null; personnelNote?: string | null };
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    decisionStatus: current.decisionStatus,
    outOfWarrantyReason: current.outOfWarrantyReason ?? "",
    adminNote: current.adminNote ?? "",
    personnelNote: current.personnelNote ?? "",
  });

  const updateMut = useUpdateWarrantyClaim({
    mutation: {
      onSuccess: () => {
        toast.success("Talep güncellendi");
        qc.invalidateQueries({ queryKey: getListWarrantyClaimsQueryKey(deviceId) });
        onClose();
      },
      onError: () => toast.error("Güncelleme başarısız"),
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Garanti Talebi Kararı</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-2 block text-xs font-bold text-slate-500">Karar</label>
            <div className="flex gap-2">
              {CLAIM_STATUS_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setForm((p) => ({ ...p, decisionStatus: o.value }))}
                  className={`flex-1 rounded-lg border py-2 text-xs font-bold ring-1 transition ${claimCls(o.value)} ${form.decisionStatus === o.value ? "ring-2" : "opacity-50"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">Garanti Dışı Sebep</label>
            <input className="input" value={form.outOfWarrantyReason} onChange={(e) => setForm((p) => ({ ...p, outOfWarrantyReason: e.target.value }))} placeholder="Yetkisiz müdahale, hasar vb." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">Personel Notu</label>
            <textarea className="input min-h-[60px] resize-y" value={form.personnelNote} onChange={(e) => setForm((p) => ({ ...p, personnelNote: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">Admin Notu</label>
            <textarea className="input min-h-[60px] resize-y" value={form.adminNote} onChange={(e) => setForm((p) => ({ ...p, adminNote: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button className="btn-secondary" onClick={onClose}>İptal</button>
          <button
            className="btn-primary"
            disabled={updateMut.isPending}
            onClick={() => updateMut.mutate({ id: deviceId, claimId, data: form })}
          >
            {updateMut.isPending ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WarrantyDeviceDetailPage() {
  const { id: idStr } = useParams<{ id: string }>();
  const id = parseInt(idStr ?? "", 10);
  const qc = useQueryClient();
  const [tab, setTab] = useState<"info" | "records" | "claims">("info");
  const [svcModal, setSvcModal] = useState<{ open: boolean; record?: Partial<ServiceFormState> & { id?: number } }>({ open: false });
  const [claimDecision, setClaimDecision] = useState<{
    open: boolean;
    claimId?: number;
    current?: { decisionStatus: string; outOfWarrantyReason?: string | null; adminNote?: string | null; personnelNote?: string | null };
  }>({ open: false });
  const [editInfo, setEditInfo] = useState(false);
  const [infoForm, setInfoForm] = useState<Record<string, string>>({});
  const [copiedQr, setCopiedQr] = useState(false);

  const { data: device, isLoading } = useGetWarrantyDevice(id);
  const { data: recordsData } = useListServiceRecords(id);
  const { data: claimsData } = useListWarrantyClaims(id);

  const updateMut = useUpdateWarrantyDevice({
    mutation: {
      onSuccess: (updated) => {
        toast.success("Cihaz güncellendi");
        qc.invalidateQueries({ queryKey: getGetWarrantyDeviceQueryKey(id) });
        qc.invalidateQueries({ queryKey: getListWarrantyDevicesQueryKey() });
        setEditInfo(false);
        setInfoForm({});
      },
      onError: () => toast.error("Güncelleme başarısız"),
    },
  });

  const createSvcMut = useCreateServiceRecord({
    mutation: {
      onSuccess: () => {
        toast.success("Servis kaydı eklendi");
        qc.invalidateQueries({ queryKey: getListServiceRecordsQueryKey(id) });
        setSvcModal({ open: false });
      },
      onError: () => toast.error("Eklenemedi"),
    },
  });

  const updateSvcMut = useUpdateServiceRecord({
    mutation: {
      onSuccess: () => {
        toast.success("Servis kaydı güncellendi");
        qc.invalidateQueries({ queryKey: getListServiceRecordsQueryKey(id) });
        setSvcModal({ open: false });
      },
      onError: () => toast.error("Güncelleme başarısız"),
    },
  });

  const deleteSvcMut = useDeleteServiceRecord({
    mutation: {
      onSuccess: () => {
        toast.success("Servis kaydı silindi");
        qc.invalidateQueries({ queryKey: getListServiceRecordsQueryKey(id) });
      },
      onError: () => toast.error("Silinemedi"),
    },
  });

  const records = recordsData?.items ?? [];
  const claims = claimsData?.items ?? [];

  function copyQrUrl() {
    if (!device) return;
    const url = `${window.location.origin}/servis/qr/${device.qrToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedQr(true);
      setTimeout(() => setCopiedQr(false), 2000);
    });
  }

  if (isLoading) return <div className="p-8 text-center text-slate-400">Yükleniyor…</div>;
  if (!device) return <div className="p-8 text-center text-slate-400">Cihaz bulunamadı.</div>;

  const STATUS_OPTIONS = [
    { value: "aktif_garanti",     label: "Aktif Garanti" },
    { value: "yakin_bitis",       label: "Yakında Bitecek" },
    { value: "garanti_disi",      label: "Garanti Dışı" },
    { value: "bakim_riskli",      label: "Bakım Riskli" },
    { value: "yetkisiz_askida",   label: "Yetkisiz — Askıda" },
    { value: "uzatilmis_garanti", label: "Uzatılmış Garanti" },
    { value: "bakim_anlasmasi",   label: "Bakım Anlaşması" },
    { value: "talep_incelemede",  label: "Talep İncelemede" },
    { value: "talep_onaylandi",   label: "Talep Onaylandı" },
    { value: "talep_reddedildi",  label: "Talep Reddedildi" },
  ];

  const qrUrl = `${window.location.origin}/servis/qr/${device.qrToken}`;

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/admin/garanti" className="mb-2 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-3.5 w-3.5" /> Garanti Listesi
          </Link>
          <h1 className="text-xl font-bold text-slate-900">{device.productName}</h1>
          <p className="mt-0.5 font-mono text-sm text-slate-500">{device.serialNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusCls(device.status)}`}>
            {statusLabel(device.status)}
          </span>
          <button
            onClick={copyQrUrl}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            title={qrUrl}
          >
            {copiedQr ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Link2 className="h-3.5 w-3.5" />}
            {copiedQr ? "Kopyalandı!" : "QR Linki Kopyala"}
          </button>
        </div>
      </div>

      {/* Tab nav */}
      <div className="mb-5 flex gap-1 border-b border-slate-200">
        {([
          ["info",    "Cihaz Bilgileri",    Settings],
          ["records", "Servis Geçmişi",     Wrench],
          ["claims",  "Garanti Talepleri",  ShieldAlert],
        ] as const).map(([t, lbl, Icon]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            <Icon className="h-4 w-4" />
            {lbl}
            {t === "records" && <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-black text-slate-600">{records.length}</span>}
            {t === "claims" && claims.length > 0 && <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-black text-rose-600">{claims.length}</span>}
          </button>
        ))}
      </div>

      {/* TAB: Device Info */}
      {tab === "info" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Cihaz Detayları</h2>
            <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline" onClick={() => { setEditInfo(!editInfo); setInfoForm({}); }}>
              <Pencil className="h-3.5 w-3.5" /> {editInfo ? "İptal" : "Düzenle"}
            </button>
          </div>

          {editInfo ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["productName", "Ürün Adı"],
                  ["model", "Model"],
                  ["serialNumber", "Seri Numarası"],
                  ["customerFirm", "Müşteri Firma"],
                  ["customerContact", "İletişim Kişisi"],
                  ["customerPhone", "Telefon"],
                  ["customerEmail", "E-posta"],
                  ["installDate", "Kurulum Tarihi", "date"],
                  ["warrantyStartDate", "Garanti Başlangıç", "date"],
                  ["warrantyEndDate", "Garanti Bitiş", "date"],
                  ["warrantyType", "Garanti Tipi"],
                  ["maintenanceContractStatus", "Bakım Sözleşmesi"],
                  ["lastMaintenanceDate", "Son Bakım", "date"],
                  ["nextMaintenanceDate", "Sonraki Bakım", "date"],
                  ["imageUrl", "Görsel URL"],
                ].map(([k, lbl, type]) => (
                  <div key={k}>
                    <label className="mb-1 block text-xs font-bold text-slate-500">{lbl}</label>
                    <input
                      className="input"
                      type={type ?? "text"}
                      defaultValue={((device as unknown) as Record<string, string | null | undefined>)[k] ?? ""}
                      onChange={(e) => setInfoForm((p) => ({ ...p, [k]: e.target.value }))}
                    />
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">Garanti Durumu</label>
                  <select
                    className="input"
                    defaultValue={device.status}
                    onChange={(e) => setInfoForm((p) => ({ ...p, status: e.target.value }))}
                  >
                    {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-xs font-bold text-slate-500">Notlar</label>
                <textarea
                  className="input min-h-[72px] resize-y"
                  defaultValue={device.notes ?? ""}
                  onChange={(e) => setInfoForm((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button className="btn-secondary" onClick={() => { setEditInfo(false); setInfoForm({}); }}>İptal</button>
                <button
                  className="btn-primary"
                  disabled={updateMut.isPending}
                  onClick={() => updateMut.mutate({ id, data: infoForm })}
                >
                  {updateMut.isPending ? "Kaydediliyor…" : "Kaydet"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoField label="Ürün Adı" value={device.productName} />
                <InfoField label="Model" value={device.model} />
                <InfoField label="Seri Numarası" value={device.serialNumber} />
                <InfoField label="QR Token" value={device.qrToken} />
                <InfoField label="Müşteri Firma" value={device.customerFirm} />
                <InfoField label="İletişim Kişisi" value={device.customerContact} />
                <InfoField label="Telefon" value={device.customerPhone} />
                <InfoField label="E-posta" value={device.customerEmail} />
                <InfoField label="Kurulum Tarihi" value={device.installDate} />
                <InfoField label="Garanti Başlangıç" value={device.warrantyStartDate} />
                <InfoField label="Garanti Bitiş" value={device.warrantyEndDate} />
                <InfoField label="Garanti Tipi" value={device.warrantyType} />
                <InfoField label="Bakım Sözleşmesi" value={device.maintenanceContractStatus} />
                <InfoField label="Son Bakım Tarihi" value={device.lastMaintenanceDate} />
                <InfoField label="Sonraki Bakım" value={device.nextMaintenanceDate} />
              </div>
              {device.notes && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Notlar</p>
                  <p className="mt-1 text-sm text-slate-700">{device.notes}</p>
                </div>
              )}
              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                  {/* Inline QR code */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
                      <QRCode
                        id="admin-qr-code-svg"
                        value={qrUrl}
                        size={112}
                        level="M"
                        fgColor="#061b39"
                        bgColor="#ffffff"
                      />
                    </div>
                    <button
                      className="flex items-center gap-1.5 rounded-lg bg-oxynavy-700 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-oxynavy-800 active:opacity-90"
                      onClick={() =>
                        generateQrLabelPdf({
                          qrUrl,
                          productName: device.productName,
                          serialNumber: device.serialNumber,
                          model: device.model ?? "",
                          customerFirm: device.customerFirm,
                          warrantyEndDate: device.warrantyEndDate,
                          qrSvgId: "admin-qr-code-svg",
                        })
                      }
                    >
                      <Printer className="h-3.5 w-3.5" /> QR Etiket Yazdır
                    </button>
                  </div>

                  {/* Link + info */}
                  <div className="flex-1 min-w-0">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Müşteri QR Sayfası Linki</p>
                    <div className="flex items-center gap-2">
                      <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="flex-1 truncate font-mono text-xs text-blue-600 hover:underline">{qrUrl}</a>
                      <button onClick={copyQrUrl} className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900" title="Kopyala">
                        {copiedQr ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      QR kodu cihaz etiketine yapıştırın. Müşteri kamerasıyla tarayınca garanti &amp; servis bilgilerini görebilir.
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      "QR Etiket Yazdır" → 90×60 mm label PDF indirir (yazıcıya gönderebilirsiniz).
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB: Service Records */}
      {tab === "records" && (
        <div>
          <div className="mb-4 flex justify-end">
            <button className="btn-primary flex items-center gap-2" onClick={() => setSvcModal({ open: true })}>
              <Plus className="h-4 w-4" /> Servis Kaydı Ekle
            </button>
          </div>
          {records.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
              <Wrench className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-slate-400">Henüz servis kaydı yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((r) => (
                <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200">
                          {SERVICE_TYPE_LABELS[r.serviceType] ?? r.serviceType}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">{r.serviceDate}</span>
                        {r.reportNo && <span className="font-mono text-xs text-slate-400">{r.reportNo}</span>}
                      </div>
                      {r.servicePersonnel && <p className="mt-1 text-sm text-slate-600">Personel: {r.servicePersonnel}</p>}
                      {r.description && <p className="mt-1 text-sm text-slate-600">{r.description}</p>}
                      {r.workHours && <p className="mt-1 text-xs text-slate-400">Çalışma: {r.workHours}</p>}
                      {r.notes && (
                        <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2">
                          <p className="text-xs font-bold text-amber-700">Admin Notu</p>
                          <p className="text-xs text-amber-800">{r.notes}</p>
                        </div>
                      )}
                      {r.kits && r.kits.length > 0 && (
                        <div className="mt-3">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Kullanılan Bakım Kitleri</p>
                          <div className="flex flex-wrap gap-1.5">
                            {r.kits.map((k) => (
                              <span key={k.id} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                                {k.kitName}{k.kitCode ? ` (${k.kitCode})` : ""}{k.quantity ? ` × ${k.quantity}${k.unit ?? ""}` : ""}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                        onClick={() => setSvcModal({
                          open: true,
                          record: {
                            id: r.id,
                            serviceDate: r.serviceDate,
                            serviceType: r.serviceType,
                            servicePersonnel: r.servicePersonnel ?? "",
                            description: r.description ?? "",
                            workHours: r.workHours ?? "",
                            notes: r.notes ?? "",
                            reportNo: r.reportNo ?? "",
                            kits: r.kits?.map((k) => ({ kitName: k.kitName, kitCode: k.kitCode ?? "", quantity: k.quantity ?? "", unit: k.unit ?? "" })) ?? [],
                          },
                        })}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50"
                        onClick={() => { if (confirm("Servis kaydı silinsin mi?")) deleteSvcMut.mutate({ id, recordId: r.id }); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Claims */}
      {tab === "claims" && (
        <div>
          {claims.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
              <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-slate-400">Henüz garanti talebi yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {claims.map((c) => (
                <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${claimCls(c.decisionStatus)}`}>
                          {claimLabel(c.decisionStatus)}
                        </span>
                        <span className="font-semibold text-slate-800">{c.faultType}</span>
                        <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString("tr-TR")}</span>
                      </div>
                      <p className="text-sm text-slate-600">{c.faultDescription}</p>
                      {c.claimantName && <p className="mt-1 text-xs text-slate-400">Başvuran: {c.claimantName}{c.claimantPhone ? ` / ${c.claimantPhone}` : ""}</p>}
                      {c.workHours && <p className="mt-1 text-xs text-slate-400">Çalışma saati: {c.workHours}</p>}
                      {c.outOfWarrantyReason && (
                        <div className="mt-2 rounded-lg bg-red-50 px-3 py-2">
                          <p className="text-xs font-bold text-red-700">Garanti Dışı Sebep</p>
                          <p className="text-xs text-red-800">{c.outOfWarrantyReason}</p>
                        </div>
                      )}
                      {c.personnelNote && <p className="mt-1 text-xs text-slate-500">Personel notu: {c.personnelNote}</p>}
                      {c.adminNote && (
                        <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2">
                          <p className="text-xs font-bold text-amber-700">Admin Notu</p>
                          <p className="text-xs text-amber-800">{c.adminNote}</p>
                        </div>
                      )}
                    </div>
                    <button
                      className="shrink-0 flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                      onClick={() => setClaimDecision({ open: true, claimId: c.id, current: c })}
                    >
                      <ClipboardList className="h-3.5 w-3.5" /> Karar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Service record modal */}
      {svcModal.open && (
        <ServiceRecordModal
          initial={svcModal.record}
          onClose={() => setSvcModal({ open: false })}
          saving={createSvcMut.isPending || updateSvcMut.isPending}
          onSave={(data) => {
            if (svcModal.record?.id) {
              updateSvcMut.mutate({ id, recordId: svcModal.record.id, data });
            } else {
              createSvcMut.mutate({ id, data });
            }
          }}
        />
      )}

      {/* Claim decision modal */}
      {claimDecision.open && claimDecision.claimId && claimDecision.current && (
        <ClaimDecisionModal
          claimId={claimDecision.claimId}
          deviceId={id}
          current={claimDecision.current}
          onClose={() => setClaimDecision({ open: false })}
        />
      )}
    </section>
  );
}
