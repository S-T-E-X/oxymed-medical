/**
 * One-off backfill for DB-driven E-E-A-T page content. Turkish remains in the
 * base columns; only translated overlays are written to the locales jsonb.
 */
import pLimit from "p-limit";
import pRetry from "p-retry";
import { eq } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  certificatesTable,
  corporateSectionsTable,
  db,
  referencesTable,
} from "@workspace/db";

const TARGETS = [
  { code: "en", name: "English" }, { code: "de", name: "German" },
  { code: "fr", name: "French" }, { code: "it", name: "Italian" },
  { code: "ar", name: "Arabic" }, { code: "ru", name: "Russian" },
  { code: "fa", name: "Persian (Farsi)" }, { code: "ka", name: "Georgian" },
  { code: "bg", name: "Bulgarian" }, { code: "az", name: "Azerbaijani" },
  { code: "es", name: "Spanish" },
] as const;

type Manifest = Record<string, string>;

async function translate(source: Manifest, language: string, context: string): Promise<Manifest> {
  const completion = await openai.chat.completions.create({
    model: "gpt-5.4-mini",
    max_completion_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          `Translate this Turkish ${context} JSON into ${language}. Return only JSON with exactly the same keys. ` +
          "Translate values, never keys. Keep empty strings empty. Preserve proper nouns, standards, certifications, " +
          "numbers and units. Translate only the supplied text and never add facts or claims.",
      },
      { role: "user", content: JSON.stringify(source) },
    ],
  });
  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error(`Empty ${language} response`);
  const result = JSON.parse(raw) as Manifest;
  for (const [field, value] of Object.entries(source)) {
    if (typeof result[field] !== "string" || (value.trim() && !result[field]!.trim())) {
      throw new Error(`Truncated ${language} response at ${field}`);
    }
  }
  return result;
}

async function overlays(source: Manifest, context: string, current: Record<string, Manifest> = {}) {
  const limit = pLimit(4);
  const missing = TARGETS.filter(({ code }) => !current[code]);
  const entries = await Promise.all(missing.map((target) => limit(async () => [
    target.code,
    await pRetry(() => translate(source, target.name, context), { retries: 3, minTimeout: 2000 }),
  ] as const)));
  return { ...current, ...Object.fromEntries(entries) };
}

async function main() {
  const [sections, certificates, references] = await Promise.all([
    db.select().from(corporateSectionsTable),
    db.select().from(certificatesTable),
    db.select().from(referencesTable),
  ]);

  for (const row of sections) {
    const locales = await overlays({
      title: row.title ?? "",
      subtitle: row.subtitle ?? "",
      content: row.content ?? "",
    }, "corporate-page content", (row.locales ?? {}) as Record<string, Manifest>);
    await db.update(corporateSectionsTable).set({ locales }).where(eq(corporateSectionsTable.id, row.id));
    console.log(`corporate_sections ${row.id}: ${Object.keys(locales).length} locales`);
  }
  for (const row of certificates) {
    const locales = await overlays({ title: row.title }, "certificate title", (row.locales ?? {}) as Record<string, Manifest>);
    await db.update(certificatesTable).set({ locales }).where(eq(certificatesTable.id, row.id));
    console.log(`certificates ${row.id}: ${Object.keys(locales).length} locales`);
  }
  for (const row of references) {
    // title and city are proper nouns and intentionally never enter the model.
    const locales = await overlays({
      projectType: row.projectType,
      capacity: row.capacity ?? "",
      category: row.category,
    }, "reference-project metadata", (row.locales ?? {}) as Record<string, Manifest>);
    await db.update(referencesTable).set({ locales }).where(eq(referencesTable.id, row.id));
    console.log(`references ${row.id}: ${Object.keys(locales).length} locales`);
  }
}

main().catch((error) => {
  console.error("translate-eeat-locales failed:", error);
  process.exit(1);
});