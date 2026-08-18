import { useEffect, useMemo } from "react";
import {
  Bell,
  Building2,
  Check,
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
import AnimatedFaq from "../components/common/AnimatedFaq";
import Seo from "../components/common/Seo";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { useI18n } from "../i18n/I18nProvider";
import { useLocalizedPath } from "../i18n/useLocalizedPath";
import { localizedJsonSetting } from "../i18n/settingsI18n";
import "./GasControlPanelPage.css";

const USE_CASE_ICONS = [Hospital, HeartPulse, Stethoscope, Building2, FileCheck2];
const HERO_FEATURE_ICONS = [ShieldCheck, SlidersHorizontal, Bell, Wrench];
const FEATURE_TILE_ICONS = [Layers3, Gauge, Bell, Zap];

function useGCPContent() {
  const { data: rawSettings } = useListSettings();
  const { tv, locale } = useI18n();
  const s = (rawSettings as Record<string, string>) ?? {};

  function parse<T>(key: string, fallback: T): T {
    const parsed = localizedJsonSetting(s, key, locale, fallback);
    if (Array.isArray(fallback)) {
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
    }
    return typeof parsed === "object" && parsed !== null ? parsed : fallback;
  }

  return {
    hero: parse<{ title: string; description: string }>("gcp_hero", {
      title: tv<string>("gcp.hero.title", "3 Gazlı Kat Kontrol Panosu"),
      description: tv<string>("gcp.hero.description", "Medikal gaz sistemleriniz için güvenli, akıllı ve kesintisiz kontrol."),
    }),
    heroImage: s["gcp_hero_image"] ?? "",
    drawingImage: s["gcp_drawing_image"] ?? "",
    imgs: [s["gcp_img_0"] ?? "", s["gcp_img_1"] ?? "", s["gcp_img_2"] ?? ""],
    specs: parse<Array<{ k: string; v: string }>>("gcp_specs",
      tv<Array<{ k: string; v: string }>>("gcp.specs.rows", [])
    ),
    faqs: parse<Array<{ q: string; a: string }>>("gcp_faqs",
      tv<Array<{ q: string; a: string }>>("gcp.faqs.items", [])
    ),
    advantages: parse<string[]>("gcp_advantages",
      tv<string[]>("gcp.advantages.items", [])
    ),
    detailCards: parse<Array<{ title: string; text: string }>>("gcp_detail_cards",
      tv<Array<{ title: string; text: string }>>("gcp.detailCards", [])
    ),
  };
}

function ImageSlot({ label, size, className = "", image, width, height }: { label: string; size: string; className?: string; image?: string; width: number; height: number; }) {
  const { t } = useI18n();
  return (
    <div
      className={`gcp-image-slot ${image ? "gcp-image-slot--has-image" : ""} ${className}`}
    >
      {image && <img src={image} alt={label} width={width} height={height} loading="lazy" decoding="async" />}
      {!image && (
        <>
          <span>{label}</span>
          <strong>{size}</strong>
          <small>{t("gcp.imageSlot.webpLabel")}</small>
        </>
      )}
    </div>
  );
}

export default function GasControlPanelPage() {
  const { hero, specs, faqs, advantages, detailCards, heroImage, drawingImage, imgs } = useGCPContent();
  const { t, tv } = useI18n();
  const path = useLocalizedPath();

  const heroFeatures = tv<Array<{ title: string; text: string }>>("gcp.heroFeatures", []);
  const featureTiles = tv<Array<{ title: string; text: string }>>("gcp.featureTiles.items", []);
  const useCaseLabels = tv<string[]>("gcp.useCases.items", []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: hero.title,
    description: hero.description,
    brand: { "@type": "Brand", name: "Oxymed Medikal" },
    category: t("gcp.useCases.title"),
  }), [hero.title, hero.description, t]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="gcp-page">
      <Seo routeKey="gcp" jsonLd={jsonLd} />
      {/* This page draws its own trail inside the dark hero, so the shared
          component contributes the structured data only. */}
      <Breadcrumbs
        jsonLdOnly
        items={[
          { label: t("common.breadcrumb.home"), to: path("home") },
          { label: t("common.breadcrumb.products"), to: path("products") },
          { label: hero.title },
        ]}
      />
      <Header />

      <main>
        <section className="gcp-hero">
          <div className="gcp-container gcp-hero__grid">
            <div className="gcp-hero__content">
              <nav className="gcp-breadcrumb" aria-label={t("gcp.breadcrumb.ariaLabel")}>
                <Link to={path("home")}>
                  <Home size={15} />
                </Link>
                <span>/</span>
                <Link to={path("products")}>{t("gcp.breadcrumb.products")}</Link>
                <span>/</span>
                <span>{hero.title}</span>
              </nav>

              <h1>
                {hero.title}
              </h1>
              <p>{hero.description}</p>

              <div className="gcp-hero-features">
                {heroFeatures.map((item, i) => {
                  const Icon = HERO_FEATURE_ICONS[i] ?? ShieldCheck;
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
              aria-hidden="true"
            >
              {heroImage && <img src={heroImage} alt={hero.title} width={582} height={640} loading="eager" decoding="async" />}
              {!heroImage && (
                <>
                  <span>{t("gcp.hero.photoSlot")}</span>
                  <strong>{t("gcp.hero.photoSlotSize")}</strong>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="gcp-container gcp-card-row">
          <h2 className="gcp-visually-hidden">Detaylar</h2>
          {detailCards.map((card, i) => (
            <article className="gcp-detail-card" key={card.title}>
              <ImageSlot label={card.title} size="800 x 450 px" image={imgs[i]} width={800} height={450} />
              <div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="gcp-container gcp-info-grid">
          <article className="gcp-specs">
            <h2>{t("gcp.specs.title")}</h2>
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
            <h2>{t("gcp.drawing.title")}</h2>
            <ImageSlot label={t("gcp.drawing.slotLabel")} size={t("gcp.drawing.slotSize")} image={drawingImage} width={520} height={360} />
          </article>

          <article className="gcp-uses">
            <h2>{t("gcp.useCases.title")}</h2>
            <ul>
              {useCaseLabels.map((label, i) => {
                const Icon = USE_CASE_ICONS[i] ?? Hospital;
                return (
                  <li key={label}>
                    <Icon size={34} />
                    <span>{label}</span>
                  </li>
                );
              })}
            </ul>
          </article>
        </section>

        <section className="gcp-dark-band">
          <div className="gcp-container gcp-dark-grid">
            <article className="gcp-advantages">
              <h2>{t("gcp.advantages.title")}</h2>
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
              <h2>{t("gcp.featureTiles.title")}</h2>
              <div>
                {featureTiles.map((item, i) => {
                  const Icon = FEATURE_TILE_ICONS[i] ?? Layers3;
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
          <h2>{t("gcp.faqs.title")}</h2>
          <AnimatedFaq
            className="gcp-faq-grid"
            items={faqs.map((faq) => ({ question: faq.q, answer: faq.a }))}
          />
        </section>

        <section className="gcp-cta">
          <div className="gcp-container gcp-cta__inner">
            <div>
              <FileCheck2 size={42} />
              <span>
                <strong>{t("gcp.cta.title")}</strong>
                <small>{t("gcp.cta.subtitle")}</small>
              </span>
            </div>
            <nav aria-label={t("gcp.cta.ariaLabel")}>
              <Link to={path("quote")} className="gcp-cta-primary">{t("gcp.cta.primaryBtn")}</Link>
              <Link to={path("home") + "#iletisim"} className="gcp-cta-secondary">{t("gcp.cta.secondaryBtn")}</Link>
            </nav>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
