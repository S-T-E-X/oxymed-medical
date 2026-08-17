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

/**
 * Quote item units are controlled vocabulary, not free text. Translate them
 * deterministically instead of asking the model to translate abbreviations
 * inconsistently (or copying the Turkish value during duplication).
 */
const QUOTE_UNIT_TRANSLATIONS: Record<string, Partial<Record<QuoteLanguage, string>>> = {
  ADET: { tr: "ADET", en: "PCS", de: "STK.", fr: "PCS", es: "UD.", ru: "ШТ.", ar: "قطعة", it: "PZ.", fa: "عدد", az: "ƏDƏD", pt: "UN.", bg: "БР.", ro: "BUC.", ka: "ცალი" },
  SET: { tr: "SET", en: "SET", de: "SET", fr: "ENSEMBLE", es: "JUEGO", ru: "КОМПЛ.", ar: "طقم", it: "SET", fa: "مجموعه", az: "DƏST", pt: "CONJ.", bg: "КОМПЛ.", ro: "SET", ka: "კომპლექტი" },
  METRE: { tr: "METRE", en: "METER", de: "METER", fr: "MÈTRE", es: "METRO", ru: "М", ar: "متر", it: "METRO", fa: "متر", az: "METR", pt: "METRO", bg: "МЕТЪР", ro: "METRU", ka: "მეტრი" },
  MT: { tr: "MT", en: "M", de: "M", fr: "M", es: "M", ru: "М", ar: "م", it: "M", fa: "م", az: "M", pt: "M", bg: "М", ro: "M", ka: "მ" },
  M2: { tr: "M²", en: "M²", de: "M²", fr: "M²", es: "M²", ru: "М²", ar: "م²", it: "M²", fa: "م²", az: "M²", pt: "M²", bg: "М²", ro: "M²", ka: "მ²" },
  KG: { tr: "KG", en: "KG", de: "KG", fr: "KG", es: "KG", ru: "КГ", ar: "كغ", it: "KG", fa: "کیلوگرم", az: "KG", pt: "KG", bg: "КГ", ro: "KG", ka: "კგ" },
  PAKET: { tr: "PAKET", en: "PACKAGE", de: "PAKET", fr: "PAQUET", es: "PAQUETE", ru: "УПАКОВКА", ar: "عبوة", it: "CONFEZIONE", fa: "بسته", az: "PAKET", pt: "PACOTE", bg: "ПАКЕТ", ro: "PACHET", ka: "შეფუთვა" },
  KUTU: { tr: "KUTU", en: "BOX", de: "KARTON", fr: "BOÎTE", es: "CAJA", ru: "КОРОБКА", ar: "علبة", it: "SCATOLA", fa: "جعبه", az: "QUTU", pt: "CAIXA", bg: "КУТИЯ", ro: "CUTIE", ka: "ყუთი" },
  TAKIM: { tr: "TAKIM", en: "SET", de: "SATZ", fr: "ENSEMBLE", es: "JUEGO", ru: "КОМПЛЕКТ", ar: "طقم", it: "SET", fa: "مجموعه", az: "DƏST", pt: "CONJUNTO", bg: "КОМПЛЕКТ", ro: "SET", ka: "კომპლექტი" },
};

export function translateQuoteUnit(unit: string | null | undefined, language: string): string {
  const raw = (unit ?? "").trim();
  if (!raw) return "";
  const key = raw.toUpperCase();
  return QUOTE_UNIT_TRANSLATIONS[key]?.[language as QuoteLanguage] ?? raw;
}
