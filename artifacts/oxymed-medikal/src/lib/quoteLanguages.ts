// Central list of languages a quote form / template can be authored or
// AI-translated into. Add a language here (frontend) and to the matching
// list in artifacts/api-server/src/lib/quoteLanguages.ts (backend) to
// support it end-to-end — the backend list also drives the OpenAI prompt's
// target-language name, so keep the codes identical.
export const QUOTE_LANGUAGES = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "İngilizce" },
  { code: "de", label: "Almanca" },
  { code: "fr", label: "Fransızca" },
  { code: "es", label: "İspanyolca" },
  { code: "ru", label: "Rusça" },
  { code: "ar", label: "Arapça" },
  { code: "it", label: "İtalyanca" },
  { code: "fa", label: "Farsça" },
  { code: "az", label: "Azerice" },
  { code: "pt", label: "Portekizce" },
  { code: "bg", label: "Bulgarca" },
  { code: "ro", label: "Rumence" },
  { code: "ka", label: "Gürcüce" },
] as const;

export type QuoteLanguage = (typeof QUOTE_LANGUAGES)[number]["code"];

export function isQuoteLanguage(value: string | null | undefined): value is QuoteLanguage {
  return QUOTE_LANGUAGES.some((l) => l.code === value);
}

export function quoteLanguageLabel(code: string): string {
  return QUOTE_LANGUAGES.find((l) => l.code === code)?.label ?? code.toUpperCase();
}
