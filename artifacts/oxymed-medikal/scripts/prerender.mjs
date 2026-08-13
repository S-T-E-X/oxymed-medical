/**
 * Bakes per-URL SEO metadata into static HTML after `vite build`.
 *
 * The site is a client-rendered SPA, so a crawler that does not execute
 * JavaScript would otherwise see one identical <head> for every URL. This
 * step writes a real HTML file per localized route with its own lang/dir,
 * title, description, canonical, hreflang set, Open Graph tags and JSON-LD —
 * while the body still boots the same React bundle.
 *
 * Two kinds of page are emitted:
 *   - Static routes, from the per-locale seo.json dictionaries.
 *   - News article detail pages, from .news-seo.json, which the gen-sitemap
 *     step writes out of the database earlier in the same build. Only
 *     published language versions appear there, so an unpublished or
 *     untranslated article never gets a file.
 *
 * Run automatically as part of the artifact build.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE_DIR = path.resolve(HERE, "..");
const DIST_DIR = path.join(SITE_DIR, "dist/public");
const LOCALES_DIR = path.join(SITE_DIR, "src/i18n/locales");
/** Written by gen-sitemap from the database, earlier in this same build. */
const NEWS_SEO_FILE = path.join(SITE_DIR, ".news-seo.json");

const SITE_ORIGIN = (process.env.SITE_ORIGIN ?? "https://www.oxymed.com.tr").replace(/\/$/, "");

const LOCALES = ["tr", "en", "de", "fr", "it", "ar", "ru", "fa", "ka", "bg", "az"];
const DEFAULT_LOCALE = "tr";

const LOCALE_META = {
  tr: { dir: "ltr", ogLocale: "tr_TR" },
  en: { dir: "ltr", ogLocale: "en_US" },
  de: { dir: "ltr", ogLocale: "de_DE" },
  fr: { dir: "ltr", ogLocale: "fr_FR" },
  it: { dir: "ltr", ogLocale: "it_IT" },
  ar: { dir: "rtl", ogLocale: "ar_AR" },
  ru: { dir: "ltr", ogLocale: "ru_RU" },
  fa: { dir: "rtl", ogLocale: "fa_IR" },
  ka: { dir: "ltr", ogLocale: "ka_GE" },
  bg: { dir: "ltr", ogLocale: "bg_BG" },
  az: { dir: "ltr", ogLocale: "az_AZ" },
};

const ROUTE_KEYS = ["home", "products", "gcp", "ams", "dvp", "dvs", "service", "quote", "news"];

// Mirrors src/i18n/routes.ts — keep in sync when a slug changes.
const PRODUCTS_SLUG = {
  tr: "urunler", en: "products", de: "produkte", fr: "produits", it: "prodotti",
  ar: "muntajat", ru: "produkciya", fa: "mahsulat", ka: "produkcia", bg: "produkti", az: "mehsullar",
};

const NEWS_SLUG = {
  tr: "haberler", en: "news", de: "nachrichten", fr: "actualites", it: "notizie",
  ar: "akhbar", ru: "novosti", fa: "akhbar", ka: "siakhleebi", bg: "novini", az: "xeberler",
};

const LEAF_SLUGS = {
  gcp: {
    tr: "kat-kontrol-panosu", en: "gas-control-panel", de: "gas-kontrolltafel", fr: "panneau-de-controle-gaz",
    it: "pannello-controllo-gas", ar: "lawhat-altahakum-bialghaz", ru: "panel-kontrolya-gaza",
    fa: "panel-kontrol-gaz", ka: "gazis-sakontrolo-paneli", bg: "panel-za-kontrol-na-gaz", az: "qaz-nezaret-panosu",
  },
  ams: {
    tr: "amalgam-separator", en: "amalgam-separator", de: "amalgamabscheider", fr: "separateur-amalgame",
    it: "separatore-amalgama", ar: "fasil-almalgham", ru: "amalgamnyy-separator",
    fa: "jodakonande-amalgam", ka: "amalgamis-separatori", bg: "amalgamen-separator", az: "amalqam-separatoru",
  },
  dvp: {
    tr: "dental-vakum-pompasi", en: "dental-vacuum-pump", de: "dental-vakuumpumpe", fr: "pompe-a-vide-dentaire",
    it: "pompa-per-vuoto-dentale", ar: "midakhat-tafrigh-alasnan", ru: "stomatologicheskiy-vakuumnyy-nasos",
    fa: "pomp-vakum-dandanpezeshki", ka: "dentaluri-vakuumis-tumbo", bg: "dentalna-vakuumna-pompa", az: "dental-vakuum-nasosu",
  },
  dvs: {
    tr: "dental-vakum-sistemi", en: "dental-vacuum-system", de: "dental-vakuumsystem", fr: "systeme-aspiration-dentaire",
    it: "sistema-aspirazione-dentale", ar: "nizam-tafrigh-alasnan", ru: "stomatologicheskaya-vakuumnaya-sistema",
    fa: "sistem-vakum-dandanpezeshki", ka: "dentaluri-vakuumis-sistema", bg: "dentalna-vakuumna-sistema", az: "dental-vakuum-sistemi",
  },
  service: {
    tr: "servis", en: "service", de: "service", fr: "service", it: "assistenza", ar: "khidmat-alsiyana",
    ru: "servis", fa: "khadamat", ka: "servisi", bg: "serviz", az: "servis",
  },
  quote: {
    tr: "teklif-al", en: "get-a-quote", de: "angebot-anfordern", fr: "demander-un-devis",
    it: "richiedi-preventivo", ar: "talab-arad-siar", ru: "zapros-predlozheniya",
    fa: "darkhast-gheymat", ka: "fasis-motkhovna", bg: "zapitvane-za-oferta", az: "teklif-al",
  },
};

const NESTED_UNDER_PRODUCTS = new Set(["gcp", "ams", "dvp", "dvs"]);

function routePath(routeKey, locale) {
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  if (routeKey === "home") return prefix || "/";
  if (routeKey === "products") return `${prefix}/${PRODUCTS_SLUG[locale]}`;
  if (routeKey === "news") return `${prefix}/${NEWS_SLUG[locale]}`;
  const leaf = LEAF_SLUGS[routeKey][locale];
  return NESTED_UNDER_PRODUCTS.has(routeKey)
    ? `${prefix}/${PRODUCTS_SLUG[locale]}/${leaf}`
    : `${prefix}/${leaf}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Published article versions, as written by gen-sitemap from the database.
 * A missing file means the sitemap step never ran — fail rather than silently
 * shipping article URLs that resolve to the generic SPA shell.
 */
async function loadNewsArticles() {
  let raw;
  try {
    raw = await readFile(NEWS_SEO_FILE, "utf8");
  } catch {
    throw new Error(
      `Missing ${path.basename(NEWS_SEO_FILE)}. It is generated by the gen-sitemap step, ` +
        `which must run before prerender in the build script.`,
    );
  }
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`${path.basename(NEWS_SEO_FILE)} is not an array.`);
  }
  return parsed;
}

async function loadSeo(locale) {
  const file = path.join(LOCALES_DIR, locale, "seo.json");
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    // Falls back to Turkish when a language has not been translated yet.
    return JSON.parse(await readFile(path.join(LOCALES_DIR, "tr", "seo.json"), "utf8"));
  }
}

function buildHead(routeKey, locale, seo) {
  const entry = seo?.[routeKey] ?? {};
  const title = entry.title ?? "Oxymed Medikal";
  const description = entry.description ?? "";
  const canonical = `${SITE_ORIGIN}${routePath(routeKey, locale)}`;
  const image = `${SITE_ORIGIN}/opengraph.jpg`;

  const alternates = [
    ...LOCALES.map((l) => ({ hreflang: l, href: `${SITE_ORIGIN}${routePath(routeKey, l)}` })),
    { hreflang: "x-default", href: `${SITE_ORIGIN}${routePath(routeKey, DEFAULT_LOCALE)}` },
  ]
    .map((a) => `    <link rel="alternate" hreflang="${a.hreflang}" href="${escapeHtml(a.href)}" />`)
    .join("\n");

  const ogAlternates = LOCALES.filter((l) => l !== locale)
    .map((l) => `    <meta property="og:locale:alternate" content="${LOCALE_META[l].ogLocale}" />`)
    .join("\n");

  const organizationLd = {
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
  };

  return [
    `    <title>${escapeHtml(title)}</title>`,
    `    <meta name="description" content="${escapeHtml(description)}" />`,
    `    <meta name="robots" content="index, follow" />`,
    `    <link rel="canonical" href="${escapeHtml(canonical)}" />`,
    alternates,
    `    <meta property="og:type" content="website" />`,
    `    <meta property="og:site_name" content="Oxymed Medikal" />`,
    `    <meta property="og:title" content="${escapeHtml(title)}" />`,
    `    <meta property="og:description" content="${escapeHtml(description)}" />`,
    `    <meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `    <meta property="og:image" content="${escapeHtml(image)}" />`,
    `    <meta property="og:locale" content="${LOCALE_META[locale].ogLocale}" />`,
    ogAlternates,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `    <meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `    <meta name="twitter:image" content="${escapeHtml(image)}" />`,
    `    <script type="application/ld+json">${JSON.stringify(organizationLd)}</script>`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * <head> for one published language version of an article. Every value comes
 * from that language's own row, so a foreign-language page carries no Turkish
 * text, and the hreflang set lists only versions that are actually published.
 */
function buildArticleHead(article, listTitle) {
  const title = article.title || "Oxymed Medikal";
  const description = article.description ?? "";
  const canonical = `${SITE_ORIGIN}${article.path}`;
  const locale = article.locale;

  const rawImage = article.imageUrl;
  const image = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${SITE_ORIGIN}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`
    : `${SITE_ORIGIN}/opengraph.jpg`;

  const alternates = (article.alternates ?? [])
    .map(
      (a) =>
        `    <link rel="alternate" hreflang="${escapeHtml(a.hreflang)}" href="${escapeHtml(`${SITE_ORIGIN}${a.path}`)}" />`,
    )
    .join("\n");

  // Only advertise languages this article actually exists in.
  const publishedLocales = new Set(
    (article.alternates ?? []).map((a) => a.hreflang).filter((l) => l !== "x-default"),
  );
  const ogAlternates = [...publishedLocales]
    .filter((l) => l !== locale && LOCALE_META[l])
    .map((l) => `    <meta property="og:locale:alternate" content="${LOCALE_META[l].ogLocale}" />`)
    .join("\n");

  const articleLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": canonical,
        mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
        headline: title,
        ...(description ? { description } : {}),
        image,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        inLanguage: locale,
        author: { "@type": "Organization", name: "Oxymed Medikal", url: SITE_ORIGIN },
        publisher: {
          "@type": "Organization",
          name: "Oxymed Medikal",
          url: SITE_ORIGIN,
          logo: { "@type": "ImageObject", url: `${SITE_ORIGIN}/favicon.svg` },
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Oxymed Medikal", item: SITE_ORIGIN },
          {
            "@type": "ListItem",
            position: 2,
            name: listTitle,
            item: `${SITE_ORIGIN}${routePath("news", locale)}`,
          },
          { "@type": "ListItem", position: 3, name: title, item: canonical },
        ],
      },
    ],
  };

  return [
    `    <title>${escapeHtml(title)}</title>`,
    `    <meta name="description" content="${escapeHtml(description)}" />`,
    `    <meta name="robots" content="index, follow" />`,
    `    <link rel="canonical" href="${escapeHtml(canonical)}" />`,
    alternates,
    `    <meta property="og:type" content="article" />`,
    `    <meta property="og:site_name" content="Oxymed Medikal" />`,
    `    <meta property="og:title" content="${escapeHtml(title)}" />`,
    `    <meta property="og:description" content="${escapeHtml(description)}" />`,
    `    <meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `    <meta property="og:image" content="${escapeHtml(image)}" />`,
    `    <meta property="og:locale" content="${LOCALE_META[locale].ogLocale}" />`,
    ogAlternates,
    `    <meta property="article:published_time" content="${escapeHtml(article.publishedAt)}" />`,
    `    <meta property="article:modified_time" content="${escapeHtml(article.updatedAt)}" />`,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `    <meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `    <meta name="twitter:image" content="${escapeHtml(image)}" />`,
    `    <script type="application/ld+json">${JSON.stringify(articleLd)}</script>`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function main() {
  const templatePath = path.join(DIST_DIR, "index.html");
  const template = await readFile(templatePath, "utf8");

  // Strip the generic tags from the built template so each page gets its own.
  const stripped = template
    .replace(/\s*<title>[\s\S]*?<\/title>/i, "")
    .replace(/\s*<meta\s+name="description"[^>]*>/gi, "")
    .replace(/\s*<meta\s+name="robots"[^>]*>/gi, "")
    .replace(/\s*<meta\s+property="og:[^"]*"[^>]*>/gi, "")
    .replace(/\s*<meta\s+name="twitter:[^"]*"[^>]*>/gi, "");

  const seoByLocale = Object.fromEntries(
    await Promise.all(LOCALES.map(async (locale) => [locale, await loadSeo(locale)])),
  );

  // Localized "News" label for each language's breadcrumb.
  const newsListTitleByLocale = Object.fromEntries(
    await Promise.all(
      LOCALES.map(async (locale) => {
        try {
          const news = JSON.parse(await readFile(path.join(LOCALES_DIR, locale, "news.json"), "utf8"));
          return [locale, news?.hero?.title ?? "News"];
        } catch {
          return [locale, "News"];
        }
      }),
    ),
  );

  let written = 0;
  for (const locale of LOCALES) {
    for (const routeKey of ROUTE_KEYS) {
      const head = buildHead(routeKey, locale, seoByLocale[locale]);

      const html = stripped
        .replace(/<html[^>]*>/i, `<html lang="${locale}" dir="${LOCALE_META[locale].dir}">`)
        .replace(/<\/head>/i, `${head}\n  </head>`);

      const routeUrl = routePath(routeKey, locale);
      const outFile =
        routeUrl === "/"
          ? path.join(DIST_DIR, "index.html")
          : path.join(DIST_DIR, routeUrl.replace(/^\//, ""), "index.html");

      await mkdir(path.dirname(outFile), { recursive: true });
      await writeFile(outFile, html, "utf8");
      written += 1;
    }
  }

  // ── News article detail pages ─────────────────────────────────────────────
  // Sourced from the database via gen-sitemap, so only published language
  // versions get a file; everything else keeps hitting the SPA's not-found.
  const articles = await loadNewsArticles();
  let articlesWritten = 0;

  for (const article of articles) {
    if (!LOCALE_META[article.locale]) continue;

    const head = buildArticleHead(article, newsListTitleByLocale[article.locale]);
    const html = stripped
      .replace(/<html[^>]*>/i, `<html lang="${article.locale}" dir="${LOCALE_META[article.locale].dir}">`)
      .replace(/<\/head>/i, `${head}\n  </head>`);

    const outFile = path.join(DIST_DIR, article.path.replace(/^\//, ""), "index.html");
    await mkdir(path.dirname(outFile), { recursive: true });
    await writeFile(outFile, html, "utf8");
    articlesWritten += 1;
  }

  console.log(
    `Prerendered SEO metadata into ${written + articlesWritten} HTML files ` +
      `(${written} static routes + ${articlesWritten} news articles).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
