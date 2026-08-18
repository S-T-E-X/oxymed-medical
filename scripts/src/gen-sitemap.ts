/**
 * Generates every database-derived SEO artifact for the marketing site:
 *
 *   - public/sitemap.xml
 *   - public/robots.txt
 *   - .news-seo.json  (build input consumed by scripts/prerender.mjs)
 *
 *   pnpm --filter @workspace/scripts run gen-sitemap
 *   SITE_ORIGIN=https://www.example.com pnpm --filter @workspace/scripts run gen-sitemap
 *
 * Runs as the first step of the web artifact's build, before `vite build`, so
 * the freshly written sitemap is copied into dist and the article metadata is
 * available to the prerender step. Article data therefore always reflects the
 * database as of the build/deploy, never a hand-run snapshot.
 *
 * Every translated page is listed once per language, and each entry carries the
 * full reciprocal xhtml:link alternate set plus x-default, which is what Google
 * expects for a multilingual site.
 *
 * News article URLs are read from the database so each published language
 * version receives an accurate <lastmod> and a reciprocal alternate set that
 * covers only the languages that actually exist and are published.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { eq, and } from "drizzle-orm";
import {
  db,
  pool,
  newsTable,
  newsTranslationsTable,
  productsTable,
  type PageData,
  type PageDataContent,
} from "@workspace/db";
import {
  availableProductLocales,
  contentForLocale,
  isValidProductSlug,
  localizedName,
} from "@workspace/product-content";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE_DIR = path.resolve(HERE, "../../artifacts/oxymed-medikal");
const PUBLIC_DIR = path.join(SITE_DIR, "public");

/**
 * Build-time handoff to scripts/prerender.mjs. Generated, not checked in —
 * regenerated from the database on every build.
 */
const NEWS_SEO_FILE = ".news-seo.json";

/** Same handoff, for the DB-driven generic product detail pages. */
const PRODUCT_SEO_FILE = ".product-seo.json";

const SITE_ORIGIN = (process.env.SITE_ORIGIN ?? "https://www.oxymedmedical.com").replace(/\/$/, "");

// Fail loudly rather than writing a sitemap that silently omits all news.
if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL is not set. Cannot query news from the database.");
  console.error("Set DATABASE_URL and re-run: pnpm --filter @workspace/scripts run gen-sitemap");
  process.exit(1);
}

const LOCALES = ["tr", "en", "de", "fr", "it", "ar", "ru", "fa", "ka", "bg", "az", "es"] as const;
type Locale = (typeof LOCALES)[number];
const DEFAULT_LOCALE: Locale = "tr";

const ROUTE_KEYS = ["home", "products", "gcp", "ams", "dvp", "dvs", "service", "quote", "news", "catalogs", "corporate", "certificates", "references"] as const;
type RouteKey = (typeof ROUTE_KEYS)[number];

// Mirrors artifacts/oxymed-medikal/src/i18n/routes.ts — keep the two in sync.
const PRODUCTS_SLUG: Record<Locale, string> = {
  tr: "urunler", en: "products", de: "produkte", fr: "produits", it: "prodotti",
  ar: "muntajat", ru: "produkciya", fa: "mahsulat", ka: "produkcia", bg: "produkti", az: "mehsullar",
  es: "productos",
};

const NEWS_SLUG: Record<Locale, string> = {
  tr: "haberler", en: "news", de: "nachrichten", fr: "actualites", it: "notizie",
  ar: "akhbar", ru: "novosti", fa: "akhbar", ka: "siakhleebi", bg: "novini", az: "xeberler",
  es: "noticias",
};

const LEAF_SLUGS: Record<Exclude<RouteKey, "home" | "products" | "news">, Record<Locale, string>> = {
  gcp: {
    tr: "kat-kontrol-panosu", en: "gas-control-panel", de: "gas-kontrolltafel", fr: "panneau-de-controle-gaz",
    it: "pannello-controllo-gas", ar: "lawhat-altahakum-bialghaz", ru: "panel-kontrolya-gaza",
    fa: "panel-kontrol-gaz", ka: "gazis-sakontrolo-paneli", bg: "panel-za-kontrol-na-gaz", az: "qaz-nezaret-panosu",
    es: "panel-de-control-de-gases-medicinales",
  },
  ams: {
    tr: "amalgam-separator", en: "amalgam-separator", de: "amalgamabscheider", fr: "separateur-amalgame",
    it: "separatore-amalgama", ar: "fasil-almalgham", ru: "amalgamnyy-separator",
    fa: "jodakonande-amalgam", ka: "amalgamis-separatori", bg: "amalgamen-separator", az: "amalqam-separatoru",
    es: "separador-de-amalgama",
  },
  dvp: {
    tr: "medikal-vakum-santrali", en: "medical-vacuum-plant", de: "medizinische-vakuumzentrale", fr: "centrale-de-vide-medical",
    it: "centrale-vuoto-medicale", ar: "mahattat-tafrigh-tibbi", ru: "meditsinskaya-vakuumnaya-stanciya",
    fa: "istgah-vakum-pezeshki", ka: "samedicino-vakuumis-sadguri", bg: "medicinska-vakuumna-stanciya", az: "tibbi-vakuum-stansiyasi",
    es: "central-de-vacio-medicinal",
  },
  dvs: {
    tr: "dental-vakum-sistemi", en: "dental-vacuum-system", de: "dental-vakuumsystem", fr: "systeme-aspiration-dentaire",
    it: "sistema-aspirazione-dentale", ar: "nizam-tafrigh-alasnan", ru: "stomatologicheskaya-vakuumnaya-sistema",
    fa: "sistem-vakum-dandanpezeshki", ka: "dentaluri-vakuumis-sistema", bg: "dentalna-vakuumna-sistema", az: "dental-vakuum-sistemi",
    es: "sistema-de-vacio-dental-central",
  },
  service: {
    tr: "servis", en: "service", de: "service", fr: "service", it: "assistenza", ar: "khidmat-alsiyana",
    ru: "servis", fa: "khadamat", ka: "servisi", bg: "serviz", az: "servis",
    es: "servicio-tecnico",
  },
  quote: {
    tr: "teklif-al", en: "get-a-quote", de: "angebot-anfordern", fr: "demander-un-devis",
    it: "richiedi-preventivo", ar: "talab-arad-siar", ru: "zapros-predlozheniya",
    fa: "darkhast-gheymat", ka: "fasis-motkhovna", bg: "zapitvane-za-oferta", az: "teklif-al",
    es: "solicitar-presupuesto",
  },
  catalogs: {
    tr: "kataloglar", en: "catalogs", de: "kataloge", fr: "catalogues", it: "cataloghi",
    ar: "katalujat", ru: "katalogi", fa: "katalog-ha", ka: "katalogebi", bg: "katalozi", az: "kataloqlar",
    es: "catalogos",
  },
  corporate: {
    tr: "kurumsal", en: "about", de: "unternehmen", fr: "entreprise", it: "azienda",
    ar: "hawlana", ru: "o-kompanii", fa: "darbare-ma", ka: "kompania", bg: "za-nas", az: "haqqimizda",
    es: "empresa",
  },
  certificates: {
    tr: "sertifikalar", en: "certificates", de: "zertifikate", fr: "certificats", it: "certificazioni",
    ar: "shahadat", ru: "sertifikaty", fa: "govahinameha", ka: "sertifikatebi", bg: "sertifikati", az: "sertifikatlar",
    es: "certificados",
  },
  references: {
    tr: "referanslar", en: "references", de: "referenzen", fr: "references", it: "referenze",
    ar: "maraji", ru: "referensy", fa: "namunekarha", ka: "rekomendaciebi", bg: "referencii", az: "referanslar",
    es: "referencias",
  },
};

const NESTED_UNDER_PRODUCTS = new Set<RouteKey>(["gcp", "ams", "dvp", "dvs"]);

/** Search-engine priority per page type. */
const PRIORITY: Record<RouteKey, string> = {
  home: "1.0", products: "0.9", gcp: "0.8", ams: "0.8",
  dvp: "0.8", dvs: "0.8", service: "0.7", quote: "0.7", news: "0.8",
  catalogs: "0.7", corporate: "0.8", certificates: "0.7", references: "0.8",
};

function localizedPath(routeKey: RouteKey, locale: Locale): string {
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  if (routeKey === "home") return prefix || "/";
  if (routeKey === "products") return `${prefix}/${PRODUCTS_SLUG[locale]}`;
  if (routeKey === "news") return `${prefix}/${NEWS_SLUG[locale]}`;
  const leaf = LEAF_SLUGS[routeKey][locale];
  return NESTED_UNDER_PRODUCTS.has(routeKey)
    ? `${prefix}/${PRODUCTS_SLUG[locale]}/${leaf}`
    : `${prefix}/${leaf}`;
}

function absoluteUrl(routeKey: RouteKey, locale: Locale): string {
  return `${SITE_ORIGIN}${localizedPath(routeKey, locale)}`;
}

function newsArticlePath(locale: Locale, slug: string): string {
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  return `${prefix}/${NEWS_SLUG[locale]}/${slug}`;
}

function newsArticleUrl(locale: Locale, slug: string): string {
  return `${SITE_ORIGIN}${newsArticlePath(locale, slug)}`;
}

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function isoDate(date: Date | string | null | undefined, fallback: Date): string {
  const d = date ? new Date(date) : fallback;
  return d.toISOString().slice(0, 10);
}

interface ArticleVersion {
  locale: Locale;
  slug: string;
  publishedAt: Date;
  /** Everything the prerender step needs to bake a real <head> for this URL. */
  title: string;
  description: string;
  /** Raw value from the database; may be a site-relative path or absolute URL. */
  imageUrl: string | null;
  updatedAt: Date;
}

interface ArticleGroup {
  sourceId: number;
  versions: ArticleVersion[];
}

/** First non-empty value, trimmed; "" when there is none. */
function firstText(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

/** Search snippets should be a sentence or two, not a whole article. */
function toDescription(value: string): string {
  const flat = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (flat.length <= 300) return flat;
  return `${flat.slice(0, 297).trimEnd()}...`;
}

async function loadPublishedNewsGroups(): Promise<ArticleGroup[]> {
  // Fetch all published Turkish source articles.
  const sources = await db
    .select()
    .from(newsTable)
    .where(eq(newsTable.published, true));

  if (sources.length === 0) return [];

  // Fetch all translation rows whose source is among the published set and
  // where the translation itself is also published.
  const sourceIds = sources.map((s) => s.id);
  const allTranslations = await db
    .select()
    .from(newsTranslationsTable)
    .where(eq(newsTranslationsTable.published, true));

  // Index sources by id for quick lookup.
  const sourceById = new Map(sources.map((s) => [s.id, s]));

  // Group: one entry per article containing all language versions.
  const groupMap = new Map<number, ArticleGroup>();

  for (const source of sources) {
    groupMap.set(source.id, {
      sourceId: source.id,
      versions: [
        {
          locale: "tr" as Locale,
          slug: source.slug,
          publishedAt: source.publishedAt,
          title: firstText(source.seoTitle, source.title),
          description: toDescription(firstText(source.seoDescription, source.excerpt, source.content)),
          imageUrl: source.imageUrl,
          updatedAt: source.updatedAt,
        },
      ],
    });
  }

  // Only add a translation when its source is also published (i.e. in our map).
  for (const tr of allTranslations) {
    const source = sourceById.get(tr.newsId);
    if (!source) continue; // source not published — skip

    // Only include locales we actually support.
    if (!LOCALES.includes(tr.locale as Locale)) continue;

    const group = groupMap.get(tr.newsId);
    if (!group) continue;

    // Effective publish date: translation date if set, else source date.
    const publishedAt = tr.publishedAt ?? source.publishedAt;

    group.versions.push({
      locale: tr.locale as Locale,
      slug: tr.slug,
      publishedAt,
      // Only translated copy — never the Turkish source — so a foreign page's
      // <head> cannot contain Turkish text.
      title: firstText(tr.seoTitle, tr.title),
      description: toDescription(firstText(tr.seoDescription, tr.excerpt, tr.content)),
      // Images are shared across languages; they carry no language of their own.
      imageUrl: source.imageUrl,
      updatedAt: tr.updatedAt,
    });
  }

  return [...groupMap.values()];
}

/**
 * The four dental/gas products predate the DB-driven template and have their
 * own hand-built routes with per-locale slugs (gcp/ams/dvp/dvs). They must not
 * also be emitted as generic /urunler/<slug> URLs or two pages would compete
 * for the same content.
 */
const LEGACY_PRODUCT_SLUGS = new Set([
  "kat-kontrol-panosu",
  "amalgam-separator",
  "dental-vakum-pompasi",
  "dental-vakum-sistemi",
]);

function productDetailPath(locale: Locale, slug: string): string {
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  return `${prefix}/${PRODUCTS_SLUG[locale]}/${slug}`;
}

function productDetailUrl(locale: Locale, slug: string): string {
  return `${SITE_ORIGIN}${productDetailPath(locale, slug)}`;
}

interface ProductVersion {
  locale: Locale;
  title: string;
  description: string;
  imageUrl: string | null;
  updatedAt: Date;
}

interface ProductGroup {
  slug: string;
  versions: ProductVersion[];
}

/**
 * Published, generic-template products and the languages they actually exist
 * in. Eligibility comes from the shared `availableProductLocales` helper — the
 * same one the public page uses to build its hreflang set — so the sitemap,
 * the prerendered <head>, and the hydrated page can never disagree about which
 * language versions exist.
 */
async function loadPublishedProductGroups(): Promise<ProductGroup[]> {
  const rows = await db.select().from(productsTable).where(eq(productsTable.published, true));

  const groups: ProductGroup[] = [];

  for (const row of rows) {
    const slug = row.pageSlug?.trim();
    if (!slug || LEGACY_PRODUCT_SLUGS.has(slug)) continue;

    // Published data reaching the build must satisfy the same single-segment
    // contract the API enforces on write. A slug like `../en` would otherwise
    // be emitted as the route /urunler/../en, which the prerenderer resolves
    // to dist/public/en/index.html and overwrites the English home page. Fail
    // the build loudly rather than silently skipping: invalid published data
    // means something wrote to the database outside the API.
    if (!isValidProductSlug(slug)) {
      throw new Error(
        `Invalid pageSlug on published product #${row.id}: ${JSON.stringify(slug)}. ` +
          `Expected a single lowercase URL segment (e.g. "dental-vakum-pompasi").`,
      );
    }

    const pageData = (row.pageData ?? {}) as PageData;
    // Passing the row makes a translated title part of the eligibility
    // contract, matching the public page: a language whose heading would still
    // be Turkish is not a published translation.
    const locales = availableProductLocales(pageData, {
      fallbackDescription: row.description,
      product: row as unknown as Record<string, unknown>,
    });

    const versions: ProductVersion[] = locales.map((locale) => {
      const content = contentForLocale(pageData, locale) as PageDataContent | undefined;
      const localizedTitle =
        localizedName(row as unknown as Record<string, unknown>, "title", locale) ?? firstText(row.title);

      // Turkish may fall back to the product's short card description; other
      // languages only ever describe themselves.
      const description =
        locale === DEFAULT_LOCALE
          ? toDescription(firstText(content?.heroDescription, row.description, content?.heroSubtitle))
          : toDescription(firstText(content?.heroDescription, content?.heroSubtitle));

      return {
        locale: locale as Locale,
        title: localizedTitle,
        description,
        imageUrl: row.imageUrl,
        updatedAt: row.updatedAt,
      };
    });

    if (versions.length === 0) continue;

    groups.push({ slug, versions });
  }

  return groups;
}

async function main() {
  const todayLastmod = new Date().toISOString().slice(0, 10);

  // ── Static routes ─────────────────────────────────────────────────────────
  const staticEntries: string[] = [];
  for (const routeKey of ROUTE_KEYS) {
    const alternates = [
      ...LOCALES.map((locale) => ({ hreflang: locale, href: absoluteUrl(routeKey, locale) })),
      { hreflang: "x-default", href: absoluteUrl(routeKey, DEFAULT_LOCALE) },
    ];

    for (const locale of LOCALES) {
      const links = alternates
        .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${xmlEscape(a.href)}" />`)
        .join("\n");

      staticEntries.push(
        [
          "  <url>",
          `    <loc>${xmlEscape(absoluteUrl(routeKey, locale))}</loc>`,
          `    <lastmod>${todayLastmod}</lastmod>`,
          `    <changefreq>monthly</changefreq>`,
          `    <priority>${PRIORITY[routeKey]}</priority>`,
          links,
          "  </url>",
        ].join("\n"),
      );
    }
  }

  // ── Dynamic news article URLs ─────────────────────────────────────────────
  const articleGroups = await loadPublishedNewsGroups();
  const newsEntries: string[] = [];

  for (const group of articleGroups) {
    // Build the alternate set for THIS article only (the languages that exist
    // and are published). x-default points at Turkish when it exists.
    const trVersion = group.versions.find((v) => v.locale === "tr");

    const alternates: Array<{ hreflang: string; href: string }> = group.versions.map((v) => ({
      hreflang: v.locale,
      href: newsArticleUrl(v.locale, v.slug),
    }));

    // x-default is the Turkish version when published, otherwise omit it.
    if (trVersion) {
      alternates.push({ hreflang: "x-default", href: newsArticleUrl("tr", trVersion.slug) });
    }

    for (const version of group.versions) {
      const links = alternates
        .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${xmlEscape(a.href)}" />`)
        .join("\n");

      newsEntries.push(
        [
          "  <url>",
          `    <loc>${xmlEscape(newsArticleUrl(version.locale, version.slug))}</loc>`,
          `    <lastmod>${isoDate(version.publishedAt, new Date())}</lastmod>`,
          `    <changefreq>weekly</changefreq>`,
          `    <priority>0.7</priority>`,
          links,
          "  </url>",
        ].join("\n"),
      );
    }
  }

  // ── Dynamic product detail URLs (generic DB-driven template) ──────────────
  const productGroups = await loadPublishedProductGroups();
  const productEntries: string[] = [];

  for (const group of productGroups) {
    const alternates: Array<{ hreflang: string; href: string }> = group.versions.map((v) => ({
      hreflang: v.locale,
      href: productDetailUrl(v.locale, group.slug),
    }));
    if (group.versions.some((v) => v.locale === DEFAULT_LOCALE)) {
      alternates.push({ hreflang: "x-default", href: productDetailUrl(DEFAULT_LOCALE, group.slug) });
    }

    for (const version of group.versions) {
      const links = alternates
        .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${xmlEscape(a.href)}" />`)
        .join("\n");

      productEntries.push(
        [
          "  <url>",
          `    <loc>${xmlEscape(productDetailUrl(version.locale, group.slug))}</loc>`,
          `    <lastmod>${isoDate(version.updatedAt, new Date())}</lastmod>`,
          `    <changefreq>monthly</changefreq>`,
          `    <priority>0.8</priority>`,
          links,
          "  </url>",
        ].join("\n"),
      );
    }
  }

  const allEntries = [...staticEntries, ...newsEntries, ...productEntries];

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    allEntries.join("\n"),
    "</urlset>",
    "",
  ].join("\n");

  const robots = [
    "User-agent: *",
    "Allow: /",
    "",
    "# Admin and print-only pages carry no search value",
    "Disallow: /admin",
    "Disallow: /teklif-goruntule",
    "Disallow: /teklif-sablonu",
    "Disallow: /servis-raporu",
    "Disallow: /taslak",
    "",
    `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
    "",
  ].join("\n");

  // ── Article metadata for the prerender step ───────────────────────────────
  // One record per published language version, carrying the same reciprocal
  // alternate set used in the sitemap so the baked <head> and the sitemap can
  // never disagree about which languages exist.
  const seoArticles = articleGroups.flatMap((group) => {
    const trVersion = group.versions.find((v) => v.locale === "tr");
    const alternates = [
      ...group.versions.map((v) => ({ hreflang: v.locale as string, path: newsArticlePath(v.locale, v.slug) })),
      ...(trVersion ? [{ hreflang: "x-default", path: newsArticlePath("tr", trVersion.slug) }] : []),
    ];

    return group.versions.map((version) => ({
      locale: version.locale,
      slug: version.slug,
      path: newsArticlePath(version.locale, version.slug),
      title: version.title,
      description: version.description,
      imageUrl: version.imageUrl,
      publishedAt: version.publishedAt.toISOString(),
      updatedAt: version.updatedAt.toISOString(),
      alternates,
    }));
  });

  // ── Product metadata for the prerender step ───────────────────────────────
  // Same shape and same reciprocal alternate set as the sitemap entries above,
  // so a baked <head> can never advertise a language the sitemap omits.
  const seoProducts = productGroups.flatMap((group) => {
    const hasTr = group.versions.some((v) => v.locale === DEFAULT_LOCALE);
    const alternates = [
      ...group.versions.map((v) => ({ hreflang: v.locale as string, path: productDetailPath(v.locale, group.slug) })),
      ...(hasTr ? [{ hreflang: "x-default", path: productDetailPath(DEFAULT_LOCALE, group.slug) }] : []),
    ];

    return group.versions.map((version) => ({
      locale: version.locale,
      slug: group.slug,
      path: productDetailPath(version.locale, group.slug),
      title: version.title,
      description: version.description,
      imageUrl: version.imageUrl,
      updatedAt: version.updatedAt.toISOString(),
      alternates,
    }));
  });

  await writeFile(path.join(PUBLIC_DIR, "sitemap.xml"), sitemap, "utf8");
  await writeFile(path.join(PUBLIC_DIR, "robots.txt"), robots, "utf8");
  await writeFile(path.join(SITE_DIR, NEWS_SEO_FILE), `${JSON.stringify(seoArticles, null, 2)}\n`, "utf8");
  await writeFile(path.join(SITE_DIR, PRODUCT_SEO_FILE), `${JSON.stringify(seoProducts, null, 2)}\n`, "utf8");

  const staticCount = staticEntries.length;
  const newsCount = newsEntries.length;
  const productCount = productEntries.length;
  console.log(
    `Wrote sitemap.xml (${staticCount} static URLs + ${newsCount} news article URLs + ${productCount} product URLs = ${staticCount + newsCount + productCount} total), ` +
      `robots.txt, ${NEWS_SEO_FILE} (${seoArticles.length} article versions) and ${PRODUCT_SEO_FILE} (${seoProducts.length} product versions) for ${SITE_ORIGIN}`,
  );

  // Close the pg pool so the process exits cleanly instead of hanging in CI.
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
