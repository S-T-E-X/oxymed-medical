import type { Locale } from "./config";

const LOCALE_CODES = new Set<Locale>(["tr", "en", "de", "fr", "it", "ar", "ru", "fa", "ka", "bg", "az"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function isLocalizedValue(value: unknown): value is Partial<Record<Locale, unknown>> {
  return isRecord(value) && Object.keys(value).some((key) => LOCALE_CODES.has(key as Locale));
}

/**
 * Resolve a text setting without letting an old Turkish admin override leak
 * into every locale. Legacy plain-text settings remain visible in Turkish;
 * translated locales use their dictionary fallback until the setting is stored
 * in the locale-map format.
 */
export function localizedSetting(
  settings: Record<string, string>,
  key: string,
  locale: Locale,
  fallback: string,
): string {
  const raw = settings[key]?.trim();
  if (!raw) return fallback;

  const parsed = parseJson(raw);
  if (isLocalizedValue(parsed)) {
    const value = parsed[locale] ?? parsed.tr;
    return typeof value === "string" ? value : fallback;
  }

  return locale === "tr" ? raw : fallback;
}

/**
 * Resolve a JSON setting such as the GCP hero/spec blocks. Both the legacy
 * single-language object and the new { tr, en, ... } format are supported.
 */
export function localizedJsonSetting<T>(
  settings: Record<string, string>,
  key: string,
  locale: Locale,
  fallback: T,
): T {
  const raw = settings[key]?.trim();
  if (!raw) return fallback;

  const parsed = parseJson(raw);
  if (isLocalizedValue(parsed)) {
    const value = parsed[locale] ?? parsed.tr;
    return value === undefined ? fallback : (value as T);
  }

  return locale === "tr" && parsed !== undefined ? (parsed as T) : fallback;
}