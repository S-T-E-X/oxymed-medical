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
  ShieldCheck,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import "./ServicePage.css";

const deviceInfo = [
  ["Cihaz Türü", "Medikal Vakum Santrali"],
  ["Model", "OXY-VAC PRO 3x250"],
  ["Seri Numarası", "OXM-VAC-250-0148"],
  ["Üretim Tarihi", "15.03.2024"],
  ["Garanti Durumu", "Devam Ediyor"],
  ["Garanti Bitiş Tarihi", "15.03.2026"],
];

const serviceHistory = [
  [
    "14.05.2026",
    "Periyodik Bakım",
    "Yağ değişimi, filtre değişimi, kaçak kontrolü, sensör kalibrasyonu yapıldı.",
    "Ahmet Yılmaz",
  ],
  [
    "15.02.2025",
    "Periyodik Bakım",
    "Genel bakım ve sistem testleri yapıldı. Alarm sistemi kontrol edildi.",
    "Mehmet Kaya",
  ],
  [
    "20.11.2024",
    "Arıza Müdahalesi",
    "Vakum düşüklüğü arızası giderildi. Sensör değişimi yapıldı.",
    "Ahmet Yılmaz",
  ],
  [
    "10.08.2024",
    "Periyodik Bakım",
    "Filtre değişimi ve yağ kontrolü yapıldı.",
    "Mehmet Kaya",
  ],
];

const benefits = [
  {
    icon: Headphones,
    title: "Uzman Destek",
    text: "Deneyimli teknik ekibimiz her zaman yanınızda.",
  },
  {
    icon: Clock3,
    title: "Hızlı Müdahale",
    text: "Talebiniz sonrası en kısa sürede müdahale ediyoruz.",
  },
  {
    icon: Settings,
    title: "Orijinal Yedek Parça",
    text: "Tüm müdahalelerde orijinal parça kullanıyoruz.",
  },
  {
    icon: ShieldCheck,
    title: "Güvenli & Garantili",
    text: "İşlemler garanti kapsamında güvence altındadır.",
  },
];

export default function ServicePage() {
  return (
    <div className="service-page">
      <Header />

      <main>
        <section className="service-hero">
          <div className="service-hero__shade" />
          <div className="service-hero__inner">
            <h1>Servis &amp; Destek</h1>
            <p>
              Cihazınıza ait servis geçmişini görüntüleyin, hızlı servis
              randevusu oluşturun.
            </p>
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
                <p>
                  Cihazınızın seri numarası veya servis kodu ile sorgulama
                  yapın.
                </p>
              </div>

              <div
                className="service-query-tabs"
                role="tablist"
                aria-label="Sorgulama yöntemi"
              >
                <button type="button" className="active">
                  <Search size={17} />
                  Seri Numarası ile Sorgula
                </button>
                <button type="button">
                  <QrCode size={17} />
                  Servis Kodu ile Sorgula
                </button>
              </div>

              <label className="service-field">
                <span>Seri Numarası</span>
                <div className="service-query-row">
                  <input type="text" placeholder="Örn: OXM-VAC-250-0148" />
                  <button type="button">Sorgula</button>
                </div>
              </label>

              <p className="service-hint">
                <Info size={16} />
                Seri numaranızı cihaz üzerindeki etiketten görebilirsiniz.
              </p>
            </div>

            <div className="service-query-card__visual">
              <img
                src="/assets/images/service-vacuum-system.png"
                alt="Medikal vakum santrali"
              />
              <button type="button">
                <Info size={16} />
                Seri numarası nerede bulunur?
              </button>
            </div>
          </div>

          <div className="service-content-grid">
            <div className="service-left-column">
              <section className="service-device-card">
                <div className="service-card-heading">
                  <h2>Cihaz Bilgileri</h2>
                  <span>Aktif</span>
                </div>
                <div className="service-device-card__body">
                  <img
                    src="/assets/images/service-vacuum-system.png"
                    alt="Cihaz görseli"
                  />
                  <dl>
                    {deviceInfo.map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd className={value === "Devam Ediyor" ? "green" : ""}>
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </section>

              <section className="service-history-card">
                <h2>Yapılan İşlemler &amp; Servis Geçmişi</h2>
                <div className="service-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Tarih</th>
                        <th>İşlem Türü</th>
                        <th>Açıklama</th>
                        <th>Servis Personeli</th>
                        <th>Rapor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceHistory.map(
                        ([date, type, description, person]) => (
                          <tr key={`${date}-${type}`}>
                            <td>{date}</td>
                            <td>{type}</td>
                            <td>{description}</td>
                            <td>{person}</td>
                            <td>
                              <Link
                                to="/servis-raporu"
                                className="service-pdf-link"
                              >
                                PDF
                                <FileText size={15} />
                              </Link>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
                <button type="button" className="service-history-button">
                  Tüm Geçmişi Görüntüle
                </button>
              </section>
            </div>

            <aside className="service-request-card">
              <h2>Hızlı Servis Talep Formu</h2>
              <p>
                Servis talebinizi hızlıca oluşturun, ekibimiz en kısa sürede
                sizinle iletişime geçsin.
              </p>

              <form>
                <label>
                  <span>Seri Numarası</span>
                  <div>
                    <QrCode size={15} />
                    <input type="text" placeholder="Seri numaranız" />
                  </div>
                </label>
                <label>
                  <span>Ad Soyad</span>
                  <div>
                    <User size={15} />
                    <input type="text" placeholder="Adınız Soyadınız" />
                  </div>
                </label>
                <label>
                  <span>Telefon</span>
                  <div>
                    <Phone size={15} />
                    <input type="tel" placeholder="5XX XXX XX XX" />
                  </div>
                </label>
                <label>
                  <span>E-posta</span>
                  <div>
                    <Mail size={15} />
                    <input type="email" placeholder="ornek@email.com" />
                  </div>
                </label>
                <label>
                  <span>Hastane / Kurum Adı</span>
                  <div>
                    <MapPin size={15} />
                    <input type="text" placeholder="Kurum adı" />
                  </div>
                </label>
                <label>
                  <span>Bulunduğunuz Şehir</span>
                  <select defaultValue="">
                    <option value="" disabled>
                      Şehir seçiniz
                    </option>
                    <option>Ankara</option>
                    <option>İstanbul</option>
                    <option>İzmir</option>
                  </select>
                </label>
                <label>
                  <span>Talep Türü</span>
                  <select defaultValue="">
                    <option value="" disabled>
                      Talep türünü seçiniz
                    </option>
                    <option>Periyodik Bakım</option>
                    <option>Arıza Müdahalesi</option>
                    <option>Yedek Parça</option>
                  </select>
                </label>
                <label>
                  <span>Açıklama</span>
                  <textarea placeholder="Kısa açıklama giriniz..." />
                </label>
                <label className="service-check">
                  <input type="checkbox" />
                  <span>KVKK Aydınlatma Metni'ni okudum, onaylıyorum.</span>
                </label>
                <button type="button" className="service-submit">
                  Talep Oluştur
                </button>
              </form>
            </aside>
          </div>

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
