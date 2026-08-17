/**
 * The single source of truth for "does this product have real content in this
 * language?".
 *
 * Three places need to agree on this question and must never drift apart:
 *   - the public product page, when it builds its hreflang set at runtime
 *   - gen-sitemap, when it decides which URLs and alternates to publish
 *   - prerender, which bakes a <head> only for the languages listed above
 *
 * If the runtime advertised a language the build-time pipeline skipped, the
 * SPA would overwrite a correct baked <head> with links to pages that were
 * never published — so both sides import this module instead of re-deriving
 * the rule locally.
 *
 * Deliberately dependency-free (no drizzle, no React) so the browser bundle,
 * the node build scripts, and the API can all use it.
 */

export const CONTENT_LOCALES = [
  "tr",
  "en",
  "de",
  "fr",
  "it",
  "ar",
  "ru",
  "fa",
  "ka",
  "bg",
  "az",
] as const;

export type ContentLocale = (typeof CONTENT_LOCALES)[number];

export const DEFAULT_CONTENT_LOCALE: ContentLocale = "tr";

/** Non-default locales, i.e. the ones whose copy lives under pageData.locales. */
export type TranslatedLocale = Exclude<ContentLocale, "tr">;

/**
 * The subset of a product's page content this module needs to reason about.
 * Structurally compatible with PageDataContent from the db and api packages,
 * without importing either of them.
 */
export interface ProductContentShape {
  heroSubtitle?: string;
  heroDescription?: string;
  features?: unknown[];
  detailCards?: unknown[];
  useCases?: unknown[];
  advantages?: unknown[];
  featureTiles?: unknown[];
  faq?: unknown[];
  specs?: unknown[];
}

export interface ProductPageDataShape extends ProductContentShape {
  locales?: Partial<Record<string, ProductContentShape>>;
}

/**
 * The only shape a product `pageSlug` may take: one lowercase URL segment.
 *
 * A slug is not just a URL fragment — the build writes each published product
 * to `dist/public/<...>/<slug>/index.html`, so a slug containing `/`, `\`, `.`
 * segments, or control characters could escape the intended output directory
 * or collide with unrelated build output. It also has to match the client's
 * single-segment `:slug` route, or the sitemap would advertise URLs the app
 * cannot render.
 */
export const PRODUCT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Maximum slug length, kept well under filesystem path-segment limits. */
export const PRODUCT_SLUG_MAX_LENGTH = 120;

/**
 * Whether a value is safe to use as a product page slug.
 *
 * Rejects path separators, `.`/`..` traversal segments, control characters,
 * whitespace, uppercase, and leading/trailing or doubled hyphens.
 */
export function isValidProductSlug(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (value.length === 0 || value.length > PRODUCT_SLUG_MAX_LENGTH) return false;
  return PRODUCT_SLUG_PATTERN.test(value);
}

/**
 * A record carrying per-locale name columns, e.g. a product row with
 * `title` / `titleEn` / `titleDe`, or a category with `name` / `nameEn`.
 *
 * Typed as `object` rather than an index signature so generated API
 * interfaces and drizzle rows can be passed without casting at every call
 * site; the lookup below narrows each field it reads.
 */
export type LocalizedNameRecord = object;

/**
 * The locale-specific value for a translatable name field, or undefined when
 * this language has no translation.
 *
 * Deliberately has NO fallback to the Turkish base field. Callers must decide
 * explicitly what to show when a translation is missing, so Turkish source
 * copy can never leak onto a non-Turkish page by accident.
 */
export function localizedName(
  record: LocalizedNameRecord | undefined,
  baseField: string,
  locale: string,
): string | undefined {
  if (!record) return undefined;
  const key =
    locale === DEFAULT_CONTENT_LOCALE
      ? baseField
      : `${baseField}${locale.charAt(0).toUpperCase()}${locale.slice(1)}`;
  const value = (record as Record<string, unknown>)[key];
  if (typeof value !== "string") return undefined;
  return value.trim() ? value : undefined;
}

function hasText(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasItems(value: unknown[] | undefined): boolean {
  return Array.isArray(value) && value.length > 0;
}

/**
 * True when an editor has actually supplied something renderable. An object
 * that exists but is empty (or holds only blank strings) does not count — the
 * page would render an empty shell, which must not be advertised to crawlers.
 */
export function hasProductContent(content: ProductContentShape | undefined): boolean {
  if (!content) return false;
  return (
    hasText(content.heroSubtitle) ||
    hasText(content.heroDescription) ||
    hasItems(content.features) ||
    hasItems(content.detailCards) ||
    hasItems(content.useCases) ||
    hasItems(content.advantages) ||
    hasItems(content.featureTiles) ||
    hasItems(content.faq) ||
    hasItems(content.specs)
  );
}

/**
 * Content for one language: Turkish reads the top-level fields, every other
 * language reads only its own entry under `locales` (no Turkish fallback).
 */
export function contentForLocale(
  pageData: ProductPageDataShape | undefined,
  locale: string,
): ProductContentShape | undefined {
  if (!pageData) return undefined;
  if (locale === DEFAULT_CONTENT_LOCALE) {
    const { locales: _locales, ...base } = pageData;
    return base;
  }
  return pageData.locales?.[locale];
}

/**
 * Every language this product genuinely exists in, in canonical locale order.
 *
 * This is the list that drives sitemap entries, prerendered files, and runtime
 * hreflang tags. A Turkish product with no translations yields `["tr"]`, so no
 * empty language version is ever advertised.
 *
 * `fallbackDescription` covers the Turkish page specifically: its hero can fall
 * back to the product's short card description, so Turkish still qualifies even
 * when pageData itself is empty.
 */
export function availableProductLocales(
  pageData: ProductPageDataShape | undefined,
  options: {
    fallbackDescription?: string | null;
    /**
     * The product row. When supplied, a language additionally requires its own
     * translated product title — a page whose body is translated but whose
     * heading is still Turkish is not a real translation, and publishing it
     * would put Turkish text on a non-Turkish URL.
     */
    product?: LocalizedNameRecord;
  } = {},
): ContentLocale[] {
  const available: ContentLocale[] = [];

  for (const locale of CONTENT_LOCALES) {
    if (
      options.product !== undefined &&
      locale !== DEFAULT_CONTENT_LOCALE &&
      !localizedName(options.product, "title", locale)
    ) {
      continue;
    }

    const content = contentForLocale(pageData, locale);
    if (hasProductContent(content)) {
      available.push(locale);
      continue;
    }
    if (locale === DEFAULT_CONTENT_LOCALE && hasText(options.fallbackDescription ?? undefined)) {
      available.push(locale);
    }
  }

  return available;
}

/**
 * Whether a product may be served at all on a given locale's URL.
 *
 * Rendering and indexing must follow the exact same rule as the sitemap: if a
 * locale is not published, the URL must not render the product template with
 * partial/Turkish content and must not be indexable.
 */
export function isProductLocaleAvailable(
  pageData: ProductPageDataShape | undefined,
  locale: string,
  options: { fallbackDescription?: string | null; product?: LocalizedNameRecord } = {},
): boolean {
  return (availableProductLocales(pageData, options) as string[]).includes(locale);
}

/**
 * Whether a product row may be disclosed to an anonymous visitor at all.
 *
 * Publication state is a separate axis from translation state: a fully
 * translated product that has been withdrawn must disappear from the public
 * site even though its content still qualifies. Unpublishing removes a product
 * from the catalogue, the sitemap and the prerendered output, but the row keeps
 * its slug and id — so anyone holding the old URL would still reach it unless
 * every public read applies this check.
 *
 * A hidden category hides the products inside it, matching the list endpoint.
 * Anything unknown fails closed.
 */
export function isProductPubliclyVisible(
  product: { published?: unknown } | null | undefined,
  options: { categoryVisible?: boolean | null } = {},
): boolean {
  if (!product || product.published !== true) return false;
  return options.categoryVisible !== false;
}
