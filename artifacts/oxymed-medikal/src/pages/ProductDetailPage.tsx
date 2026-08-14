import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  FileCheck2,
  HelpCircle,
  Layers,
  Loader2,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  useGetProduct,
  useGetProductBySlug,
  useListProductCategories,
  type PageData,
  type PageDataContent,
} from "@workspace/api-client-react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import { useI18n } from "../i18n/I18nProvider";
import { useLocalizedPath } from "../i18n/useLocalizedPath";
import { pickLocalizedName } from "../i18n/pickLocalizedName";
import "./ProductDetailPage.css";

function localizedPageData(pageData: PageData | undefined, locale: string): PageDataContent {
  if (!pageData) return {};
  const { locales, ...base } = pageData;
  return {
    ...base,
    ...(locale === "tr" ? undefined : locales?.[locale]),
  };
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const { locale, t } = useI18n();
  const path = useLocalizedPath();
  const isNumericSlug = /^\d+$/.test(slug ?? "");
  const slugQuery = useGetProductBySlug(isNumericSlug ? "" : slug ?? "");
  const idQuery = useGetProduct(isNumericSlug ? Number(slug) : 0);
  const product = isNumericSlug ? idQuery.data : slugQuery.data;
  const isLoading = isNumericSlug ? idQuery.isLoading : slugQuery.isLoading;
  const isError = isNumericSlug ? idQuery.isError : slugQuery.isError;
  const { data: categories = [] } = useListProductCategories();

  if (isLoading) {
    return (
      <div className="pdp-page">
        <Header />
        <main className="pdp-main">
          <div className="pdp-state">
            <Loader2 className="pdp-spinner" aria-hidden="true" />
            <p>{t("products.detail.loading")}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="pdp-page">
        <Header />
        <main className="pdp-main">
          <div className="pdp-state">
            <p>{t("products.detail.notFound")}</p>
            <Link to={path("products")} className="pdp-back-link">{t("products.detail.backToProducts")}</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const pd = localizedPageData(product.pageData, locale);
  const category = categories.find((c) => c.id === product.categoryId);
  const localizedTitle = pickLocalizedName(product, "title", locale);
  const eyebrow = category ? pickLocalizedName(category, "name", locale) : t("products.detail.brand");
  const features = (pd.features ?? []).slice(0, 4);
  const detailCards = pd.detailCards ?? [];
  const specs = pd.specs ?? product.specs ?? [];
  const useCases = pd.useCases ?? [];
  const advantages = pd.advantages ?? [];
  const featureTiles = pd.featureTiles ?? [];
  const faq = pd.faq ?? [];

  return (
    <div className="pdp-page">
      <Header />

      <main className="pdp-main">
        <section className="pdp-hero">
          <div className="pdp-container pdp-hero__grid">
            <div className="pdp-hero__content">
              <div className="pdp-eyebrow">{eyebrow}</div>
              <h1>{localizedTitle}</h1>
              {pd.heroSubtitle && <p className="pdp-hero__subtitle">{pd.heroSubtitle}</p>}
              <div className="pdp-title-line" />
              {(pd.heroDescription || product.description) && (
                <p className="pdp-hero__desc">{pd.heroDescription || product.description}</p>
              )}

              {features.length > 0 && (
                <div className="pdp-hero-features">
                  {features.map((feature) => (
                    <article key={feature.title}>
                      <Sparkles aria-hidden="true" />
                      <div>
                        <h2>{feature.title}</h2>
                        <span>{feature.text}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="pdp-hero__visual" aria-label={t("products.detail.productImage").replace("{{product}}", localizedTitle)}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={localizedTitle} />
              ) : (
                <div className="pdp-hero-photo-slot" />
              )}
            </div>
          </div>
        </section>

        {detailCards.length > 0 && (
          <section className="pdp-container pdp-detail-grid" aria-label={t("products.detail.detailImages")}>
            {detailCards.map((card) => (
              <article key={card.title}>
                {card.imageUrl ? (
                  <div className="pdp-image-slot" style={{ backgroundImage: `url(${card.imageUrl})` }} />
                ) : (
                  <div className="pdp-image-slot" />
                )}
                <h2>{card.title}</h2>
                <p>{card.text}</p>
              </article>
            ))}
          </section>
        )}

        {(specs.length > 0 || advantages.length > 0) && (
          <section className="pdp-container pdp-technical-panel">
            {specs.length > 0 && (
              <article className="pdp-specs">
                <header>
                  <Settings aria-hidden="true" />
                  <h2>{t("products.detail.technicalSpecifications")}</h2>
                </header>
                <dl>
                  {specs.map((s) => (
                    <div key={s.label}>
                      <dt>{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            )}

            {advantages.length > 0 && (
              <article className="pdp-advantages">
                <header>
                  <BadgeCheck aria-hidden="true" />
                  <h2>{t("products.detail.advantages")}</h2>
                </header>
                <ul>
                  {advantages.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            )}
          </section>
        )}

        {useCases.length > 0 && (
          <section className="pdp-container pdp-usage-band">
            <h2>{t("products.detail.applications")}</h2>
            <div>
              {useCases.map((item) => (
                <article key={item}>
                  <Layers aria-hidden="true" />
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {featureTiles.length > 0 && (
          <section className="pdp-container pdp-tiles">
            {featureTiles.map((tile) => (
              <article key={tile.title}>
                <BadgeCheck aria-hidden="true" />
                <h3>{tile.title}</h3>
                <p>{tile.text}</p>
              </article>
            ))}
          </section>
        )}

        {faq.length > 0 && (
          <section className="pdp-container pdp-faq">
            <header>
              <HelpCircle aria-hidden="true" />
              <h2>{t("products.detail.faq")}</h2>
            </header>
            <div className="pdp-faq__grid">
              {faq.map((item, index) => (
                <details key={item.question} open={index === 0}>
                  <summary>
                    <span>{item.question}</span>
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className="pdp-quote-strip">
          <div className="pdp-container pdp-quote-strip__inner">
            <FileCheck2 aria-hidden="true" />
            <div>
                <h2>{t("products.detail.quickQuote")}</h2>
                <p>{t("products.detail.quickQuoteDescription")}</p>
            </div>
            <Link to={path("quote")}>
              {t("products.detail.requestQuote")}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
