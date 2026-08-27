import { openai } from "@workspace/integrations-openai-ai-server";

export const TARGET_LOCALES = [
  { code: "en", name: "English" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
  { code: "it", name: "Italian" },
  { code: "ar", name: "Arabic" },
  { code: "ru", name: "Russian" },
  { code: "fa", name: "Persian (Farsi)" },
  { code: "ka", name: "Georgian" },
  { code: "bg", name: "Bulgarian" },
  { code: "az", name: "Azerbaijani" },
  { code: "es", name: "Spanish" },
] as const;

export type LocaleOverlay = Record<string, Record<string, string>>;

/**
 * Translates one resource manifest to every non-Turkish locale. Validation is
 * intentionally fail-closed: no partial/truncated model response is returned.
 */
export async function translateLocaleOverlays(
  source: Record<string, string>,
  context: string,
): Promise<LocaleOverlay> {
  const targets = TARGET_LOCALES.map(({ code, name }) => `"${code}" (${name})`).join(", ");
  const fields = Object.keys(source);
  const completion = await openai.chat.completions.create({
    model: "gpt-5.4-mini",
    max_completion_tokens: 8192,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          `You are a professional translator for a medical equipment company's website ${context}. ` +
          `Translate the Turkish string values into all languages: ${targets}. ` +
          `Return only a JSON object keyed by language code. Each locale must contain exactly these fields: ${fields.join(", ")}. ` +
          `Keep empty strings empty. Preserve proper nouns, standards, certifications, numbers, dimensions and units exactly. ` +
          `Translate only the supplied text; never add facts, claims, dates or qualifications.`,
      },
      { role: "user", content: JSON.stringify(source) },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("empty");
  let translated: unknown;
  try {
    translated = JSON.parse(raw);
  } catch {
    throw new Error("invalid");
  }
  if (!translated || typeof translated !== "object" || Array.isArray(translated)) throw new Error("invalid");

  const result = translated as LocaleOverlay;
  for (const { code } of TARGET_LOCALES) {
    const overlay = result[code];
    if (!overlay || typeof overlay !== "object" || Array.isArray(overlay)) throw new Error("truncated");
    for (const field of fields) {
      const value = overlay[field];
      if (typeof value !== "string" || (source[field]?.trim() && !value.trim())) throw new Error("truncated");
    }
  }
  return result;
}