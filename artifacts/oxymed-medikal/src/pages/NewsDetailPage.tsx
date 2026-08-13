import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Tag, AlertCircle, Loader2 } from "lucide-react";
import { useListNews } from "@workspace/api-client-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Seo from "../components/common/Seo";
import { LocalePathProvider, type LocalePathOverrides } from "../i18n/LocalePathContext";
import { useI18n } from "../i18n/I18nProvider";
import { newsDetailPath, localizedPath } from "../i18n/routes";
import { SITE_ORIGIN, LOCALE_META, DEFAULT_LOCALE } from "../i18n/config";
import type { Locale } from "../i18n/config";
import type { Alternate } from "../i18n/seo";

function formatDate(dateStr: string | null | undefined, locale: string) {
  if (!dateStr) return "";
  // Format the date using the active locale for natural reading.
  return new Date(dateStr).toLocaleDateString(
    LOCALE_META[locale as keyof typeof LOCALE_META]?.htmlLang ?? locale,
    { day: "numeric", month: "long", year: "numeric" },
  );
}

export default function NewsDetailPage() {
  const { locale, t } = useI18n();
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, isError } = useListNews({
    locale,
    slug,
    published: true,
    limit: 1,
  });

  const news = data?.items?.[0];

  // Build per-locale path overrides so the language switcher navigates to the
  // same article in the target language (or falls back to that language's news
  // list when no published translation exists for that locale).
  const localePathOverrides = useMemo<LocalePathOverrides>(() => {
    if (!news) return {};
    const overrides: LocalePathOverrides = {};
    for (const alt of news.alternates ?? []) {
      if (alt.locale && alt.slug) {
        overrides[alt.locale as Locale] = newsDetailPath(alt.locale as Locale, alt.slug);
      }
    }
    // For locales without a published translation, send the visitor to that
    // language's news list rather than a dead article URL.
    const coveredLocales = new Set(Object.keys(overrides));
    const allLocales = Object.keys(LOCALE_META) as Locale[];
    for (const l of allLocales) {
      if (!coveredLocales.has(l)) {
        overrides[l] = localizedPath("news", l);
      }
    }
    return overrides;
  }, [news]);

  // Build data-driven hreflang alternates from item.alternates (only published
  // language versions). x-default points at Turkish when it is among them.
  const hreflangAlternates = useMemo<Alternate[]>(() => {
    if (!news) return [];
    const alts: Alternate[] = (news.alternates ?? [])
      .filter((a) => a.locale && a.slug)
      .map((a) => ({
        hreflang: LOCALE_META[a.locale as Locale]?.hreflang ?? a.locale,
        href: `${SITE_ORIGIN}${newsDetailPath(a.locale as Locale, a.slug)}`,
      }));
    // Add the current locale's own URL when it is not already in the list.
    const currentHreflang = LOCALE_META[locale as Locale]?.hreflang ?? locale;
    if (!alts.some((a) => a.hreflang === currentHreflang) && news.slug) {
      alts.push({
        hreflang: currentHreflang,
        href: `${SITE_ORIGIN}${newsDetailPath(locale as Locale, news.slug)}`,
      });
    }
    // x-default only when the Turkish (source) version is among the published ones.
    const trAlt = alts.find((a) => a.hreflang === "tr");
    if (trAlt) {
      alts.push({ hreflang: "x-default", href: trAlt.href });
    }
    return alts;
  }, [news, locale]);

  // JSON-LD NewsArticle structured data.
  const articleJsonLd = useMemo(() => {
    if (!news) return null;
    const canonicalUrl = `${SITE_ORIGIN}${newsDetailPath(locale as Locale, news.slug)}`;
    const imageUrl = news.imageUrl
      ? news.imageUrl.startsWith("http")
        ? news.imageUrl
        : `${SITE_ORIGIN}${news.imageUrl}`
      : `${SITE_ORIGIN}/assets/images/hero-medical-suite.png`;

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Oxymed Medikal",
          item: SITE_ORIGIN,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: t("news.hero.title"),
          item: `${SITE_ORIGIN}${localizedPath("news", locale as Locale)}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: news.title,
          item: canonicalUrl,
        },
      ],
    };

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "NewsArticle",
          "@id": canonicalUrl,
          mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
          headline: news.title,
          description: news.seoDescription ?? news.excerpt ?? undefined,
          image: imageUrl,
          datePublished: news.publishedAt ?? undefined,
          dateModified: news.updatedAt ?? undefined,
          inLanguage: LOCALE_META[locale as Locale]?.htmlLang ?? locale,
          author: {
            "@type": "Organization",
            name: "Oxymed Medikal",
            url: SITE_ORIGIN,
          },
          publisher: {
            "@type": "Organization",
            name: "Oxymed Medikal",
            url: SITE_ORIGIN,
            logo: {
              "@type": "ImageObject",
              url: `${SITE_ORIGIN}/favicon.svg`,
            },
          },
        },
        breadcrumbJsonLd,
      ],
    };
  }, [news, locale, t]);

  const newsListPath = localizedPath("news", locale as Locale);

  // SEO: trim excerpt to a reasonable meta description length.
  const metaDescription = news
    ? (news.seoDescription ?? (news.excerpt ? news.excerpt.slice(0, 160) : undefined))
    : undefined;

  const canonicalUrl = news
    ? `${SITE_ORIGIN}${newsDetailPath(locale as Locale, news.slug)}`
    : undefined;

  return (
    <LocalePathProvider overrides={localePathOverrides}>
      <div className="min-h-screen bg-white text-oxynavy-950">
        {news && (
          <Seo
            routeKey="news"
            title={news.seoTitle ?? news.title}
            description={metaDescription}
            image={news.imageUrl ?? undefined}
            canonicalUrl={canonicalUrl}
            alternates={hreflangAlternates}
            ogType="article"
            jsonLd={articleJsonLd}
          />
        )}
        <Header />
        <main>
          {isLoading ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-oxynavy-400" aria-label={t("common.status.loading")} />
            </div>
          ) : isError || !news ? (
            // Honest not-found state — never fall back to Turkish content on a foreign URL.
            <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                {t("news.detail.notFound")}
              </div>
              <Link
                to={newsListPath}
                className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-oxynavy-900 transition hover:text-oxynavy-600"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {t("news.detail.backList")}
              </Link>
            </div>
          ) : (
            <>
              <div className="w-full bg-oxynavy-950">
                <img
                  src={news.imageUrl ?? "/assets/images/product-medical-gas.png"}
                  alt={news.title}
                  className="mx-auto block max-h-[520px] w-full max-w-6xl object-cover"
                />
              </div>

              <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                <Link
                  to={newsListPath}
                  className="inline-flex items-center gap-2 text-xs font-extrabold text-oxynavy-500 transition hover:text-oxynavy-900"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("news.detail.backAll")}
                </Link>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {news.category && (
                    <span className="inline-flex items-center gap-1.5 rounded bg-oxynavy-50 px-2.5 py-1 text-[11px] font-extrabold text-oxynavy-700">
                      <Tag className="h-3 w-3" aria-hidden="true" />
                      {news.category}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-steel-500">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {formatDate(news.publishedAt, locale)}
                  </span>
                </div>

                <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-oxynavy-950 sm:text-4xl">
                  {news.title}
                </h1>

                {news.excerpt && (
                  <p className="mt-5 text-base font-medium leading-7 text-steel-600 border-l-4 border-oxynavy-200 pl-4">
                    {news.excerpt}
                  </p>
                )}

                {news.content && (
                  <div className="mt-8 space-y-4 text-[15px] leading-8 text-steel-800 whitespace-pre-wrap">
                    {news.content}
                  </div>
                )}

                <div className="mt-12 border-t border-steel-100 pt-8">
                  <Link
                    to={newsListPath}
                    className="inline-flex items-center gap-2 text-sm font-extrabold text-oxynavy-900 transition hover:text-oxynavy-600"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    {t("news.detail.backList")}
                  </Link>
                </div>
              </div>
            </>
          )}
        </main>
        <Footer />
      </div>
    </LocalePathProvider>
  );
}
