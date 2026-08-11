/**
 * Writes public/sitemap.xml and public/robots.txt for the marketing site.
 *
 *   pnpm --filter @workspace/scripts run gen-sitemap
 *   SITE_ORIGIN=https://www.example.com pnpm --filter @workspace/scripts run gen-sitemap
 *
 * Every translated page is listed once per language, and each entry carries the
 * full reciprocal xhtml:link alternate set plus x-default, which is what Google
 * expects for a multilingual site.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE_DIR = path.resolve(HERE, "../../artifacts/oxymed-medikal");
const PUBLIC_DIR = path.join(SITE_DIR, "public");

const SITE_ORIGIN = (process.env.SITE_ORIGIN ?? "https://www.oxymed.com.tr").replace(/\/$/, "");

const LOCALES = ["tr", "en", "de", "fr", "it", "ar", "ru", "fa", "ka", "bg", "az"] as const;
type Locale = (typeof LOCALES)[number];
const DEFAULT_LOCALE: Locale = "tr";

const ROUTE_KEYS = ["home", "products", "gcp", "ams", "dvp", "dvs", "service", "quote"] as const;
type RouteKey = (typeof ROUTE_KEYS)[number];

// Mirrors artifacts/oxymed-medikal/src/i18n/routes.ts — keep the two in sync.
const PRODUCTS_SLUG: Record<Locale, string> = {
  tr: "urunler", en: "products", de: "produkte", fr: "produits", it: "prodotti",
  ar: "muntajat", ru: "produkciya", fa: "mahsulat", ka: "produkcia", bg: "produkti", az: "mehsullar",
};

const LEAF_SLUGS: Record<Exclude<RouteKey, "home" | "products">, Record<Locale, string>> = {
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

const NESTED_UNDER_PRODUCTS = new Set<RouteKey>(["gcp", "ams", "dvp", "dvs"]);

/** Search-engine priority per page type. */
const PRIORITY: Record<RouteKey, string> = {
  home: "1.0", products: "0.9", gcp: "0.8", ams: "0.8",
  dvp: "0.8", dvs: "0.8", service: "0.7", quote: "0.7",
};

function localizedPath(routeKey: RouteKey, locale: Locale): string {
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  if (routeKey === "home") return prefix || "/";
  if (routeKey === "products") return `${prefix}/${PRODUCTS_SLUG[locale]}`;
  const leaf = LEAF_SLUGS[routeKey][locale];
  return NESTED_UNDER_PRODUCTS.has(routeKey)
    ? `${prefix}/${PRODUCTS_SLUG[locale]}/${leaf}`
    : `${prefix}/${leaf}`;
}

function absoluteUrl(routeKey: RouteKey, locale: Locale): string {
  return `${SITE_ORIGIN}${localizedPath(routeKey, locale)}`;
}

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function main() {
  const lastmod = new Date().toISOString().slice(0, 10);

  const entries: string[] = [];
  for (const routeKey of ROUTE_KEYS) {
    const alternates = [
      ...LOCALES.map((locale) => ({ hreflang: locale, href: absoluteUrl(routeKey, locale) })),
      { hreflang: "x-default", href: absoluteUrl(routeKey, DEFAULT_LOCALE) },
    ];

    for (const locale of LOCALES) {
      const links = alternates
        .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${xmlEscape(a.href)}" />`)
        .join("\n");

      entries.push(
        [
          "  <url>",
          `    <loc>${xmlEscape(absoluteUrl(routeKey, locale))}</loc>`,
          `    <lastmod>${lastmod}</lastmod>`,
          `    <changefreq>monthly</changefreq>`,
          `    <priority>${PRIORITY[routeKey]}</priority>`,
          links,
          "  </url>",
        ].join("\n"),
      );
    }
  }

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    entries.join("\n"),
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

  await writeFile(path.join(PUBLIC_DIR, "sitemap.xml"), sitemap, "utf8");
  await writeFile(path.join(PUBLIC_DIR, "robots.txt"), robots, "utf8");

  console.log(`Wrote sitemap.xml (${ROUTE_KEYS.length * LOCALES.length} URLs) and robots.txt for ${SITE_ORIGIN}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
