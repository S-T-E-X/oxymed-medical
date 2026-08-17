import { Router, type IRouter } from "express";
import { db, slidersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth, isAdminRequest } from "../lib/auth";
import { writeAdminAuditLog } from "../lib/audit";
import { z } from "zod/v4";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

const localeTextFields = {
  titleEn: z.string().optional(),
  titleDe: z.string().optional(),
  titleFr: z.string().optional(),
  titleIt: z.string().optional(),
  titleAr: z.string().optional(),
  titleRu: z.string().optional(),
  titleFa: z.string().optional(),
  titleKa: z.string().optional(),
  titleBg: z.string().optional(),
  titleAz: z.string().optional(),
  subtitleEn: z.string().optional(),
  subtitleDe: z.string().optional(),
  subtitleFr: z.string().optional(),
  subtitleIt: z.string().optional(),
  subtitleAr: z.string().optional(),
  subtitleRu: z.string().optional(),
  subtitleFa: z.string().optional(),
  subtitleKa: z.string().optional(),
  subtitleBg: z.string().optional(),
  subtitleAz: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionDe: z.string().optional(),
  descriptionFr: z.string().optional(),
  descriptionIt: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionRu: z.string().optional(),
  descriptionFa: z.string().optional(),
  descriptionKa: z.string().optional(),
  descriptionBg: z.string().optional(),
  descriptionAz: z.string().optional(),
  ctaPrimaryTextEn: z.string().optional(),
  ctaPrimaryTextDe: z.string().optional(),
  ctaPrimaryTextFr: z.string().optional(),
  ctaPrimaryTextIt: z.string().optional(),
  ctaPrimaryTextAr: z.string().optional(),
  ctaPrimaryTextRu: z.string().optional(),
  ctaPrimaryTextFa: z.string().optional(),
  ctaPrimaryTextKa: z.string().optional(),
  ctaPrimaryTextBg: z.string().optional(),
  ctaPrimaryTextAz: z.string().optional(),
  ctaSecondaryTextEn: z.string().optional(),
  ctaSecondaryTextDe: z.string().optional(),
  ctaSecondaryTextFr: z.string().optional(),
  ctaSecondaryTextIt: z.string().optional(),
  ctaSecondaryTextAr: z.string().optional(),
  ctaSecondaryTextRu: z.string().optional(),
  ctaSecondaryTextFa: z.string().optional(),
  ctaSecondaryTextKa: z.string().optional(),
  ctaSecondaryTextBg: z.string().optional(),
  ctaSecondaryTextAz: z.string().optional(),
};

const SliderBody = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  mobileImageUrl: z.string().optional(),
  ctaPrimaryText: z.string().optional(),
  ctaPrimaryHref: z.string().optional(),
  ctaSecondaryText: z.string().optional(),
  ctaSecondaryHref: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
  showCatalogButton: z.boolean().optional(),
  overlayEnabled: z.boolean().optional(),
  overlayColor: z.string().optional(),
  overlayFromOpacity: z.coerce.number().int().min(0).max(100).optional(),
  overlayToOpacity: z.coerce.number().int().min(0).max(100).optional(),
  textColor: z.string().optional(),
  ctaPrimaryBg: z.string().optional(),
  ctaSecondaryBg: z.string().optional(),
  ...localeTextFields,
});

const SliderUpdateBody = SliderBody.partial();

function parseId(raw: string | string[]): number {
  // Strict positive-integer parsing: malformed input yields 0, which matches
  // no serial primary key, so callers fall through to their normal 404 path
  // instead of passing NaN into a SQL query.
  const str = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(str);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
}

router.get("/sliders", async (req, res): Promise<void> => {
  let rows = await db.select().from(slidersTable).orderBy(asc(slidersTable.sortOrder));

  // Inactive sliders are unpublished content: the admin panel lists them, the
  // public site must not receive them at all — hiding them client-side would
  // still ship their text and imagery to every visitor.
  res.setHeader("Vary", "Authorization");
  const activeOnly = req.query["activeOnly"] === "true" || !(await isAdminRequest(req));
  if (activeOnly) {
    rows = rows.filter((r) => r.isActive);
  }
  res.json(rows);
});

router.post("/sliders", requireAuth, async (req, res): Promise<void> => {
  const parsed = SliderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [slider] = await db.insert(slidersTable).values(parsed.data).returning();
  res.status(201).json(slider);
});

router.get("/sliders/:id", async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [slider] = await db.select().from(slidersTable).where(eq(slidersTable.id, id));
  if (!slider) {
    res.status(404).json({ error: "Slider not found" });
    return;
  }
  res.json(slider);
});

router.patch("/sliders/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const parsed = SliderUpdateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [slider] = await db.update(slidersTable).set(parsed.data).where(eq(slidersTable.id, id)).returning();
  if (!slider) {
    res.status(404).json({ error: "Slider not found" });
    return;
  }
  res.json(slider);
});

router.delete("/sliders/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [deleted] = await db.delete(slidersTable).where(eq(slidersTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Slider not found" });
    return;
  }
  await writeAdminAuditLog(req, {
    action: "slider.delete",
    targetType: "slider",
    targetId: id,
    details: { title: deleted.title },
  });
  res.sendStatus(204);
});

// ── AI Translation ────────────────────────────────────────────────────────────

const SLIDER_TARGET_LOCALES = [
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

const TranslateFieldsBody = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  ctaPrimaryText: z.string().optional(),
  ctaSecondaryText: z.string().optional(),
});

type TranslatedLocales = Record<string, {
  title: string;
  subtitle: string;
  description: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
}>;

router.post("/sliders/translate-fields", requireAuth, async (req, res): Promise<void> => {
  const parsed = TranslateFieldsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const source = parsed.data;

  const manifest = {
    title: source.title,
    subtitle: source.subtitle ?? "",
    description: source.description ?? "",
    ctaPrimaryText: source.ctaPrimaryText ?? "",
    ctaSecondaryText: source.ctaSecondaryText ?? "",
  };

  const targetList = SLIDER_TARGET_LOCALES.map((l) => `"${l.code}" (${l.name})`).join(", ");

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    max_completion_tokens: 8192,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          `You are a professional translator for a medical equipment company's website hero sliders. ` +
          `Translate the given Turkish text fields into all of the following languages: ${targetList}. ` +
          `Return a JSON object where each key is the language code and the value is an object with the same fields as the input: ` +
          `"title", "subtitle", "description", "ctaPrimaryText", "ctaSecondaryText". ` +
          `Keep the exact same JSON keys and structure — only translate the string VALUES. ` +
          `If a value is an empty string, keep it as an empty string. ` +
          `Use natural, professional language appropriate for a medical equipment company's marketing website. ` +
          `Respond with ONLY a JSON object, no commentary.`,
      },
      {
        role: "user",
        content: JSON.stringify(manifest),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    res.status(502).json({ error: "Çeviri servisinden yanıt alınamadı" });
    return;
  }

  let translations: TranslatedLocales;
  try {
    translations = JSON.parse(raw) as TranslatedLocales;
  } catch {
    res.status(502).json({ error: "Çeviri servisi geçersiz bir yanıt döndürdü" });
    return;
  }

  // Fields that have non-empty source values (only these can "fail")
  const sourceFields = (["title", "subtitle", "description", "ctaPrimaryText", "ctaSecondaryText"] as const)
    .filter((f) => manifest[f] !== "");

  // For each target locale, report which expected fields are missing/empty in the response
  const failedFieldsByLocale: Record<string, string[]> = {};
  for (const locale of SLIDER_TARGET_LOCALES) {
    const t = translations[locale.code];
    const missing: string[] = [];
    for (const field of sourceFields) {
      if (!t || typeof t[field] !== "string" || t[field].trim() === "") {
        missing.push(field);
      }
    }
    if (missing.length > 0) {
      failedFieldsByLocale[locale.code] = missing;
    }
  }

  res.json({ translations, failedFieldsByLocale });
});

export default router;
