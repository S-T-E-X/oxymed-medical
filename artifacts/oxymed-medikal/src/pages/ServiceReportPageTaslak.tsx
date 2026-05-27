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
import "./ServiceReportPageTaslak.css";

const serviceSummary = [
  { icon: CalendarDays, label: "Servis Tarihi", value: "14.05.2026" },
  { icon: Clock3, label: "Servis Saati", value: "14:35" },
  { icon: ClipboardCheck, label: "Servis Türü", value: "Periyodik Bakım" },
  { icon: Gauge, label: "Müdahale Önceliği", value: "Normal", status: "ok-dot" },
  { icon: CheckCircle2, label: "İşlem Durumu", value: "Tamamlandı", success: true },
];

const hospitalInfo = [
  ["Hastane Adı", "Ankara Şehir Hastanesi"],
  ["Bölüm", "Yoğun Bakım"],
  ["Lokasyon", "Teknik Oda - B Blok"],
  ["İletişim", "0312 123 45 67"],
  ["Sorumlu Kişi", "Mehmet Kaya"],
  ["E-posta", "teknikservis@ankarasehirhast.gov.tr"],
];

const deviceInfo = [
  ["Cihaz Türü", "Medikal Vakum Santrali"],
  ["Model", "OXY-VAC PRO 3x250"],
  ["Seri Numarası", "OXM-VAC-250-0148"],
  ["PLC Sistemi", "Rasch PLC"],
  ["HMI Modeli", 'Rasch SPM2 10"'],
  ["Üretim Tarihi", "15.03.2024"],
  ["Devreye Alma Tarihi", "20.03.2024"],
  ["Garanti Durumu", "Devam Ediyor"],
];

const alarms = [
  ["Düşük Vakum Alarmı", "Yok", true],
  ["Yüksek Sıcaklık Alarmı", "Yok", true],
  ["Termik Hatası", "Yok", true],
  ["Sensör Hatası", "Yok", true],
  ["Bakım Süresi Doldu", "Var", false],
  ["Acil Arıza", "Yok", true],
] as const;

const workHours = [
  ["Pompa 1", "1248 Saat"],
  ["Pompa 2", "1187 Saat"],
  ["Pompa 3", "1196 Saat"],
];

const actions = [
  "Yağ seviyesi kontrol edildi",
  "Vakum filtreleri kontrol edildi",
  "Yağ filtreleri değiştirildi",
  "Kaçak kontrolü yapıldı",
  "Elektrik bağlantıları kontrol edildi",
  "Vakum sensörü kalibrasyonu kontrol edildi",
  "Alarm sistemi test edildi",
  "HMI ekran kontrolü yapıldı",
  "PLC hata kayıtları incelendi",
  "Sistem genel performans testi tamamlandı",
];

const parts = [
  ["Yağ Filtresi", "OXM-FLT-OIL-01", "3", "Değiştirildi"],
  ["Hava Filtresi", "OXM-FLT-AIR-02", "3", "Değiştirildi"],
  ["Vakum Filtresi", "OXM-FLT-VAC-03", "3", "Değiştirildi"],
  ["Yağ (ISO VG 100)", "OXM-OIL-100", "6 Lt", "Değiştirildi"],
];

const photos = [
  ["Yağ Filtresi Değişimi", "/assets/images/product-medical-gas.png"],
  ["Hava Filtresi Kontrolü", "/assets/images/product-bed-head-unit.png"],
  ["Vakum Testi", "/assets/images/product-pendant-system.png"],
  ["HMI Ekran Kontrolü", "/assets/images/product-electrical-data.png"],
];

const signatures = [
  ["Servis Personeli", "Ahmet Yılmaz", "#1f2937"],
  ["Teknik Sorumlu", "Mehmet Kaya", "#1f2937"],
  ["Hastane Yetkilisi", "Onay / İmza", "#1d4ed8"],
];

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

function DetailRows({ rows }: { rows: string[][] }) {
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

export default function ServiceReportPage() {
  return (
    <main className="sr-preview">
      <article className="sr-page">
        <header className="sr-header">
          <div className="sr-logo-block">
            <img src="/assets/brand/oxymed-service-logo.webp" alt="Oxymed Medikal Gaz Sistemleri" />
          </div>
          <div className="sr-heading">
            <h1>SERVİS &amp; BAKIM RAPORU</h1>
            <p>MEDİKAL VAKUM SANTRALİ</p>
          </div>
          <div className="sr-report-no">
            <div>RAPOR NO</div>
            <strong>OXM-SRV-2026-00421</strong>
            <div className="sr-barcode" />
            <span>14.05.2026&nbsp;&nbsp;-&nbsp;&nbsp;14:35</span>
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
                  <strong>
                    {item.status ? <i className={item.status} /> : null}
                    {item.value}
                  </strong>
                </div>
              </div>
            );
          })}
          <div className="sr-service-code">
            <small>Servis Kodu</small>
            <strong>928-516</strong>
            <span>(Geçerlilik: 30 dk)</span>
          </div>
        </section>

        <div className="sr-grid sr-top-grid">
          <Panel title="Hastane / Proje Bilgileri" icon={Building2}>
            <div className="sr-hospital-layout">
              <DetailRows rows={hospitalInfo} />
              <Hospital className="sr-watermark" size={92} />
            </div>
          </Panel>

          <Panel title="Cihaz Bilgileri" icon={Settings}>
            <div className="sr-device">
              <DetailRows rows={deviceInfo} />
              <img src="/assets/images/product-medical-gas.png" alt="Medikal vakum santrali" />
            </div>
          </Panel>
        </div>

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
                {alarms.map(([label, value, ok]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td className={ok ? "sr-ok-text" : "sr-danger-text"}>
                      <span className={ok ? "sr-check-dot" : "sr-alert-dot"}>{ok ? <Check size={9} /> : "!"}</span>
                      {value}
                    </td>
                  </tr>
                ))}
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
                {workHours.map(([name, hour]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{hour}</td>
                    <td><span className="sr-check-dot"><Check size={9} /></span></td>
                  </tr>
                ))}
                <tr className="sr-total-row">
                  <td>Toplam Çalışma Süresi</td>
                  <td colSpan={2}>3631 Saat</td>
                </tr>
                <tr>
                  <td>Son Bakım Tarihi</td>
                  <td colSpan={2}>15.02.2026</td>
                </tr>
                <tr>
                  <td>Bir Sonraki Bakım Tarihi</td>
                  <td colSpan={2}>15.08.2026</td>
                </tr>
                <tr>
                  <td>Bakım Periyodu</td>
                  <td colSpan={2}>6 Ay / 1500 Saat</td>
                </tr>
              </tbody>
            </table>
          </Panel>

          <Panel title="Vakum Performans Testi" icon={Gauge}>
            <div className="sr-gauge-block">
              <div className="sr-gauge">
                <div className="sr-gauge-arc" />
                <div className="sr-gauge-needle" />
                <strong>-72</strong>
                <span>kPa</span>
                <small className="sr-gauge-min">-100</small>
                <small className="sr-gauge-max">0</small>
              </div>
              <table className="sr-table sr-test-table">
                <tbody>
                  <tr><td>Test Sonucu</td><td className="sr-ok-text">Başarılı</td></tr>
                  <tr><td>Çalışma Basıncı</td><td>-72 kPa</td></tr>
                  <tr><td>Minimum Vakum</td><td>-70 kPa</td></tr>
                  <tr><td>Test Süresi</td><td>10 Dakika</td></tr>
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="sr-grid sr-mid-grid">
          <Panel title="Yapılan İşlemler" icon={Wrench}>
            <div className="sr-action-list">
              {actions.map((action) => (
                <p key={action}><span className="sr-check-dot"><Check size={9} /></span>{action}</p>
              ))}
            </div>
          </Panel>

          <Panel title="Açıklama / Notlar" icon={FileText}>
            <div className="sr-notes">
              <div>
                <p>Sistemde herhangi bir arıza tespit edilmemiştir.</p>
                <p>Tüm değerler olması gereken aralıklardadır.</p>
                <p>Bakım işlemleri üretici önerilerine uygun olarak yapılmıştır. Bir sonraki bakıma kadar düzenli kontrollerin yapılması önerilir.</p>
              </div>
              <aside>
                <strong>Servis Personeli</strong>
                <b>Ahmet Yılmaz</b>
                <SignatureMark color="#475569" />
                <div className="sr-qr-row">
                  <QrPattern />
                  <span>Raporu Doğrulamak İçin QR Kodu Okutunuz.</span>
                </div>
              </aside>
            </div>
          </Panel>
        </div>

        <div className="sr-grid sr-lower-grid">
          <Panel title="Değiştirilen Parçalar" icon={Settings}>
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
                {parts.map((part) => (
                  <tr key={part[1]}>
                    {part.map((cell) => <td key={cell}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Servis Fotoğrafları" icon={Camera}>
            <div className="sr-photo-grid">
              {photos.map(([caption, image]) => (
                <figure key={caption}>
                  <img src={image} alt={caption} />
                  <figcaption>{caption}</figcaption>
                </figure>
              ))}
            </div>
          </Panel>
        </div>

        <div className="sr-grid sr-bottom-grid">
          <Panel title="İmza & Onay" icon={ClipboardCheck}>
            <div className="sr-signatures">
              {signatures.map(([role, name, color]) => (
                <div key={role}>
                  <small>{role}</small>
                  <strong>{name}</strong>
                  <SignatureMark color={color} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Sonraki Bakım Planlaması" icon={CalendarDays}>
            <div className="sr-plan">
              <table className="sr-plan-table">
                <tbody>
                  <tr><td>Önerilen Bakım Tarihi</td><td>15.08.2026</td></tr>
                  <tr><td>Önerilen Bakım Türü</td><td>Periyodik Bakım</td></tr>
                  <tr><td>Tahmini Süre</td><td>2 Saat</td></tr>
                  <tr><td>Not</td><td>Orijinal yedek parça kullanımı önerilir.</td></tr>
                </tbody>
              </table>
              <div className="sr-calendar">
                <strong>AĞUSTOS 2026</strong>
                <div className="sr-calendar-days">
                  {["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz", "", "", "", "", "", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"].map((day, index) => (
                    <span key={`${day}-${index}`} className={day === "15" ? "active" : ""}>{day}</span>
                  ))}
                </div>
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
