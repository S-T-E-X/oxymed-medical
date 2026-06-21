import { useEffect } from "react";
import { useListSettings } from "@workspace/api-client-react";
import {
  BadgeCheck,
  Building2,
  CircleCheck,
  Gauge,
  Hospital,
  Ruler,
  Settings,
  ShieldCheck,
  Stethoscope,
  VolumeX,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import "./DentalVacuumPumpPage.css";

const heroFeatures = [
  {
    icon: ShieldCheck,
    title: "GÜVENİLİR PERFORMANS",
    text: "Kesintisiz ve güçlü vakum gücü.",
  },
  {
    icon: VolumeX,
    title: "SESSİZ ÇALIŞMA",
    text: "Düşük ses seviyesi ile konforlu kullanım.",
  },
  {
    icon: BadgeCheck,
    title: "DAYANIKLI YAPI",
    text: "Uzun ömürlü çelik tank ve sağlam gövde.",
  },
  {
    icon: Wrench,
    title: "KOLAY BAKIM",
    text: "Modüler yapı ile hızlı servis imkanı.",
  },
];

const imageCards = [
  {
    title: "YÜKSEK PERFORMANSLI POMPALAR",
    text: "Güçlü motor yapısı ve sessiz çalışma.",
  },
  {
    title: "DAYANIKLI BAĞLANTI SİSTEMİ",
    text: "Kaliteli bağlantı elemanları ve güvenli valfler.",
  },
  {
    title: "KOMPAKT VE MODÜLER TASARIM",
    text: "Kolay kurulum, yer tasarrufu ve uzun ömür.",
  },
];

const specs = [
  ["Ürün Adı", "Dental Vakum Pompası"],
  ["Pompa Adedi", "3 Adet"],
  ["Tank Tipi", "Yatay Çelik Tank"],
  ["Gövde Yapısı", "Çelik, Toz Boyalı"],
  ["Tank Hacmi", "270 - 300 L (Opsiyonel)"],
  ["Çalışma Sistemi", "Yağsız Vakum Sistemi"],
  ["Maks. Vakum", "-0,85 bar"],
  ["Bağlantılar", "Vakum Girişi: 1 1/4\" / Tahliye: 1/2\""],
  ["Kullanım Alanı", "Diş klinikleri, poliklinikler ve hastaneler"],
  ["Bakım Kolaylığı", "Modüler yapı, kolay servis ve bakım"],
];

const useCases = [
  { icon: Stethoscope, text: "Diş Klinikleri" },
  { icon: Settings, text: "Ağız ve Diş Sağlığı Merkezleri" },
  { icon: Building2, text: "Poliklinikler" },
  { icon: Hospital, text: "Hastaneler" },
];

function parseDvpSpecsText(text: string): [string, string][] {
  return text.split("\n").filter(Boolean).map((line): [string, string] => {
    const idx = line.indexOf("::");
    return idx === -1 ? [line, ""] : [line.slice(0, idx), line.slice(idx + 2)];
  });
}

export default function DentalVacuumPumpPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: rawSettings } = useListSettings();
  const s = (rawSettings as Record<string, string> | undefined) ?? {};
  const eyebrow = s["dvp_hero_eyebrow"] || "OXY-DVP SERIES";
  const heroTitle = s["dvp_hero_title"];
  const desc1 = s["dvp_hero_desc1"] || "Oxymed Dental Vakum Pompası, diş klinikleri ve sağlık kuruluşlarında güvenilir, sessiz ve kesintisiz vakum çözümü sunar.";
  const desc2 = s["dvp_hero_desc2"] || "Yüksek performanslı motor yapısı ve dayanıklı tasarımıyla uzun ömürlü, ekonomik ve hijyenik bir kullanım sağlar.";
  const heroImage = s["dvp_hero_image"];
  const galleryImages = [0, 1, 2].map((i) => s[`dvp_img_${i}`]);
  const displaySpecs: [string, string][] = s["dvp_specs_text"] ? parseDvpSpecsText(s["dvp_specs_text"]) : (specs as [string, string][]);
  const drawingImage = s["dvp_drawing_image"];

  return (
    <div className="dvp-page">
      <Header />

      <main className="dvp-main">
        <section className="dvp-hero">
          <div className="dvp-container dvp-hero__grid">
            <div className="dvp-hero__content">
              <div className="dvp-eyebrow">{eyebrow}</div>
              <h1>
                {heroTitle ? heroTitle : <><span>DENTAL</span>VAKUM POMPASI</>}
              </h1>
              <div className="dvp-title-line" />
              <p>{desc1}</p>
              <p>{desc2}</p>
            </div>

            <div className="dvp-hero__visual" aria-label="Dental vakum pompası ana WEBP görsel alanı">
              <div className="dvp-hero-photo-slot" style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined} />
              <div className="dvp-hero-floor" aria-hidden="true" />
            </div>
          </div>

          <div className="dvp-container dvp-feature-row">
            {heroFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title}>
                  <Icon aria-hidden="true" />
                  <h2>{feature.title}</h2>
                  <p>{feature.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="dvp-gallery">
          <div className="dvp-container dvp-gallery__grid">
            {imageCards.map((card, i) => (
              <article key={card.title}>
                <div className="dvp-image-slot" aria-label={`${card.title} WEBP görsel alanı`} style={galleryImages[i] ? { backgroundImage: `url(${galleryImages[i]})` } : undefined} />
                <h2>{card.title}</h2>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="dvp-container dvp-technical-panel">
          <article className="dvp-specs">
            <header>
              <Settings aria-hidden="true" />
              <h2>TEKNİK ÖZELLİKLER</h2>
            </header>
            <dl>
              {displaySpecs.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="dvp-drawing">
            <header>
              <Ruler aria-hidden="true" />
              <h2>TEKNİK ÇİZİM & BOYUTLAR</h2>
            </header>
            <div className="dvp-drawing-grid">
              <div className="dvp-drawing-slot" aria-label="Teknik çizim ve boyutlar WEBP görsel alanı" style={drawingImage ? { backgroundImage: `url(${drawingImage})` } : undefined} />
            </div>
            <div className="dvp-dimensions" aria-hidden="true">
              <span>1150 mm</span>
              <span>1200 mm</span>
              <span>700 mm</span>
            </div>
            <p>Boyutlar yaklaşık değerlerdir.</p>
          </article>

          <article className="dvp-usage">
            <header>
              <Gauge aria-hidden="true" />
              <h2>KULLANIM ALANLARI</h2>
            </header>
            <ul>
              {useCases.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.text}>
                    <Icon aria-hidden="true" />
                    <span>{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </article>
        </section>

        <section className="dvp-container dvp-quick-quote">
          <div>
            <CircleCheck aria-hidden="true" />
            <span>
              <strong>Dental vakum pompası için hızlı teklif alın.</strong>
              <small>Projenize uygun kapasite ve kurulum seçeneğini birlikte netleştirelim.</small>
            </span>
          </div>
          <Link to="/teklif-al">TEKLİF AL</Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
