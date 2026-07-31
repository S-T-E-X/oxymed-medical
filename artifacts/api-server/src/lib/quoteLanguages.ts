// Central list of languages a quote form can be authored or AI-translated
// into. Keep the `code` values identical to
// artifacts/oxymed-medikal/src/lib/quoteLanguages.ts (frontend) — the codes
// are stored as-is in quote_forms.language. `englishName` is only used to
// name the target language in the OpenAI translation prompt.
export const QUOTE_LANGUAGES = [
  { code: "tr", englishName: "Turkish" },
  { code: "en", englishName: "English" },
  { code: "de", englishName: "German" },
  { code: "fr", englishName: "French" },
  { code: "es", englishName: "Spanish" },
  { code: "ru", englishName: "Russian" },
  { code: "ar", englishName: "Arabic" },
  { code: "it", englishName: "Italian" },
  { code: "fa", englishName: "Persian (Farsi)" },
  { code: "az", englishName: "Azerbaijani" },
  { code: "pt", englishName: "Portuguese" },
  { code: "bg", englishName: "Bulgarian" },
  { code: "ro", englishName: "Romanian" },
  { code: "ka", englishName: "Georgian" },
] as const;

export type QuoteLanguage = (typeof QUOTE_LANGUAGES)[number]["code"];

export const QUOTE_LANGUAGE_CODES = QUOTE_LANGUAGES.map((l) => l.code) as [QuoteLanguage, ...QuoteLanguage[]];

export function quoteLanguageEnglishName(code: string): string {
  return QUOTE_LANGUAGES.find((l) => l.code === code)?.englishName ?? code.toUpperCase();
}
