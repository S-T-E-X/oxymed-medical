/**
 * Backfills locale-specific content for generic DB-driven product detail pages.
 *
 * This is intentionally a data operation, not a runtime translation fallback:
 * the public page can render deterministic copy without making an AI request.
 */
import pLimit from "p-limit";
import pRetry from "p-retry";
import { openai } from "@workspace/integrations-openai-ai-server";
import { db, productsTable, type PageData, type PageDataContent } from "@workspace/db";
import { eq } from "drizzle-orm";

const TARGETS = [
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
] as const;

const PROMPT = (language: string) => [
  `You are a professional medical-device translator. Translate this Turkish product detail JSON into ${language}.`,
  "Return ONLY valid JSON with exactly the same keys, nesting and array lengths.",
  "Translate values, never keys. Preserve image URLs, model codes, standards, certifications, gas symbols, units, dimensions and technical numbers.",
  "Use accurate B2B hospital-equipment terminology. Keep short labels concise and preserve the meaning of the Turkish source.",
  "Do not translate empty strings or URLs.",
].join("\n");

async function translate(content: PageDataContent, language: string): Promise<PageDataContent> {
  const completion = await openai.chat.completions.create({
    model: "gpt-5.6-terra",
    messages: [
      { role: "system", content: PROMPT(language) },
      { role: "user", content: JSON.stringify(content, null, 2) },
    ],
    response_format: { type: "json_object" },
  });
  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error(`Empty ${language} translation response`);
  return JSON.parse(raw) as PageDataContent;
}

async function main() {
  const products = await db.select().from(productsTable);
  const candidates = products.filter((product) => {
    const pageData = (product.pageData ?? {}) as PageData;
    return Boolean(product.pageSlug && !["kat-kontrol-panosu", "amalgam-separator", "dental-vakum-pompasi", "dental-vakum-sistemi"].includes(product.pageSlug) && Object.keys(pageData).some((key) => key !== "locales"));
  });
  const limit = pLimit(4);

  for (const product of candidates) {
    const source = product.pageData as PageData;
    const existingLocales = source.locales ?? {};
    const missingTargets = TARGETS.filter((target) => !existingLocales[target.code]);
    if (missingTargets.length === 0) continue;

    const { locales: _locales, ...content } = source;
    const translated = await Promise.all(
      missingTargets.map((target) =>
        limit(async () => [
          target.code,
          await pRetry(() => translate(content, target.name), { retries: 3, minTimeout: 2000 }),
        ] as const),
      ),
    );

    const locales = { ...existingLocales };
    for (const [locale, value] of translated) locales[locale] = value;
    await db
      .update(productsTable)
      .set({ pageData: { ...content, locales } })
      .where(eq(productsTable.id, product.id));
    console.log(`  ${product.title}: ${translated.length} locale pageData entries backfilled`);
  }
}

main().catch((error) => {
  console.error("translate-product-page-data failed:", error);
  process.exit(1);
});