import {
  Bell,
  Building2,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  Gauge,
  Hospital,
  Settings,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useGetServiceReport } from "@workspace/api-client-react";
import "./ServiceReportPage.css";

// ─── Static maps ──────────────────────────────────────────────────────────────

const SERVICE_TYPE_LABELS: Record<string, string> = {
  periyodik_bakim:  "Periyodik Bakım",
  ariza_mudahalesi: "Arıza Müdahalesi",
  yedek_parca:      "Yedek Parça",
  genel_kontrol:    "Genel Kontrol",
  devreye_alma:     "Devreye Alma",
  garanti_servisi:  "Garanti Servisi",
};

const STATUS_LABELS: Record<string, string> = {
  taslak:      "Taslak",
  tamamlandi:  "Tamamlandı",
  iptal:       "İptal",
};

const PRIORITY_LABELS: Record<string, string> = {
  acil:   "ACİL",
  yuksek: "Yüksek",
  normal: "Normal",
  dusuk:  "Düşük",
};

const ALARM_KEYS = [
  { key: "dusuk_vakum",       label: "Düşük Vakum Alarmı" },
  { key: "yuksek_sicaklik",   label: "Yüksek Sıcaklık Alarmı" },
  { key: "termik_hata",       label: "Termik Hatası" },
  { key: "sensor_hata",       label: "Sensör Hatası" },
  { key: "bakim_suresi_doldu",label: "Bakım Süresi Doldu" },
  { key: "acil_ariza",        label: "Acil Arıza" },
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

const TURKISH_MONTHS = [
  "Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
  "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDateStr(dateStr: string): { day: number; month: number; year: number } | null {
  if (!dateStr) return null;
  if (dateStr.includes(".")) {
    const [d, m, y] = dateStr.split(".");
    const day = parseInt(d ?? "", 10);
    const month = parseInt(m ?? "", 10) - 1;
    const year = parseInt(y ?? "", 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) return { day, month, year };
  } else if (dateStr.includes("-")) {
    const [y, m, d] = dateStr.split("-");
    const year = parseInt(y ?? "", 10);
    const month = parseInt(m ?? "", 10) - 1;
    const day = parseInt(d ?? "", 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) return { day, month, year };
  }
  return null;
}

interface CalendarData {
  monthLabel: string;
  cells: Array<{ label: string; active: boolean; isHeader: boolean }>;
}

function buildCalendar(dateStr: string | null | undefined): CalendarData | null {
  if (!dateStr) return null;
  const parsed = parseDateStr(dateStr);
  if (!parsed) return null;
  const { day, month, year } = parsed;

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const headers = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"].map((h) => ({
    label: h, active: false, isHeader: true,
  }));
  const blanks = Array.from({ length: startOffset }, () => ({
    label: "", active: false, isHeader: false,
  }));
  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    label: String(i + 1), active: i + 1 === day, isHeader: false,
  }));

  return {
    monthLabel: `${TURKISH_MONTHS[month] ?? ""} ${year}`,
    cells: [...headers, ...blanks, ...days],
  };
}

function gaugeRotation(valueStr: string | null | undefined): number {
  if (!valueStr) return -42;
  const num = parseFloat(valueStr);
  if (isNaN(num)) return -42;
  const clamped = Math.max(-100, Math.min(0, num));
  const percent = (clamped + 100) / 100;
  return -90 + percent * 180;
}

// ─── Shared components ────────────────────────────────────────────────────────

function Panel({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`sr-panel ${className}`}>
      <div className="sr-panel-title">
        <Icon size={12} />
        <span>{title}</span>
      </div>
      <div className="sr-panel-body">{children}</div>
    </section>
  );
}

function DetailRows({ rows }: { rows: [string, string][] }) {
  return (
    <div className="sr-detail-rows">
      {rows.map(([label, value]) => (
        <div className="sr-detail-row" key={label}>
          <strong>{label}</strong>
          <span>:</span>
          <p>{value || "—"}</p>
        </div>
      ))}
    </div>
  );
}

function SignatureMark({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 130 46" className="sr-signature-mark" aria-hidden="true">
      <path
        d="M8 36 C23 29, 28 8, 34 14 C39 20, 28 42, 42 33 C55 24, 61 9, 65 15 C69 21, 55 38, 73 29 C88 22, 97 18, 119 12"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path d="M13 38 C42 34, 76 28, 123 23" fill="none" stroke={color} strokeLinecap="round" strokeWidth="0.9" />
    </svg>
  );
}

function QrPattern() {
  return (
    <div className="sr-qr" aria-label="QR kod alanı">
      {Array.from({ length: 49 }).map((_, index) => (
        <span key={index} className={(index * 7 + index + Math.floor(index / 2)) % 3 === 0 ? "on" : ""} />
      ))}
    </div>
  );
}

// ─── Loading / Error states ────────────────────────────────────────────────────

function ReportSkeleton() {
  return (
    <main className="sr-preview">
      <article className="sr-page" style={{ padding: "48px", textAlign: "center", color: "#64748b" }}>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Rapor yükleniyor…</p>
      </article>
    </main>
  );
}

function ReportNotFound() {
  return (
    <main className="sr-preview">
      <article className="sr-page" style={{ padding: "48px", textAlign: "center", color: "#64748b" }}>
        <FileText size={48} style={{ margin: "0 auto 16px", color: "#cbd5e1" }} />
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Servis raporu bulunamadı</p>
        <p style={{ fontSize: ".9rem", marginTop: 8 }}>Bu rapora ait kayıt mevcut değil ya da kaldırılmış olabilir.</p>
      </article>
    </main>
  );
}

// ─── Dynamic report ────────────────────────────────────────────────────────────

function DynamicReport({ recordId }: { recordId: number }) {
  const { data, isLoading, error } = useGetServiceReport(recordId);

  if (isLoading) return <ReportSkeleton />;
  if (error || !data) return <ReportNotFound />;

  const rd = (data.reportDataJson ?? {}) as Record<string, unknown>;
  const device = (data.device ?? {}) as Record<string, unknown>;

  const str = (key: string) => ((rd[key] as string | undefined) ?? "");
  const deviceStr = (key: string) => ((device[key] as string | undefined) ?? "");

  // Device fields
  const deviceProductName  = deviceStr("productName");
  const deviceModel        = deviceStr("model");
  const deviceSerialNumber = deviceStr("serialNumber");
  const deviceCustomerFirm = deviceStr("customerFirm");
  const deviceInstallDate  = deviceStr("installDate");
  const deviceWarrantyEnd  = deviceStr("warrantyEndDate");
  const deviceLastMaint    = deviceStr("lastMaintenanceDate");
  const deviceNextMaint    = deviceStr("nextMaintenanceDate");
  const deviceImageUrl     = (device["imageUrl"] as string | null | undefined) ?? null;

  // Report data fields
  const hospitalName    = str("hospitalName") || deviceCustomerFirm;
  const department      = str("department");
  const location        = str("location");
  const contactPerson   = str("contactPerson");
  const contact         = str("contact");
  const email           = str("email");

  const deviceType      = str("deviceType") || deviceProductName;
  const deviceModelRd   = str("deviceModel") || deviceModel;
  const plcSystem       = str("plcSystem");
  const hmiModel        = str("hmiModel");
  const productionDate  = str("productionDate");
  const commissionDate  = str("commissionDate") || deviceInstallDate;
  const warrantyStatus  = str("warrantyStatus") || (deviceWarrantyEnd ? `Bitiş: ${deviceWarrantyEnd}` : "—");

  const alarms          = ((rd["alarms"] ?? {}) as Record<string, string>);
  const pump1Hours      = str("pump1Hours");
  const pump2Hours      = str("pump2Hours");
  const pump3Hours      = str("pump3Hours");
  const pump4Hours      = str("pump4Hours");
  const totalWorkHours  = str("totalWorkHours");
  const lastMaintDate   = str("lastMaintenanceDate") || deviceLastMaint;
  const nextMaintDate   = str("nextMaintenanceDate") || deviceNextMaint;
  const maintenancePeriod = str("maintenancePeriod");

  const workingPressure = str("workingPressure") || str("vacuumTestPressure");
  const minVacuum       = str("minVacuum") || str("vacuumMinPressure");
  const testDuration    = str("testDuration") || str("vacuumTestDuration");
  const testResult      = str("testResult") || str("vacuumTestResult");

  const operations      = ((rd["operations"] ?? []) as string[]);
  const customOps       = ((rd["customOperations"] ?? []) as string[]);
  const allOperations   = [...DEFAULT_OPERATIONS, ...customOps];
  const notes           = str("notes");

  const recommendedMaintDate = str("recommendedMaintenanceDate");
  const recommendedMaintType = str("recommendedMaintenanceType") || str("nextMaintenanceType");
  const estimatedDuration    = str("estimatedDuration") || str("nextMaintenanceDuration");
  const maintenanceNote      = str("maintenanceNote") || str("nextMaintenanceNote");

  const photos     = data.photos ?? [];
  const signatures = data.signatures ?? [];
  const parts      = data.parts ?? [];

  const sigPersonel = signatures.find((s) => s.role === "personel");
  const sigSorumlu  = signatures.find((s) => s.role === "sorumlu");
  const sigYetkili  = signatures.find((s) => s.role === "yetkili");
  const personnelName = sigPersonel?.signerName ?? null;

  const statusLabel   = STATUS_LABELS[data.status ?? ""] ?? data.status ?? "";
  const isDone        = data.status === "tamamlandi";
  const priorityLabel = PRIORITY_LABELS[data.priority ?? ""] ?? data.priority ?? "";

  const calData = buildCalendar(recommendedMaintDate || nextMaintDate);
  const needleRot = gaugeRotation(workingPressure || minVacuum);

  const hospitalInfoRows: [string, string][] = [
    ["Hastane Adı",   hospitalName],
    ["Bölüm",         department],
    ["Lokasyon",      location],
    ["Sorumlu Kişi",  contactPerson],
    ["İletişim",      contact],
    ["E-posta",       email],
  ].filter(([, v]) => v) as [string, string][];

  const deviceInfoRows: [string, string][] = [
    ["Cihaz Türü",          deviceType],
    ["Model",               deviceModelRd],
    ["Seri Numarası",       deviceSerialNumber],
    ["PLC Sistemi",         plcSystem],
    ["HMI Modeli",          hmiModel],
    ["Üretim Tarihi",       productionDate],
    ["Devreye Alma Tarihi", commissionDate],
    ["Garanti Durumu",      warrantyStatus],
  ].filter(([, v]) => v) as [string, string][];

  const hasVacuumData = !!(workingPressure || minVacuum || testResult);
  const hasNextMaint  = !!(recommendedMaintDate || recommendedMaintType);

  return (
    <main className="sr-preview">
      <article className="sr-page">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <header className="sr-header">
          <div className="sr-logo-block">
            <img src="/assets/brand/oxymed-service-logo.webp" alt="Oxymed Medikal Gaz Sistemleri" />
          </div>
          <div className="sr-heading">
            <h1>SERVİS &amp; BAKIM RAPORU</h1>
            <p>{deviceType.toUpperCase() || deviceProductName.toUpperCase()}</p>
          </div>
          <div className="sr-report-no">
            <div>RAPOR NO</div>
            <strong>{data.reportNo ?? `SRV-${data.id}`}</strong>
            <div className="sr-barcode" />
            <span>
              {data.serviceDate}
              {data.serviceTime ? `\u00a0\u00a0-\u00a0\u00a0${data.serviceTime}` : ""}
            </span>
          </div>
        </header>

        {/* ── SUMMARY BAR ────────────────────────────────────────────────── */}
        <section className="sr-summary">
          <div className="sr-summary-item">
            <CalendarDays size={17} />
            <div>
              <small>Servis Tarihi</small>
              <strong>{data.serviceDate}</strong>
            </div>
          </div>
          {data.serviceTime && (
            <div className="sr-summary-item">
              <Clock3 size={17} />
              <div>
                <small>Servis Saati</small>
                <strong>{data.serviceTime}</strong>
              </div>
            </div>
          )}
          <div className="sr-summary-item">
            <ClipboardCheck size={17} />
            <div>
              <small>Servis Türü</small>
              <strong>{SERVICE_TYPE_LABELS[data.serviceType] ?? data.serviceType}</strong>
            </div>
          </div>
          {priorityLabel && (
            <div className="sr-summary-item">
              <Gauge size={17} />
              <div>
                <small>Müdahale Önceliği</small>
                <strong>
                  <i className="ok-dot" />
                  {priorityLabel}
                </strong>
              </div>
            </div>
          )}
          <div className="sr-summary-item">
            <CheckCircle2 size={17} className={isDone ? "sr-green" : ""} />
            <div>
              <small>İşlem Durumu</small>
              <strong>{statusLabel}</strong>
            </div>
          </div>
          <div className="sr-service-code">
            <small>Servis Kodu</small>
            <strong>{data.serviceCode ?? String(data.id ?? "").padStart(3, "0")}</strong>
          </div>
        </section>

        {/* ── TOP GRID: Hospital + Device ────────────────────────────────── */}
        <div className="sr-grid sr-top-grid">
          <Panel title="Hastane / Proje Bilgileri" icon={Building2}>
            <div className="sr-hospital-layout">
              <DetailRows rows={hospitalInfoRows.length > 0 ? hospitalInfoRows : [["Firma / Kurum", deviceCustomerFirm]]} />
              <Hospital className="sr-watermark" size={92} />
            </div>
          </Panel>

          <Panel title="Cihaz Bilgileri" icon={Settings}>
            <div className="sr-device">
              <DetailRows rows={deviceInfoRows} />
              <img
                src={deviceImageUrl ?? "/assets/images/product-medical-gas.png"}
                alt="Medikal vakum santrali"
              />
            </div>
          </Panel>
        </div>

        {/* ── THREE GRID: Alarms + Work Hours + Vacuum Test ──────────────── */}
        <div className="sr-grid sr-three-grid">
          <Panel title="Alarm & Arıza Bilgileri" icon={Bell}>
            <table className="sr-table">
              <thead>
                <tr>
                  <th>Alarm / Arıza Türü</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {ALARM_KEYS.map(({ key, label }) => {
                  const status = alarms[key] ?? "yok";
                  const isOk = status === "yok" || status === "kontrol_edildi" || status === "mudahale_edildi";
                  const isDanger = status === "var";
                  const statusLabels: Record<string, string> = {
                    yok: "Yok",
                    var: "Var",
                    kontrol_edildi: "Kontrol Edildi",
                    mudahale_edildi: "Müdahale Edildi",
                  };
                  return (
                    <tr key={key}>
                      <td>{label}</td>
                      <td className={isDanger ? "sr-danger-text" : isOk ? "sr-ok-text" : ""}>
                        <span className={isDanger ? "sr-alert-dot" : "sr-check-dot"}>
                          {isDanger ? "!" : <Check size={9} />}
                        </span>
                        {statusLabels[status] ?? status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>

          <Panel title="Çalışma Saatleri" icon={Clock3}>
            <table className="sr-table sr-hours-table">
              <thead>
                <tr>
                  <th>Ekipman</th>
                  <th>Çalışma Süresi</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {pump1Hours && (
                  <tr>
                    <td>Pompa 1</td>
                    <td>{pump1Hours}</td>
                    <td><span className="sr-check-dot"><Check size={9} /></span></td>
                  </tr>
                )}
                {pump2Hours && (
                  <tr>
                    <td>Pompa 2</td>
                    <td>{pump2Hours}</td>
                    <td><span className="sr-check-dot"><Check size={9} /></span></td>
                  </tr>
                )}
                {pump3Hours && (
                  <tr>
                    <td>Pompa 3</td>
                    <td>{pump3Hours}</td>
                    <td><span className="sr-check-dot"><Check size={9} /></span></td>
                  </tr>
                )}
                {pump4Hours && (
                  <tr>
                    <td>Pompa 4</td>
                    <td>{pump4Hours}</td>
                    <td><span className="sr-check-dot"><Check size={9} /></span></td>
                  </tr>
                )}
                {totalWorkHours && (
                  <tr className="sr-total-row">
                    <td>Toplam Çalışma Süresi</td>
                    <td colSpan={2}>{totalWorkHours}</td>
                  </tr>
                )}
                {lastMaintDate && (
                  <tr>
                    <td>Son Bakım Tarihi</td>
                    <td colSpan={2}>{lastMaintDate}</td>
                  </tr>
                )}
                {nextMaintDate && (
                  <tr>
                    <td>Bir Sonraki Bakım Tarihi</td>
                    <td colSpan={2}>{nextMaintDate}</td>
                  </tr>
                )}
                {maintenancePeriod && (
                  <tr>
                    <td>Bakım Periyodu</td>
                    <td colSpan={2}>{maintenancePeriod}</td>
                  </tr>
                )}
                {!pump1Hours && !pump2Hours && !pump3Hours && !pump4Hours && !totalWorkHours && (
                  <tr>
                    <td colSpan={3} style={{ color: "#94a3b8", fontStyle: "italic" }}>Çalışma saati girilmemiş</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Panel>

          <Panel title="Vakum Performans Testi" icon={Gauge}>
            {hasVacuumData ? (
              <div className="sr-gauge-block">
                <div className="sr-gauge">
                  <div className="sr-gauge-arc" />
                  <div
                    className="sr-gauge-needle"
                    style={{ transform: `rotate(${needleRot}deg)` }}
                  />
                  <strong>{workingPressure ? workingPressure.replace(/[^0-9\-]/g, "") : "—"}</strong>
                  <span>kPa</span>
                  <small className="sr-gauge-min">-100</small>
                  <small className="sr-gauge-max">0</small>
                </div>
                <table className="sr-table sr-test-table">
                  <tbody>
                    {testResult && (
                      <tr>
                        <td>Test Sonucu</td>
                        <td className={testResult === "Başarılı" ? "sr-ok-text" : testResult === "Başarısız" ? "sr-danger-text" : ""}>
                          {testResult}
                        </td>
                      </tr>
                    )}
                    {workingPressure && <tr><td>Çalışma Basıncı</td><td>{workingPressure}</td></tr>}
                    {minVacuum && <tr><td>Minimum Vakum</td><td>{minVacuum}</td></tr>}
                    {testDuration && <tr><td>Test Süresi</td><td>{testDuration}</td></tr>}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontSize: "2.3mm", color: "#94a3b8", fontStyle: "italic", padding: "4mm 1mm" }}>
                Vakum testi verisi girilmemiş.
              </p>
            )}
          </Panel>
        </div>

        {/* ── MID GRID: Operations + Notes ───────────────────────────────── */}
        <div className="sr-grid sr-mid-grid">
          <Panel title="Yapılan İşlemler" icon={Wrench}>
            <div className="sr-action-list">
              {operations.length > 0
                ? operations.map((action) => (
                    <p key={action} style={{ color: "#071b38", fontWeight: 700 }}>
                      <span className="sr-check-dot"><Check size={9} /></span>
                      {action}
                    </p>
                  ))
                : <p style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "2.3mm" }}>İşlem girilmemiş.</p>
              }
            </div>
          </Panel>

          <Panel title="Açıklama / Notlar" icon={FileText}>
            <div className="sr-notes">
              <div>
                {notes
                  ? notes.split(/\n/).map((line, i) => <p key={i}>{line}</p>)
                  : <p>Bu servis kaydı için not girilmemiştir.</p>}
              </div>
              <aside>
                {personnelName && (
                  <>
                    <strong>Servis Personeli</strong>
                    <b>{personnelName}</b>
                    <SignatureMark color="#475569" />
                  </>
                )}
                <div className="sr-qr-row">
                  <QrPattern />
                  <span>Raporu Doğrulamak İçin QR Kodu Okutunuz.</span>
                </div>
              </aside>
            </div>
          </Panel>
        </div>

        {/* ── LOWER GRID: Parts + Photos ─────────────────────────────────── */}
        <div className="sr-grid sr-lower-grid">
          <Panel title="Değiştirilen Parçalar" icon={Settings}>
            {parts.length > 0 ? (
              <table className="sr-table sr-parts-table">
                <thead>
                  <tr>
                    <th>Parça Adı</th>
                    <th>Kod / Model</th>
                    <th>Adet</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.map((p, idx) => (
                    <tr key={idx}>
                      <td>{p.partName}</td>
                      <td>{p.partCode ?? "—"}</td>
                      <td>{p.quantity ?? "—"}</td>
                      <td>{p.condition ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ fontSize: "2.3mm", color: "#94a3b8", fontStyle: "italic", padding: "2mm 1mm" }}>
                Parça değişimi yapılmadı.
              </p>
            )}
          </Panel>

          <Panel title="Servis Fotoğrafları" icon={Camera}>
            {photos.length > 0 ? (
              <div className="sr-photo-grid">
                {photos.slice(0, 4).map((ph, i) => (
                  <figure key={i}>
                    <img src={ph.url} alt={ph.caption ?? `Servis fotoğrafı ${i + 1}`} />
                    {ph.caption && <figcaption>{ph.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "2.3mm", color: "#94a3b8", fontStyle: "italic", padding: "2mm 1mm" }}>
                Fotoğraf eklenmemiş.
              </p>
            )}
          </Panel>
        </div>

        {/* ── BOTTOM GRID: Signatures + Next Maintenance ─────────────────── */}
        <div className="sr-grid sr-bottom-grid">
          <Panel title="İmza & Onay" icon={ClipboardCheck}>
            <div className="sr-signatures">
              {[
                { sig: sigPersonel, role: "Servis Personeli",  fallbackColor: "#475569" },
                { sig: sigSorumlu,  role: "Teknik Sorumlu",    fallbackColor: "#475569" },
                { sig: sigYetkili,  role: "Hastane Yetkilisi", fallbackColor: "#1d4ed8" },
              ].map(({ sig, role, fallbackColor }) => (
                <div key={role}>
                  <small>{role}</small>
                  {sig?.imageDataUrl ? (
                    <img
                      src={sig.imageDataUrl}
                      alt={`${role} imzası`}
                      style={{ maxWidth: "100%", maxHeight: "10mm", objectFit: "contain" }}
                    />
                  ) : (
                    <strong>{sig?.signerName ?? "Onay / İmza"}</strong>
                  )}
                  <SignatureMark color={fallbackColor} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Sonraki Bakım Planlaması" icon={CalendarDays}>
            <div className="sr-plan">
              <table className="sr-plan-table">
                <tbody>
                  {(recommendedMaintDate || nextMaintDate) && (
                    <tr><td>Önerilen Bakım Tarihi</td><td>{recommendedMaintDate || nextMaintDate}</td></tr>
                  )}
                  {recommendedMaintType && (
                    <tr><td>Önerilen Bakım Türü</td><td>{recommendedMaintType}</td></tr>
                  )}
                  {estimatedDuration && (
                    <tr><td>Tahmini Süre</td><td>{estimatedDuration}</td></tr>
                  )}
                  {maintenanceNote && (
                    <tr><td>Not</td><td>{maintenanceNote}</td></tr>
                  )}
                  {!hasNextMaint && !nextMaintDate && (
                    <tr><td colSpan={2} style={{ color: "#94a3b8", fontStyle: "italic" }}>Planlama girilmemiş.</td></tr>
                  )}
                </tbody>
              </table>
              {calData && (
                <div className="sr-calendar">
                  <strong>{calData.monthLabel}</strong>
                  <div className="sr-calendar-days">
                    {calData.cells.map((cell, index) => (
                      <span
                        key={`${cell.label}-${index}`}
                        className={cell.active ? "active" : ""}
                        style={cell.isHeader ? { fontWeight: 800, color: "#08265f" } : {}}
                      >
                        {cell.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Panel>
        </div>

        <img
          src="/assets/brand/oxymed-service-footer.webp"
          alt="Oxymed Medikal iletişim bilgileri"
          className="sr-footer-image"
        />
      </article>
    </main>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ServiceReportPage() {
  const { recordId } = useParams<{ recordId?: string }>();
  const id = parseInt(recordId ?? "", 10);

  if (!recordId || isNaN(id)) return <ReportNotFound />;
  return <DynamicReport recordId={id} />;
}
