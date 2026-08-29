import { useEffect } from "react";
import { LOCALE_META, LOCALES, SITE_ORIGIN, type Locale } from "../../i18n/config";
import { useI18n } from "../../i18n/I18nProvider";
import { absoluteUrl, alternatesFor, type Alternate } from "../../i18n/seo";
import type { RouteKey } from "../../i18n/routes";
import { setJsonLd } from "./jsonLd";
import { publicMediaUrl } from "../../lib/mediaUrl";

/**
 * Marks every tag this component owns so a navigation can clean up the
 * previous page's metadata without touching tags baked into index.html.
 */
const OWNED_ATTR = "data-seo-managed";

function upsertMeta(selectorAttr: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${selectorAttr}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(selectorAttr, key);
    document.head.appendChild(element);
  }
  element.setAttribute(OWNED_ATTR, "true");
  element.setAttribute("content", content);
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    if (hreflang) element.hreflang = hreflang;
    document.head.appendChild(element);
  }
  element.setAttribute(OWNED_ATTR, "true");
  element.href = href;
}

export type SeoProps = {
  /** Which translated page this is — drives canonical and hreflang URLs. */
  routeKey: RouteKey;
  /** Overrides the `seo.<routeKey>.title` dictionary entry when provided. */
  title?: string;
  /** Overrides the `seo.<routeKey>.description` dictionary entry. */
  description?: string;
  /** Absolute or root-relative social share image. */
  image?: string;
  /** Extra JSON-LD (e.g. a Product schema) merged in alongside the defaults. */
  jsonLd?: Record<string, unknown> | null;
  /**
   * Explicit canonical URL. When omitted the standard per-route canonical is
   * used. Article detail pages supply this because two articles can share the
   * same routeKey while having completely different URLs.
   */
  canonicalUrl?: string;
  /**
   * Explicit hreflang alternate set. When supplied it completely replaces the
   * default alternatesFor(routeKey) list — use this for data-driven pages
   * (e.g. news detail) where not every locale has a published version.
   * Existing callers that do not supply this prop keep today's behaviour.
   */
  alternates?: Alternate[];
  /**
   * og:type override. Defaults to "website"; article pages supply "article".
   */
  ogType?: string;
  /**
   * Keep this URL out of search results. Data-driven pages set this when the
   * requested locale has no published content, so a directly-visited URL that
   * the sitemap deliberately omits cannot be indexed anyway.
   */
  noindex?: boolean;
};

/**
 * Per-page metadata: title, description, canonical, hreflang alternates,
 * Open Graph / Twitter cards and structured data. Static crawlers additionally
 * get these values pre-baked into HTML by scripts/prerender.mjs at build time.
 */
export default function Seo({
  routeKey,
  title,
  description,
  image,
  jsonLd = null,
  canonicalUrl,
  alternates,
  ogType = "website",
  noindex = false,
}: SeoProps) {
  const { locale, t } = useI18n();

  const resolvedTitle = title ?? t(`seo.${routeKey}.title`);
  const resolvedDescription = description ?? t(`seo.${routeKey}.description`);
  // Explicit canonical wins; otherwise use the standard route-based URL.
  const canonical = canonicalUrl ?? absoluteUrl(routeKey, locale);
  const resolvedImage = publicMediaUrl(image);
  const shareImage = resolvedImage
    ? resolvedImage.startsWith("http")
      ? resolvedImage
      : `${SITE_ORIGIN}${resolvedImage}`
    : `${SITE_ORIGIN}/assets/images/hero-medical-suite.png`;

  // Use explicit alternates when provided, otherwise generate from the route.
  const resolvedAlternates = alternates ?? alternatesFor(routeKey);

  useEffect(() => {
    document.title = resolvedTitle;

    upsertMeta("name", "description", resolvedDescription);
    upsertMeta("name", "robots", noindex ? "noindex, follow" : "index, follow");

    upsertMeta("property", "og:title", resolvedTitle);
    upsertMeta("property", "og:description", resolvedDescription);
    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", shareImage);
    upsertMeta("property", "og:site_name", "Oxymed Medikal");
    upsertMeta("property", "og:locale", LOCALE_META[locale].ogLocale);

    // Tell social crawlers which other languages exist for THIS page. Derived
    // from the resolved alternate set, never the full locale list: a
    // data-driven page (news, DB products) only exists in the languages that
    // actually have content, and advertising the rest points crawlers at
    // pages that were never published.
    document.head
      .querySelectorAll('meta[property="og:locale:alternate"]')
      .forEach((node) => node.remove());
    const alternateLocales = resolvedAlternates
      .map((alternate) => alternate.hreflang)
      .filter((hreflang): hreflang is Locale => hreflang !== locale && hreflang in LOCALE_META);
    for (const alternate of new Set(alternateLocales)) {
      const element = document.createElement("meta");
      element.setAttribute("property", "og:locale:alternate");
      element.setAttribute("content", LOCALE_META[alternate].ogLocale);
      element.setAttribute(OWNED_ATTR, "true");
      document.head.appendChild(element);
    }

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", resolvedTitle);
    upsertMeta("name", "twitter:description", resolvedDescription);
    upsertMeta("name", "twitter:image", shareImage);

    // A noindex page must not self-canonicalise: pointing a canonical at an
    // unpublished locale URL would nominate it as the indexable version of
    // content the sitemap deliberately omits.
    if (noindex) {
      document.head.querySelectorAll('link[rel="canonical"]').forEach((node) => node.remove());
    } else {
      upsertLink("canonical", canonical);
    }
    // Drop stale alternates before writing this page's set, otherwise a
    // navigation would leave the previous page's hreflang URLs behind.
    document.head
      .querySelectorAll(`link[rel="alternate"][hreflang]`)
      .forEach((node) => node.remove());
    for (const alternate of resolvedAlternates) {
      upsertLink("alternate", alternate.href, alternate.hreflang);
    }
  }, [canonical, locale, noindex, ogType, resolvedAlternates, resolvedDescription, resolvedTitle, shareImage]);

  useEffect(() => {
    setJsonLd("organization", {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Oxymed Medikal",
      url: SITE_ORIGIN,
      logo: `${SITE_ORIGIN}/favicon.svg`,
      address: {
        "@type": "PostalAddress",
        streetAddress: "10016 Sk. No:5 AOSB",
        addressLocality: "Çiğli, İzmir",
        addressCountry: "TR",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+90 232 870 0 222",
          contactType: "sales",
          availableLanguage: LOCALES.map((candidate) => LOCALE_META[candidate].englishName),
        },
      ],
    });
  }, []);

  useEffect(() => {
    setJsonLd("page", jsonLd);
    return () => setJsonLd("page", null);
  }, [jsonLd]);

  return null;
}
