import { Router, type IRouter, type Request } from "express";
import { db, productsTable, productCategoriesTable, PRODUCT_PAGE_ICON_KEYS } from "@workspace/db";
import { eq, asc, count, and, or, isNull, notInArray } from "drizzle-orm";
import { requireAuth, isAdminRequest } from "../lib/auth";
import { parsePageLimit } from "../lib/security";
import { writeAdminAuditLog } from "../lib/audit";
import {
  PRODUCT_SLUG_MAX_LENGTH,
  isProductPubliclyVisible,
  isValidProductSlug,
} from "@workspace/product-content";
import { z } from "zod/v4";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

type ProductRow = typeof productsTable.$inferSelect;
function stripPrivate(p: ProductRow): Omit<ProductRow, "privateData"> & { privateData: null } {
  return { ...p, privateData: null };
}

const ProductSpecSchema = z.object({ label: z.string(), value: z.string() });
const ProductPageIconSchema = z.enum(PRODUCT_PAGE_ICON_KEYS);
const PageUseCaseSchema = z.union([
  z.string(),
  z.object({ text: z.string(), icon: ProductPageIconSchema.optional() }),
]);

/**
 * `pageSlug` becomes a directory name at build time (`dist/public/.../<slug>/
 * index.html`) and a single-segment `:slug` route in the client, so it must be
 * one plain lowercase URL segment. Anything with path separators or `..` could
 * write outside the build output directory.
 */
const PageSlugSchema = z
  .string()
  .max(PRODUCT_SLUG_MAX_LENGTH)
  .refine(isValidProductSlug, {
    message:
      "URL uzantısı yalnızca küçük harf, rakam ve tire içerebilir (örn. dental-vakum-pompasi).",
  });

const PageDataContentSchema = z.object({
  heroSubtitle: z.string().optional(),
  heroDescription: z.string().optional(),
  features: z.array(z.object({ title: z.string(), text: z.string(), icon: ProductPageIconSchema.optional() })).optional(),
  detailCards: z.array(z.object({ title: z.string(), text: z.string(), imageUrl: z.string().optional() })).optional(),
  useCases: z.array(PageUseCaseSchema).optional(),
  advantages: z.array(z.string()).optional(),
  featureTiles: z.array(z.object({ title: z.string(), text: z.string() })).optional(),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
  specs: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});

const PageDataSchema = PageDataContentSchema.extend({
  templateVersion: z.literal(1).optional(),
  sectionOrder: z.array(z.enum(["detailCards", "technical", "useCases", "featureTiles", "faq"])).optional(),
  hiddenSections: z.array(z.enum(["detailCards", "technical", "useCases", "featureTiles", "faq"])).optional(),
  locales: z.record(z.string(), PageDataContentSchema).optional(),
});

const PrivateDataSchema = z.object({
  costPrice: z.string().optional(),
  salePrice: z.string().optional(),
  materials: z.array(z.string()).optional(),
});

const ProductCategoryBody = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().optional(),
  imageUrl: z.string().optional().nullable(),
  visible: z.boolean().optional(),
  showOnHome: z.boolean().optional(),
  // Locale-specific names
  nameEn: z.string().optional().nullable(),
  nameDe: z.string().optional().nullable(),
  nameFr: z.string().optional().nullable(),
  nameIt: z.string().optional().nullable(),
  nameAr: z.string().optional().nullable(),
  nameRu: z.string().optional().nullable(),
  nameFa: z.string().optional().nullable(),
  nameKa: z.string().optional().nullable(),
  nameBg: z.string().optional().nullable(),
  nameAz: z.string().optional().nullable(),
  nameEs: z.string().optional().nullable(),
  // Locale-specific descriptions
  descriptionEn: z.string().optional().nullable(),
  descriptionDe: z.string().optional().nullable(),
  descriptionFr: z.string().optional().nullable(),
  descriptionIt: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  descriptionRu: z.string().optional().nullable(),
  descriptionFa: z.string().optional().nullable(),
  descriptionKa: z.string().optional().nullable(),
  descriptionBg: z.string().optional().nullable(),
  descriptionAz: z.string().optional().nullable(),
  descriptionEs: z.string().optional().nullable(),
});

const ProductBody = z.object({
  categoryId: z.coerce.number().int().optional().nullable(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  specs: z.array(ProductSpecSchema).optional(),
  sortOrder: z.coerce.number().int().optional(),
  showOnHome: z.boolean().optional(),
  homeSortOrder: z.coerce.number().int().optional(),
  published: z.boolean().optional(),
  pageSlug: PageSlugSchema.optional().nullable(),
  pageData: PageDataSchema.optional().nullable(),
  privateData: PrivateDataSchema.optional().nullable(),
  quoteTitle: z.string().optional().nullable(),
  quoteBullets: z.array(z.string()).optional(),
  quoteModelCode: z.string().optional().nullable(),
  quoteImageUrl: z.string().optional().nullable(),
  quoteUnit: z.string().optional().nullable(),
  quoteUnitPrice: z.string().optional().nullable(),
  // Locale-specific titles
  titleEn: z.string().optional().nullable(),
  titleDe: z.string().optional().nullable(),
  titleFr: z.string().optional().nullable(),
  titleIt: z.string().optional().nullable(),
  titleAr: z.string().optional().nullable(),
  titleRu: z.string().optional().nullable(),
  titleFa: z.string().optional().nullable(),
  titleKa: z.string().optional().nullable(),
  titleBg: z.string().optional().nullable(),
  titleAz: z.string().optional().nullable(),
  titleEs: z.string().optional().nullable(),
});

// ---- AI translation of product page content ----

const PAGE_TRANSLATION_TARGETS = [
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

const TranslatePageContentBody = z.object({
  targetLocale: z.enum(PAGE_TRANSLATION_TARGETS.map((t) => t.code) as [string, ...string[]]),
  content: PageDataContentSchema,
});

type PageContent = z.infer<typeof PageDataContentSchema>;

/**
 * Structural validation of the model output against the Turkish source:
 * same array lengths, and every non-empty source string must come back as a
 * non-empty string. On any mismatch we fail the whole request — the admin UI
 * must never silently store Turkish (or partial) copy as a "translation".
 */
function validateTranslatedContent(source: PageContent, translated: unknown): string | null {
  const parsed = PageDataContentSchema.safeParse(translated);
  if (!parsed.success) return "yanıt beklenen yapıda değil";
  const t = parsed.data;
  const arrayKeys = ["features", "detailCards", "useCases", "advantages", "featureTiles", "faq", "specs"] as const;
  for (const key of arrayKeys) {
    const srcLen = (source[key] ?? []).length;
    const outLen = (t[key] ?? []).length;
    if (srcLen !== outLen) return `"${key}" bölümünde öğe sayısı uyuşmuyor`;
  }
  const flatten = (c: PageContent): string[] => [
    c.heroSubtitle ?? "",
    c.heroDescription ?? "",
    ...(c.features ?? []).flatMap((f) => [f.title, f.text]),
    ...(c.detailCards ?? []).flatMap((d) => [d.title, d.text]),
    ...(c.useCases ?? []).map((item) => (typeof item === "string" ? item : item.text)),
    ...(c.advantages ?? []),
    ...(c.featureTiles ?? []).flatMap((f) => [f.title, f.text]),
    ...(c.faq ?? []).flatMap((f) => [f.question, f.answer]),
    ...(c.specs ?? []).flatMap((s) => [s.label, s.value]),
  ];
  const srcStrings = flatten(source);
  const outStrings = flatten(t);
  for (let i = 0; i < srcStrings.length; i++) {
    if (srcStrings[i].trim() !== "" && (outStrings[i] ?? "").trim() === "") {
      return "bazı metinler boş döndü";
    }
  }
  return null;
}

router.post("/products/translate-page-content", requireAuth, async (req, res): Promise<void> => {
  const parsed = TranslatePageContentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { targetLocale, content } = parsed.data;
  const target = PAGE_TRANSLATION_TARGETS.find((t) => t.code === targetLocale)!;

  const source: PageContent = {
    heroSubtitle: content.heroSubtitle ?? "",
    heroDescription: content.heroDescription ?? "",
    features: content.features ?? [],
    detailCards: (content.detailCards ?? []).map((d) => ({ title: d.title, text: d.text, imageUrl: d.imageUrl ?? "" })),
    useCases: content.useCases ?? [],
    advantages: content.advantages ?? [],
    featureTiles: content.featureTiles ?? [],
    faq: content.faq ?? [],
    specs: content.specs ?? [],
  };

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      max_completion_tokens: 16384,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            `You are a professional medical-device translator for a hospital equipment company's website. ` +
            `Translate the given Turkish product detail page JSON into ${target.name}. ` +
            `Return ONLY a JSON object with exactly the same keys, nesting and array lengths as the input. ` +
            `Translate string VALUES only, never keys. ` +
             `Icon values are stable identifiers, not language: preserve every feature and use-case icon value exactly as-is. ` +
            `Preserve image URLs, model codes, standards, certifications, gas symbols, units, dimensions and technical numbers exactly as-is. ` +
            `If a value is an empty string, keep it as an empty string. ` +
            `Use accurate, natural B2B hospital-equipment terminology; keep short labels concise.`,
        },
        { role: "user", content: JSON.stringify(source) },
      ],
    });
  } catch {
    res.status(502).json({ error: "Çeviri servisine ulaşılamadı" });
    return;
  }

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    res.status(502).json({ error: "Çeviri servisinden yanıt alınamadı" });
    return;
  }
  let translated: unknown;
  try {
    translated = JSON.parse(raw);
  } catch {
    res.status(502).json({ error: "Çeviri servisi geçersiz bir yanıt döndürdü" });
    return;
  }
  const problem = validateTranslatedContent(source, translated);
  if (problem) {
    res.status(502).json({ error: `Çeviri doğrulanamadı: ${problem}` });
    return;
  }

  // Image URLs are not translatable content — always restore them from the
  // source so a model paraphrase can never break an image reference.
  const t = PageDataContentSchema.parse(translated);
  const result: PageContent = {
    ...t,
    features: (t.features ?? []).map((feature, i) => ({
      ...feature,
      icon: content.features?.[i] && typeof content.features[i] !== "string"
        ? content.features[i].icon
        : feature.icon,
    })),
    detailCards: (t.detailCards ?? []).map((d, i) => ({
      ...d,
      imageUrl: source.detailCards?.[i]?.imageUrl ?? "",
    })),
    useCases: (t.useCases ?? []).map((item, i) => {
      const sourceItem = source.useCases?.[i];
      const sourceIcon = sourceItem && typeof sourceItem !== "string" ? sourceItem.icon : undefined;
      if (typeof item === "string") return sourceIcon ? { text: item, icon: sourceIcon } : item;
      return sourceIcon ? { ...item, icon: sourceIcon } : item;
    }),
  };
  res.json({ targetLocale, content: result });
});

function parseId(raw: string | string[]): number {
  // Strict positive-integer parsing: malformed input yields 0, which matches
  // no serial primary key, so callers fall through to their normal 404 path
  // instead of passing NaN into a SQL query.
  const str = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(str);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
}

// ---- Categories ----
// Visitors only ever see visible categories; the admin panel needs the full
// list to be able to unhide one, so hidden rows are gated on a valid token.
router.get("/product-categories", async (req, res): Promise<void> => {
  const isAdmin = await isAdminRequest(req);
  const rows = await db
    .select()
    .from(productCategoriesTable)
    .where(isAdmin ? undefined : eq(productCategoriesTable.visible, true))
    .orderBy(asc(productCategoriesTable.sortOrder), asc(productCategoriesTable.id));
  // The response differs by credential, so shared caches must not reuse an
  // admin response for an anonymous visitor.
  res.setHeader("Vary", "Cookie");
  res.json(rows);
});

router.post("/product-categories", requireAuth, async (req, res): Promise<void> => {
  const parsed = ProductCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [cat] = await db.insert(productCategoriesTable).values(parsed.data).returning();
  res.status(201).json(cat);
});

router.patch("/product-categories/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const parsed = ProductCategoryBody.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [cat] = await db.update(productCategoriesTable).set(parsed.data).where(eq(productCategoriesTable.id, id)).returning();
  if (!cat) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json(cat);
});

router.delete("/product-categories/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [deleted] = await db.delete(productCategoriesTable).where(eq(productCategoriesTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  await writeAdminAuditLog(req, {
    action: "product-category.delete",
    targetType: "product_category",
    targetId: id,
    details: { name: deleted.name },
  });
  res.sendStatus(204);
});

// ---- Products ----
router.get("/products", async (req, res): Promise<void> => {
  const { limit, offset } = parsePageLimit(req.query as Record<string, unknown>, 50);
  const categoryIdStr = req.query["categoryId"] as string | undefined;
  const publishedStr = req.query["published"] as string | undefined;
  const isAdmin = await isAdminRequest(req);

  // Drafts are admin-only: an anonymous caller always gets the published view,
  // whatever it asks for in the query string. The response therefore varies by
  // credentials and must never be served from a shared cache entry.
  res.setHeader("Vary", "Cookie");
  const publishedFilter = isAdmin ? publishedStr : "true";

  const conditions = [];
  if (categoryIdStr) {
    const catId = parseId(categoryIdStr);
    conditions.push(eq(productsTable.categoryId, catId));
  }
  if (publishedFilter !== undefined) {
    conditions.push(eq(productsTable.published, publishedFilter === "true"));
  }

  if (!isAdmin) {
    // Hiding a category must also hide the products inside it, otherwise they
    // stay reachable through the unfiltered catalog. Uncategorised products
    // are unaffected.
    const hidden = await db
      .select({ id: productCategoriesTable.id })
      .from(productCategoriesTable)
      .where(eq(productCategoriesTable.visible, false));
    const hiddenIds = hidden.map((c) => c.id);
    if (hiddenIds.length > 0) {
      conditions.push(
        or(isNull(productsTable.categoryId), notInArray(productsTable.categoryId, hiddenIds))!,
      );
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let query = db
    .select()
    .from(productsTable)
    .orderBy(asc(productsTable.sortOrder), asc(productsTable.id))
    .$dynamic();
  let countQuery = db.select({ count: count() }).from(productsTable).$dynamic();

  if (whereClause) {
    query = query.where(whereClause);
    countQuery = countQuery.where(whereClause);
  }

  const [rows, [totalRow]] = await Promise.all([
    query.limit(limit).offset(offset),
    countQuery,
  ]);

  const items = isAdmin ? rows : rows.map(stripPrivate);
  // Hidden-category filtering and privateData stripping both depend on the
  // caller's credentials, so shared caches must not mix the two responses.
  res.setHeader("Vary", "Cookie");
  res.json({ items, total: totalRow?.count ?? 0 });
});

router.post("/products", requireAuth, async (req, res): Promise<void> => {
  const parsed = ProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (parsed.data.showOnHome === true) {
    const [{ count: homeCount }] = await db
      .select({ count: count() })
      .from(productsTable)
      .where(eq(productsTable.showOnHome, true));
    if (homeCount >= 4) {
      res.status(400).json({ error: "Ana sayfada en fazla 4 ürün seçilebilir." });
      return;
    }
  }
  const [product] = await db.insert(productsTable).values(parsed.data).returning();
  res.status(201).json(product);
});

/**
 * Public detail reads must not disclose withdrawn content.
 *
 * Unpublishing a product removes it from the catalogue, the sitemap and the
 * prerendered output, but the row keeps its slug and id — so without this the
 * page stays fully readable to anyone who kept the URL, and the SPA would
 * render it with an indexable self-canonical. Admins keep full access so the
 * editor can still load drafts.
 *
 * A hidden category hides the products inside it, matching the list endpoint.
 */
async function isPubliclyVisible(product: ProductRow): Promise<boolean> {
  if (product.published !== true) return false;
  if (product.categoryId == null) return isProductPubliclyVisible(product);
  const [category] = await db
    .select({ visible: productCategoriesTable.visible })
    .from(productCategoriesTable)
    .where(eq(productCategoriesTable.id, product.categoryId));
  return isProductPubliclyVisible(product, { categoryVisible: category?.visible ?? null });
}

router.get("/products/by-slug/:slug", async (req, res): Promise<void> => {
  const slug = req.params["slug"]!;
  const [product] = await db.select().from(productsTable).where(eq(productsTable.pageSlug, slug));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const isAdmin = await isAdminRequest(req);
  if (!isAdmin && !(await isPubliclyVisible(product))) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.setHeader("Vary", "Cookie");
  res.json(isAdmin ? product : stripPrivate(product));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const isAdmin = await isAdminRequest(req);
  if (!isAdmin && !(await isPubliclyVisible(product))) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.setHeader("Vary", "Cookie");
  res.json(isAdmin ? product : stripPrivate(product));
});

router.patch("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const parsed = ProductBody.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (parsed.data.showOnHome === true) {
    const [current] = await db
      .select({ showOnHome: productsTable.showOnHome })
      .from(productsTable)
      .where(eq(productsTable.id, id));
    if (!current) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    if (!current.showOnHome) {
      const [{ count: homeCount }] = await db
        .select({ count: count() })
        .from(productsTable)
        .where(eq(productsTable.showOnHome, true));
      if (homeCount >= 4) {
        res.status(400).json({ error: "Ana sayfada en fazla 4 ürün seçilebilir." });
        return;
      }
    }
  }
  const [product] = await db.update(productsTable).set(parsed.data).where(eq(productsTable.id, id)).returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(product);
});

router.delete("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [deleted] = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  await writeAdminAuditLog(req, {
    action: "product.delete",
    targetType: "product",
    targetId: id,
    details: { title: deleted.title },
  });
  res.sendStatus(204);
});

export default router;
