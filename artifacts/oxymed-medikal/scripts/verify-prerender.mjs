/**
 * Post-build smoke test for prerendered SEO HTML.
 *
 * Checks every locale × route combination to confirm:
 *   1. The HTML file exists in dist/public.
 *   2. It has a <title> that is not empty or generic.
 *   3. It contains a <link rel="canonical"> whose href matches the expected URL.
 *   4. All canonical URLs across every route/locale are unique (no two pages
 *      share the same canonical → duplicate-content alarm for crawlers).
 *   5. sitemap.xml and robots.txt are present.
 *
 * Run automatically after prerender.mjs as part of `pnpm run build`.
 * Exits with code 1 on any failure so a bad build is caught before deploy.
 */

import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE_DIR = path.resolve(HERE, "..");
const DIST_DIR = path.join(SITE_DIR, "dist/public");
/** Build input written by gen-sitemap; the list of pages prerender should have produced. */
const NEWS_SEO_FILE = path.join(SITE_DIR, ".news-seo.json");

const SITE_ORIGIN = (process.env.SITE_ORIGIN ?? "https://www.oxymed.com.tr").replace(/\/$/, "");

const LOCALES = ["tr", "en", "de", "fr", "it", "ar", "ru", "fa", "ka", "bg", "az"];
const DEFAULT_LOCALE = "tr";
const ROUTE_KEYS = ["home", "products", "gcp", "ams", "dvp", "dvs", "service", "quote", "news"];

const PRODUCTS_SLUG = {
  tr: "urunler", en: "products", de: "produkte", fr: "produits", it: "prodotti",
  ar: "muntajat", ru: "produkciya", fa: "mahsulat", ka: "produkcia", bg: "produkti", az: "mehsullar",
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
  news: {
    tr: "haberler", en: "news", de: "nachrichten", fr: "actualites", it: "notizie",
    ar: "akhbar", ru: "novosti", fa: "akhbar", ka: "siakhleebi", bg: "novini", az: "xeberler",
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
  if (routeKey === "news") return `${prefix}/${LEAF_SLUGS.news[locale]}`;
  const leaf = LEAF_SLUGS[routeKey][locale];
  return NESTED_UNDER_PRODUCTS.has(routeKey)
    ? `${prefix}/${PRODUCTS_SLUG[locale]}/${leaf}`
    : `${prefix}/${leaf}`;
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : null;
}

function extractCanonical(html) {
  const m = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)
    ?? html.match(/<link\s+href="([^"]+)"\s+rel="canonical"/i);
  return m ? m[1].trim() : null;
}

function extractLang(html) {
  const m = html.match(/<html[^>]+lang="([^"]+)"/i);
  return m ? m[1].trim() : null;
}

async function main() {
  const errors = [];
  const warnings = [];
  const canonicalsSeen = new Map(); // canonical → "locale/routeKey" for duplicate detection

  // --- Check every locale × route ---
  for (const locale of LOCALES) {
    for (const routeKey of ROUTE_KEYS) {
      const urlPath = routePath(routeKey, locale);
      const filePath =
        urlPath === "/"
          ? path.join(DIST_DIR, "index.html")
          : path.join(DIST_DIR, urlPath.replace(/^\//, ""), "index.html");

      const label = `[${locale}/${routeKey}]`;

      // 1. File must exist
      let html;
      try {
        html = await readFile(filePath, "utf8");
      } catch {
        errors.push(`${label} Missing file: ${filePath}`);
        continue;
      }

      // 2. Title must not be empty
      const title = extractTitle(html);
      if (!title) {
        errors.push(`${label} No <title> found`);
      }

      // 3. Canonical must be present and must match the expected absolute URL
      const canonical = extractCanonical(html);
      const expectedCanonical = `${SITE_ORIGIN}${urlPath === "/" ? "/" : urlPath}`;
      if (!canonical) {
        errors.push(`${label} No <link rel="canonical"> found`);
      } else if (canonical !== expectedCanonical) {
        errors.push(
          `${label} Canonical mismatch:\n    expected: ${expectedCanonical}\n    got:      ${canonical}`,
        );
      }

      // 4. html[lang] must match locale
      const lang = extractLang(html);
      if (lang !== locale) {
        errors.push(`${label} <html lang="${lang}"> but expected "${locale}"`);
      }

      // 5. Track canonicals for duplicate detection (skip if already errored above)
      if (canonical) {
        if (canonicalsSeen.has(canonical)) {
          errors.push(
            `${label} Duplicate canonical "${canonical}" also used by ${canonicalsSeen.get(canonical)}`,
          );
        } else {
          canonicalsSeen.set(canonical, label);
        }
      }

      // 6. Warn when title looks like the unmodified fallback
      if (title === "Oxymed Medikal" && routeKey !== "home") {
        warnings.push(`${label} Title is the generic fallback "Oxymed Medikal" — SEO copy may be missing`);
      }
    }
  }

  // --- News article detail pages ---
  // Sourced from the same build input the prerender step used, so this catches
  // a published article whose HTML never got written.
  let articles = [];
  try {
    articles = JSON.parse(await readFile(NEWS_SEO_FILE, "utf8"));
  } catch {
    errors.push(
      `Missing or unreadable ${path.basename(NEWS_SEO_FILE)} — the gen-sitemap step must run before prerender.`,
    );
  }

  for (const article of articles) {
    const label = `[${article.locale}/news:${article.slug}]`;
    const filePath = path.join(DIST_DIR, article.path.replace(/^\//, ""), "index.html");

    let html;
    try {
      html = await readFile(filePath, "utf8");
    } catch {
      errors.push(`${label} Missing prerendered article file: ${filePath}`);
      continue;
    }

    const title = extractTitle(html);
    if (!title) {
      errors.push(`${label} No <title> found`);
    } else if (title === "Oxymed Medikal") {
      errors.push(`${label} Title is the generic fallback — article metadata was not baked in`);
    }

    const canonical = extractCanonical(html);
    const expectedCanonical = `${SITE_ORIGIN}${article.path}`;
    if (canonical !== expectedCanonical) {
      errors.push(`${label} Canonical mismatch:\n    expected: ${expectedCanonical}\n    got:      ${canonical}`);
    }

    const lang = extractLang(html);
    if (lang !== article.locale) {
      errors.push(`${label} <html lang="${lang}"> but expected "${article.locale}"`);
    }

    if (canonical) {
      if (canonicalsSeen.has(canonical)) {
        errors.push(`${label} Duplicate canonical "${canonical}" also used by ${canonicalsSeen.get(canonical)}`);
      } else {
        canonicalsSeen.set(canonical, label);
      }
    }

    // A crawler must be able to read the article without running JavaScript.
    if (!html.includes('"@type":"NewsArticle"')) {
      errors.push(`${label} No NewsArticle JSON-LD in the prerendered HTML`);
    }
    if (!html.includes('property="og:type" content="article"')) {
      errors.push(`${label} og:type is not "article"`);
    }

    // Every advertised hreflang must itself have been prerendered, or we are
    // pointing crawlers at URLs that resolve to the bare SPA shell.
    for (const alt of article.alternates ?? []) {
      if (alt.hreflang === "x-default") continue;
      const altFile = path.join(DIST_DIR, alt.path.replace(/^\//, ""), "index.html");
      try {
        await access(altFile);
      } catch {
        errors.push(`${label} hreflang="${alt.hreflang}" points at ${alt.path}, which was not prerendered`);
      }
    }
  }

  // --- sitemap.xml and robots.txt must exist ---
  for (const staticFile of ["sitemap.xml", "robots.txt"]) {
    try {
      await access(path.join(DIST_DIR, staticFile));
    } catch {
      errors.push(`Missing static file in dist/public: ${staticFile}`);
    }
  }

  // --- sitemap.xml must reference SITE_ORIGIN ---
  try {
    const sitemap = await readFile(path.join(DIST_DIR, "sitemap.xml"), "utf8");
    if (!sitemap.includes(SITE_ORIGIN)) {
      errors.push(`sitemap.xml does not contain the expected origin "${SITE_ORIGIN}"`);
    }
    // Static pages are a fixed grid; news ARTICLE urls come from the database
    // and legitimately vary per build, so the count is a floor, not an equality.
    const urlCount = (sitemap.match(/<loc>/g) ?? []).length;
    const expectedStatic = LOCALES.length * ROUTE_KEYS.length;
    if (urlCount < expectedStatic) {
      errors.push(`sitemap.xml has ${urlCount} <loc> entries; expected at least ${expectedStatic} (${LOCALES.length} locales × ${ROUTE_KEYS.length} static routes) plus any news articles`);
    }
  } catch {
    // already reported as missing above
  }

  // --- robots.txt must point Sitemap to SITE_ORIGIN ---
  try {
    const robots = await readFile(path.join(DIST_DIR, "robots.txt"), "utf8");
    if (!robots.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`)) {
      errors.push(`robots.txt Sitemap directive does not match SITE_ORIGIN "${SITE_ORIGIN}"`);
    }
  } catch {
    // already reported as missing above
  }

  // --- Summary ---
  const staticTotal = LOCALES.length * ROUTE_KEYS.length;
  const total = staticTotal + articles.length;
  if (warnings.length) {
    for (const w of warnings) console.warn(`⚠  ${w}`);
  }

  if (errors.length) {
    console.error(`\n✗ Prerender verification FAILED (${errors.length} error${errors.length > 1 ? "s" : ""} across ${total} pages):\n`);
    for (const e of errors) console.error(`  • ${e}`);
    process.exit(1);
  }

  console.log(
    `✓ Prerender verified: ${total} pages (${staticTotal} static + ${articles.length} news articles), ` +
      `all titles and canonicals correct. SITE_ORIGIN=${SITE_ORIGIN}`,
  );
}

main().catch((err) => {
  console.error("verify-prerender: unexpected error:", err);
  process.exit(1);
});
