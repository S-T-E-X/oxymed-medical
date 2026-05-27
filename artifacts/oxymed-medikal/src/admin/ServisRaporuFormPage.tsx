import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Camera, ChevronDown, ChevronUp, Loader2, Plus, Save, Trash2, X,
  FileText, Eye, CheckSquare, Square, Search, Mail,
} from "lucide-react";
import { useImageUpload } from "./useImageUpload";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ─── Static data ──────────────────────────────────────────────────────────────

const SERVICE_TYPES = [
  { value: "periyodik_bakim", label: "Periyodik Bakım" },
  { value: "ariza_mudahalesi", label: "Arıza Müdahalesi" },
  { value: "yedek_parca", label: "Yedek Parça" },
  { value: "genel_kontrol", label: "Genel Kontrol" },
  { value: "devreye_alma", label: "Devreye Alma" },
  { value: "garanti_servisi", label: "Garanti Servisi" },
];

const PRIORITIES = [
  { value: "acil", label: "ACİL" },
  { value: "yuksek", label: "Yüksek" },
  { value: "normal", label: "Normal" },
  { value: "dusuk", label: "Düşük" },
];

const ALARM_KEYS = [
  { key: "dusuk_vakum", label: "Düşük Vakum Alarmı" },
  { key: "yuksek_sicaklik", label: "Yüksek Sıcaklık Alarmı" },
  { key: "termik_hata", label: "Termik Hatası" },
  { key: "sensor_hata", label: "Sensör Hatası" },
  { key: "bakim_suresi_doldu", label: "Bakım Süresi Doldu" },
  { key: "acil_ariza", label: "Acil Arıza" },
];

const ALARM_STATUSES = [
  { value: "yok", label: "Yok" },
  { value: "var", label: "Var" },
  { value: "kontrol_edildi", label: "Kontrol Edildi" },
  { value: "mudahale_edildi", label: "Müdahale Edildi" },
];

const DEFAULT_OPERATIONS = [
  "Yağ seviyesi kontrol edildi",
  "Vakum filtresi kontrol edildi",
  "Yağ filtreleri değiştirildi",
  "Kaçak kontrolü yapıldı",
  "Elektrik bağlantıları kontrol edildi",
  "Vakum sensörü kalibrasyonu kontrol edildi",
  "Alarm sistemi test edildi",
  "HMI ekran kontrolü yapıldı",
  "PLC hata kayıtları incelendi",
  "Sistem genel performans testi tamamlandı",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Device {
  id: number;
  serialNumber: string;
  productName: string;
  model: string;
  deviceType?: string | null;
  plcSystem?: string | null;
  hmiModel?: string | null;
  productionDate?: string | null;
  customerFirm: string;
  customerDepartment?: string | null;
  customerLocation?: string | null;
  customerContact?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  installDate?: string | null;
  warrantyEndDate?: string | null;
  lastMaintenanceDate?: string | null;
  nextMaintenanceDate?: string | null;
  status: string;
  imageUrl?: string | null;
}

const MAINTENANCE_INTERVALS = [
  { label: "2 Hafta", days: 14 },
  { label: "1 Ay",    days: 30 },
  { label: "3 Ay",    days: 90 },
  { label: "6 Ay",    days: 180 },
  { label: "8 Ay",    days: 240 },
  { label: "1 Yıl",   days: 365 },
];

interface Photo { url: string; caption: string; sortOrder: number; }
interface Part { partName: string; partCode: string; quantity: string; condition: string; }
interface EmailLog {
  id: number;
  reportId: number;
  sentTo: string;
  sentBy: string | null;
  status: string;
  errorMessage: string | null;
  sentAt: string;
}
interface Signature { role: string; signerName: string; imageDataUrl: string; }

// ─── Signature Canvas ─────────────────────────────────────────────────────────

function SignatureCanvas({ role, label, value, onChange }: {
  role: string; label: string; value: Signature | null;
  onChange: (sig: Signature | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [signerName, setSignerName] = useState(value?.signerName ?? "");

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = "touches" in e ? e.touches[0]!.clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0]!.clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#061b39";
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDraw() {
    if (!drawing.current) return;
    drawing.current = false;
    const dataUrl = canvasRef.current!.toDataURL("image/png");
    onChange({ role, signerName, imageDataUrl: dataUrl });
  }

  function clearCanvas() {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">{label}</p>
      <input
        type="text"
        placeholder="Ad Soyad"
        value={signerName}
        onChange={(e) => {
          setSignerName(e.target.value);
          if (value) onChange({ ...value, signerName: e.target.value });
        }}
        className="h-8 rounded border border-slate-200 px-2 text-sm"
      />
      <div className="relative border border-slate-300 rounded-lg bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          width={300} height={100}
          className="w-full touch-none cursor-crosshair"
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
        />
        <button
          type="button"
          onClick={clearCanvas}
          className="absolute top-1 right-1 flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500 hover:bg-slate-200"
        >
          <X className="h-3 w-3" /> Temizle
        </button>
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50"
      >
        <span className="font-bold text-slate-900">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1 border-t border-slate-100">{children}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const selectCls = `${inputCls} appearance-none`;

// ─── Device search ────────────────────────────────────────────────────────────

function DeviceSearch({ onSelect }: { onSelect: (device: Device) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(q?: string) {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const search = q !== undefined ? q : query;
      const url = search.trim()
        ? `${BASE}/api/warranty/devices?search=${encodeURIComponent(search)}&limit=20`
        : `${BASE}/api/warranty/devices?limit=20`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json() as { items: Device[] };
      setResults(data.items ?? []);
    } catch {
      toast.error("Cihaz araması başarısız");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void handleSearch(""); }, []);


  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Seri no, müşteri veya model ile ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-9 pr-3 h-9 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={() => handleSearch()}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Ara
        </button>
      </div>
      {results.length > 0 && (
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          {results.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => { onSelect(d); setResults([]); }}
              className="flex items-center justify-between w-full px-4 py-3 text-left text-sm hover:bg-blue-50 border-b border-slate-100 last:border-0"
            >
              <div>
                <p className="font-bold text-slate-900">{d.productName} · {d.model}</p>
                <p className="text-slate-500 text-xs">{d.serialNumber} · {d.customerFirm}</p>
              </div>
              <span className="text-blue-600 text-xs font-bold">Seç →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Form Page ───────────────────────────────────────────────────────────

export default function ServisRaporuFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === "yeni";
  const { uploadFile, uploading: uploadingPhoto } = useImageUpload();

  // Core fields
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split("T")[0] ?? "");
  const [serviceTime, setServiceTime] = useState("");
  const [serviceType, setServiceType] = useState("periyodik_bakim");
  const [priority, setPriority] = useState("normal");
  const [status, setStatus] = useState("taslak");
  const [serviceCode, setServiceCode] = useState("");
  const [createdBy, setCreatedBy] = useState("");

  // Hospital info
  const [hospitalName, setHospitalName] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");

  // Device overrides
  const [deviceType, setDeviceType] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [plcSystem, setPlcSystem] = useState("");
  const [hmiModel, setHmiModel] = useState("");
  const [productionDate, setProductionDate] = useState("");
  const [commissionDate, setCommissionDate] = useState("");
  const [warrantyStatus, setWarrantyStatus] = useState("");

  // Alarms
  const [alarms, setAlarms] = useState<Record<string, string>>({});

  // Work hours
  const [pump1Hours, setPump1Hours] = useState("");
  const [pump2Hours, setPump2Hours] = useState("");
  const [pump3Hours, setPump3Hours] = useState("");
  const [pump4Hours, setPump4Hours] = useState("");
  const [totalWorkHours, setTotalWorkHours] = useState("");
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState("");
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState("");
  const [maintenancePeriod, setMaintenancePeriod] = useState("");

  // Vacuum test
  const [workingPressure, setWorkingPressure] = useState("");
  const [minVacuum, setMinVacuum] = useState("");
  const [testDuration, setTestDuration] = useState("");
  const [testResult, setTestResult] = useState("");
  const [testDescription, setTestDescription] = useState("");

  // Operations
  const [operations, setOperations] = useState<string[]>([]);
  const [customOperations, setCustomOperations] = useState<string[]>([]);
  const [newOperation, setNewOperation] = useState("");

  // Notes
  const [notes, setNotes] = useState("");

  // Photos
  const [photos, setPhotos] = useState<Photo[]>([]);

  // Signatures
  const [signatures, setSignatures] = useState<{ personel: Signature | null; sorumlu: Signature | null; yetkili: Signature | null }>({
    personel: null, sorumlu: null, yetkili: null,
  });

  // Parts
  const [parts, setParts] = useState<Part[]>([]);
  const [newPart, setNewPart] = useState<Part>({ partName: "", partCode: "", quantity: "1", condition: "" });

  // Next maintenance
  const [recommendedMaintenanceDate, setRecommendedMaintenanceDate] = useState("");
  const [recommendedMaintenanceType, setRecommendedMaintenanceType] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [maintenanceNote, setMaintenanceNote] = useState("");
  const [maintenanceInterval, setMaintenanceInterval] = useState("");

  // UI state
  const [saving, setSaving] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [reportNo, setReportNo] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailTarget, setEmailTarget] = useState("");
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  // Service code is assigned server-side after first save (reportNo format: OXM-SRV-YYYY-NNNNNN)

  // Auto-calculate total work hours from individual pump values
  useEffect(() => {
    const vals = [pump1Hours, pump2Hours, pump3Hours, pump4Hours]
      .map(v => parseFloat(v.replace(",", ".")))
      .filter(v => !isNaN(v) && v > 0);
    if (vals.length > 0) {
      const sum = vals.reduce((a, b) => a + b, 0);
      setTotalWorkHours(Number.isInteger(sum) ? String(sum) : sum.toFixed(1));
    }
  }, [pump1Hours, pump2Hours, pump3Hours, pump4Hours]);

  // Load existing report
  useEffect(() => {
    if (!isNew) {
      loadReport();
      loadEmailLogs();
    }
  }, [id]);

  async function loadEmailLogs() {
    if (!id) return;
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${BASE}/api/service-reports/${id}/email-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json() as { items: EmailLog[] };
      setEmailLogs(data.items ?? []);
    } catch {
      /* best-effort */
    }
  }

  async function loadReport() {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${BASE}/api/service-reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { toast.error("Rapor bulunamadı"); navigate("/admin/servis-raporlari"); return; }
      const r = await res.json() as Record<string, unknown> & {
        reportNo: string; deviceId: number; serviceDate: string; serviceTime: string | null;
        serviceType: string; priority: string; status: string; serviceCode: string | null;
        createdBy: string | null; reportDataJson: Record<string, unknown>;
        device: Device | null; photos: Photo[]; signatures: Signature[]; parts: Part[];
      };
      setReportNo(r.reportNo);
      setServiceDate(r.serviceDate);
      setServiceTime(r.serviceTime ?? "");
      setServiceType(r.serviceType);
      setPriority(r.priority);
      setStatus(r.status);
      setServiceCode(r.serviceCode ?? "");
      setCreatedBy(r.createdBy ?? "");
      if (r.device) setSelectedDevice(r.device);

      const rd = r.reportDataJson ?? {};
      const s = (k: string) => (rd[k] as string | undefined) ?? "";
      setHospitalName(s("hospitalName")); setDepartment(s("department"));
      setLocation(s("location")); setContactPerson(s("contactPerson"));
      setContact(s("contact")); setEmail(s("email"));
      setDeviceType(s("deviceType")); setDeviceModel(s("deviceModel"));
      setPlcSystem(s("plcSystem")); setHmiModel(s("hmiModel"));
      setProductionDate(s("productionDate")); setCommissionDate(s("commissionDate"));
      setWarrantyStatus(s("warrantyStatus"));
      setAlarms((rd["alarms"] as Record<string, string>) ?? {});
      setPump1Hours(s("pump1Hours")); setPump2Hours(s("pump2Hours")); setPump3Hours(s("pump3Hours")); setPump4Hours(s("pump4Hours"));
      setTotalWorkHours(s("totalWorkHours")); setLastMaintenanceDate(s("lastMaintenanceDate"));
      setNextMaintenanceDate(s("nextMaintenanceDate")); setMaintenancePeriod(s("maintenancePeriod"));
      setWorkingPressure(s("workingPressure")); setMinVacuum(s("minVacuum"));
      setTestDuration(s("testDuration")); setTestResult(s("testResult")); setTestDescription(s("testDescription"));
      setOperations((rd["operations"] as string[]) ?? []);
      setCustomOperations((rd["customOperations"] as string[]) ?? []);
      setNotes(s("notes"));
      setRecommendedMaintenanceDate(s("recommendedMaintenanceDate"));
      setRecommendedMaintenanceType(s("recommendedMaintenanceType"));
      setEstimatedDuration(s("estimatedDuration")); setMaintenanceNote(s("maintenanceNote"));
      setPhotos((r.photos ?? []).map((p) => ({ url: p.url, caption: p.caption ?? "", sortOrder: p.sortOrder ?? 0 })));
      const sigMap: typeof signatures = { personel: null, sorumlu: null, yetkili: null };
      for (const sig of r.signatures ?? []) {
        const role = sig.role as keyof typeof sigMap;
        if (role in sigMap) sigMap[role] = { role: sig.role, signerName: sig.signerName ?? "", imageDataUrl: sig.imageDataUrl };
      }
      setSignatures(sigMap);
      setParts((r.parts ?? []).map((p) => ({
        partName: p.partName ?? "",
        partCode: p.partCode ?? "",
        quantity: p.quantity ?? "1",
        condition: p.condition ?? "",
      })));
    } catch {
      toast.error("Rapor yüklenemedi");
    }
  }

  function buildReportData(): Record<string, unknown> {
    return {
      hospitalName, department, location, contactPerson, contact, email,
      deviceType, deviceModel, plcSystem, hmiModel, productionDate, commissionDate, warrantyStatus,
      alarms,
      pump1Hours, pump2Hours, pump3Hours, pump4Hours, totalWorkHours, lastMaintenanceDate, nextMaintenanceDate, maintenancePeriod,
      workingPressure, minVacuum, testDuration, testResult, testDescription,
      operations, customOperations, notes,
      recommendedMaintenanceDate, recommendedMaintenanceType, estimatedDuration, maintenanceNote,
    };
  }

  function buildPayload(extraStatus?: string) {
    const sigs = Object.values(signatures).filter(Boolean) as Signature[];
    return {
      deviceId: selectedDevice?.id,
      serviceDate, serviceTime: serviceTime || null, serviceType, priority,
      status: extraStatus ?? status,
      serviceCode: serviceCode || null,
      createdBy: createdBy || null,
      reportDataJson: buildReportData(),
      photos: photos.map((p, i) => ({ ...p, sortOrder: i })),
      signatures: sigs,
      parts,
    };
  }

  async function handleSave(saveStatus?: string) {
    if (!selectedDevice) { toast.error("Lütfen bir cihaz seçin"); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const payload = buildPayload(saveStatus);
      let res: Response;
      if (isNew) {
        res = await fetch(`${BASE}/api/service-reports`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${BASE}/api/service-reports/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string; detail?: string };
        throw new Error(body.detail ?? body.error ?? `HTTP ${res.status}`);
      }
      const saved = await res.json() as { id: number; reportNo: string };
      setReportNo(saved.reportNo);
      toast.success(saveStatus === "tamamlandi" ? "Rapor tamamlandı ve kaydedildi" : "Rapor kaydedildi");
      if (isNew) navigate(`/admin/servis-raporlari/${saved.id}`, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  async function handleSendEmail() {
    if (isNew || !id) { toast.error("Lütfen önce raporu kaydedin"); return; }
    const target = emailTarget.trim() || email.trim();
    if (!target) { toast.error("Lütfen bir e-posta adresi girin"); return; }
    setSendingEmail(true);
    toast.info("Rapor PDF olarak oluşturulup gönderiliyor...");
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${BASE}/api/service-reports/${id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: target }),
      });
      const body = await res.json().catch(() => ({})) as { error?: string; detail?: string; success?: boolean };
      if (!res.ok) {
        throw new Error(body.detail ?? body.error ?? `HTTP ${res.status}`);
      }
      toast.success(`Rapor ${target} adresine gönderildi`);
      setShowEmailDialog(false);
      loadEmailLogs();
    } catch (err) {
      toast.error(`Gönderilemedi: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSendingEmail(false);
    }
  }

  async function handleGeneratePdf() {
    if (isNew || !id) { toast.error("Lütfen önce raporu kaydedin"); return; }
    setGeneratingPdf(true);
    toast.info("Sunucuda PDF oluşturuluyor...");
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${BASE}/api/service-reports/${id}/generate-pdf`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string; detail?: string };
        throw new Error(body.detail ?? body.error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const filename = `${reportNo ?? "rapor"}.pdf`;
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF indirildi");
    } catch (err) {
      console.error(err);
      toast.error(`PDF oluşturulamadı: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setGeneratingPdf(false);
    }
  }

  async function handleShowPreview() {
    setPreviewHtml(null);
    setShowPreview(true);
    setPreviewLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const payload = buildTemplateData();
      const res = await fetch(`${BASE}/api/service-reports/preview-html`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      setPreviewHtml(html);
    } catch (err) {
      toast.error(`Önizleme yüklenemedi: ${err instanceof Error ? err.message : String(err)}`);
      setShowPreview(false);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (photos.length + files.length > 4) { toast.error("En fazla 4 fotoğraf yüklenebilir"); return; }
    for (const file of files) {
      try {
        const { publicUrl } = await uploadFile(file);
        setPhotos((p) => [...p, { url: publicUrl, caption: "", sortOrder: p.length }]);
      } catch {
        toast.error(`${file.name} yüklenemedi`);
      }
    }
    e.target.value = "";
  }

  function toggleOperation(op: string) {
    setOperations((prev) => prev.includes(op) ? prev.filter((o) => o !== op) : [...prev, op]);
  }

  function addCustomOperation() {
    if (!newOperation.trim()) return;
    setCustomOperations((p) => [...p, newOperation.trim()]);
    setNewOperation("");
  }

  function buildTemplateData() {
    return {
      reportNo: reportNo ?? `OXM-SRV-${new Date().getFullYear()}-XXXXXX`,
      serviceDate, serviceTime: serviceTime || null,
      serviceType, priority: priority || null, status,
      serviceCode: serviceCode || null, createdBy: createdBy || null,
      device: selectedDevice ? {
        productName: selectedDevice.productName, model: selectedDevice.model,
        serialNumber: selectedDevice.serialNumber, customerFirm: selectedDevice.customerFirm,
        installDate: selectedDevice.installDate, warrantyEndDate: selectedDevice.warrantyEndDate,
        lastMaintenanceDate: selectedDevice.lastMaintenanceDate, nextMaintenanceDate: selectedDevice.nextMaintenanceDate,
        imageUrl: selectedDevice.imageUrl,
      } : { productName: "—", model: "—", serialNumber: "—", customerFirm: "—" },
      reportDataJson: buildReportData(),
      photos: photos.map((p) => ({ url: p.url, caption: p.caption })),
      signatures: Object.values(signatures).filter(Boolean) as Signature[],
      parts: parts.map((p) => ({
        partName: p.partName,
        partCode: p.partCode || null,
        quantity: p.quantity || "1",
        condition: p.condition || null,
      })),
    };
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isNew ? "Yeni Servis Raporu" : `Rapor: ${reportNo ?? "..."}`}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Servis raporu bilgilerini doldurun</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleShowPreview()}
            disabled={previewLoading}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {previewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />} Önizle
          </button>
          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={generatingPdf || isNew}
            title={isNew ? "Önce kaydedin" : ""}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            {generatingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4 text-red-500" />}
            PDF Oluştur
          </button>
          <button
            type="button"
            onClick={() => { setEmailTarget(email); setShowEmailDialog(true); }}
            disabled={isNew}
            title={isNew ? "Önce kaydedin" : ""}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <Mail className="h-4 w-4 text-blue-500" />
            E-posta ile Gönder
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Kaydet (Taslak)
          </button>
          <button
            type="button"
            onClick={() => handleSave("tamamlandi")}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Servis Geçmişine Kaydet
          </button>
        </div>
      </div>

      {/* Email dialog */}
      {showEmailDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Raporu E-posta ile Gönder</h2>
                  <p className="text-xs text-slate-500">PDF eki olarak gönderilecek</p>
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
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                  Alıcı E-posta Adresi
                </label>
                <input
                  type="email"
                  value={emailTarget}
                  onChange={(e) => setEmailTarget(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
                  placeholder="ornek@hastane.com"
                  autoFocus
                  className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {email && emailTarget !== email && (
                  <button
                    type="button"
                    onClick={() => setEmailTarget(email)}
                    className="mt-1.5 text-xs text-blue-600 hover:underline"
                  >
                    Rapordaki adresi kullan: {email}
                  </button>
                )}
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-500 space-y-1">
                <p><span className="font-bold text-slate-700">Rapor No:</span> {reportNo ?? "—"}</p>
                <p><span className="font-bold text-slate-700">Tarih:</span> {serviceDate}</p>
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
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

      {/* Preview modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black/60 py-8">
          <div className="mx-auto max-w-[210mm]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-white">PDF Önizleme</span>
              <button
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow hover:bg-slate-50"
              >
                <X className="h-4 w-4" /> Kapat
              </button>
            </div>
            {previewLoading ? (
              <div className="flex items-center justify-center h-[297mm] bg-white rounded shadow">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                title="PDF Önizleme"
                style={{ width: "210mm", height: "297mm", border: "none", display: "block", borderRadius: "2px", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
                sandbox="allow-same-origin"
              />
            ) : null}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* 1. Device selection */}
        <Section title="1. Cihaz Seçimi">
          {selectedDevice ? (
            <div className="flex items-start justify-between rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div>
                <p className="font-bold text-slate-900">{selectedDevice.productName} · {selectedDevice.model}</p>
                <p className="text-sm text-slate-500 mt-0.5">Seri No: {selectedDevice.serialNumber} · {selectedDevice.customerFirm}</p>
                {selectedDevice.warrantyEndDate && <p className="text-xs text-slate-400 mt-0.5">Garanti Bitiş: {selectedDevice.warrantyEndDate}</p>}
              </div>
              <button type="button" onClick={() => setSelectedDevice(null)} className="text-slate-400 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <DeviceSearch onSelect={(d) => {
              void (async (d) => {
              setSelectedDevice(d);
              setHospitalName(d.customerFirm);
              if (d.customerDepartment) setDepartment(d.customerDepartment);
              if (d.customerLocation)   setLocation(d.customerLocation);
              if (d.customerContact)    setContactPerson(d.customerContact);
              if (d.customerPhone)      setContact(d.customerPhone);
              if (d.customerEmail)      setEmail(d.customerEmail);
              setDeviceType(d.deviceType || d.productName);
              setDeviceModel(d.model);
              setPlcSystem(d.plcSystem ?? "");
              setHmiModel(d.hmiModel ?? "");
              setProductionDate(d.productionDate ?? "");
              setCommissionDate(d.installDate ?? "");
              // Son bakım: o cihazın son servis raporunun tarihi
              try {
                const token = localStorage.getItem("admin_token");
                const res = await fetch(`${BASE}/api/service-reports?deviceId=${d.id}&limit=1`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                  const rData = await res.json() as { items: Array<{ data?: Record<string, unknown> }> };
                  const lastDate = rData.items?.[0]?.data?.serviceDate as string | undefined;
                  setLastMaintenanceDate(lastDate ?? d.lastMaintenanceDate ?? "");
                } else {
                  setLastMaintenanceDate(d.lastMaintenanceDate ?? "");
                }
              } catch {
                setLastMaintenanceDate(d.lastMaintenanceDate ?? "");
              }
            })(d);
            }} />
          )}
        </Section>

        {/* 2. Service header */}
        <Section title="2. Servis Üst Bilgileri">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            <Field label="Servis Tarihi">
              <input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Servis Saati">
              <input type="time" value={serviceTime} onChange={(e) => setServiceTime(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Servis Türü">
              <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className={selectCls}>
                {SERVICE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Müdahale Önceliği">
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectCls}>
                {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Field>
            <Field label="İşlem Durumu">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
                <option value="taslak">Taslak</option>
                <option value="tamamlandi">Tamamlandı</option>
                <option value="iptal">İptal</option>
              </select>
            </Field>
            <Field label="Servis Personeli">
              <input type="text" value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} placeholder="Ad Soyad" className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* 3. Hospital info */}
        <Section title="3. Hastane / Proje Bilgileri">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <Field label="Hastane Adı"><input type="text" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} className={inputCls} /></Field>
            <Field label="Bölüm"><input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className={inputCls} /></Field>
            <Field label="Lokasyon"><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} /></Field>
            <Field label="Sorumlu Kişi"><input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className={inputCls} /></Field>
            <Field label="İletişim / Tel"><input type="text" value={contact} onChange={(e) => setContact(e.target.value)} className={inputCls} /></Field>
            <Field label="E-posta"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></Field>
          </div>
        </Section>

        {/* 4. Device details */}
        <Section title="4. Cihaz Bilgileri">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            <Field label="Cihaz Türü"><input type="text" value={deviceType} onChange={(e) => setDeviceType(e.target.value)} className={inputCls} /></Field>
            <Field label="Model"><input type="text" value={deviceModel} onChange={(e) => setDeviceModel(e.target.value)} className={inputCls} /></Field>
            <Field label="PLC Sistemi"><input type="text" value={plcSystem} onChange={(e) => setPlcSystem(e.target.value)} className={inputCls} /></Field>
            <Field label="HMI Modeli"><input type="text" value={hmiModel} onChange={(e) => setHmiModel(e.target.value)} className={inputCls} /></Field>
            <Field label="Üretim Tarihi"><input type="text" value={productionDate} onChange={(e) => setProductionDate(e.target.value)} className={inputCls} placeholder="15.03.2024" /></Field>
            <Field label="Devreye Alma"><input type="text" value={commissionDate} onChange={(e) => setCommissionDate(e.target.value)} className={inputCls} /></Field>
            <Field label="Garanti Durumu"><input type="text" value={warrantyStatus} onChange={(e) => setWarrantyStatus(e.target.value)} className={inputCls} placeholder="Devam ediyor / Bitti" /></Field>
          </div>
        </Section>

        {/* 5. Alarms */}
        <Section title="5. Alarm & Arıza Bilgileri">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {ALARM_KEYS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <label className="flex-1 text-sm font-medium text-slate-700">{label}</label>
                <select
                  value={alarms[key] ?? "yok"}
                  onChange={(e) => setAlarms((p) => ({ ...p, [key]: e.target.value }))}
                  className="h-8 w-40 rounded-lg border border-slate-200 bg-white px-2 text-sm"
                >
                  {ALARM_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            ))}
          </div>
        </Section>

        {/* 6. Work hours */}
        <Section title="6. Çalışma Saatleri" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            <Field label="Pompa 1 (saat)"><input type="text" value={pump1Hours} onChange={(e) => setPump1Hours(e.target.value)} className={inputCls} placeholder="1250" /></Field>
            <Field label="Pompa 2 (saat)"><input type="text" value={pump2Hours} onChange={(e) => setPump2Hours(e.target.value)} className={inputCls} /></Field>
            <Field label="Pompa 3 (saat)"><input type="text" value={pump3Hours} onChange={(e) => setPump3Hours(e.target.value)} className={inputCls} /></Field>
            <Field label="Pompa 4 (saat)"><input type="text" value={pump4Hours} onChange={(e) => setPump4Hours(e.target.value)} className={inputCls} /></Field>
            <Field label="Toplam Çalışma">
              <input type="text" value={totalWorkHours} readOnly className={`${inputCls} bg-slate-50 text-slate-500 cursor-default`} placeholder="Otomatik hesaplanır" />
            </Field>
            <Field label="Son Bakım Tarihi"><input type="text" value={lastMaintenanceDate} onChange={(e) => setLastMaintenanceDate(e.target.value)} className={`${inputCls} bg-slate-50`} placeholder="Cihaz seçince otomatik dolar" /></Field>
            <Field label="Bakım Periyodu"><input type="text" value={maintenancePeriod} onChange={(e) => setMaintenancePeriod(e.target.value)} className={inputCls} placeholder="6 ay / 500 saat" /></Field>
          </div>
        </Section>

        {/* 7. Vacuum test */}
        <Section title="7. Vakum Performans Testi" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <Field label="Çalışma Basıncı"><input type="text" value={workingPressure} onChange={(e) => setWorkingPressure(e.target.value)} className={inputCls} placeholder="-600 mbar" /></Field>
            <Field label="Minimum Vakum"><input type="text" value={minVacuum} onChange={(e) => setMinVacuum(e.target.value)} className={inputCls} /></Field>
            <Field label="Test Süresi"><input type="text" value={testDuration} onChange={(e) => setTestDuration(e.target.value)} className={inputCls} placeholder="30 dk" /></Field>
            <Field label="Test Sonucu">
              <select value={testResult} onChange={(e) => setTestResult(e.target.value)} className={selectCls}>
                <option value="">—</option>
                <option value="Başarılı">Başarılı</option>
                <option value="Başarısız">Başarısız</option>
                <option value="Koşullu Başarılı">Koşullu Başarılı</option>
              </select>
            </Field>
            <Field label="Açıklama">
              <input type="text" value={testDescription} onChange={(e) => setTestDescription(e.target.value)} className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* 8. Operations */}
        <Section title="8. Yapılan İşlemler">
          <div className="grid gap-2 md:grid-cols-2">
            {[...DEFAULT_OPERATIONS, ...customOperations].map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => toggleOperation(op)}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition ${
                  operations.includes(op)
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {operations.includes(op)
                  ? <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                  : <Square className="h-4 w-4 text-slate-300 shrink-0" />}
                {op}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={newOperation}
              onChange={(e) => setNewOperation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomOperation()}
              placeholder="Yeni işlem ekle..."
              className="flex-1 h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="button" onClick={addCustomOperation} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              <Plus className="h-4 w-4" /> Ekle
            </button>
          </div>
        </Section>

        {/* 9. Parts */}
        <Section title="9. Değiştirilen / Kullanılan Parçalar" defaultOpen={false}>
          {parts.length > 0 && (
            <div className="mb-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wide">
                    <th className="px-3 py-2 text-left border border-slate-200">Parça Adı</th>
                    <th className="px-3 py-2 text-left border border-slate-200">Parça Kodu</th>
                    <th className="px-3 py-2 text-left border border-slate-200">Adet</th>
                    <th className="px-3 py-2 text-left border border-slate-200">Durum</th>
                    <th className="px-3 py-2 border border-slate-200 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {parts.map((part, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 border border-slate-200">
                        <input
                          type="text"
                          value={part.partName}
                          onChange={(e) => setParts((p) => p.map((r, j) => j === i ? { ...r, partName: e.target.value } : r))}
                          className="w-full h-8 rounded border border-slate-200 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </td>
                      <td className="px-3 py-2 border border-slate-200">
                        <input
                          type="text"
                          value={part.partCode}
                          onChange={(e) => setParts((p) => p.map((r, j) => j === i ? { ...r, partCode: e.target.value } : r))}
                          className="w-full h-8 rounded border border-slate-200 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                          placeholder="OXM-…"
                        />
                      </td>
                      <td className="px-3 py-2 border border-slate-200 w-24">
                        <input
                          type="text"
                          value={part.quantity}
                          onChange={(e) => setParts((p) => p.map((r, j) => j === i ? { ...r, quantity: e.target.value } : r))}
                          className="w-full h-8 rounded border border-slate-200 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                          placeholder="1"
                        />
                      </td>
                      <td className="px-3 py-2 border border-slate-200">
                        <select
                          value={part.condition}
                          onChange={(e) => setParts((p) => p.map((r, j) => j === i ? { ...r, condition: e.target.value } : r))}
                          className="w-full h-8 rounded border border-slate-200 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        >
                          <option value="">—</option>
                          <option value="Yeni">Yeni</option>
                          <option value="Yeniden Kullanılan">Yeniden Kullanılan</option>
                          <option value="Revize">Revize</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 border border-slate-200 text-center">
                        <button
                          type="button"
                          onClick={() => setParts((p) => p.filter((_, j) => j !== i))}
                          className="flex items-center justify-center h-7 w-7 rounded bg-red-50 text-red-500 hover:bg-red-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {parts.length === 0 && (
            <p className="text-sm text-slate-400 italic mb-3">Henüz parça eklenmedi.</p>
          )}
          <div className="flex flex-wrap gap-2 items-end border-t border-slate-100 pt-3">
            <div className="flex flex-col gap-1 flex-1 min-w-32">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Parça Adı *</label>
              <input
                type="text"
                value={newPart.partName}
                onChange={(e) => setNewPart((p) => ({ ...p, partName: e.target.value }))}
                placeholder="Yağ filtresi..."
                className="h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col gap-1 w-32">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Kod</label>
              <input
                type="text"
                value={newPart.partCode}
                onChange={(e) => setNewPart((p) => ({ ...p, partCode: e.target.value }))}
                placeholder="OXM-001"
                className="h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col gap-1 w-20">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Adet</label>
              <input
                type="text"
                value={newPart.quantity}
                onChange={(e) => setNewPart((p) => ({ ...p, quantity: e.target.value }))}
                placeholder="1"
                className="h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col gap-1 w-40">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Durum</label>
              <select
                value={newPart.condition}
                onChange={(e) => setNewPart((p) => ({ ...p, condition: e.target.value }))}
                className="h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">—</option>
                <option value="Yeni">Yeni</option>
                <option value="Yeniden Kullanılan">Yeniden Kullanılan</option>
                <option value="Revize">Revize</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!newPart.partName.trim()) { toast.error("Parça adı zorunludur"); return; }
                setParts((p) => [...p, { ...newPart }]);
                setNewPart({ partName: "", partCode: "", quantity: "1", condition: "" });
              }}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 h-9 text-sm font-semibold text-white hover:bg-slate-700 shrink-0"
            >
              <Plus className="h-4 w-4" /> Ekle
            </button>
          </div>
        </Section>

        {/* 10. Notes */}
        <Section title="10. Açıklama / Notlar" defaultOpen={false}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Servis notları, gözlemler, öneriler..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </Section>

        {/* 11. Photos */}
        <Section title="11. Servis Fotoğrafları">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {photos.map((photo, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden border border-slate-200">
                <img src={photo.url} alt={`Fotoğraf ${i + 1}`} className="w-full h-32 object-cover" />
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Fotoğraf başlığı..."
                    value={photo.caption}
                    onChange={(e) => setPhotos((p) => p.map((ph, j) => j === i ? { ...ph, caption: e.target.value } : ph))}
                    className="w-full text-xs rounded border border-slate-200 px-2 py-1 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {photos.length < 4 && (
              <label className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:bg-slate-100">
                {uploadingPhoto ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : <Camera className="h-6 w-6 text-slate-300" />}
                <span className="mt-1 text-xs text-slate-400">Fotoğraf Ekle</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">Maksimum 4 fotoğraf · {photos.length}/4 yüklendi</p>
        </Section>

        {/* 12. Signatures */}
        <Section title="12. İmza ve Onay">
          <div className="grid gap-6 md:grid-cols-3">
            {(["personel", "sorumlu", "yetkili"] as const).map((role) => (
              <SignatureCanvas
                key={role}
                role={role}
                label={role === "personel" ? "Servis Personeli" : role === "sorumlu" ? "Teknik Sorumlu" : "Hastane Yetkilisi"}
                value={signatures[role]}
                onChange={(sig) => setSignatures((p) => ({ ...p, [role]: sig }))}
              />
            ))}
          </div>
        </Section>

        {/* 13. Next maintenance */}
        <Section title="13. Sonraki Bakım Planlaması" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <Field label="Süre Seçimi">
              <select
                value={maintenanceInterval}
                onChange={(e) => {
                  const val = e.target.value;
                  setMaintenanceInterval(val);
                  if (val) {
                    const days = MAINTENANCE_INTERVALS.find(i => i.label === val)?.days ?? 0;
                    const base = serviceDate ? new Date(serviceDate + "T00:00:00") : new Date();
                    const result = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
                    const d = String(result.getDate()).padStart(2, "0");
                    const m = String(result.getMonth() + 1).padStart(2, "0");
                    setRecommendedMaintenanceDate(`${d}.${m}.${result.getFullYear()}`);
                  }
                }}
                className={selectCls}
              >
                <option value="">— Süre Seçin —</option>
                {MAINTENANCE_INTERVALS.map((i) => <option key={i.label} value={i.label}>{i.label}</option>)}
              </select>
            </Field>
            <Field label="Önerilen Bakım Tarihi">
              <input type="text" value={recommendedMaintenanceDate} onChange={(e) => setRecommendedMaintenanceDate(e.target.value)} className={inputCls} placeholder="01.06.2025" />
            </Field>
            <Field label="Bakım Türü">
              <select value={recommendedMaintenanceType} onChange={(e) => setRecommendedMaintenanceType(e.target.value)} className={selectCls}>
                <option value="">—</option>
                {SERVICE_TYPES.map((t) => <option key={t.value} value={t.label}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Tahmini Süre"><input type="text" value={estimatedDuration} onChange={(e) => setEstimatedDuration(e.target.value)} className={inputCls} placeholder="2 saat" /></Field>
            <Field label="Not">
              <input type="text" value={maintenanceNote} onChange={(e) => setMaintenanceNote(e.target.value)} className={inputCls} />
            </Field>
          </div>
        </Section>
      </div>

      {/* Email send history */}
      {!isNew && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5 bg-slate-50">
            <Mail className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-700">Gönderim Geçmişi</h3>
            {emailLogs.length > 0 && (
              <span className="ml-auto text-xs text-slate-400">{emailLogs.length} kayıt</span>
            )}
          </div>
          {emailLogs.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-400 italic">Henüz e-posta gönderilmedi.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {emailLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between px-5 py-3 gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{log.sentTo}</p>
                    {log.sentBy && (
                      <p className="text-xs text-slate-400 mt-0.5">Gönderen: {log.sentBy}</p>
                    )}
                    {log.status === "failed" && log.errorMessage && (
                      <p className="text-xs text-red-500 mt-0.5 truncate" title={log.errorMessage}>Hata: {log.errorMessage}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${log.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                      {log.status === "success" ? "Başarılı" : "Başarısız"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(log.sentAt).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom action bar */}
      <div className="mt-6 flex flex-wrap justify-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Eye className="h-4 w-4" /> Önizle
        </button>
        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Kaydet (Taslak)
        </button>
        <button
          type="button"
          onClick={() => handleSave("tamamlandi")}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Servis Geçmişine Kaydet
        </button>
      </div>
    </div>
  );
}
