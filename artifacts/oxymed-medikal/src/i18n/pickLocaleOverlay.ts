import type { Locale } from "./config";

/** Selects a non-empty jsonb locale overlay, falling back to the Turkish base field. */
export function pickLocaleOverlay(
  record: { locales?: unknown },
  field: string,
  locale: Locale,
  baseValue: string | null | undefined,
): string {
  const base = baseValue ?? "";
  if (locale === "tr" || !record.locales || typeof record.locales !== "object") return base;
  const overlay = (record.locales as Record<string, unknown>)[locale];
  if (!overlay || typeof overlay !== "object") return base;
  const value = (overlay as Record<string, unknown>)[field];
  return typeof value === "string" && value.trim() !== "" ? value : base;
}