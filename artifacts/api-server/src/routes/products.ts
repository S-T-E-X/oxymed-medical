import { Router, type IRouter, type Request } from "express";
import { db, productsTable, productCategoriesTable } from "@workspace/db";
import { eq, asc, count, and, or, isNull, notInArray } from "drizzle-orm";
import { requireAuth, verifyToken } from "../lib/auth";
import {
  PRODUCT_SLUG_MAX_LENGTH,
  isProductPubliclyVisible,
  isValidProductSlug,
} from "@workspace/product-content";
import { z } from "zod/v4";

const router: IRouter = Router();

function checkIsAdmin(req: Request): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return false;
  try {
    verifyToken(authHeader.slice(7));
    return true;
  } catch {
    return false;
  }
}

type ProductRow = typeof productsTable.$inferSelect;
function stripPrivate(p: ProductRow): Omit<ProductRow, "privateData"> & { privateData: null } {
  return { ...p, privateData: null };
}

const ProductSpecSchema = z.object({ label: z.string(), value: z.string() });

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
  features: z.array(z.object({ title: z.string(), text: z.string() })).optional(),
  detailCards: z.array(z.object({ title: z.string(), text: z.string(), imageUrl: z.string().optional() })).optional(),
  useCases: z.array(z.string()).optional(),
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
});

function parseId(raw: string | string[]): number {
  return parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
}

// ---- Categories ----
// Visitors only ever see visible categories; the admin panel needs the full
// list to be able to unhide one, so hidden rows are gated on a valid token.
router.get("/product-categories", async (req, res): Promise<void> => {
  const isAdmin = checkIsAdmin(req);
  const rows = await db
    .select()
    .from(productCategoriesTable)
    .where(isAdmin ? undefined : eq(productCategoriesTable.visible, true))
    .orderBy(asc(productCategoriesTable.sortOrder), asc(productCategoriesTable.id));
  // The response differs by credential, so shared caches must not reuse an
  // admin response for an anonymous visitor.
  res.setHeader("Vary", "Authorization");
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
  res.sendStatus(204);
});

// ---- Products ----
router.get("/products", async (req, res): Promise<void> => {
  const page = parseInt((req.query["page"] as string) ?? "1", 10);
  const limit = parseInt((req.query["limit"] as string) ?? "50", 10);
  const offset = (page - 1) * limit;
  const categoryIdStr = req.query["categoryId"] as string | undefined;
  const publishedStr = req.query["published"] as string | undefined;

  const conditions = [];
  if (categoryIdStr) {
    const catId = parseInt(categoryIdStr, 10);
    conditions.push(eq(productsTable.categoryId, catId));
  }
  if (publishedStr !== undefined) {
    const pub = publishedStr === "true";
    conditions.push(eq(productsTable.published, pub));
  }
  const isAdmin = checkIsAdmin(req);

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
  res.setHeader("Vary", "Authorization");
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
  const isAdmin = checkIsAdmin(req);
  if (!isAdmin && !(await isPubliclyVisible(product))) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.setHeader("Vary", "Authorization");
  res.json(isAdmin ? product : stripPrivate(product));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const isAdmin = checkIsAdmin(req);
  if (!isAdmin && !(await isPubliclyVisible(product))) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.setHeader("Vary", "Authorization");
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
  res.sendStatus(204);
});

export default router;
