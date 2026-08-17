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

// Units are controlled vocabulary. Keep this deterministic so translated
// quotes never retain Turkish labels such as ADET or METRE.
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
  return QUOTE_UNIT_TRANSLATIONS[raw.toUpperCase()]?.[language as QuoteLanguage] ?? raw;
}

// Right-to-left script languages — the quote template/print view switches its
// whole page to dir="rtl" for these so the document reads right-to-left, not
// just the glyph shaping.
const RTL_LANGUAGES: ReadonlySet<string> = new Set(["ar", "fa"]);

export function isRtlLanguage(code: string | null | undefined): boolean {
  return !!code && RTL_LANGUAGES.has(code);
}
