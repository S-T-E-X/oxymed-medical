import type { Locale } from "./config";

/**
 * Pick the locale-specific value for a translatable name/title field,
 * falling back to Turkish (the base field) when the locale value is absent.
 *
 * Works for both ProductCategory (baseField = "name") and
 * Product (baseField = "title").
 */
export function pickLocalizedName(
  record: object,
  baseField: string,
  locale: Locale,
): string {
  const r = record as Record<string, string | null | undefined>;
  const base = r[baseField] ?? "";
  if (locale === "tr") return base;

  const suffix = locale.charAt(0).toUpperCase() + locale.slice(1);
  const localeKey = baseField + suffix;
  const localeVal = r[localeKey];

  if (localeVal && localeVal.trim()) return localeVal;
  return base;
}
