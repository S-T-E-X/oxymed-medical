import "../pages/ServiceReportPage.css";
import {
  Bell, Building2, CalendarDays, Camera, Check, CheckCircle2,
  ClipboardCheck, Clock3, FileText, Gauge, Settings, Wrench,
} from "lucide-react";
import ServiceReportBarcode from "./ServiceReportBarcode";
import ServiceReportQRCode from "./ServiceReportQRCode";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface ServiceReportTemplateData {
  id?: number;
  reportNo: string;
  serviceDate: string;
  serviceTime?: string | null;
  serviceType: string;
  priority?: string | null;
  status: string;
  serviceCode?: string | null;
  createdBy?: string | null;
  device: {
    productName: string;
    model: string;
    serialNumber: string;
    customerFirm: string;
    installDate?: string | null;
    warrantyEndDate?: string | null;
    lastMaintenanceDate?: string | null;
    nextMaintenanceDate?: string | null;
    imageUrl?: string | null;
  };
  reportDataJson?: Record<string, unknown>;
  photos?: Array<{ url: string; caption?: string | null }>;
  signatures?: Array<{ role: string; signerName?: string | null; imageDataUrl: string }>;
  parts?: Array<{ partName: string; partCode?: string | null; quantity: string; condition?: string | null }>;
}

// ─── Static maps ──────────────────────────────────────────────────────────────

const SERVICE_TYPE_LABELS: Record<string, string> = {
  periyodik_bakim: "Periyodik Bakım",
  ariza_mudahalesi: "Arıza Müdahalesi",
  yedek_parca: "Yedek Parça",
  genel_kontrol: "Genel Kontrol",
  devreye_alma: "Devreye Alma",
  garanti_servisi: "Garanti Servisi",
};

const STATUS_LABELS: Record<string, string> = {
  taslak: "Taslak",
  tamamlandi: "Tamamlandı",
  iptal: "İptal",
};

const PRIORITY_LABELS: Record<string, string> = {
  acil: "ACİL",
  yuksek: "Yüksek",
  normal: "Normal",
  dusuk: "Düşük",
};

const ALARM_KEYS = [
  { key: "dusuk_vakum",        label: "Düşük Vakum Alarmı" },
  { key: "yuksek_sicaklik",    label: "Yüksek Sıcaklık Alarmı" },
  { key: "termik_hata",        label: "Termik Hatası" },
  { key: "sensor_hata",        label: "Sensör Hatası" },
  { key: "bakim_suresi_doldu", label: "Bakım Süresi Doldu" },
  { key: "acil_ariza",         label: "Acil Arıza" },
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
  }
  if (dateStr.includes("-")) {
    const [y, m, d] = dateStr.split("-");
    const day = parseInt(d ?? "", 10);
    const month = parseInt(m ?? "", 10) - 1;
    const year = parseInt(y ?? "", 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) return { day, month, year };
  }
  return null;
}

function buildCalendar(dateStr: string) {
  const parsed = parseDateStr(dateStr);
  if (!parsed) return null;
  const { day, month, year } = parsed;
  const headers = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"].map((h) => ({
    label: h, isTarget: false, isBlank: false,
  }));
  const firstDow = new Date(year, month, 1).getDay();
  const blanks = (firstDow === 0 ? 6 : firstDow - 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blankCells = Array.from({ length: blanks }, (_, i) => ({
    label: "", isTarget: false, isBlank: true, key: `b${i}`,
  }));
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => ({
    label: String(i + 1), isTarget: i + 1 === day, isBlank: false, key: `d${i}`,
  }));
  return {
    monthLabel: `${TURKISH_MONTHS[month] ?? ""} ${year}`,
    cells: [...headers, ...blankCells, ...dayCells],
  };
}

function gaugeRotation(valueStr: string): number {
  if (!valueStr) return -90;
  const num = parseFloat(valueStr.replace(/[^0-9.\-]/g, ""));
  if (isNaN(num)) return -90;
  const clamped = Math.max(-100, Math.min(0, num));
  return -90 + ((clamped + 100) / 100) * 180;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Panel({ title, icon: Icon, children, className = "" }: {
  title: string; icon: LucideIcon; children: ReactNode; className?: string;
}) {
  return (
    <section className={`sr-panel ${className}`}>
      <div className="sr-panel-title">
        <Icon size={10} className="sr-panel-icon" />
        {title}
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

function SignatureMark({ color = "#0f2c54" }: { color?: string }) {
  return (
    <svg viewBox="0 0 130 46" className="sr-signature-mark" aria-hidden="true">
      <path d="M5 38 Q20 8 40 28 Q55 44 65 22 Q75 2 90 28 Q102 44 125 10"
        fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ServiceReportTemplate({ data }: { data: ServiceReportTemplateData }) {
  const rd = (data.reportDataJson ?? {}) as Record<string, unknown>;
  const device = data.device;

  const str = (key: string) => ((rd[key] as string | undefined) ?? "");

  const hospitalName   = str("hospitalName") || device.customerFirm;
  const department     = str("department");
  const location       = str("location");
  const contactPerson  = str("contactPerson");
  const contact        = str("contact");
  const email          = str("email");

  const deviceType     = str("deviceType") || device.productName;
  const deviceModel    = str("deviceModel") || device.model;
  const plcSystem      = str("plcSystem");
  const hmiModel       = str("hmiModel");
  const productionDate = str("productionDate");
  const commissionDate = str("commissionDate") || (device.installDate ?? "");
  const warrantyStatus = str("warrantyStatus") || (device.warrantyEndDate ? `Bitiş: ${device.warrantyEndDate}` : "—");

  const alarms         = ((rd["alarms"] ?? {}) as Record<string, string>);
  const pump1Hours     = str("pump1Hours");
  const pump2Hours     = str("pump2Hours");
  const pump3Hours     = str("pump3Hours");
  const pump4Hours     = str("pump4Hours");
  const totalWorkHours = str("totalWorkHours");
  const lastMaintDate  = str("lastMaintenanceDate") || (device.lastMaintenanceDate ?? "");
  const nextMaintDate  = str("nextMaintenanceDate") || (device.nextMaintenanceDate ?? "");
  const maintenancePeriod = str("maintenancePeriod");

  const workingPressure = str("workingPressure") || str("vacuumTestPressure");
  const minVacuum       = str("minVacuum") || str("vacuumMinPressure");
  const testDuration    = str("testDuration") || str("vacuumTestDuration");
  const testResult      = str("testResult") || str("vacuumTestResult");
  const testDescription = str("testDescription");

  const operations    = ((rd["operations"] ?? []) as string[]);
  const notes         = str("notes");

  const recommendedMaintDate = str("recommendedMaintenanceDate");
  const recommendedMaintType = str("recommendedMaintenanceType") || str("nextMaintenanceType");
  const estimatedDuration    = str("estimatedDuration") || str("nextMaintenanceDuration");
  const maintenanceNote      = str("maintenanceNote") || str("nextMaintenanceNote");

  const photos     = data.photos ?? [];
  const signatures = data.signatures ?? [];
  const parts      = data.parts ?? [];

  const sigPersonel   = signatures.find((s) => s.role === "personel");
  const sigSorumlu    = signatures.find((s) => s.role === "sorumlu");
  const sigYetkili    = signatures.find((s) => s.role === "yetkili");

  const statusLabel   = STATUS_LABELS[data.status ?? ""] ?? data.status ?? "";
  const isDone        = data.status === "tamamlandi";
  const priorityLabel = PRIORITY_LABELS[data.priority ?? ""] ?? data.priority ?? "";

  const calData = buildCalendar(recommendedMaintDate || nextMaintDate);
  const qrValue = data.reportNo ?? `SRV-${data.id ?? ""}`;
  const needleRot = gaugeRotation(workingPressure || minVacuum);

  const hospitalInfoRows: [string, string][] = [
    ["Hastane Adı",  hospitalName],
    ["Bölüm",        department],
    ["Lokasyon",     location],
    ["Sorumlu Kişi", contactPerson],
    ["İletişim",     contact],
    ["E-posta",      email],
  ].filter(([, v]) => v) as [string, string][];

  const deviceInfoRows: [string, string][] = [
    ["Cihaz Türü",          deviceType],
    ["Model",               deviceModel],
    ["Seri Numarası",       device.serialNumber],
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

        {/* ── HEADER ── */}
        <header className="sr-header">
          <div className="sr-logo-block">
            <img src="/assets/brand/oxymed-service-logo.webp" alt="Oxymed Medikal Gaz Sistemleri" />
          </div>
          <div className="sr-heading">
            <h1>SERVİS &amp; BAKIM RAPORU</h1>
            <p>{deviceType.toUpperCase() || device.productName.toUpperCase()}</p>
          </div>
          <div className="sr-report-no">
            <div>RAPOR NO</div>
            <strong>{data.reportNo ?? `SRV-${data.id ?? "XXXX"}`}</strong>
            <ServiceReportBarcode value={data.reportNo ?? `SRV-${data.id ?? "XXXX"}`} />
            <span>
              {data.serviceDate}
              {data.serviceTime ? `\u00a0\u00a0-\u00a0\u00a0${data.serviceTime}` : ""}
            </span>
          </div>
        </header>

        {/* ── SUMMARY BAR ── */}
        <section className="sr-summary">
          <div className="sr-summary-item">
            <CalendarDays size={17} />
            <div>
              <small>Servis Tarihi</small>
              <strong>
                {data.serviceDate}
                {data.serviceTime && (
                  <span style={{ fontSize: "2.5mm", fontWeight: 700 }}>{"\u00a0"}{data.serviceTime}</span>
                )}
              </strong>
            </div>
          </div>
          <div className="sr-summary-item">
            <ClipboardCheck size={17} />
            <div>
              <small>Servis Türü</small>
              <strong>{SERVICE_TYPE_LABELS[data.serviceType] ?? data.serviceType}</strong>
            </div>
          </div>
          <div className="sr-summary-item">
            <Gauge size={17} />
            <div>
              <small>Müdahale Önceliği</small>
              <strong>
                {priorityLabel ? <><i className="ok-dot" />{priorityLabel}</> : "—"}
              </strong>
            </div>
          </div>
          <div className="sr-summary-item">
            <CheckCircle2 size={17} className={isDone ? "sr-green" : ""} />
            <div>
              <small>İşlem Durumu</small>
              <strong>{statusLabel}</strong>
            </div>
          </div>
        </section>

        {/* ── TOP GRID: Hospital + Device ── */}
        <div className="sr-grid sr-top-grid">
          <Panel title="Hastane / Proje Bilgileri" icon={Building2}>
            <div className="sr-hospital-layout">
              <DetailRows rows={hospitalInfoRows} />
            </div>
          </Panel>

          <Panel title="Cihaz Bilgileri" icon={Settings}>
            <div className={`sr-device ${device.imageUrl ? "" : "sr-device-no-image"}`}>
              <DetailRows rows={deviceInfoRows} />
              {device.imageUrl && (
                <figure className="sr-device-img">
                  <img src={device.imageUrl} alt={deviceType} />
                </figure>
              )}
            </div>
          </Panel>
        </div>

        {/* ── THREE GRID: Alarms + Hours + Vacuum ── */}
        <div className="sr-grid sr-three-grid">
          <Panel title="Alarm &amp; Arıza Bilgileri" icon={Bell}>
            <table className="sr-table">
              <thead>
                <tr>
                  <th>Alarm / Arıza</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {ALARM_KEYS.map(({ key, label }) => {
                  const val = alarms[key] ?? "yok";
                  const isDanger = val === "var" || val === "acil";
                  const isOk     = val === "yok";
                  return (
                    <tr key={key}>
                      <td>{label}</td>
                      <td className={isDanger ? "sr-danger-text" : isOk ? "sr-ok-text" : ""}>
                        <span className={isDanger ? "sr-alert-dot" : "sr-check-dot"}>
                          {isDanger ? "!" : <Check size={9} />}
                        </span>
                        {val === "yok" ? "Normal" : val === "var" ? "Alarm" : val === "kontrol_edildi" ? "Kontrol Edildi" : val === "mudahale_edildi" ? "Müdahale Edildi" : val}
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
                  <div className="sr-gauge-needle" style={{ transform: `rotate(${needleRot}deg)` }} />
                  <strong>{workingPressure ? workingPressure.replace(/[^0-9.,\-]/g, "") : "—"}</strong>
                  <span>kPa</span>
                  <small className="sr-gauge-min">-100</small>
                  <small className="sr-gauge-max">0</small>
                </div>
                <table className="sr-table sr-test-table">
                  <tbody>
                    {workingPressure && <tr><th>Çalışma Basıncı</th><td>{workingPressure}</td></tr>}
                    {minVacuum       && <tr><th>Min Vakum</th><td>{minVacuum}</td></tr>}
                    {testDuration    && <tr><th>Test Süresi</th><td>{testDuration}</td></tr>}
                    {testResult && (
                      <tr>
                        <th>Test Sonucu</th>
                        <td className={testResult === "Başarılı" ? "sr-ok-text" : testResult === "Başarısız" ? "sr-danger-text" : ""}>
                          {testResult}
                        </td>
                      </tr>
                    )}
                    {testDescription && <tr><th>Açıklama</th><td>{testDescription}</td></tr>}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontSize: "2.3mm", color: "#94a3b8", fontStyle: "italic", padding: "2mm 1mm" }}>
                Vakum testi girilmemiş.
              </p>
            )}
          </Panel>
        </div>

        {/* ── MID GRID: Operations + Notes ── */}
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
              <aside className="sr-qr-aside">
                <ServiceReportQRCode value={qrValue} size={18} />
                <span>Raporu Doğrulamak İçin QR Kodu Okutunuz</span>
              </aside>
            </div>
          </Panel>
        </div>

        {/* ── LOWER GRID: Parts + Photos ── */}
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
                      <td>{p.partName || "—"}</td>
                      <td>{p.partCode || "—"}</td>
                      <td>{p.quantity || "—"}</td>
                      <td>{p.condition || "—"}</td>
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
                    <img src={ph.url} alt={ph.caption ?? `Fotoğraf ${i + 1}`} />
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

        {/* ── BOTTOM GRID: Signatures + Next Maintenance ── */}
        <div className="sr-grid sr-bottom-grid">
          <Panel title="İmza &amp; Onay" icon={CheckCircle2}>
            <div className="sr-sig-row">
              {([
                { sig: sigPersonel, label: "Servis Personeli" },
                { sig: sigSorumlu,  label: "Teknik Sorumlu" },
                { sig: sigYetkili,  label: "Hastane Yetkilisi" },
              ] as { sig: typeof sigPersonel; label: string }[]).map(({ sig, label }) => (
                <div key={label} className="sr-sig-box">
                  <div className="sr-sig-image">
                    {sig?.imageDataUrl
                      ? <img src={sig.imageDataUrl} alt={`${label} imzası`} />
                      : <span className="sr-sig-empty">—</span>
                    }
                  </div>
                  <p className="sr-sig-name">{sig?.signerName ?? "—"}</p>
                  <p className="sr-sig-role">{label}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Sonraki Bakım Planlaması" icon={CalendarDays}>
            {hasNextMaint ? (
              <div className="sr-next-maint">
                {calData && (
                  <div className="sr-calendar">
                    <div className="sr-cal-month">{calData.monthLabel}</div>
                    <div className="sr-cal-grid">
                      {calData.cells.map((cell, i) => (
                        <span
                          key={i}
                          className={
                            cell.isBlank
                              ? "sr-cal-blank"
                              : cell.isTarget
                              ? "sr-cal-target"
                              : ""
                          }
                        >
                          {cell.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="sr-maint-details">
                  {recommendedMaintDate && (
                    <div className="sr-maint-row">
                      <span>Önerilen Tarih</span>
                      <strong>{recommendedMaintDate}</strong>
                    </div>
                  )}
                  {recommendedMaintType && (
                    <div className="sr-maint-row">
                      <span>Bakım Türü</span>
                      <strong>{recommendedMaintType}</strong>
                    </div>
                  )}
                  {estimatedDuration && (
                    <div className="sr-maint-row">
                      <span>Tahmini Süre</span>
                      <strong>{estimatedDuration}</strong>
                    </div>
                  )}
                  {maintenanceNote && (
                    <div className="sr-maint-row">
                      <span>Not</span>
                      <strong>{maintenanceNote}</strong>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: "2.3mm", color: "#94a3b8", fontStyle: "italic", padding: "2mm 1mm" }}>
                Bakım planı girilmemiş.
              </p>
            )}
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
