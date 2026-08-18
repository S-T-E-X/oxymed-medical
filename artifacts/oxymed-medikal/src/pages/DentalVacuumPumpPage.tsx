import { useEffect, useMemo, type CSSProperties } from "react";
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
import Seo from "../components/common/Seo";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { useI18n } from "../i18n/I18nProvider";
import { useLocalizedPath } from "../i18n/useLocalizedPath";
import { localizedSetting } from "../i18n/settingsI18n";
import "./DentalVacuumPumpPage.css";

const heroFeatureIcons = [ShieldCheck, VolumeX, BadgeCheck, Wrench];
const useCaseIcons = [Stethoscope, Settings, Building2, Hospital];

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

  const { t, tv, locale } = useI18n();
  const path = useLocalizedPath();

  const { data: rawSettings } = useListSettings();
  const s = (rawSettings as Record<string, string> | undefined) ?? {};

  const eyebrow = localizedSetting(s, "dvp_hero_eyebrow", locale, t("dvp.hero.eyebrow"));
  const heroTitle = localizedSetting(s, "dvp_hero_title", locale, "");
  const desc1 = localizedSetting(s, "dvp_hero_desc1", locale, t("dvp.hero.desc1"));
  const desc2 = localizedSetting(s, "dvp_hero_desc2", locale, t("dvp.hero.desc2"));
  const heroImage = s["dvp_hero_image"];
  const heroMobileImage = s["dvp_hero_mobile_image"];
  const galleryImages = [0, 1, 2].map((i) => s[`dvp_img_${i}`]);
  const drawingImage = s["dvp_drawing_image"];

  const heroFeatures = tv<Array<{ title: string; text: string }>>("dvp.heroFeatures", []);
  const imageCards = tv<Array<{ title: string; text: string; ariaLabel: string }>>("dvp.imageCards", []);
  const specRows = tv<Array<[string, string]>>("dvp.specs.rows", []);

  const specsText = localizedSetting(s, "dvp_specs_text", locale, "");
  const displaySpecs: [string, string][] = specsText
    ? parseDvpSpecsText(specsText)
    : (specRows as [string, string][]);

  const useCaseItems = tv<string[]>("dvp.useCases.items", []);

  const heroVisualStyle = {
    "--dvp-hero-image": heroImage ? `url(${heroImage})` : "none",
    "--dvp-hero-mobile-image": `url(${heroMobileImage || heroImage || ""})`,
  } as CSSProperties;

  const productName = t("dvp.hero.titleLine1") + " " + t("dvp.hero.titleLine2");
  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Product",
      name: productName,
      description: t("dvp.hero.desc1"),
      brand: {
        "@type": "Brand",
        name: "Oxymed Medikal",
      },
      category: t("dvp.category"),
    }),
    [productName, t],
  );

  return (
    <div className="dvp-page">
      <Seo routeKey="dvp" jsonLd={jsonLd} />
      <Header />

      <main className="dvp-main">
        <section className="dvp-hero">
          <div className="dvp-container dvp-hero__grid">
            <div className="dvp-hero__content">
              <Breadcrumbs
                tone="dark"
                items={[
                  { label: t("common.breadcrumb.home"), to: path("home") },
                  { label: t("common.breadcrumb.products"), to: path("products") },
                  { label: heroTitle || productName },
                ]}
              />
              <div className="dvp-eyebrow">{eyebrow}</div>
              <h1>
                {heroTitle ? (
                  heroTitle
                ) : (
                  <>
                    <span>{t("dvp.hero.titleLine1")}</span>
                    {t("dvp.hero.titleLine2")}
                  </>
                )}
              </h1>
              <div className="dvp-title-line" />
              <p>{desc1}</p>
              <p>{desc2}</p>
            </div>

            <div
              className="dvp-hero__visual"
              aria-label={t("dvp.hero.visualAriaLabel")}
              style={heroVisualStyle}
            >
              <div className="dvp-hero-photo-slot" />
              <div className="dvp-hero-floor" aria-hidden="true" />
            </div>
          </div>

          <div className="dvp-container dvp-feature-row">
            {heroFeatures.map((feature, i) => {
              const Icon = heroFeatureIcons[i];
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
                <div
                  className={`dvp-image-slot${galleryImages[i] ? " dvp-image-slot--has-image" : ""}`}
                  aria-label={card.ariaLabel}
                  style={galleryImages[i] ? { backgroundImage: `url(${galleryImages[i]})` } : undefined}
                />
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
              <h2>{t("dvp.specs.heading")}</h2>
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
              <h2>{t("dvp.drawing.heading")}</h2>
            </header>
            <div className="dvp-drawing-grid">
              <div
                className={`dvp-drawing-slot${drawingImage ? " dvp-drawing-slot--has-image" : ""}`}
                aria-label={t("dvp.drawing.ariaLabel")}
                style={drawingImage ? { backgroundImage: `url(${drawingImage})` } : undefined}
              />
            </div>
            <p>{t("dvp.drawing.note")}</p>
          </article>

          <article className="dvp-usage">
            <header>
              <Gauge aria-hidden="true" />
              <h2>{t("dvp.useCases.heading")}</h2>
            </header>
            <ul>
              {useCaseItems.map((text, i) => {
                const Icon = useCaseIcons[i];
                return (
                  <li key={text}>
                    <Icon aria-hidden="true" />
                    <span>{text}</span>
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
              <strong>{t("dvp.quickQuote.strong")}</strong>
              <small>{t("dvp.quickQuote.small")}</small>
            </span>
          </div>
          <Link to={path("quote")}>{t("dvp.quickQuote.cta")}</Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
