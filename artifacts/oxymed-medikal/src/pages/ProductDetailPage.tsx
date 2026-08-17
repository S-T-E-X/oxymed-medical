import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  FileCheck2,
  HelpCircle,
  Loader2,
  Settings,
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
import Seo from "../components/common/Seo";
import { useI18n } from "../i18n/I18nProvider";
import { useLocalizedPath } from "../i18n/useLocalizedPath";
import { DEFAULT_LOCALE, LOCALE_META, SITE_ORIGIN, type Locale } from "../i18n/config";
import { localizedPath } from "../i18n/routes";
import type { Alternate } from "../i18n/seo";
import { getProductIcon } from "../data/productPageIcons";
import {
  availableProductLocales,
  contentForLocale,
  isProductLocaleAvailable,
  localizedName,
} from "@workspace/product-content";
import "./ProductDetailPage.css";

type SectionKey = "detailCards" | "technical" | "useCases" | "featureTiles" | "faq";

const ALL_SECTIONS: SectionKey[] = ["detailCards", "technical", "useCases", "featureTiles", "faq"];

/**
 * A not-found / unavailable-locale page represents no real content, so it must
 * not advertise language versions of itself. Module-level so the identity is
 * stable across renders.
 */
const NO_ALTERNATES: Alternate[] = [];

/**
 * Section order is a presentation choice that applies to every locale, so an
 * order saved in the CMS is honoured regardless of the visitor's language.
 * Unknown or missing keys fall back to the default order.
 */
function normalizeSectionOrder(order: string[] | undefined): SectionKey[] {
  const known = (order ?? []).filter((s): s is SectionKey => (ALL_SECTIONS as string[]).includes(s));
  const deduped = Array.from(new Set(known));
  return [...deduped, ...ALL_SECTIONS.filter((s) => !deduped.includes(s))];
}

/**
 * Generic product copy must never silently leak from Turkish into another
 * locale. Editors can see missing language content in the CMS; visitors only
 * see sections deliberately supplied for their current locale. The shared
 * helper enforces the same rule the SEO pipeline uses.
 */
function localizedPageData(pageData: PageData | undefined, locale: string): PageDataContent {
  return (contentForLocale(pageData, locale) as PageDataContent | undefined) ?? {};
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

  // A missing or withdrawn product (the API 404s unpublished rows for
  // anonymous callers) must not inherit the app's default indexable head.
  if (isError || !product) {
    return (
      <div className="pdp-page">
        <Seo
          routeKey="products"
          title={t("products.detail.notFound")}
          alternates={NO_ALTERNATES}
          noindex
        />
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

  // A locale that the sitemap does not publish must not render the product
  // template either. Otherwise /en/products/<turkish-only-product> would serve
  // a half-empty page with Turkish headings and self-canonicalise as the
  // indexable English version of content that was never translated.
  const localeAvailable = isProductLocaleAvailable(product.pageData, locale, {
    fallbackDescription: product.description,
    product,
  });

  // Defence in depth: the API already 404s unpublished products for anonymous
  // callers, but an admin session (or a cached response) can still deliver one
  // here, and it must never acquire a canonical or hreflang set.
  const isPublished = product.published === true;

  if (!localeAvailable || !isPublished) {
    return (
      <div className="pdp-page">
        <Seo
          routeKey="products"
          title={t("products.detail.notFound")}
          alternates={NO_ALTERNATES}
          noindex
        />
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
  // Reaching here means this locale is published, so a localized title exists
  // (the eligibility rule requires one); the ?? only satisfies the type.
  const localizedTitle = localizedName(product, "title", locale) ?? product.title;
  // Category names have no translations yet, so a Turkish category name would
  // be Turkish text on a non-Turkish page. Use the translated brand label
  // instead until categories are localized.
  const categoryName = category ? localizedName(category, "name", locale) : undefined;
  const eyebrow = categoryName ?? t("products.detail.brand");
  // The short card description is Turkish source copy, so it may only back the
  // hero on the Turkish page. Other locales show their own text or nothing.
  const heroDescription = locale === DEFAULT_LOCALE
    ? (pd.heroDescription || product.description || "")
    : (pd.heroDescription ?? "");
  const features = (pd.features ?? []).slice(0, 4);
  const detailCards = pd.detailCards ?? [];
  const specs = locale === "tr" ? (pd.specs ?? product.specs ?? []) : (pd.specs ?? []);
  const useCases = pd.useCases ?? [];
  const advantages = pd.advantages ?? [];
  const featureTiles = pd.featureTiles ?? [];
  const faq = pd.faq ?? [];
  const hiddenSections: SectionKey[] = product.pageData?.hiddenSections ?? [];
  const sectionOrder = normalizeSectionOrder(product.pageData?.sectionOrder);
  const sections: Record<SectionKey, React.ReactNode> = {
    detailCards: detailCards.length > 0 && !hiddenSections.includes("detailCards") && (
      <section key="detailCards" className="pdp-container pdp-detail-grid" aria-label={t("products.detail.detailImages")}>
        {detailCards.map((card) => (
          <article key={card.title}>
            {card.imageUrl ? <div className="pdp-image-slot" style={{ backgroundImage: `url(${card.imageUrl})` }} /> : <div className="pdp-image-slot" />}
            <h2>{card.title}</h2><p>{card.text}</p>
          </article>
        ))}
      </section>
    ),
    technical: (specs.length > 0 || advantages.length > 0) && !hiddenSections.includes("technical") && (
      <section key="technical" className="pdp-container pdp-technical-panel">
        {specs.length > 0 && <article className="pdp-specs"><header><Settings aria-hidden="true" /><h2>{t("products.detail.technicalSpecifications")}</h2></header><dl>{specs.map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}</dl></article>}
        {advantages.length > 0 && <article className="pdp-advantages"><header><BadgeCheck aria-hidden="true" /><h2>{t("products.detail.advantages")}</h2></header><ul>{advantages.map((item) => <li key={item}>{item}</li>)}</ul></article>}
      </section>
    ),
    useCases: useCases.length > 0 && !hiddenSections.includes("useCases") && (
      <section key="useCases" className="pdp-container pdp-usage-band">
        <h2>{t("products.detail.applications")}</h2>
        <div>
          {useCases.map((item, index) => {
            const text = typeof item === "string" ? item : item.text ?? "";
            const Icon = getProductIcon(typeof item === "string" ? undefined : item.icon, "layers");
            return <article key={`${text}-${index}`}><Icon aria-hidden="true" /><p>{text}</p></article>;
          })}
        </div>
      </section>
    ),
    featureTiles: featureTiles.length > 0 && !hiddenSections.includes("featureTiles") && (
      <section key="featureTiles" className="pdp-container pdp-tiles">{featureTiles.map((tile) => <article key={tile.title}><BadgeCheck aria-hidden="true" /><h3>{tile.title}</h3><p>{tile.text}</p></article>)}</section>
    ),
    faq: faq.length > 0 && !hiddenSections.includes("faq") && (
      <section key="faq" className="pdp-container pdp-faq"><header><HelpCircle aria-hidden="true" /><h2>{t("products.detail.faq")}</h2></header><div className="pdp-faq__grid">{faq.map((item, index) => <details key={item.question} open={index === 0}><summary><span>{item.question}</span></summary><p>{item.answer}</p></details>)}</div></section>
    ),
  };

  // The DB-driven detail page uses one slug across every language, so the
  // canonical/hreflang set is the products route plus that slug per locale.
  const productSlug = product.pageSlug || String(product.id);
  const canonicalUrl = `${SITE_ORIGIN}${localizedPath("products", locale, [productSlug])}`;
  // Advertise only the languages this product genuinely has content for, using
  // the same rule the sitemap and prerender steps apply. Advertising the full
  // locale list here would let hydration replace a correctly baked <head> with
  // links to language versions that were never published.
  const publishedLocales = availableProductLocales(product.pageData, {
    fallbackDescription: product.description,
    product,
  }) as Locale[];
  const alternates: Alternate[] = [
    ...publishedLocales.map((candidate) => ({
      hreflang: LOCALE_META[candidate].hreflang,
      href: `${SITE_ORIGIN}${localizedPath("products", candidate, [productSlug])}`,
    })),
    ...(publishedLocales.includes(DEFAULT_LOCALE)
      ? [{
          hreflang: "x-default",
          href: `${SITE_ORIGIN}${localizedPath("products", DEFAULT_LOCALE, [productSlug])}`,
        }]
      : []),
  ];
  const seoDescription = heroDescription || pd.heroSubtitle || "";
  const productLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: localizedTitle,
    ...(seoDescription ? { description: seoDescription } : {}),
    ...(product.imageUrl ? { image: product.imageUrl } : {}),
    ...(categoryName ? { category: categoryName } : {}),
    brand: { "@type": "Brand", name: "Oxymed Medikal" },
    url: canonicalUrl,
    ...(specs.length > 0
      ? { additionalProperty: specs.map((s) => ({ "@type": "PropertyValue", name: s.label, value: s.value })) }
      : {}),
  };

  return (
    <div className="pdp-page">
      <Seo
        routeKey="products"
        title={`${localizedTitle} | Oxymed Medikal`}
        description={seoDescription}
        image={product.imageUrl ?? undefined}
        canonicalUrl={canonicalUrl}
        alternates={alternates}
        jsonLd={productLd}
      />
      <Header />

      <main className="pdp-main">
        <section className="pdp-hero">
          <div className="pdp-container pdp-hero__grid">
            <div className="pdp-hero__content">
              <div className="pdp-eyebrow">{eyebrow}</div>
              <h1>{localizedTitle}</h1>
              {pd.heroSubtitle && <p className="pdp-hero__subtitle">{pd.heroSubtitle}</p>}
              <div className="pdp-title-line" />
              {heroDescription && <p className="pdp-hero__desc">{heroDescription}</p>}

              {features.length > 0 && (
                <div className="pdp-hero-features">
                  {features.map((feature) => (
                    <article key={feature.title}>
                      {(() => {
                        const Icon = getProductIcon(feature.icon, "sparkles");
                        return <Icon aria-hidden="true" />;
                      })()}
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

        {sectionOrder.map((section) => sections[section])}

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
