import { useEffect, useMemo } from "react";
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
import Seo from "../components/common/Seo";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { useI18n } from "../i18n/I18nProvider";
import { useLocalizedPath } from "../i18n/useLocalizedPath";
import { localizedSetting } from "../i18n/settingsI18n";
import "./DentalVacuumSystemPage.css";

const heroFeatureIcons = [ShieldCheck, Volume2, Settings, BadgeCheck];
const useCaseIcons = [Stethoscope, Hospital, Building2, CircleCheck, Microscope];

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

  const { t, tv, locale } = useI18n();
  const path = useLocalizedPath();

  const { data: rawSettings } = useListSettings();
  const s = (rawSettings as Record<string, string> | undefined) ?? {};

  const eyebrow = localizedSetting(s, "dvs_hero_eyebrow", locale, t("dvs.hero.eyebrow"));
  const heroTitle = localizedSetting(s, "dvs_hero_title", locale, "");
  const desc1 = localizedSetting(s, "dvs_hero_desc1", locale, t("dvs.hero.desc1"));
  const desc2 = localizedSetting(s, "dvs_hero_desc2", locale, t("dvs.hero.desc2"));
  const heroImage = s["dvs_hero_image"];
  const heroMobileImage = s["dvs_hero_mobile_image"];
  const imageCards_imgs = [0, 1, 2].map((i) => s[`dvs_img_${i}`]);
  const drawingImage = s["dvs_drawing_image"];

  const heroFeatures = tv<Array<{ title: string; text: string }>>("dvs.heroFeatures", []);
  const imageCards = tv<Array<{ title: string; text: string; ariaLabel: string }>>("dvs.imageCards", []);
  const specRows = tv<Array<[string, string]>>("dvs.specs.rows", []);

  const specsText = localizedSetting(s, "dvs_specs_text", locale, "");
  const displaySpecs: [string, string][] = specsText
    ? parseDvsSpecsText(specsText)
    : (specRows as [string, string][]);

  const useCaseItems = tv<string[]>("dvs.useCases.items", []);

  const productName = t("dvs.hero.titleLine1") + " " + t("dvs.hero.titleLine2");
  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Product",
      name: productName,
      description: t("dvs.hero.desc1"),
      brand: {
        "@type": "Brand",
        name: "Oxymed Medikal",
      },
      category: t("dvs.category"),
    }),
    [productName, t],
  );

  return (
    <div className="dvs-page">
      <Seo routeKey="dvs" jsonLd={jsonLd} />
      <Header />

      <main className="dvs-main">
        <section
          className="dvs-hero"
          style={
            heroImage
              ? {
                  backgroundImage: `url(${heroImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center top",
                  backgroundRepeat: "no-repeat",
                }
              : undefined
          }
        >
          <div className="dvs-container dvs-hero__grid">
            <div className="dvs-hero__content">
              <Breadcrumbs
                items={[
                  { label: t("common.breadcrumb.home"), to: path("home") },
                  { label: t("common.breadcrumb.products"), to: path("products") },
                  { label: heroTitle || productName },
                ]}
              />
              <div className="dvs-eyebrow">{eyebrow}</div>
              <h1>
                {heroTitle ? (
                  heroTitle
                ) : (
                  <>
                    {t("dvs.hero.titleLine1")}
                    <span>{t("dvs.hero.titleLine2")}</span>
                  </>
                )}
              </h1>
              <div className="dvs-title-line" />
              <p>{desc1}</p>
              <p>{desc2}</p>

              <div className="dvs-hero-features">
                {heroFeatures.map((feature, i) => {
                  const Icon = heroFeatureIcons[i];
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
                  <img
                    src={heroMobileImage}
                    alt={heroTitle || productName}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <section
          className="dvs-container dvs-image-strip"
          aria-label={t("dvs.imageStrip.ariaLabel")}
        >
          {imageCards.map((card, i) => (
            <article key={card.title} className="dvs-image-card">
              <div
                className={`dvs-image-slot${imageCards_imgs[i] ? " dvs-image-slot--has-image" : ""}`}
                aria-label={card.ariaLabel}
                style={imageCards_imgs[i] ? { backgroundImage: `url(${imageCards_imgs[i]})` } : undefined}
              />
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </article>
          ))}
        </section>

        <section className="dvs-container dvs-technical-grid">
          <article className="dvs-specs">
            <h2>{t("dvs.specs.heading")}</h2>
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
            <h2>{t("dvs.drawing.heading")}</h2>
            <div className="dvs-drawing-grid">
              <div
                className={`dvs-drawing-slot${drawingImage ? " dvs-drawing-slot--has-image" : ""}`}
                aria-label={t("dvs.drawing.ariaLabel")}
                style={drawingImage ? { backgroundImage: `url(${drawingImage})` } : undefined}
              />
            </div>
          </article>

          <article className="dvs-usage">
            <h2>{t("dvs.useCases.heading")}</h2>
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

        <section className="dvs-container dvs-bottom-note">
          <div>
            <Gauge aria-hidden="true" />
            <span>{t("dvs.bottomNote.vacuum")}</span>
          </div>
          <div>
            <Ruler aria-hidden="true" />
            <span>{t("dvs.bottomNote.capacity")}</span>
          </div>
          <Link to={path("quote")}>{t("dvs.bottomNote.cta")}</Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
