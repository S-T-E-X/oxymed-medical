import { useState, useEffect, useRef } from "react";
import {
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
import { useI18n } from "../i18n/I18nProvider";
import { useLocalizedPath } from "../i18n/useLocalizedPath";
import Seo from "../components/common/Seo";
import "./ServicePage.css";

// ─── Benefit icons list (icons only; labels come from dictionary) ──────────────

const BENEFIT_ICONS = [Headphones, Clock3, Settings, ShieldCheck];

const STATUS_ACTIVE = new Set(["aktif_garanti", "yakin_bitis", "uzatilmis_garanti", "bakim_anlasmasi"]);

// ─── Service request form ──────────────────────────────────────────────────────

function ServiceRequestForm({ deviceId }: { deviceId?: number }) {
  const { t, tv } = useI18n();
  const [form, setForm] = useState({
    claimantName: "", claimantPhone: "", claimantEmail: "",
    claimantFirm: "", claimantCity: "",
    faultType: "", faultDescription: "", kvkk: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const faultTypes = tv<string[]>("service.faultTypes", []);
  const cities = tv<string[]>("service.form.cities", []);

  const createClaim = useCreateWarrantyClaim({
    mutation: {
      onSuccess: () => {
        toast.success(t("service.form.toastSuccess"));
        setSubmitted(true);
      },
      onError: () => toast.error(t("service.form.toastError")),
    },
  });

  if (submitted) {
    return (
      <div className="service-request-success">
        <CheckCircle2 size={44} className="service-success-icon" />
        <h3>{t("service.form.successTitle")}</h3>
        <p>{t("service.form.successBody")}</p>
      </div>
    );
  }

  function handleSubmit() {
    if (!form.claimantName || !form.faultType || !form.faultDescription || !form.kvkk) {
      toast.error(t("service.form.toastValidation"));
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
      toast.error(t("service.form.toastNoDevice"));
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <label>
        <span>{t("service.form.labelName")}</span>
        <div>
          <User size={15} />
          <input type="text" placeholder={t("service.form.placeholderName")} value={form.claimantName} onChange={set("claimantName")} required />
        </div>
      </label>
      <label>
        <span>{t("service.form.labelPhone")}</span>
        <div>
          <Phone size={15} />
          <input type="tel" placeholder={t("service.form.placeholderPhone")} value={form.claimantPhone} onChange={set("claimantPhone")} dir="ltr" />
        </div>
      </label>
      <label>
        <span>{t("service.form.labelEmail")}</span>
        <div>
          <Mail size={15} />
          <input type="email" placeholder={t("service.form.placeholderEmail")} value={form.claimantEmail} onChange={set("claimantEmail")} dir="ltr" />
        </div>
      </label>
      <label>
        <span>{t("service.form.labelFirm")}</span>
        <div>
          <MapPin size={15} />
          <input type="text" placeholder={t("service.form.placeholderFirm")} value={form.claimantFirm} onChange={set("claimantFirm")} />
        </div>
      </label>
      <label>
        <span>{t("service.form.labelCity")}</span>
        <select value={form.claimantCity} onChange={set("claimantCity")}>
          <option value="">{t("service.form.placeholderCity")}</option>
          {cities.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
      </label>
      <label>
        <span>{t("service.form.labelFaultType")}</span>
        <select value={form.faultType} onChange={set("faultType")} required>
          <option value="">{t("service.form.placeholderFaultType")}</option>
          {faultTypes.map((ft) => <option key={ft}>{ft}</option>)}
        </select>
      </label>
      <label>
        <span>{t("service.form.labelDescription")}</span>
        <textarea placeholder={t("service.form.placeholderDescription")} value={form.faultDescription} onChange={set("faultDescription")} required />
      </label>
      <label className="service-check">
        <input type="checkbox" checked={form.kvkk} onChange={(e) => setForm((p) => ({ ...p, kvkk: e.target.checked }))} required />
        <span>{t("service.form.kvkkConsent")}</span>
      </label>
      <button type="submit" className="service-submit" disabled={createClaim.isPending}>
        {createClaim.isPending ? t("service.form.submitting") : t("service.form.submit")}
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
  const { t } = useI18n();
  return (
    <div className="service-not-found">
      <ShieldAlert size={48} />
      <h3>{t("service.device.notFoundTitle")}</h3>
      <p>{t("service.device.notFoundBody")}</p>
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
  const { t, tv } = useI18n();
  const isActive = STATUS_ACTIVE.has(device.status);

  const statusLabels = tv<Record<string, string>>("service.statusLabels", {});
  const statusLabel = statusLabels[device.status] ?? device.status;

  const deviceInfoRows: [string, string | React.ReactNode][] = [
    [t("service.device.labels.productName"), device.productName],
    [t("service.device.labels.model"),       <span dir="ltr">{device.model}</span>],
    [t("service.device.labels.serialNumber"), <span dir="ltr">{device.serialNumber}</span>],
    ...(device.installDate         ? [[t("service.device.labels.installDate"),         device.installDate        ]] : []) as [string, string][],
    ...(device.customerFirm        ? [[t("service.device.labels.customerFirm"),        device.customerFirm       ]] : []) as [string, string][],
    [t("service.device.labels.warrantyStatus"), statusLabel],
    ...(device.warrantyEndDate     ? [[t("service.device.labels.warrantyEndDate"),     device.warrantyEndDate    ]] : []) as [string, string][],
    ...(device.lastMaintenanceDate ? [[t("service.device.labels.lastMaintenanceDate"), device.lastMaintenanceDate]] : []) as [string, string][],
    ...(device.nextMaintenanceDate ? [[t("service.device.labels.nextMaintenanceDate"), device.nextMaintenanceDate]] : []) as [string, string][],
  ];

  const records = device.serviceRecords ?? [];

  return (
    <div className="service-content-grid">
      <div className="service-left-column">
        <section className="service-device-card">
          <div className="service-card-heading">
            <h2>{t("service.device.cardTitle")}</h2>
            <span className={isActive ? "green" : ""}>{statusLabel}</span>
          </div>
          <div className="service-device-card__body">
            <img
              src={device.imageUrl ?? "/assets/images/service-vacuum-system.png"}
              alt={t("service.device.imageAlt")}
            />
            <dl>
              {deviceInfoRows.map(([label, value], idx) => (
                <div key={idx}>
                  <dt>{label}</dt>
                  <dd className={label === t("service.device.labels.warrantyStatus") && isActive ? "green" : ""}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="service-history-card">
          <h2>{t("service.device.historyTitle")}</h2>
          {records.length === 0 ? (
            <p className="service-history-empty">{t("service.device.historyEmpty")}</p>
          ) : (
            <div className="service-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t("service.device.tableDate")}</th>
                    <th>{t("service.device.tableServiceType")}</th>
                    <th>{t("service.device.tablePersonnel")}</th>
                    <th>{t("service.device.tableReport")}</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td><span dir="ltr">{r.serviceDate}</span></td>
                      <td>{r.serviceType}</td>
                      <td>{r.servicePersonnel ?? "—"}</td>
                      <td>
                        <Link to={`/servis-raporu/${r.id}`} className="service-pdf-link">
                          {t("service.device.pdfLabel")} <FileText size={15} />
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
        <h2>{t("service.form.title")}</h2>
        <p>{t("service.form.subtitle")}</p>
        <ServiceRequestForm deviceId={device.id} />
      </aside>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type QueryMode = "serial" | "service_code";

export default function ServicePage() {
  const { serialNo, qrToken } = useParams<{ serialNo?: string; qrToken?: string }>();
  const navigate = useNavigate();
  const { t, tv } = useI18n();
  const path = useLocalizedPath();

  const [queryMode, setQueryMode] = useState<QueryMode>("serial");
  const [inputValue, setInputValue] = useState(serialNo ?? "");
  const [submittedSerial, setSubmittedSerial] = useState<string | undefined>(serialNo);
  const [submittedQr, setSubmittedQr] = useState<string | undefined>(qrToken);
  const inputRef = useRef<HTMLInputElement>(null);

  const benefits = tv<Array<{ title: string; text: string }>>("service.benefits", []);

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
      <Seo routeKey="service" />
      <Header />

      <main>
        <section className="service-hero">
          <div className="service-hero__shade" />
          <div className="service-hero__inner">
            <h1>{t("service.hero.title")}</h1>
            <p>{t("service.hero.subtitle")}</p>
            <nav aria-label={t("service.hero.breadcrumbCurrent")} className="service-breadcrumb">
              <Link to={path("home")}>{t("service.hero.breadcrumbHome")}</Link>
              <ChevronRight size={14} className="rtl:-scale-x-100" />
              <span>{t("service.hero.breadcrumbCurrent")}</span>
            </nav>
          </div>
        </section>

        <section className="service-main">
          <div className="service-query-card">
            <div className="service-query-card__content">
              <div>
                <h2>{t("service.query.title")}</h2>
                <p>{t("service.query.subtitle")}</p>
              </div>

              <div className="service-query-tabs" role="tablist" aria-label={t("service.query.tabsAriaLabel")}>
                <button
                  type="button"
                  className={queryMode === "serial" ? "active" : ""}
                  onClick={() => { setQueryMode("serial"); setInputValue(""); setSubmittedSerial(undefined); setSubmittedQr(undefined); }}
                >
                  <Search size={17} />
                  {t("service.query.tabSerial")}
                </button>
                <button
                  type="button"
                  className={queryMode === "service_code" ? "active" : ""}
                  onClick={() => { setQueryMode("service_code"); setInputValue(""); setSubmittedQr(undefined); setSubmittedSerial(undefined); }}
                >
                  <QrCode size={17} />
                  {t("service.query.tabServiceCode")}
                </button>
              </div>

              <label className="service-field">
                <span>{queryMode === "serial" ? t("service.query.labelSerial") : t("service.query.labelServiceCode")}</span>
                <div className="service-query-row">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={queryMode === "serial" ? t("service.query.placeholderSerial") : t("service.query.placeholderServiceCode")}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    dir="ltr"
                  />
                  <button type="button" onClick={handleSearch}>{t("service.query.searchButton")}</button>
                </div>
              </label>

              <p className="service-hint">
                <Info size={16} />
                {t("service.query.hint")}
              </p>
            </div>

            <div className="service-query-card__visual">
              <img
                src="/assets/brand/oxymedmanservice.webp"
                alt={t("service.query.techSupportImageAlt")}
                className="service-query-man"
              />
            </div>
          </div>

          {hasResult && (
            <>
              {submittedSerial && <DeviceBySerial serialNumber={submittedSerial} />}
              {submittedQr && !submittedSerial && <DeviceByQr qrToken={submittedQr} />}
            </>
          )}

          <section className="service-benefits" aria-label={t("service.hero.breadcrumbCurrent")}>
            {benefits.map((item, idx) => {
              const Icon = BENEFIT_ICONS[idx];
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
