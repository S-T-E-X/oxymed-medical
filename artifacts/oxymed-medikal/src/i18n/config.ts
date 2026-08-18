/**
 * Supported site locales. Turkish is the source language: its pages live at
 * the site root (no prefix) so the existing Turkish URLs keep their search
 * ranking, while every other locale is served under its own path prefix.
 */
export const LOCALES = ["tr", "en", "de", "fr", "it", "ar", "ru", "fa", "ka", "bg", "az", "es"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "tr";

export type LocaleMeta = {
  /** Short code shown in the compact language switcher. */
  code: string;
  /** Language name written in that language, for the dropdown. */
  nativeName: string;
  /** Value for <html lang="...">. */
  htmlLang: string;
  /** Value for hreflang annotations. */
  hreflang: string;
  /** Text direction; Arabic and Persian are right-to-left. */
  dir: "ltr" | "rtl";
  /** Language name in English — used when asking the translation model. */
  englishName: string;
  /** og:locale value. */
  ogLocale: string;
};

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  tr: { code: "TR", nativeName: "Türkçe", htmlLang: "tr", hreflang: "tr", dir: "ltr", englishName: "Turkish", ogLocale: "tr_TR" },
  en: { code: "EN", nativeName: "English", htmlLang: "en", hreflang: "en", dir: "ltr", englishName: "English", ogLocale: "en_US" },
  de: { code: "DE", nativeName: "Deutsch", htmlLang: "de", hreflang: "de", dir: "ltr", englishName: "German", ogLocale: "de_DE" },
  fr: { code: "FR", nativeName: "Français", htmlLang: "fr", hreflang: "fr", dir: "ltr", englishName: "French", ogLocale: "fr_FR" },
  it: { code: "IT", nativeName: "Italiano", htmlLang: "it", hreflang: "it", dir: "ltr", englishName: "Italian", ogLocale: "it_IT" },
  ar: { code: "AR", nativeName: "العربية", htmlLang: "ar", hreflang: "ar", dir: "rtl", englishName: "Arabic", ogLocale: "ar_AR" },
  ru: { code: "RU", nativeName: "Русский", htmlLang: "ru", hreflang: "ru", dir: "ltr", englishName: "Russian", ogLocale: "ru_RU" },
  fa: { code: "FA", nativeName: "فارسی", htmlLang: "fa", hreflang: "fa", dir: "rtl", englishName: "Persian (Farsi)", ogLocale: "fa_IR" },
  ka: { code: "KA", nativeName: "ქართული", htmlLang: "ka", hreflang: "ka", dir: "ltr", englishName: "Georgian", ogLocale: "ka_GE" },
  bg: { code: "BG", nativeName: "Български", htmlLang: "bg", hreflang: "bg", dir: "ltr", englishName: "Bulgarian", ogLocale: "bg_BG" },
  az: { code: "AZ", nativeName: "Azərbaycan", htmlLang: "az", hreflang: "az", dir: "ltr", englishName: "Azerbaijani", ogLocale: "az_AZ" },
  es: { code: "ES", nativeName: "Español", htmlLang: "es", hreflang: "es", dir: "ltr", englishName: "Spanish", ogLocale: "es_ES" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * Absolute origin used for canonical/hreflang/sitemap URLs. Overridable via
 * VITE_SITE_ORIGIN so the production domain can change without a code edit.
 */
export const SITE_ORIGIN: string = (
  (import.meta.env?.["VITE_SITE_ORIGIN"] as string | undefined) ?? "https://www.oxymedmedical.com"
).replace(/\/$/, "");

/**
 * Bare hostname of SITE_ORIGIN, for places that print the domain as text
 * (quote sheets, PDF footers) rather than linking to it. Derived so a domain
 * change only has to happen in one place.
 */
export const SITE_DOMAIN: string = SITE_ORIGIN.replace(/^https?:\/\//, "");
