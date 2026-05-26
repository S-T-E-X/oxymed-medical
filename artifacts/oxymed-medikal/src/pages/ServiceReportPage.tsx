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

const SERVICE_TYPE_LABELS: Record<string, string> = {
  periyodik_bakim:  "Periyodik Bakım",
  ariza_mudahalesi: "Arıza Müdahalesi",
  yedek_parca:      "Yedek Parça",
  genel_kontrol:    "Genel Kontrol",
  devreye_alma:     "Devreye Alma",
  garanti_servisi:  "Garanti Servisi",
};

const STATUS_LABELS: Record<string, string> = {
  aktif_garanti:     "Devam Ediyor",
  yakin_bitis:       "Yakında Bitiyor",
  garanti_disi:      "Sona Erdi",
  bakim_riskli:      "Bakım Gerekiyor",
  yetkisiz_askida:   "Askıda",
  uzatilmis_garanti: "Uzatılmış",
  bakim_anlasmasi:   "Bakım Anlaşması",
  talep_incelemede:  "Talep İncelemede",
  talep_onaylandi:   "Onaylandı",
  talep_reddedildi:  "Reddedildi",
};

// ─── Shared components (unchanged design) ─────────────────────────────────────

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
          <p>{value}</p>
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

  // Map ServiceReportFull to display-friendly locals
  const rd = (data.reportDataJson ?? {}) as Record<string, unknown>;
  const device = (data.device ?? {}) as Record<string, unknown>;

  const deviceProductName  = (device["productName"]  as string) ?? "";
  const deviceModel        = (device["model"]         as string) ?? "";
  const deviceSerialNumber = (device["serialNumber"]  as string) ?? "";
  const deviceCustomerFirm = (device["customerFirm"]  as string) ?? "";
  const deviceInstallDate  = (device["installDate"]   as string | undefined) ?? null;
  const deviceWarrantyEnd  = (device["warrantyEndDate"] as string | undefined) ?? null;
  const deviceStatus       = (device["status"]        as string) ?? "";
  const deviceImageUrl     = null; // not in schema; kept for layout compat

  const workHours     = (rd["totalWorkHours"] as string | undefined) ?? null;
  const description   = (rd["notes"]          as string | undefined) ?? null;
  const servicePersonnel = data.signatures?.find((s) => (s as unknown as Record<string, unknown>)["role"] === "personel") as unknown as Record<string, unknown> | undefined;
  const personnelName = (servicePersonnel?.["signerName"] as string | undefined) ?? null;
  const photoUrls     = (data.photos ?? []).map((p) => (p as unknown as Record<string, unknown>)["url"] as string).filter(Boolean);
  const parts         = (data.parts ?? []).length > 0 ? data.parts : null;

  const serviceSummary = [
    { icon: CalendarDays,   label: "Servis Tarihi", value: data.serviceDate },
    { icon: ClipboardCheck, label: "Servis Türü",   value: SERVICE_TYPE_LABELS[data.serviceType] ?? data.serviceType, success: false },
    { icon: CheckCircle2,   label: "İşlem Durumu",  value: "Tamamlandı", success: true },
    ...(workHours ? [{ icon: Clock3, label: "Çalışma Saati", value: workHours, success: false }] : []),
  ];

  const hospitalInfoRows: [string, string][] = [
    ["Firma / Kurum", deviceCustomerFirm],
  ];

  const deviceInfoRows: [string, string][] = [
    ["Cihaz Türü",    deviceProductName],
    ["Model",         deviceModel],
    ["Seri Numarası", deviceSerialNumber],
    ...(deviceInstallDate ? [["Kurulum Tarihi", deviceInstallDate] as [string, string]] : []),
    ["Garanti Durumu", STATUS_LABELS[deviceStatus] ?? deviceStatus],
    ...(deviceWarrantyEnd ? [["Garanti Bitiş", deviceWarrantyEnd] as [string, string]] : []),
  ];

  const actions = description
    ? description.split(/\.\s+|\n/).map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <main className="sr-preview">
      <article className="sr-page">
        <header className="sr-header">
          <div className="sr-logo-block">
            <img src="/assets/brand/oxymed-service-logo.webp" alt="Oxymed Medikal Gaz Sistemleri" />
          </div>
          <div className="sr-heading">
            <h1>SERVİS &amp; BAKIM RAPORU</h1>
            <p>{deviceProductName.toUpperCase()}</p>
          </div>
          <div className="sr-report-no">
            <div>RAPOR NO</div>
            <strong>{data.reportNo ?? `SRV-${data.id}`}</strong>
            <div className="sr-barcode" />
            <span>{data.serviceDate}</span>
          </div>
        </header>

        <section className="sr-summary">
          {serviceSummary.map((item) => {
            const Icon = item.icon;
            return (
              <div className="sr-summary-item" key={item.label}>
                <Icon size={17} className={item.success ? "sr-green" : ""} />
                <div>
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                </div>
              </div>
            );
          })}
          <div className="sr-service-code">
            <small>Servis Kodu</small>
            <strong>{String(data.id).padStart(3, "0")}</strong>
          </div>
        </section>

        <div className="sr-grid sr-top-grid">
          <Panel title="Hastane / Proje Bilgileri" icon={Building2}>
            <div className="sr-hospital-layout">
              <DetailRows rows={hospitalInfoRows} />
              <Hospital className="sr-watermark" size={92} />
            </div>
          </Panel>

          <Panel title="Cihaz Bilgileri" icon={Settings}>
            <div className="sr-device">
              <DetailRows rows={deviceInfoRows} />
              {deviceImageUrl && (
                <img src={deviceImageUrl} alt="Cihaz görseli" />
              )}
              {!deviceImageUrl && (
                <img src="/assets/images/product-medical-gas.png" alt="Medikal vakum santrali" />
              )}
            </div>
          </Panel>
        </div>

        {(actions.length > 0 || description) && (
          <div className="sr-grid sr-mid-grid">
            {actions.length > 0 && (
              <Panel title="Yapılan İşlemler" icon={Wrench}>
                <div className="sr-action-list">
                  {actions.map((action, i) => (
                    <p key={i}><span className="sr-check-dot"><Check size={9} /></span>{action}</p>
                  ))}
                </div>
              </Panel>
            )}

            <Panel title="Açıklama" icon={FileText}>
              <div className="sr-notes">
                <div>
                  {description && <p>{description}</p>}
                  {!description && <p>Bu servis kaydı için açıklama girilmemiştir.</p>}
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
        )}

        {parts && parts.length > 0 && (
          <div className="sr-grid sr-lower-grid">
            <Panel title="Kullanılan Bakım Kitleri / Parçalar" icon={Settings}>
              <table className="sr-table sr-parts-table">
                <thead>
                  <tr>
                    <th>Kit / Parça Adı</th>
                    <th>Kod / Model</th>
                    <th>Adet</th>
                    <th>Birim</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.map((kit, idx) => {
                    const k = kit as unknown as Record<string, unknown>;
                    return (
                      <tr key={idx}>
                        <td>{k["partName"] as string}</td>
                        <td>{(k["partCode"] as string) ?? "—"}</td>
                        <td>{(k["quantity"] as string) ?? "—"}</td>
                        <td>{(k["condition"] as string) ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Panel>

            {photoUrls.length > 0 && (
              <Panel title="Servis Fotoğrafları" icon={Camera}>
                <div className="sr-photo-grid">
                  {photoUrls.map((url, i) => (
                    <figure key={i}>
                      <img src={url} alt={`Servis fotoğrafı ${i + 1}`} />
                    </figure>
                  ))}
                </div>
              </Panel>
            )}
          </div>
        )}

        <div className="sr-grid sr-bottom-grid">
          <Panel title="İmza &amp; Onay" icon={ClipboardCheck}>
            <div className="sr-signatures">
              {personnelName && (
                <div>
                  <small>Servis Personeli</small>
                  <strong>{personnelName}</strong>
                  <SignatureMark color="#475569" />
                </div>
              )}
              <div>
                <small>Hastane Yetkilisi</small>
                <strong>Onay / İmza</strong>
                <SignatureMark color="#1d4ed8" />
              </div>
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
