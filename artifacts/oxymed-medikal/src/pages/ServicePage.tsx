import { useState, useEffect, useRef } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Headphones,
  Info,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import {
  useGetWarrantyDeviceBySerial,
  useGetWarrantyDeviceByQr,
  useCreateWarrantyClaim,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import "./ServicePage.css";

// ─── Static content ───────────────────────────────────────────────────────────

const benefits = [
  { icon: Headphones, title: "Uzman Destek",        text: "Deneyimli teknik ekibimiz her zaman yanınızda." },
  { icon: Clock3,     title: "Hızlı Müdahale",      text: "Talebiniz sonrası en kısa sürede müdahale ediyoruz." },
  { icon: Settings,   title: "Orijinal Yedek Parça", text: "Tüm müdahalelerde orijinal parça kullanıyoruz." },
  { icon: ShieldCheck, title: "Güvenli & Garantili", text: "İşlemler garanti kapsamında güvence altındadır." },
];

const FAULT_TYPES = ["Arıza / Çalışmıyor", "Bakım Talebi", "Yedek Parça Talebi", "Performans Düşüklüğü", "Garanti Talebi", "Diğer"];

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

const STATUS_ACTIVE = new Set(["aktif_garanti", "yakin_bitis", "uzatilmis_garanti", "bakim_anlasmasi"]);

// ─── Service request form ──────────────────────────────────────────────────────

function ServiceRequestForm({ deviceId, prefillSerial }: { deviceId?: number; prefillSerial?: string }) {
  const [form, setForm] = useState({
    claimantName: "", claimantPhone: "", claimantEmail: "",
    claimantFirm: "", claimantCity: "",
    faultType: "", faultDescription: "", kvkk: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const createClaim = useCreateWarrantyClaim({
    mutation: {
      onSuccess: () => {
        toast.success("Garanti talebiniz iletildi! En kısa sürede sizinle iletişime geçeceğiz.");
        setSubmitted(true);
      },
      onError: () => toast.error("Talep oluşturulamadı, lütfen tekrar deneyin."),
    },
  });

  if (submitted) {
    return (
      <div className="service-request-success">
        <CheckCircle2 size={44} className="service-success-icon" />
        <h3>Talebiniz Alındı!</h3>
        <p>Servis ekibimiz en kısa sürede sizinle iletişime geçecektir.</p>
      </div>
    );
  }

  function handleSubmit() {
    if (!form.claimantName || !form.faultType || !form.faultDescription || !form.kvkk) {
      toast.error("Lütfen zorunlu alanları doldurun ve KVKK onayını verin.");
      return;
    }
    if (deviceId) {
      createClaim.mutate({
        id: deviceId,
        data: {
          claimantName: form.claimantName,
          claimantPhone: form.claimantPhone,
          claimantEmail: form.claimantEmail,
          faultType: form.faultType,
          faultDescription: `${form.faultDescription}${form.claimantFirm ? `\nKurum: ${form.claimantFirm}` : ""}${form.claimantCity ? ` / ${form.claimantCity}` : ""}`,
        },
      });
    } else {
      toast.error("Lütfen önce cihazı sorgulayın.");
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <label>
        <span>Ad Soyad *</span>
        <div><User size={15} /><input type="text" placeholder="Adınız Soyadınız" value={form.claimantName} onChange={set("claimantName")} required /></div>
      </label>
      <label>
        <span>Telefon</span>
        <div><Phone size={15} /><input type="tel" placeholder="5XX XXX XX XX" value={form.claimantPhone} onChange={set("claimantPhone")} /></div>
      </label>
      <label>
        <span>E-posta</span>
        <div><Mail size={15} /><input type="email" placeholder="ornek@email.com" value={form.claimantEmail} onChange={set("claimantEmail")} /></div>
      </label>
      <label>
        <span>Hastane / Kurum Adı</span>
        <div><MapPin size={15} /><input type="text" placeholder="Kurum adı" value={form.claimantFirm} onChange={set("claimantFirm")} /></div>
      </label>
      <label>
        <span>Bulunduğunuz Şehir</span>
        <select value={form.claimantCity} onChange={set("claimantCity")}>
          <option value="">Şehir seçiniz</option>
          <option>Ankara</option><option>İstanbul</option><option>İzmir</option>
          <option>Bursa</option><option>Antalya</option><option>Konya</option>
          <option>Adana</option><option>Diğer</option>
        </select>
      </label>
      <label>
        <span>Talep Türü *</span>
        <select value={form.faultType} onChange={set("faultType")} required>
          <option value="">Talep türünü seçiniz</option>
          {FAULT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label>
        <span>Açıklama *</span>
        <textarea placeholder="Kısa açıklama giriniz..." value={form.faultDescription} onChange={set("faultDescription")} required />
      </label>
      <label className="service-check">
        <input type="checkbox" checked={form.kvkk} onChange={(e) => setForm((p) => ({ ...p, kvkk: e.target.checked }))} required />
        <span>KVKK Aydınlatma Metni'ni okudum, onaylıyorum.</span>
      </label>
      <button type="submit" className="service-submit" disabled={createClaim.isPending}>
        {createClaim.isPending ? "Gönderiliyor…" : "Talep Oluştur"}
      </button>
    </form>
  );
}

// ─── Device lookup: by serial number ──────────────────────────────────────────

function DeviceBySerial({ serialNumber }: { serialNumber: string }) {
  const { data, isLoading, error } = useGetWarrantyDeviceBySerial(serialNumber);
  if (isLoading) return <DeviceLoadingSkeleton />;
  if (error || !data) return <DeviceNotFound />;
  return <DeviceFound device={data} />;
}

function DeviceByQr({ qrToken }: { qrToken: string }) {
  const { data, isLoading, error } = useGetWarrantyDeviceByQr(qrToken);
  if (isLoading) return <DeviceLoadingSkeleton />;
  if (error || !data) return <DeviceNotFound />;
  return <DeviceFound device={data} />;
}

function DeviceLoadingSkeleton() {
  return (
    <div className="service-content-grid">
      <div className="service-left-column">
        <div className="service-device-card" style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
          <div style={{ height: 200, background: "#f1f5f9", borderRadius: 8 }} />
        </div>
      </div>
      <aside className="service-request-card">
        <div style={{ height: 400, background: "#f8fafc", borderRadius: 8 }} />
      </aside>
    </div>
  );
}

function DeviceNotFound() {
  return (
    <div className="service-not-found">
      <ShieldAlert size={48} />
      <h3>Cihaz bulunamadı</h3>
      <p>Bu seri numarasına ait kayıtlı cihaz bilgisi bulunamadı. Lütfen seri numarasını kontrol edin veya teknik destek hattımızı arayın.</p>
    </div>
  );
}

function DeviceFound({ device }: { device: {
  id: number; productName: string; model: string; serialNumber: string;
  installDate?: string | null; warrantyEndDate?: string | null;
  lastMaintenanceDate?: string | null; nextMaintenanceDate?: string | null;
  status: string; customerFirm?: string | null; imageUrl?: string | null;
  serviceRecords?: Array<{
    id: number; serviceDate: string; serviceType: string;
    servicePersonnel?: string | null;
  }> | null;
}}) {
  const isActive = STATUS_ACTIVE.has(device.status);
  const deviceInfoRows = [
    ["Cihaz Türü",        device.productName],
    ["Model",             device.model],
    ["Seri Numarası",     device.serialNumber],
    ...(device.installDate          ? [["Kurulum Tarihi",   device.installDate         ]] : []),
    ...(device.customerFirm         ? [["Müşteri / Kurum",  device.customerFirm        ]] : []),
    ["Garanti Durumu",    STATUS_LABELS[device.status] ?? device.status],
    ...(device.warrantyEndDate      ? [["Garanti Bitiş",    device.warrantyEndDate     ]] : []),
    ...(device.lastMaintenanceDate  ? [["Son Bakım",        device.lastMaintenanceDate ]] : []),
    ...(device.nextMaintenanceDate  ? [["Sonraki Bakım",    device.nextMaintenanceDate ]] : []),
  ] as [string, string][];

  const records = device.serviceRecords ?? [];

  return (
    <div className="service-content-grid">
      <div className="service-left-column">
        <section className="service-device-card">
          <div className="service-card-heading">
            <h2>Cihaz Bilgileri</h2>
            <span className={isActive ? "green" : ""}>{STATUS_LABELS[device.status] ?? device.status}</span>
          </div>
          <div className="service-device-card__body">
            {device.imageUrl && (
              <img src={device.imageUrl} alt="Cihaz görseli" />
            )}
            {!device.imageUrl && (
              <img src="/assets/images/service-vacuum-system.png" alt="Cihaz görseli" />
            )}
            <dl>
              {deviceInfoRows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd className={label === "Garanti Durumu" && isActive ? "green" : ""}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="service-history-card">
          <h2>Yapılan İşlemler &amp; Servis Geçmişi</h2>
          {records.length === 0 ? (
            <p className="service-history-empty">Henüz servis kaydı bulunmuyor.</p>
          ) : (
            <div className="service-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>İşlem Türü</th>
                    <th>Servis Personeli</th>
                    <th>Rapor</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td>{r.serviceDate}</td>
                      <td>{r.serviceType}</td>
                      <td>{r.servicePersonnel ?? "—"}</td>
                      <td>
                        <Link to={`/servis-raporu/${r.id}`} className="service-pdf-link">
                          PDF <FileText size={15} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <aside className="service-request-card">
        <h2>Hızlı Servis Talep Formu</h2>
        <p>Servis talebinizi hızlıca oluşturun, ekibimiz en kısa sürede sizinle iletişime geçsin.</p>
        <ServiceRequestForm deviceId={device.id} prefillSerial={device.serialNumber} />
      </aside>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type QueryMode = "serial" | "service_code";

export default function ServicePage() {
  const { serialNo, qrToken } = useParams<{ serialNo?: string; qrToken?: string }>();
  const navigate = useNavigate();

  const [queryMode, setQueryMode] = useState<QueryMode>("serial");
  const [inputValue, setInputValue] = useState(serialNo ?? "");
  const [submittedSerial, setSubmittedSerial] = useState<string | undefined>(serialNo);
  const [submittedQr, setSubmittedQr] = useState<string | undefined>(qrToken);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (serialNo) {
      setSubmittedSerial(serialNo);
      setSubmittedQr(undefined);
    }
  }, [serialNo]);

  useEffect(() => {
    if (qrToken) {
      setSubmittedQr(qrToken);
      setSubmittedSerial(undefined);
    }
  }, [qrToken]);

  function handleSearch() {
    const v = inputValue.trim();
    if (!v) return;
    if (queryMode === "serial") {
      navigate(`/servis/${encodeURIComponent(v)}`);
    } else {
      navigate(`/servis/qr/${encodeURIComponent(v)}`);
    }
  }

  const hasResult = !!submittedSerial || !!submittedQr;

  return (
    <div className="service-page">
      <Header />

      <main>
        <section className="service-hero">
          <div className="service-hero__shade" />
          <div className="service-hero__inner">
            <h1>Servis &amp; Destek</h1>
            <p>Cihazınıza ait servis geçmişini görüntüleyin, hızlı servis randevusu oluşturun.</p>
            <nav aria-label="Sayfa yolu" className="service-breadcrumb">
              <Link to="/">Anasayfa</Link>
              <ChevronRight size={14} />
              <span>Servis &amp; Destek</span>
            </nav>
          </div>
        </section>

        <section className="service-main">
          <div className="service-query-card">
            <div className="service-query-card__content">
              <div>
                <h2>Cihaz Sorgulama</h2>
                <p>Cihazınızın seri numarası veya servis kodu ile sorgulama yapın.</p>
              </div>

              <div className="service-query-tabs" role="tablist" aria-label="Sorgulama yöntemi">
                <button
                  type="button"
                  className={queryMode === "serial" ? "active" : ""}
                  onClick={() => { setQueryMode("serial"); setInputValue(""); setSubmittedSerial(undefined); setSubmittedQr(undefined); }}
                >
                  <Search size={17} />
                  Seri Numarası ile Sorgula
                </button>
                <button
                  type="button"
                  className={queryMode === "service_code" ? "active" : ""}
                  onClick={() => { setQueryMode("service_code"); setInputValue(""); setSubmittedQr(undefined); setSubmittedSerial(undefined); }}
                >
                  <QrCode size={17} />
                  Servis Kodu ile Sorgula
                </button>
              </div>

              <label className="service-field">
                <span>{queryMode === "serial" ? "Seri Numarası" : "Servis Kodu (QR)"}</span>
                <div className="service-query-row">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={queryMode === "serial" ? "Örn: OXM-VAC-250-0148" : "Örn: abc123xyz"}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <button type="button" onClick={handleSearch}>Sorgula</button>
                </div>
              </label>

              <p className="service-hint">
                <Info size={16} />
                Seri numaranızı cihaz üzerindeki etiketten görebilirsiniz.
              </p>
            </div>

            <div className="service-query-card__visual">
              <img src="/assets/images/service-vacuum-system.png" alt="Medikal vakum santrali" />
              <button type="button">
                <Info size={16} />
                Seri numarası nerede bulunur?
              </button>
            </div>
          </div>

          {hasResult && (
            <>
              {submittedSerial && <DeviceBySerial serialNumber={submittedSerial} />}
              {submittedQr && !submittedSerial && <DeviceByQr qrToken={submittedQr} />}
            </>
          )}

          <section className="service-benefits" aria-label="Servis avantajları">
            {benefits.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title}>
                  <Icon size={46} />
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.text}</small>
                  </span>
                </div>
              );
            })}
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
}
