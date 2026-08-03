import { useEffect } from "react";
import { useListSettings } from "@workspace/api-client-react";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  CirclePlus,
  Clock3,
  Droplets,
  FileCheck2,
  MessageCircle,
  Puzzle,
  Ruler,
  Settings,
  ShieldCheck,
  Stethoscope,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import "./AmalgamSeparatorPage.css";

const heroFeatures = [
  {
    icon: ShieldCheck,
    title: "Paslanmaz Çelik Gövde",
    text: "Yüksek kaliteli paslanmaz çelik malzeme uzun ömürlü kullanım sağlar.",
  },
  {
    icon: Droplets,
    title: "Hijyenik Tasarım",
    text: "Pürüzsüz yüzey yapısı ile kolay temizlik ve hijyenik kullanım sunar.",
  },
  {
    icon: Puzzle,
    title: "Kolay Entegrasyon",
    text: "Mevcut vakum hatlarına hızlı ve kolay entegrasyon imkanı.",
  },
  {
    icon: Clock3,
    title: "Uzun Ömürlü Kullanım",
    text: "Sağlam yapısı ile zorlu koşullarda bile maksimum performans.",
  },
];

const detailCards = [
  {
    title: "Dayanıklı Gövde",
    text: "Kalın paslanmaz çelik gövde yapısı ile korozyona karşı üstün direnç sağlar.",
  },
  {
    title: "Detaylı Bağlantı Yapısı",
    text: "İç bağlantı tasarımı, akış verimliliğini artırır ve tıkanma riskini minimize eder.",
  },
  {
    title: "Kolay Montaj",
    text: "Standart bağlantı noktaları sayesinde hızlı ve pratik montaj imkanı sunar.",
  },
  {
    title: "Hijyenik Yüzey",
    text: "Pürüzsüz iç ve dış yüzey yapısı ile kolay temizlik ve hijyen sağlar.",
  },
];

const specs = [
  ["Ürün Adı", "Amalgam Separatörü"],
  ["Kullanım Alanı", "Diş üniteleri ve vakum sistemleri"],
  ["Gövde Malzemesi", "Paslanmaz Çelik (AISI 304)"],
  ["Bağlantı Yapısı", "Standart dental vakum hatlarına uygun"],
  ["Temizlik / Bakım", "Kolay sökülebilir yapı ve pürüzsüz yüzey"],
  ["Montaj Tipi", "Dikey montaj"],
  ["Uyumluluk", "Tüm dental vakum sistemleri ile uyumlu"],
  ["Yüzey Yapısı", "Pürüzsüz, hijyenik, korozyona dayanıklı"],
];

const useCases = [
  {
    icon: Stethoscope,
    title: "Diş Klinikleri",
    text: "Diş kliniklerinde amalgam atıklarının güvenli ayrıştırılması.",
  },
  {
    icon: Settings,
    title: "Dental Sistemler",
    text: "Dental üniteler ve vakum sistemleriyle tam uyumlu kullanım.",
  },
  {
    icon: Building2,
    title: "Merkezi Vakum Hatları ile Entegrasyon",
    text: "Merkezi sistemlere kolay entegrasyon ve optimum performans.",
  },
  {
    icon: Wrench,
    title: "Teknik Servis Uygulamaları",
    text: "Teknik servis ve bakım uygulamalarında güvenilir çözüm ortağı.",
  },
  {
    icon: CirclePlus,
    title: "Sağlık Kuruluşları",
    text: "Hastaneler ve sağlık kuruluşları için ideal çözüm.",
  },
];

const faqs = [
  {
    q: "Amalgam separatörü ne işe yarar?",
    a: "Amalgam partiküllerini aspirasyon sistemlerinden ayırarak çevreye karışmasını önler ve atıkların güvenli şekilde toplanmasını sağlar.",
  },
  {
    q: "Montaj süreci nasıldır?",
    a: "Dikey montaj önerilir. Standart bağlantı noktaları sayesinde mevcut vakum hattına hızlı ve kolay şekilde entegre edilir.",
  },
  {
    q: "Hangi sistemlerle uyumludur?",
    a: "Tüm dental vakum sistemleri ve merkezi vakum hatları ile uyumludur. Standart bağlantı ölçülerine sahiptir.",
  },
  {
    q: "Neden paslanmaz çelik tercih edilmiştir?",
    a: "Paslanmaz çelik malzeme, korozyona karşı üstün direnç sağlar, uzun ömürlüdür ve hijyenik kullanım için idealdir.",
  },
  {
    q: "Bakımı nasıl yapılır?",
    a: "Dış yüzey nemli bir bezle silinebilir. İç kısım periyodik olarak kontrol edilmeli ve gerektiğinde sökülebilir yapısı sayesinde kolayca temizlenmelidir.",
  },
];

function parseSpecsText(text: string): [string, string][] {
  return text.split("\n").filter(Boolean).map((line): [string, string] => {
    const idx = line.indexOf("::");
    return idx === -1 ? [line, ""] : [line.slice(0, idx), line.slice(idx + 2)];
  });
}

export default function AmalgamSeparatorPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: rawSettings } = useListSettings();
  const s = (rawSettings as Record<string, string> | undefined) ?? {};
  const eyebrow = s["ams_hero_eyebrow"] || "OXYMED MEDİKAL";
  const heroTitle = s["ams_hero_title"];
  const desc1 = s["ams_hero_desc1"] || "Oxymed Amalgam Separatörü, diş ünitelerinden aspirasyon sistemleriyle oluşan amalgam partiküllerini etkin şekilde ayırarak çevreye karışmasını önler.";
  const desc2 = s["ams_hero_desc2"] || "Hijyenik, dayanıklı ve verimli tasarımıyla güvenli bir çalışma ortamı sunar.";
  const heroImage = s["ams_hero_image"];
  const detailImages = [0, 1, 2, 3].map((i) => s[`ams_img_${i}`]);
  const displaySpecs: [string, string][] = s["ams_specs_text"] ? parseSpecsText(s["ams_specs_text"]) : (specs as [string, string][]);
  const drawingImage = s["ams_drawing_image"];

  return (
    <div className="ams-page">
      <Header />

      <main className="ams-main">
        <section className="ams-hero">
          <div className="ams-container ams-hero__grid">
            <div className="ams-hero__content">
              <div className="ams-eyebrow">{eyebrow}</div>
              <h1>
                {heroTitle ? heroTitle : <>AMALGAM<span>SEPARATÖRÜ</span></>}
              </h1>
              <div className="ams-title-line" />
              <p>{desc1}</p>
              <p>{desc2}</p>

              <div className="ams-hero-features">
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
            </div>

            <div className="ams-hero__visual" aria-label="Amalgam separatörü ana WEBP görsel alanı">
              <div
                className={`ams-hero-photo-slot${heroImage ? " ams-hero-photo-slot--has-image" : ""}`}
                style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
              />
            </div>
          </div>
        </section>

        <section className="ams-container ams-detail-grid" aria-label="Ürün detay görsel alanları">
          {detailCards.map((card, i) => (
            <article key={card.title}>
              <div
                className={`ams-image-slot${detailImages[i] ? " ams-image-slot--has-image" : ""}`}
                aria-label={`${card.title} WEBP görsel alanı`}
                style={detailImages[i] ? { backgroundImage: `url(${detailImages[i]})` } : undefined}
              />
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </article>
          ))}
        </section>

        <section className="ams-container ams-technical-panel">
          <article className="ams-specs">
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

          <article className="ams-drawing">
            <header>
              <Ruler aria-hidden="true" />
              <h2>TEKNİK ÇİZİM VE ÖLÇÜLER</h2>
            </header>
            <div
              className={`ams-drawing-slot${drawingImage ? " ams-drawing-slot--has-image" : ""}`}
              aria-label="Teknik çizim ve ölçüler WEBP görsel alanı"
              style={drawingImage ? { backgroundImage: `url(${drawingImage})` } : undefined}
            />
            <p>Tüm ölçüler mm cinsindendir.</p>
          </article>
        </section>

        <section className="ams-container ams-usage-band">
          <h2>KULLANIM ALANLARI</h2>
          <div>
            {useCases.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title}>
                  <Icon aria-hidden="true" />
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="ams-container ams-faq">
          <header>
            <MessageCircle aria-hidden="true" />
            <h2>S.S.S.</h2>
          </header>
          <div className="ams-faq__grid">
            {faqs.map((item, index) => (
              <details key={item.q} open={index === 0}>
                <summary>
                  <span>{item.q}</span>
                  <ChevronDown aria-hidden="true" />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="ams-quote-strip">
          <div className="ams-container ams-quote-strip__inner">
            <FileCheck2 aria-hidden="true" />
            <div>
              <h2>Hızlı Teklif Al</h2>
              <p>Projeniz için uygun çözüm ve fiyat teklifi almak için bizimle iletişime geçin.</p>
            </div>
            <Link to="/teklif-al">
              Teklif İste
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
