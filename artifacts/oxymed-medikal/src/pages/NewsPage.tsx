import { useState } from "react";
import { ArrowRight, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useListNews } from "@workspace/api-client-react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import Seo from "../components/common/Seo";
import { useI18n } from "../i18n/I18nProvider";
import { newsDetailPath, localizedPath } from "../i18n/routes";
import { SITE_ORIGIN, LOCALE_META, LOCALES } from "../i18n/config";
import { alternatesFor } from "../i18n/seo";
import type { Alternate } from "../i18n/seo";
import { publicMediaUrl } from "../lib/mediaUrl";

function formatDate(dateStr: string | null | undefined, locale: string) {
  if (!dateStr) return "";
  // Use the active locale so dates read naturally to each visitor.
  return new Date(dateStr).toLocaleDateString(LOCALE_META[locale as keyof typeof LOCALE_META]?.htmlLang ?? locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      {message}
    </div>
  );
}

export default function NewsPage() {
  const { locale, t } = useI18n();

  // The news list page exists in every language (the list may just be empty for
  // a language with no published translations yet). Use all-locale alternates.
  const newsListAlternates: Alternate[] = LOCALES.map((l) => ({
    hreflang: LOCALE_META[l].hreflang,
    href: `${SITE_ORIGIN}${localizedPath("news", l)}`,
  }));
  newsListAlternates.push({
    hreflang: "x-default",
    href: `${SITE_ORIGIN}${localizedPath("news", "tr")}`,
  });

  return (
    <div className="min-h-screen bg-white text-oxynavy-950">
      <Seo
        routeKey="news"
        canonicalUrl={`${SITE_ORIGIN}${localizedPath("news", locale)}`}
        alternates={newsListAlternates}
      />
      <Header />
      <main>
        <NewsHero />
        <NewsContent locale={locale} t={t} />
      </main>
      <Footer />
    </div>
  );
}

function NewsHero() {
  const { t } = useI18n();
  return (
    <section className="relative isolate overflow-hidden bg-oxynavy-950 text-white">
      <img
        src="/assets/images/corporate-production-floor.png"
        alt={t("news.hero.imageAlt")}
        className="absolute inset-0 h-full w-full object-cover opacity-55"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-oxynavy-950 via-oxynavy-950/80 to-oxynavy-950/30" />
      <div className="relative mx-auto min-h-[240px] max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="max-w-xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-white/78">
            <span className="inline-flex items-center gap-2">
              {t("common.nav.home")}
              <span className="text-white/44">›</span>
            </span>
            <span>{t("news.hero.title")}</span>
          </div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">{t("news.hero.title")}</h1>
          <div className="mt-4 h-1 w-14 bg-white" />
          <p className="mt-5 max-w-[470px] text-sm font-medium leading-7 text-white/88">{t("news.hero.description")}</p>
        </div>
      </div>
    </section>
  );
}

type NewsContentProps = {
  locale: string;
  t: (key: string, fallback?: string) => string;
};

function NewsContent({ locale, t }: NewsContentProps) {
  const [activeCategory, setActiveCategory] = useState<string | undefined>();

  // Fetch all items in this locale to derive the available categories.
  const {
    data: allNewsData,
    isLoading: allLoading,
    isError: allError,
  } = useListNews({ locale, published: true, limit: 500 });
  const allItems = allNewsData?.items ?? [];

  const allCategoriesLabel = t("news.list.allCategories");
  const categories = [allCategoriesLabel, ...Array.from(
    new Set(allItems.map((n) => n.category).filter(Boolean) as string[])
  )];

  const {
    data: filteredData,
    isLoading: filteredLoading,
    isError: filteredError,
  } = useListNews({
    locale,
    published: true,
    category: activeCategory,
    limit: 50,
  });
  const displayItems = filteredData?.items ?? [];

  const {
    data: popularData,
    isLoading: popularLoading,
    isError: popularError,
  } = useListNews({ locale, published: true, limit: 5 });
  const popularNews = popularData?.items ?? [];

  return (
    <section className="bg-steel-50 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap gap-2">
          {allLoading
            ? [1, 2, 3, 4].map((i) => <div key={i} className="h-9 w-28 animate-pulse rounded bg-steel-200" />)
            : categories.map((cat) => {
                const isAll = cat === allCategoriesLabel;
                const active = isAll ? !activeCategory : activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(isAll ? undefined : cat)}
                    className={`rounded px-4 py-2 text-[12px] font-extrabold transition ${
                      active
                        ? "bg-oxynavy-950 text-white"
                        : "border border-steel-200 bg-white text-oxynavy-950 hover:bg-oxynavy-950 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
        </div>

        {allError && <ErrorMessage message={t("news.list.errorCategories")} />}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            {filteredError ? (
              <ErrorMessage message={t("news.list.errorList")} />
            ) : filteredLoading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-72 animate-pulse rounded-lg bg-steel-200" />
                ))}
              </div>
            ) : displayItems.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-steel-200 py-16 text-center">
                {/* Different message when the locale has no articles vs. filtered category is empty */}
                <p className="text-steel-500">
                  {allItems.length === 0 && !activeCategory
                    ? t("news.list.emptyLocale")
                    : t("news.list.empty")}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {displayItems.map((post) => (
                  <article
                    key={post.id}
                    className="group overflow-hidden rounded-lg border border-steel-100 bg-white shadow-[0_8px_24px_rgba(2,20,35,0.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(2,20,35,0.08)]"
                  >
                    <Link to={newsDetailPath(locale as Parameters<typeof newsDetailPath>[0], post.slug)} className="block">
                      <div className="aspect-[1.6] overflow-hidden">
                        <img
                          src={publicMediaUrl(post.imageUrl) ?? "/assets/images/product-medical-gas.png"}
                          alt={post.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                        />
                      </div>
                    </Link>
                    <div className="p-6">
                      <div className="flex items-center gap-3">
                        {post.category && (
                          <span className="rounded bg-oxynavy-50 px-2.5 py-1 text-xs font-extrabold text-oxynavy-700">
                            {post.category}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 text-xs text-steel-500">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          {formatDate(post.publishedAt, locale)}
                        </span>
                      </div>
                      <h2 className="mt-3 text-xl font-extrabold text-oxynavy-950 leading-snug">
                        <Link
                          to={newsDetailPath(locale as Parameters<typeof newsDetailPath>[0], post.slug)}
                          className="transition hover:text-oxynavy-600"
                        >
                          {post.title}
                        </Link>
                      </h2>
                      {post.excerpt && (
                        <p className="mt-3 text-sm leading-7 text-steel-700 line-clamp-3">{post.excerpt}</p>
                      )}
                      <Link
                        to={newsDetailPath(locale as Parameters<typeof newsDetailPath>[0], post.slug)}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-oxynavy-900 transition hover:text-oxynavy-500"
                      >
                        {t("news.list.readMore")}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside aria-label={t("news.list.popular")}>
            <div className="sticky top-6 rounded-lg border border-steel-100 bg-white p-5 shadow-[0_8px_24px_rgba(2,20,35,0.06)]">
              <h2 className="text-sm font-extrabold text-oxynavy-950">{t("news.list.popular")}</h2>
              {popularError ? (
                <p className="mt-3 text-[12px] text-red-600">{t("news.list.errorPopular")}</p>
              ) : popularLoading ? (
                <div className="mt-5 space-y-4">
                  {[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded bg-steel-100" />)}
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {popularNews.map((post) => (
                    <Link
                      key={post.id}
                      to={newsDetailPath(locale as Parameters<typeof newsDetailPath>[0], post.slug)}
                      className="flex gap-3 group"
                    >
                      <div className="h-14 w-20 shrink-0 overflow-hidden rounded">
                        <img
                          src={publicMediaUrl(post.imageUrl) ?? "/assets/images/product-medical-gas.png"}
                          alt={post.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition group-hover:scale-[1.05]"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-oxynavy-950 leading-tight line-clamp-2 group-hover:text-oxynavy-700 transition">{post.title}</p>
                        <p className="mt-1 text-[11px] text-steel-500">{formatDate(post.publishedAt, locale)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
