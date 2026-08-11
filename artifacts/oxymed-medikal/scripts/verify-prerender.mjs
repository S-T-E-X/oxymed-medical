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

const SITE_ORIGIN = (process.env.SITE_ORIGIN ?? "https://www.oxymed.com.tr").replace(/\/$/, "");

const LOCALES = ["tr", "en", "de", "fr", "it", "ar", "ru", "fa", "ka", "bg", "az"];
const DEFAULT_LOCALE = "tr";
const ROUTE_KEYS = ["home", "products", "gcp", "ams", "dvp", "dvs", "service", "quote"];

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
    const urlCount = (sitemap.match(/<loc>/g) ?? []).length;
    const expected = LOCALES.length * ROUTE_KEYS.length;
    if (urlCount !== expected) {
      errors.push(`sitemap.xml has ${urlCount} <loc> entries; expected ${expected} (${LOCALES.length} locales × ${ROUTE_KEYS.length} routes)`);
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
  const total = LOCALES.length * ROUTE_KEYS.length;
  if (warnings.length) {
    for (const w of warnings) console.warn(`⚠  ${w}`);
  }

  if (errors.length) {
    console.error(`\n✗ Prerender verification FAILED (${errors.length} error${errors.length > 1 ? "s" : ""} across ${total} pages):\n`);
    for (const e of errors) console.error(`  • ${e}`);
    process.exit(1);
  }

  console.log(`✓ Prerender verified: ${total} pages, all titles and canonicals correct. SITE_ORIGIN=${SITE_ORIGIN}`);
}

main().catch((err) => {
  console.error("verify-prerender: unexpected error:", err);
  process.exit(1);
});
