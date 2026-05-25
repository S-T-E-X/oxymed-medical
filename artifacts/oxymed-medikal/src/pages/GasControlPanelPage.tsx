import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  FileCheck2,
  Gauge,
  HeartPulse,
  Home,
  Hospital,
  Layers3,
  ShieldCheck,
  SlidersHorizontal,
  Stethoscope,
  Wrench,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import "./GasControlPanelPage.css";

const heroFeatures = [
  {
    icon: ShieldCheck,
    title: "Yüksek Güvenlik",
    text: "Alarm ve otomatik kesme sistemi ile maksimum güvenlik.",
  },
  {
    icon: SlidersHorizontal,
    title: "Akıllı Kontrol",
    text: "Mikroişlemci tabanlı kontrol ünitesi ile sürekli izleme.",
  },
  {
    icon: Bell,
    title: "Alarm Sistemi",
    text: "Görsel ve sesli uyarı ile anlık bilgilendirme.",
  },
  {
    icon: Wrench,
    title: "Kolay Montaj",
    text: "Pratik bağlantı yapısı ile hızlı ve kolay kurulum.",
  },
];

const detailCards = [
  {
    title: "Gaz Bağlantı Ünitesi",
    text: "Oksijen, vakum ve hava gaz girişleri için yüksek kaliteli vana sistemi.",
    size: "420 x 240 px",
  },
  {
    title: "Akıllı Kontrol Paneli",
    text: "Mikroişlemci kontrollü sistem ile gaz basınçları anlık olarak izlenir ve yönetilir.",
    size: "420 x 240 px",
  },
  {
    title: "Dayanıklı Yapı",
    text: "Elektrostatik boyalı metal gövdesi ile uzun ömürlü ve darbelere karşı dayanıklıdır.",
    size: "420 x 240 px",
  },
];

const specs = [
  ["Ürün Adı", "3 Gazlı Kat Kontrol Panosu"],
  ["Desteklenen Gazlar", "O2 (Oksijen) - VAC (Vakum) - AIR (Hava)"],
  ["Çalışma Basıncı", "4 - 6 bar"],
  ["Alarm Türü", "Görsel ve Sesli"],
  ["Gövde Malzemesi", "Elektrostatik Boyalı Metal"],
  ["Güç Beslemesi", "220 VAC - 50/60 Hz"],
  ["Montaj Tipi", "Sıva Üstü / Sıva Altı"],
  ["Çalışma Sıcaklığı", "-10 °C / +50 °C"],
  ["Boyutlar (YxGxD)", "400 x 320 x 80 mm"],
];

const useCases = [
  { icon: Hospital, text: "Hastaneler" },
  { icon: HeartPulse, text: "Yoğun Bakım Üniteleri" },
  { icon: Stethoscope, text: "Ameliyathaneler" },
  { icon: Building2, text: "Klinikler" },
  { icon: FileCheck2, text: "Sağlık Merkezleri" },
];

const advantages = [
  "Üç farklı gazın tek panelde merkezi kontrolü",
  "Yüksek güvenlikli alarm ve kesme sistemi",
  "Kullanıcı dostu arayüz ile kolay izleme",
  "Uzun ömürlü ve dayanıklı metal gövde",
  "Kolay montaj ve bakım avantajı",
];

const featureTiles = [
  { icon: Layers3, title: "Merkezi Kontrol", text: "3 gazın tek noktadan yönetimi" },
  { icon: Gauge, title: "Anlık İzleme", text: "Basınç değerleri sürekli izlenir ve kaydedilir" },
  { icon: Bell, title: "Güvenli Alarm", text: "Görsel ve sesli alarm ile anlık uyarı" },
  { icon: Zap, title: "Modüler Yapı", text: "Kolay servis ve bakım imkanı" },
];

const faqs = [
  [
    "Hangi gazlar desteklenmektedir?",
    "3 Gazlı Kat Kontrol Panosu, Oksijen (O2), Vakum (VAC) ve Tıbbi Hava (AIR) gazlarını destekler.",
  ],
  ["Hangi alanlarda kullanılır?", "Hastane, yoğun bakım, ameliyathane ve klinik alanlarında kullanılır."],
  ["Montaj tipi nedir?", "Sıva üstü veya sıva altı montaj seçenekleriyle uygulanabilir."],
  ["Bakım ve servis ihtiyacı nasıl karşılanır?", "Periyodik bakım ve teknik servis ekibiyle güvenli çalışma sürdürülür."],
  ["Alarm sistemi nasıl çalışır?", "Basınç değerleri limit dışına çıktığında sesli ve görsel alarm verir."],
  ["Güç kesintisi durumunda sistem çalışır mı?", "Proje ihtiyacına göre yedek güç ve alarm senaryoları uygulanabilir."],
];

function ImageSlot({ label, size, className = "" }: { label: string; size: string; className?: string }) {
  return (
    <div className={`gcp-image-slot ${className}`}>
      <span>{label}</span>
      <strong>{size}</strong>
      <small>WEBP görsel alanı</small>
    </div>
  );
}

export default function GasControlPanelPage() {
  return (
    <div className="gcp-page">
      <Header />

      <main>
        <section className="gcp-hero">
          <div className="gcp-container gcp-hero__grid">
            <div className="gcp-hero__content">
              <nav className="gcp-breadcrumb" aria-label="Sayfa yolu">
                <Link to="/">
                  <Home size={15} />
                </Link>
                <span>/</span>
                <Link to="/urunler">Ürünler</Link>
                <span>/</span>
                <span>3 Gazlı Kat Kontrol Panosu</span>
              </nav>

              <h1>
                <span>3 Gazlı</span>
                Kat Kontrol Panosu
              </h1>
              <p>
                Medikal gaz sistemleriniz için güvenli, akıllı ve kesintisiz kontrol.
                3 farklı medikal gazın merkezi yönetimi tek panelde.
              </p>

              <div className="gcp-hero-features">
                {heroFeatures.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title}>
                      <Icon size={36} />
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.text}</small>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="gcp-hero-photo-note" aria-hidden="true">
              <span>Hero ürün fotoğraf alanı</span>
              <strong>1920 x 720 px WEBP</strong>
            </div>
          </div>
        </section>

        <section className="gcp-container gcp-card-row">
          {detailCards.map((card) => (
            <article className="gcp-detail-card" key={card.title}>
              <ImageSlot label={card.title} size={card.size} />
              <div>
                <h2>{card.title}</h2>
                <p>{card.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="gcp-container gcp-info-grid">
          <article className="gcp-specs">
            <h2>Teknik Özellikler</h2>
            <dl>
              {specs.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="gcp-drawing">
            <h2>Ölçüler / Teknik Çizim</h2>
            <ImageSlot label="Teknik çizim görseli" size="520 x 360 px" />
          </article>

          <article className="gcp-uses">
            <h2>Kullanım Alanları</h2>
            <ul>
              {useCases.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.text}>
                    <Icon size={34} />
                    <span>{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </article>
        </section>

        <section className="gcp-dark-band">
          <div className="gcp-container gcp-dark-grid">
            <article className="gcp-advantages">
              <h2>Avantajlar</h2>
              <ul>
                {advantages.map((item) => (
                  <li key={item}>
                    <Check size={17} />
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="gcp-feature-strip">
              <h2>Ürün Özellikleri</h2>
              <div>
                {featureTiles.map((item) => {
                  const Icon = item.icon;
                  return (
                    <section key={item.title}>
                      <Icon size={42} />
                      <strong>{item.title}</strong>
                      <small>{item.text}</small>
                    </section>
                  );
                })}
              </div>
            </article>
          </div>
        </section>

        <section className="gcp-container gcp-faq">
          <h2>Sıkça Sorulan Sorular</h2>
          <div className="gcp-faq-grid">
            {faqs.map(([question, answer], index) => (
              <details key={question} open={index === 0}>
                <summary>
                  {question}
                  <ChevronDown size={18} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="gcp-cta">
          <div className="gcp-container gcp-cta__inner">
            <div>
              <FileCheck2 size={42} />
              <span>
                <strong>Teklif Alın, Projenize Değer Katın</strong>
                <small>Uzman ekibimiz size en uygun çözümü sunmak için hazır.</small>
              </span>
            </div>
            <nav aria-label="Ürün aksiyonları">
              <Link to="/teklif-al" className="gcp-cta-primary">Teklif Al</Link>
              <Link to="/#iletisim" className="gcp-cta-secondary">İletişime Geç</Link>
            </nav>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
