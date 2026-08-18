import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./DeviceQrPage.css";
import {
  useGetWarrantyDeviceByQr,
  useCreateWarrantyClaim,
} from "@workspace/api-client-react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  User,
} from "lucide-react";
import { toast } from "sonner";

// ─── Status config ─────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  aktif_garanti:     "Aktif Garanti",
  yakin_bitis:       "Yakında Bitecek",
  garanti_disi:      "Garanti Dışı",
  bakim_riskli:      "Bakım Gerekiyor",
  yetkisiz_askida:   "Askıda",
  uzatilmis_garanti: "Uzatılmış Garanti",
  bakim_anlasmasi:   "Bakım Anlaşması",
  talep_incelemede:  "Talep İncelemede",
  talep_onaylandi:   "Talep Onaylandı",
  talep_reddedildi:  "Talep Reddedildi",
};

type StatusTone = "green" | "amber" | "red" | "blue" | "default";
function statusTone(s: string): StatusTone {
  if (["aktif_garanti", "uzatilmis_garanti", "bakim_anlasmasi", "talep_onaylandi"].includes(s)) return "green";
  if (["yakin_bitis", "talep_incelemede"].includes(s)) return "amber";
  if (["garanti_disi", "talep_reddedildi"].includes(s)) return "red";
  if (["bakim_riskli"].includes(s)) return "blue";
  return "default";
}

const toneCls: Record<StatusTone, { badge: string; ring: string; icon: typeof ShieldCheck }> = {
  green:   { badge: "bg-emerald-50 text-emerald-700 ring-emerald-300", ring: "border-emerald-200", icon: ShieldCheck  },
  amber:   { badge: "bg-amber-50 text-amber-700 ring-amber-300",       ring: "border-amber-200",   icon: AlertCircle  },
  red:     { badge: "bg-red-50 text-red-700 ring-red-300",             ring: "border-red-200",     icon: ShieldAlert  },
  blue:    { badge: "bg-blue-50 text-blue-700 ring-blue-300",          ring: "border-blue-200",    icon: Wrench       },
  default: { badge: "bg-slate-100 text-slate-600 ring-slate-300",      ring: "border-slate-200",   icon: Settings     },
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  periyodik_bakim:   "Periyodik Bakım",
  ariza_mudahalesi:  "Arıza Müdahalesi",
  yedek_parca:       "Yedek Parça",
  genel_kontrol:     "Genel Kontrol",
  devreye_alma:      "Devreye Alma",
  garanti_servisi:   "Garanti Servisi",
};

const FAULT_TYPES = [
  "Arıza / Çalışmıyor",
  "Bakım Talebi",
  "Yedek Parça Talebi",
  "Performans Düşüklüğü",
  "Garanti Talebi",
  "Diğer",
];

// ─── Service request form ──────────────────────────────────────────────────

function ClaimForm({ deviceId }: { deviceId: number }) {
  const [form, setForm] = useState({
    claimantName: "",
    claimantPhone: "",
    claimantEmail: "",
    claimantFirm: "",
    faultType: "",
    faultDescription: "",
    kvkk: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const createClaim = useCreateWarrantyClaim({
    mutation: {
      onSuccess: () => {
        toast.success("Talebiniz alındı! En kısa sürede iletişime geçeceğiz.");
        setSubmitted(true);
      },
      onError: () => toast.error("Talep oluşturulamadı, lütfen tekrar deneyin."),
    },
  });

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <p className="text-base font-bold text-slate-900">Talebiniz Alındı!</p>
        <p className="text-sm text-slate-500">Servis ekibimiz en kısa sürede sizinle iletişime geçecektir.</p>
      </div>
    );
  }

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.claimantName || !form.faultType || !form.faultDescription || !form.kvkk) {
      toast.error("Lütfen zorunlu alanları doldurun ve KVKK onayını verin.");
      return;
    }
    createClaim.mutate({
      id: deviceId,
      data: {
        claimantName: form.claimantName,
        claimantPhone: form.claimantPhone,
        claimantEmail: form.claimantEmail,
        faultType: form.faultType,
        faultDescription: `${form.faultDescription}${form.claimantFirm ? `\nKurum: ${form.claimantFirm}` : ""}`,
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="qr-label">Ad Soyad *</label>
        <div className="qr-input-wrap">
          <User className="qr-input-icon" size={15} />
          <input className="qr-input qr-input--icon" type="text" placeholder="Adınız Soyadınız" value={form.claimantName} onChange={set("claimantName")} required />
        </div>
      </div>
      <div>
        <label className="qr-label">Telefon</label>
        <div className="qr-input-wrap">
          <Phone className="qr-input-icon" size={15} />
          <input className="qr-input qr-input--icon" type="tel" placeholder="5XX XXX XX XX" value={form.claimantPhone} onChange={set("claimantPhone")} />
        </div>
      </div>
      <div>
        <label className="qr-label">E-posta</label>
        <div className="qr-input-wrap">
          <Mail className="qr-input-icon" size={15} />
          <input className="qr-input qr-input--icon" type="email" placeholder="ornek@email.com" value={form.claimantEmail} onChange={set("claimantEmail")} />
        </div>
      </div>
      <div>
        <label className="qr-label">Hastane / Kurum Adı</label>
        <div className="qr-input-wrap">
          <MapPin className="qr-input-icon" size={15} />
          <input className="qr-input qr-input--icon" type="text" placeholder="Kurum adı" value={form.claimantFirm} onChange={set("claimantFirm")} />
        </div>
      </div>
      <div>
        <label className="qr-label">Talep Türü *</label>
        <select className="qr-input" value={form.faultType} onChange={set("faultType")} required>
          <option value="">Talep türünü seçiniz</option>
          {FAULT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="qr-label">Açıklama *</label>
        <textarea className="qr-input" rows={3} placeholder="Kısa açıklama giriniz..." value={form.faultDescription} onChange={set("faultDescription")} required />
      </div>
      <label className="flex items-start gap-2.5 text-xs text-slate-500">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 accent-oxynavy-600"
          checked={form.kvkk}
          onChange={(e) => setForm((p) => ({ ...p, kvkk: e.target.checked }))}
          required
        />
        KVKK Aydınlatma Metni'ni okudum, onaylıyorum.
      </label>
      <button
        type="submit"
        className="w-full rounded-xl bg-gradient-to-b from-oxynavy-700 to-oxynavy-900 py-3.5 text-sm font-black tracking-wide text-white shadow-md active:opacity-90 disabled:opacity-60"
        disabled={createClaim.isPending}
      >
        {createClaim.isPending ? "Gönderiliyor…" : "Talep Oluştur"}
      </button>
    </form>
  );
}

// ─── Not found / error ─────────────────────────────────────────────────────

function QrNotFound() {
  return (
    <div className="qr-page">
      <header className="qr-header">
        <img src="/assets/oxymedlogobeyaz.webp" alt="Oxymed Medikal" className="h-8 w-auto" />
      </header>
      <main className="qr-main">
        <div className="qr-not-found">
          <QrCode className="h-14 w-14 text-slate-300" />
          <h2 className="mt-4 text-lg font-bold text-slate-800">Cihaz Bulunamadı</h2>
          <p className="mt-2 text-sm text-slate-500 text-center max-w-xs">
            Bu QR koda ait kayıtlı cihaz bilgisi bulunamadı. Lütfen teknik destek hattımızı arayın.
          </p>
          <a href="tel:+902322832020" className="mt-6 flex items-center gap-2 rounded-full bg-oxynavy-700 px-6 py-3 text-sm font-bold text-white shadow">
            <Phone className="h-4 w-4" /> Teknik Destek
          </a>
        </div>
      </main>
    </div>
  );
}

// ─── Main device card ──────────────────────────────────────────────────────

function DeviceQrCard({ device }: {
  device: {
    id: number;
    productName: string;
    model: string;
    serialNumber: string;
    installDate?: string | null;
    warrantyStartDate?: string | null;
    warrantyEndDate?: string | null;
    lastMaintenanceDate?: string | null;
    nextMaintenanceDate?: string | null;
    status: string;
    customerFirm?: string | null;
    imageUrl?: string | null;
    serviceRecords?: Array<{
      id: number;
      serviceDate: string;
      serviceType: string;
      servicePersonnel?: string | null;
    }> | null;
  };
}) {
  const [showForm, setShowForm] = useState(false);
  const tone = statusTone(device.status);
  const cfg = toneCls[tone];
  const StatusIcon = cfg.icon;
  const records = device.serviceRecords ?? [];

  function fmt(d?: string | null) {
    if (!d) return null;
    try {
      return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
    } catch {
      return d;
    }
  }

  const infoRows: [string, string | null][] = [
    ["Ürün",           device.productName],
    ["Model",          device.model],
    ["Seri No",        device.serialNumber],
    ["Kurum",          device.customerFirm ?? null],
    ["Kurulum",        fmt(device.installDate)],
    ["Garanti Başlangıç", fmt(device.warrantyStartDate)],
    ["Garanti Bitiş",  fmt(device.warrantyEndDate)],
    ["Son Bakım",      fmt(device.lastMaintenanceDate)],
    ["Sonraki Bakım",  fmt(device.nextMaintenanceDate)],
  ].filter(([, v]) => v != null) as [string, string][];

  return (
    <div className="qr-page">
      <header className="qr-header">
        <img src="/assets/oxymedlogobeyaz.webp" alt="Oxymed Medikal" className="h-8 w-auto" />
        <span className="qr-header__label">Garanti &amp; Servis</span>
      </header>

      <main className="qr-main">
        {/* Status banner */}
        <div className={`qr-status-banner ${cfg.ring}`}>
          <StatusIcon className="qr-status-banner__icon" size={22} />
          <div>
            <p className="qr-status-banner__label">Garanti Durumu</p>
            <p className={`qr-status-banner__badge ${cfg.badge}`}>
              {STATUS_LABELS[device.status] ?? device.status}
            </p>
          </div>
        </div>

        {/* Device image */}
        <div className="qr-image-wrap">
          <img
            src={device.imageUrl ?? "/assets/images/product-medical-gas.png"}
            alt={device.productName}
            className="qr-device-image"
          />
        </div>

        {/* Device info card */}
        <div className="qr-card">
          <h2 className="qr-card__title">Cihaz Bilgileri</h2>
          <dl className="qr-dl">
            {infoRows.map(([label, value]) => (
              <div key={label} className="qr-dl__row">
                <dt className="qr-dl__dt">{label}</dt>
                <dd className="qr-dl__dd">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Service history */}
        {records.length > 0 && (
          <div className="qr-card">
            <h2 className="qr-card__title">
              Servis Geçmişi
              <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-black text-blue-600">{records.length}</span>
            </h2>
            <div className="mt-3 space-y-2">
              {records.slice(0, 5).map((r) => (
                <div key={r.id} className="qr-record">
                  <span className="qr-record__type">{SERVICE_TYPE_LABELS[r.serviceType] ?? r.serviceType}</span>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <CalendarClock size={12} />
                    <span>{fmt(r.serviceDate)}</span>
                  </div>
                  {r.servicePersonnel && (
                    <p className="mt-0.5 text-xs text-slate-400">{r.servicePersonnel}</p>
                  )}
                </div>
              ))}
              {records.length > 5 && (
                <p className="text-center text-xs text-slate-400">+{records.length - 5} daha</p>
              )}
            </div>
          </div>
        )}

        {/* Service request */}
        <div className="qr-card">
          <button
            className="flex w-full items-center justify-between"
            onClick={() => setShowForm((p) => !p)}
          >
            <div>
              <h2 className="qr-card__title text-left">Servis / Garanti Talebi</h2>
              <p className="mt-0.5 text-xs text-slate-500">Talebinizi buradan iletebilirsiniz.</p>
            </div>
            {showForm
              ? <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" />
              : <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />}
          </button>

          {showForm && (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <ClaimForm deviceId={device.id} />
            </div>
          )}
        </div>

        {/* Contact strip */}
        <div className="qr-contact">
          <a href="tel:+902322832020" className="qr-contact__btn">
            <Phone size={16} /> <span>+90 232 283 20 20</span>
          </a>
          <a href="mailto:info@oxymedmedical.com" className="qr-contact__btn">
            <Mail size={16} /> <span>info@oxymedmedical.com</span>
          </a>
        </div>
      </main>

      <footer className="qr-footer">
        <p>© {new Date().getFullYear()} Oxymed Medikal Gaz Sistemleri San. ve Tic. A.Ş.</p>
        <Link to="/servis" className="text-blue-600 hover:underline">Seri numarası ile sorgula</Link>
      </footer>
    </div>
  );
}

// ─── Loading skeleton ──────────────────────────────────────────────────────

function QrSkeleton() {
  return (
    <div className="qr-page">
      <header className="qr-header">
        <img src="/assets/oxymedlogobeyaz.webp" alt="Oxymed Medikal" className="h-8 w-auto" />
      </header>
      <main className="qr-main">
        <div className="animate-pulse space-y-4">
          <div className="h-16 rounded-xl bg-slate-200" />
          <div className="h-44 rounded-xl bg-slate-200" />
          <div className="h-64 rounded-xl bg-slate-200" />
        </div>
      </main>
    </div>
  );
}

// ─── Page root ─────────────────────────────────────────────────────────────

export default function DeviceQrPage() {
  const { qrToken } = useParams<{ qrToken: string }>();
  const { data, isLoading, error } = useGetWarrantyDeviceByQr(qrToken ?? "");

  if (isLoading) return <QrSkeleton />;
  if (error || !data || !qrToken) return <QrNotFound />;
  return <DeviceQrCard device={data} />;
}
