import { LOCALES, LOCALE_META, DEFAULT_LOCALE, SITE_ORIGIN, type Locale } from "./config";
import { localizedPath, type RouteKey } from "./routes";

export type Alternate = { hreflang: string; href: string };

/** Absolute URL for a route in a locale, used by canonical / hreflang / sitemap. */
export function absoluteUrl(routeKey: RouteKey, locale: Locale): string {
  return `${SITE_ORIGIN}${localizedPath(routeKey, locale)}`;
}

/**
 * Reciprocal hreflang set for a page: one entry per language plus x-default,
 * which points at Turkish since that is the company's primary market.
 */
export function alternatesFor(routeKey: RouteKey): Alternate[] {
  const alternates: Alternate[] = LOCALES.map((locale) => ({
    hreflang: LOCALE_META[locale].hreflang,
    href: absoluteUrl(routeKey, locale),
  }));
  alternates.push({ hreflang: "x-default", href: absoluteUrl(routeKey, DEFAULT_LOCALE) });
  return alternates;
}
