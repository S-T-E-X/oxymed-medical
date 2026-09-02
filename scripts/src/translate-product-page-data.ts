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

const TARGET_PAGE_SLUG = "yatak-basi-unitesi";

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
  { code: "es", name: "Spanish" },
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
    max_completion_tokens: 16384,
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

const ARRAY_KEYS = ["features", "detailCards", "useCases", "advantages", "featureTiles", "faq", "specs"] as const;

function translatedContentError(source: PageDataContent, translated: PageDataContent): string | null {
  for (const key of ARRAY_KEYS) {
    if ((source[key] ?? []).length !== (translated[key] ?? []).length) {
      return `"${key}" bölümündeki öğe sayısı değişti`;
    }
  }

  const sourceStrings = [
    source.heroSubtitle ?? "",
    source.heroDescription ?? "",
    ...(source.features ?? []).flatMap((item) => [item.title, item.text]),
    ...(source.detailCards ?? []).flatMap((item) => [item.title, item.text]),
    ...(source.useCases ?? []).map((item) => typeof item === "string" ? item : item.text),
    ...(source.advantages ?? []),
    ...(source.featureTiles ?? []).flatMap((item) => [item.title, item.text]),
    ...(source.faq ?? []).flatMap((item) => [item.question, item.answer]),
    ...(source.specs ?? []).flatMap((item) => [item.label, item.value]),
  ];
  const translatedStrings = [
    translated.heroSubtitle ?? "",
    translated.heroDescription ?? "",
    ...(translated.features ?? []).flatMap((item) => [item.title, item.text]),
    ...(translated.detailCards ?? []).flatMap((item) => [item.title, item.text]),
    ...(translated.useCases ?? []).map((item) => typeof item === "string" ? item : item.text),
    ...(translated.advantages ?? []),
    ...(translated.featureTiles ?? []).flatMap((item) => [item.title, item.text]),
    ...(translated.faq ?? []).flatMap((item) => [item.question, item.answer]),
    ...(translated.specs ?? []).flatMap((item) => [item.label, item.value]),
  ];

  for (let i = 0; i < sourceStrings.length; i += 1) {
    if (sourceStrings[i].trim() && !translatedStrings[i]?.trim()) {
      return "kaynakta dolu olan bir metin boş döndü";
    }
  }

  for (let i = 0; i < (source.features ?? []).length; i += 1) {
    if (source.features?.[i]?.icon !== translated.features?.[i]?.icon) {
      return `"features[${i}].icon" değişti`;
    }
  }
  for (let i = 0; i < (source.useCases ?? []).length; i += 1) {
    const sourceItem = source.useCases?.[i];
    const translatedItem = translated.useCases?.[i];
    if (typeof sourceItem !== "string" && typeof translatedItem !== "string" && sourceItem?.icon !== translatedItem?.icon) {
      return `"useCases[${i}].icon" değişti`;
    }
  }
  for (let i = 0; i < (source.detailCards ?? []).length; i += 1) {
    if (source.detailCards?.[i]?.imageUrl !== translated.detailCards?.[i]?.imageUrl) {
      return `"detailCards[${i}].imageUrl" değişti`;
    }
  }

  return null;
}

async function main() {
  const products = await db.select().from(productsTable);
  const candidates = products.filter((product) => {
    const pageData = (product.pageData ?? {}) as PageData;
    return product.pageSlug === TARGET_PAGE_SLUG && Object.keys(pageData).some((key) => key !== "locales");
  });
  if (candidates.length === 0) {
    throw new Error(`Product with pageSlug "${TARGET_PAGE_SLUG}" was not found or has no Turkish page content`);
  }
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
          await pRetry(async () => {
            const result = await translate(content, target.name);
            const problem = translatedContentError(content, result);
            if (problem) throw new Error(`${target.name} translation validation failed: ${problem}`);
            return result;
          }, { retries: 3, minTimeout: 2000 }),
        ] as const),
      ),
    );

    const locales = { ...existingLocales };
    for (const [locale, value] of translated) locales[locale] = value;
    const titleTranslations = {
      titleEn: "Bed Head Unit",
      titleDe: "Bettkopfeinheit",
      titleFr: "Unité de tête de lit",
      titleIt: "Unità testaletto",
      titleAr: "وحدة رأس السرير",
      titleRu: "Прикроватная панель",
      titleFa: "یونیت هدبورد تخت",
      titleKa: "საწოლთანა ბლოკი",
      titleBg: "Болничен панел",
      titleAz: "Yataq başı bloku",
      titleEs: "Unidad de cabecero",
    } as const;
    const missingTitleTranslations = Object.fromEntries(
      Object.entries(titleTranslations).filter(([field]) => {
        const value = product[field as keyof typeof product];
        return typeof value !== "string" || !value.trim();
      }),
    );
    await db
      .update(productsTable)
      .set({ ...missingTitleTranslations, pageData: { ...content, locales } })
      .where(eq(productsTable.id, product.id));
    console.log(`  ${product.title}: ${translated.length} locale pageData entries backfilled; ${Object.keys(missingTitleTranslations).length} title translations added`);
  }
}

main().catch((error) => {
  console.error("translate-product-page-data failed:", error);
  process.exit(1);
});