import { useEffect } from "react";
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
import { useListSettings } from "@workspace/api-client-react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import "./GasControlPanelPage.css";

function useGCPContent() {
  const { data: rawSettings } = useListSettings();
  const s = (rawSettings as Record<string, string>) ?? {};

  function parse<T>(key: string, fallback: T): T {
    try {
      const raw = s[key];
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        if (Array.isArray(fallback) ? Array.isArray(parsed) && (parsed as unknown[]).length > 0 : typeof parsed === "object" && parsed !== null) {
          return parsed;
        }
      }
    } catch {}
    return fallback;
  }

  return {
    hero: parse<{ title: string; description: string }>("gcp_hero", {
      title: "3 Gazlı Kat Kontrol Panosu",
      description: "Medikal gaz sistemleriniz için güvenli, akıllı ve kesintisiz kontrol. 3 farklı medikal gazın merkezi yönetimi tek panelde.",
    }),
    heroImage: s["gcp_hero_image"] ?? "",
    drawingImage: s["gcp_drawing_image"] ?? "",
    imgs: [s["gcp_img_0"] ?? "", s["gcp_img_1"] ?? "", s["gcp_img_2"] ?? ""],
    specs: parse<Array<{ k: string; v: string }>>("gcp_specs", [
      { k: "Ürün Adı", v: "3 Gazlı Kat Kontrol Panosu" },
      { k: "Desteklenen Gazlar", v: "O2 (Oksijen) - VAC (Vakum) - AIR (Hava)" },
      { k: "Çalışma Basıncı", v: "4 - 6 bar" },
      { k: "Alarm Türü", v: "Görsel ve Sesli" },
      { k: "Gövde Malzemesi", v: "Elektrostatik Boyalı Metal" },
      { k: "Güç Beslemesi", v: "220 VAC - 50/60 Hz" },
      { k: "Montaj Tipi", v: "Sıva Üstü / Sıva Altı" },
      { k: "Çalışma Sıcaklığı", v: "-10 °C / +50 °C" },
      { k: "Boyutlar (YxGxD)", v: "400 x 320 x 80 mm" },
    ]),
    faqs: parse<Array<{ q: string; a: string }>>("gcp_faqs", [
      { q: "Hangi gazlar desteklenmektedir?", a: "3 Gazlı Kat Kontrol Panosu, Oksijen (O2), Vakum (VAC) ve Tıbbi Hava (AIR) gazlarını destekler." },
      { q: "Hangi alanlarda kullanılır?", a: "Hastane, yoğun bakım, ameliyathane ve klinik alanlarında kullanılır." },
      { q: "Montaj tipi nedir?", a: "Sıva üstü veya sıva altı montaj seçenekleriyle uygulanabilir." },
      { q: "Bakım ve servis ihtiyacı nasıl karşılanır?", a: "Periyodik bakım ve teknik servis ekibiyle güvenli çalışma sürdürülür." },
      { q: "Alarm sistemi nasıl çalışır?", a: "Basınç değerleri limit dışına çıktığında sesli ve görsel alarm verir." },
      { q: "Güç kesintisi durumunda sistem çalışır mı?", a: "Proje ihtiyacına göre yedek güç ve alarm senaryoları uygulanabilir." },
    ]),
    advantages: parse<string[]>("gcp_advantages", [
      "Üç farklı gazın tek panelde merkezi kontrolü",
      "Yüksek güvenlikli alarm ve kesme sistemi",
      "Kullanıcı dostu arayüz ile kolay izleme",
      "Uzun ömürlü ve dayanıklı metal gövde",
      "Kolay montaj ve bakım avantajı",
    ]),
    detailCards: parse<Array<{ title: string; text: string }>>("gcp_detail_cards", [
      { title: "Gaz Bağlantı Ünitesi", text: "Oksijen, vakum ve hava gaz girişleri için yüksek kaliteli vana sistemi." },
      { title: "Akıllı Kontrol Paneli", text: "Mikroişlemci kontrollü sistem ile gaz basınçları anlık olarak izlenir ve yönetilir." },
      { title: "Dayanıklı Yapı", text: "Elektrostatik boyalı metal gövdesi ile uzun ömürlü ve darbelere karşı dayanıklıdır." },
    ]),
  };
}

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

function ImageSlot({ label, size, className = "", image }: { label: string; size: string; className?: string; image?: string }) {
  return (
    <div
      className={`gcp-image-slot ${image ? "gcp-image-slot--has-image" : ""} ${className}`}
      style={image ? { backgroundImage: `url(${image})` } : undefined}
    >
      {!image && (
        <>
          <span>{label}</span>
          <strong>{size}</strong>
          <small>WEBP görsel alanı</small>
        </>
      )}
    </div>
  );
}

export default function GasControlPanelPage() {
  const { hero, specs, faqs, advantages, detailCards, heroImage, drawingImage, imgs } = useGCPContent();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
                <span>{hero.title}</span>
              </nav>

              <h1>
                {hero.title}
              </h1>
              <p>{hero.description}</p>

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

            <div
              className={`gcp-hero-photo-slot${heroImage ? " gcp-hero-photo-slot--has-image" : ""}`}
              style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
              aria-hidden="true"
            >
              {!heroImage && (
                <>
                  <span>Hero ürün fotoğraf alanı</span>
                  <strong>1920 x 720 px WEBP</strong>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="gcp-container gcp-card-row">
          {detailCards.map((card, i) => (
            <article className="gcp-detail-card" key={card.title}>
              <ImageSlot label={card.title} size="420 x 240 px" image={imgs[i]} />
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
              {specs.map((s) => (
                <div key={s.k}>
                  <dt>{s.k}</dt>
                  <dd>{s.v}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="gcp-drawing">
            <h2>Ölçüler / Teknik Çizim</h2>
            <ImageSlot label="Teknik çizim görseli" size="520 x 360 px" image={drawingImage} />
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
                {advantages.map((item, i) => (
                  <li key={i}>
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
            {faqs.map((f, index) => (
              <details key={index} open={index === 0}>
                <summary>
                  {f.q}
                  <ChevronDown size={18} />
                </summary>
                <p>{f.a}</p>
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
