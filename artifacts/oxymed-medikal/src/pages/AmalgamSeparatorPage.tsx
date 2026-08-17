import { useEffect, useMemo } from "react";
import { useListSettings } from "@workspace/api-client-react";
import {
  ArrowRight,
  Building2,
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
import AnimatedFaq from "../components/common/AnimatedFaq";
import Seo from "../components/common/Seo";
import { useI18n } from "../i18n/I18nProvider";
import { useLocalizedPath } from "../i18n/useLocalizedPath";
import { localizedSetting } from "../i18n/settingsI18n";
import "./AmalgamSeparatorPage.css";

const HERO_FEATURE_ICONS = [ShieldCheck, Droplets, Puzzle, Clock3];
const USE_CASE_ICONS = [Stethoscope, Settings, Building2, Wrench, CirclePlus];

function parseSpecsText(text: string): [string, string][] {
  return text.split("\n").filter(Boolean).map((line): [string, string] => {
    const idx = line.indexOf("::");
    return idx === -1 ? [line, ""] : [line.slice(0, idx), line.slice(idx + 2)];
  });
}

export default function AmalgamSeparatorPage() {
  const { t, tv, locale } = useI18n();
  const path = useLocalizedPath();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: rawSettings } = useListSettings();
  const s = (rawSettings as Record<string, string> | undefined) ?? {};

  const eyebrow = localizedSetting(s, "ams_hero_eyebrow", locale, t("ams.hero.eyebrow"));
  const heroTitle = localizedSetting(s, "ams_hero_title", locale, "");
  const desc1 = localizedSetting(s, "ams_hero_desc1", locale, t("ams.hero.desc1"));
  const desc2 = localizedSetting(s, "ams_hero_desc2", locale, t("ams.hero.desc2"));
  const heroImage = s["ams_hero_image"];
  const detailImages = [0, 1, 2, 3].map((i) => s[`ams_img_${i}`]);
  const drawingImage = s["ams_drawing_image"];

  const heroFeatures = tv<Array<{ title: string; text: string }>>("ams.heroFeatures", []);
  const detailCards = tv<Array<{ title: string; text: string }>>("ams.detailGrid.cards", []);
  const faqs = tv<Array<{ q: string; a: string }>>("ams.faqs.items", []);
  const useCases = tv<Array<{ title: string; text: string }>>("ams.useCases.items", []);
  const defaultSpecRows = tv<Array<{ k: string; v: string }>>("ams.specs.rows", []);

  const specsText = localizedSetting(s, "ams_specs_text", locale, "");
  const displaySpecs: [string, string][] = specsText
    ? parseSpecsText(specsText)
    : defaultSpecRows.map((row) => [row.k, row.v]);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: t("ams.hero.titleLine1") + " " + t("ams.hero.titleLine2"),
    description: desc1,
    brand: { "@type": "Brand", name: "Oxymed Medikal" },
    category: t("ams.useCases.title"),
  }), [t, desc1]);

  return (
    <div className="ams-page">
      <Seo routeKey="ams" jsonLd={jsonLd} />
      <Header />

      <main className="ams-main">
        <section className="ams-hero">
          <div className="ams-container ams-hero__grid">
            <div className="ams-hero__content">
              <div className="ams-eyebrow">{eyebrow}</div>
              <h1>
                {heroTitle ? heroTitle : <>{t("ams.hero.titleLine1")}<span>{t("ams.hero.titleLine2")}</span></>}
              </h1>
              <div className="ams-title-line" />
              <p>{desc1}</p>
              <p>{desc2}</p>

              <div className="ams-hero-features">
                {heroFeatures.map((feature, i) => {
                  const Icon = HERO_FEATURE_ICONS[i] ?? ShieldCheck;
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

            <div className="ams-hero__visual" aria-label={t("ams.hero.photoSlotAriaLabel")}>
              <div
                className={`ams-hero-photo-slot${heroImage ? " ams-hero-photo-slot--has-image" : ""}`}
                style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
              />
            </div>
          </div>
        </section>

        <section className="ams-container ams-detail-grid" aria-label={t("ams.detailGrid.ariaLabel")}>
          {detailCards.map((card, i) => (
            <article key={card.title}>
              <div
                className={`ams-image-slot${detailImages[i] ? " ams-image-slot--has-image" : ""}`}
                aria-label={`${card.title} ${t("ams.imageSlot.webpSuffix")}`}
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
              <h2>{t("ams.specs.title")}</h2>
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
              <h2>{t("ams.drawing.title")}</h2>
            </header>
            <div
              className={`ams-drawing-slot${drawingImage ? " ams-drawing-slot--has-image" : ""}`}
              aria-label={t("ams.drawing.slotAriaLabel")}
              style={drawingImage ? { backgroundImage: `url(${drawingImage})` } : undefined}
            />
            <p>{t("ams.drawing.unitNote")}</p>
          </article>
        </section>

        <section className="ams-container ams-usage-band">
          <h2>{t("ams.useCases.title")}</h2>
          <div>
            {useCases.map((item, i) => {
              const Icon = USE_CASE_ICONS[i] ?? Stethoscope;
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
            <h2>{t("ams.faqs.title")}</h2>
          </header>
          <AnimatedFaq
            className="ams-faq__grid"
            items={faqs.map((faq) => ({ question: faq.q, answer: faq.a }))}
          />
        </section>

        <section className="ams-quote-strip">
          <div className="ams-container ams-quote-strip__inner">
            <FileCheck2 aria-hidden="true" />
            <div>
              <h2>{t("ams.cta.title")}</h2>
              <p>{t("ams.cta.subtitle")}</p>
            </div>
            <Link to={path("quote")}>
              {t("ams.cta.btn")}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
