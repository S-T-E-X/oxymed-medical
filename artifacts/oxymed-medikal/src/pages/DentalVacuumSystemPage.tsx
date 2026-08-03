import { useEffect } from "react";
import { useListSettings } from "@workspace/api-client-react";
import {
  BadgeCheck,
  Building2,
  CircleCheck,
  Gauge,
  Hospital,
  Microscope,
  Ruler,
  Settings,
  ShieldCheck,
  Stethoscope,
  Volume2,
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import "./DentalVacuumSystemPage.css";

const heroFeatures = [
  {
    icon: ShieldCheck,
    title: "YÜKSEK GÜVENİLİRLİK",
    text: "Kesintisiz vakum üretimi için yedekli pompa konfigürasyonu.",
  },
  {
    icon: Volume2,
    title: "SESSİZ VE VERİMLİ",
    text: "Düşük ses seviyesi ve yüksek enerji verimliliği.",
  },
  {
    icon: Settings,
    title: "KOLAY KULLANIM",
    text: "Kullanıcı dostu kontrol paneli ile anlık izleme ve yönetim.",
  },
  {
    icon: BadgeCheck,
    title: "UZUN ÖMÜRLÜ YAPI",
    text: "Kaliteli komponentler ile uzun ve stabil çalışma ömrü.",
  },
];

const imageCards = [
  {
    title: "PASLANMAZ ÇELİK MANİFOLD",
    text: "Korozyona karşı dayanıklı, hijyenik ve uzun ömürlü yapı.",
  },
  {
    title: "AKILLI KONTROL PANELİ",
    text: "Sistem durumu, alarm ve otomasyon yönetimi.",
  },
  {
    title: "YÜKSEK PERFORMANSLI POMPALAR",
    text: "Güçlü vakum sağlayan, dayanıklı ve sessiz üniteler.",
  },
];

const specs = [
  ["Ürün Adı", "OXY-DVS Dental Vakum Sistemi"],
  ["Vakum Kapasitesi", "100 - 840 m³/h (isteğe bağlı)"],
  ["Çalışma Vakumu", "-0,6 / -0,8 bar"],
  ["Pompa Adedi", "2 - 4 adet (yedekli)"],
  ["Motor Gücü", "2,2 - 4 kW (pompa başı)"],
  ["Güç Beslemesi", "380 VAC - 50 Hz"],
  ["Ses Seviyesi", "≤ 70 dB(A)"],
  ["Manifold Malzemesi", "Paslanmaz Çelik (AISI 304)"],
  ["Bağlantı Çapı", "DN40 - DN65"],
  ["Çalışma Sıcaklığı", "-10 °C / +50 °C"],
  ["Koruma Sınıfı", "IP54"],
  ["Boyutlar (YxGxD)", "1300 x 600 x 1200 mm (örnek)"],
];

const useCases = [
  { icon: Stethoscope, text: "Diş Klinikleri" },
  { icon: Hospital, text: "Ağız ve Diş Sağlığı Merkezleri" },
  { icon: Building2, text: "Hastaneler" },
  { icon: CircleCheck, text: "Cerrahi Müdahale Odaları" },
  { icon: Microscope, text: "Laboratuvarlar" },
];

function parseDvsSpecsText(text: string): [string, string][] {
  return text.split("\n").filter(Boolean).map((line): [string, string] => {
    const idx = line.indexOf("::");
    return idx === -1 ? [line, ""] : [line.slice(0, idx), line.slice(idx + 2)];
  });
}

export default function DentalVacuumSystemPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: rawSettings } = useListSettings();
  const s = (rawSettings as Record<string, string> | undefined) ?? {};
  const eyebrow = s["dvs_hero_eyebrow"] || "OXY-DVS SERIES";
  const heroTitle = s["dvs_hero_title"];
  const desc1 = s["dvs_hero_desc1"] || "Dental kliniklerin merkezi vakum ihtiyacını karşılamak için tasarlanmış, yüksek performanslı ve güvenilir sistem çözümü.";
  const desc2 = s["dvs_hero_desc2"] || "Kesintisiz vakum gücü, sessiz çalışma ve uzun ömürlü yapı ile sağlık tesislerinde maksimum verimlilik sağlar.";
  const heroImage = s["dvs_hero_image"];
  const heroMobileImage = s["dvs_hero_mobile_image"];
  const imageCards_imgs = [0, 1, 2].map((i) => s[`dvs_img_${i}`]);
  const displaySpecs: [string, string][] = s["dvs_specs_text"] ? parseDvsSpecsText(s["dvs_specs_text"]) : (specs as [string, string][]);
  const drawingImage = s["dvs_drawing_image"];

  return (
    <div className="dvs-page">
      <Header />

      <main className="dvs-main">
        <section
          className="dvs-hero"
          style={
            heroImage
              ? {
                  backgroundImage: `url(${heroImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }
              : undefined
          }
        >
          <div className="dvs-container dvs-hero__grid">
            <div className="dvs-hero__content">
              <div className="dvs-eyebrow">{eyebrow}</div>
              <h1>
                {heroTitle ? heroTitle : <>DENTAL<span>VAKUM SİSTEMİ</span></>}
              </h1>
              <div className="dvs-title-line" />
              <p>{desc1}</p>
              <p>{desc2}</p>

              <div className="dvs-hero-features">
                {heroFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <article key={feature.title}>
                      <Icon aria-hidden="true" />
                      <div>
                        <h2>{feature.title}</h2>
                        <span>{feature.text}</span>
                      </div>
                    </article>
                  );
                })}
              </div>

              {heroMobileImage && (
                <div className="dvs-hero__mobile-image">
                  <img src={heroMobileImage} alt={heroTitle || "Dental Vakum Sistemi"} />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="dvs-container dvs-image-strip" aria-label="Ürün detay görsel alanları">
          {imageCards.map((card, i) => (
            <article key={card.title} className="dvs-image-card">
              <div className="dvs-image-slot" aria-label={`${card.title} WEBP görsel alanı`} style={imageCards_imgs[i] ? { backgroundImage: `url(${imageCards_imgs[i]})` } : undefined} />
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </article>
          ))}
        </section>

        <section className="dvs-container dvs-technical-grid">
          <article className="dvs-specs">
            <h2>TEKNİK ÖZELLİKLER</h2>
            <dl>
              {displaySpecs.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="dvs-drawing">
            <h2>TEKNİK ÇİZİM / BOYUTLAR</h2>
            <div className="dvs-drawing-grid">
              <div className="dvs-drawing-slot" aria-label="Teknik çizim ve boyutlar WEBP görsel alanı" style={drawingImage ? { backgroundImage: `url(${drawingImage})` } : undefined} />
            </div>
            <div className="dvs-dimensions" aria-hidden="true">
              <span>1300 mm</span>
              <span>1200 mm</span>
              <span>600 mm</span>
            </div>
          </article>

          <article className="dvs-usage">
            <h2>KULLANIM ALANLARI</h2>
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

        <section className="dvs-container dvs-bottom-note">
          <div>
            <Gauge aria-hidden="true" />
            <span>Güçlü, sessiz ve sürdürülebilir vakum performansı.</span>
          </div>
          <div>
            <Ruler aria-hidden="true" />
            <span>Proje ihtiyacına göre kapasite ve ölçü seçenekleri.</span>
          </div>
          <Link to="/teklif-al">TEKLİF AL</Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
