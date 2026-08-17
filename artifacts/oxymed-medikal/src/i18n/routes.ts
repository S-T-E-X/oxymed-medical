import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "./config";

/**
 * Pages that exist in every language. Each one has a locale-specific slug so
 * search engines see a native URL per market (e.g. /de/produkte/dental-vakuumpumpe).
 */
export const ROUTE_KEYS = ["home", "products", "gcp", "ams", "dvp", "dvs", "service", "quote", "news", "catalogs"] as const;

export type RouteKey = (typeof ROUTE_KEYS)[number];

/** Slug for the products section, which the four product pages nest under. */
const PRODUCTS_SLUG: Record<Locale, string> = {
  tr: "urunler",
  en: "products",
  de: "produkte",
  fr: "produits",
  it: "prodotti",
  ar: "muntajat",
  ru: "produkciya",
  fa: "mahsulat",
  ka: "produkcia",
  bg: "produkti",
  az: "mehsullar",
};

const LEAF_SLUGS: Record<Exclude<RouteKey, "home" | "products">, Record<Locale, string>> = {
  gcp: {
    tr: "kat-kontrol-panosu",
    en: "gas-control-panel",
    de: "gas-kontrolltafel",
    fr: "panneau-de-controle-gaz",
    it: "pannello-controllo-gas",
    ar: "lawhat-altahakum-bialghaz",
    ru: "panel-kontrolya-gaza",
    fa: "panel-kontrol-gaz",
    ka: "gazis-sakontrolo-paneli",
    bg: "panel-za-kontrol-na-gaz",
    az: "qaz-nezaret-panosu",
  },
  ams: {
    tr: "amalgam-separator",
    en: "amalgam-separator",
    de: "amalgamabscheider",
    fr: "separateur-amalgame",
    it: "separatore-amalgama",
    ar: "fasil-almalgham",
    ru: "amalgamnyy-separator",
    fa: "jodakonande-amalgam",
    ka: "amalgamis-separatori",
    bg: "amalgamen-separator",
    az: "amalqam-separatoru",
  },
  dvp: {
    tr: "dental-vakum-pompasi",
    en: "dental-vacuum-pump",
    de: "dental-vakuumpumpe",
    fr: "pompe-a-vide-dentaire",
    it: "pompa-per-vuoto-dentale",
    ar: "midakhat-tafrigh-alasnan",
    ru: "stomatologicheskiy-vakuumnyy-nasos",
    fa: "pomp-vakum-dandanpezeshki",
    ka: "dentaluri-vakuumis-tumbo",
    bg: "dentalna-vakuumna-pompa",
    az: "dental-vakuum-nasosu",
  },
  dvs: {
    tr: "dental-vakum-sistemi",
    en: "dental-vacuum-system",
    de: "dental-vakuumsystem",
    fr: "systeme-aspiration-dentaire",
    it: "sistema-aspirazione-dentale",
    ar: "nizam-tafrigh-alasnan",
    ru: "stomatologicheskaya-vakuumnaya-sistema",
    fa: "sistem-vakum-dandanpezeshki",
    ka: "dentaluri-vakuumis-sistema",
    bg: "dentalna-vakuumna-sistema",
    az: "dental-vakuum-sistemi",
  },
  service: {
    tr: "servis",
    en: "service",
    de: "service",
    fr: "service",
    it: "assistenza",
    ar: "khidmat-alsiyana",
    ru: "servis",
    fa: "khadamat",
    ka: "servisi",
    bg: "serviz",
    az: "servis",
  },
  news: {
    tr: "haberler",
    en: "news",
    de: "nachrichten",
    fr: "actualites",
    it: "notizie",
    ar: "akhbar",
    ru: "novosti",
    fa: "akhbar",
    ka: "siakhleebi",
    bg: "novini",
    az: "xeberler",
  },
  quote: {
    tr: "teklif-al",
    en: "get-a-quote",
    de: "angebot-anfordern",
    fr: "demander-un-devis",
    it: "richiedi-preventivo",
    ar: "talab-arad-siar",
    ru: "zapros-predlozheniya",
    fa: "darkhast-gheymat",
    ka: "fasis-motkhovna",
    bg: "zapitvane-za-oferta",
    az: "teklif-al",
  },
  catalogs: {
    tr: "kataloglar",
    en: "catalogs",
    de: "kataloge",
    fr: "catalogues",
    it: "cataloghi",
    ar: "katalujat",
    ru: "katalogi",
    fa: "katalog-ha",
    ka: "katalogebi",
    bg: "katalozi",
    az: "kataloqlar",
  },
};

/** URL segment of the news section in each language, e.g. /de/nachrichten. */
export function newsSegment(locale: Locale): string {
  return LEAF_SLUGS.news[locale];
}

/** Absolute in-app path of a single article in one language. */
export function newsDetailPath(locale: Locale, slug: string): string {
  return localizedPath("news", locale, [slug]);
}

/** Product detail pages live under the products segment. */
const NESTED_UNDER_PRODUCTS: ReadonlySet<RouteKey> = new Set<RouteKey>(["gcp", "ams", "dvp", "dvs"]);

/** Path segments (without locale prefix) for a route in a given locale. */
export function routeSegments(routeKey: RouteKey, locale: Locale): string[] {
  if (routeKey === "home") return [];
  if (routeKey === "products") return [PRODUCTS_SLUG[locale]];
  const leaf = LEAF_SLUGS[routeKey][locale];
  return NESTED_UNDER_PRODUCTS.has(routeKey) ? [PRODUCTS_SLUG[locale], leaf] : [leaf];
}

/**
 * Absolute in-app path for a route in a locale. Turkish keeps the bare paths
 * that are already indexed; other locales are prefixed with their code.
 */
export function localizedPath(routeKey: RouteKey, locale: Locale, extraSegments: string[] = []): string {
  const segments = [...routeSegments(routeKey, locale), ...extraSegments].filter(Boolean);
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  const tail = segments.length > 0 ? `/${segments.join("/")}` : "";
  return `${prefix}${tail}` || "/";
}

export type MatchedRoute = {
  locale: Locale;
  routeKey: RouteKey;
  /** Segments after the matched route, e.g. a device serial on the service page. */
  extraSegments: string[];
};

/** Reverse lookup: figure out which locale + page a pathname refers to. */
export function matchLocalizedPath(pathname: string): MatchedRoute | null {
  const parts = pathname.split("/").filter(Boolean);
  const [maybeLocale] = parts;
  const locale: Locale = isLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
  const rest = isLocale(maybeLocale) ? parts.slice(1) : parts;

  if (rest.length === 0) return { locale, routeKey: "home", extraSegments: [] };

  for (const routeKey of ROUTE_KEYS) {
    if (routeKey === "home") continue;
    const segments = routeSegments(routeKey, locale);
    const matches = segments.every((segment, index) => rest[index] === segment);
    if (!matches) continue;
    // Deeper routes (product detail) must win over the shorter products route.
    if (routeKey === "products" && rest.length > segments.length) continue;
    return { locale, routeKey, extraSegments: rest.slice(segments.length) };
  }

  return null;
}

/** Locale of the current pathname, defaulting to Turkish for unprefixed URLs. */
export function localeFromPath(pathname: string): Locale {
  const [maybeLocale] = pathname.split("/").filter(Boolean);
  return isLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
}

/**
 * Same page, different language. Falls back to that locale's home page when
 * the current URL is not one of the translated marketing pages.
 */
export function equivalentPath(pathname: string, targetLocale: Locale): string {
  const matched = matchLocalizedPath(pathname);
  if (!matched) return localizedPath("home", targetLocale);
  return localizedPath(matched.routeKey, targetLocale, matched.extraSegments);
}

/**
 * The four product detail pages exist as their own translated routes, but the
 * products listing gets its cards from the API, which only knows the Turkish
 * slug. This maps that slug onto the route so a card opens in the language the
 * visitor is already browsing in, instead of dropping them back into Turkish.
 */
const ROUTE_KEY_BY_TR_SLUG: Record<string, RouteKey> = {
  "kat-kontrol-panosu": "gcp",
  "amalgam-separator": "ams",
  "dental-vakum-pompasi": "dvp",
  "dental-vakum-sistemi": "dvs",
};

export function routeKeyForTurkishSlug(slug: string): RouteKey | null {
  return ROUTE_KEY_BY_TR_SLUG[slug] ?? null;
}

/** Every indexable URL, used to build the sitemap and hreflang sets. */
export function allLocalizedRoutes(): Array<{ routeKey: RouteKey; locale: Locale; path: string }> {
  return LOCALES.flatMap((locale) =>
    ROUTE_KEYS.map((routeKey) => ({ routeKey, locale, path: localizedPath(routeKey, locale) })),
  );
}
