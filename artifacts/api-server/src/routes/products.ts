import { Router, type IRouter, type Request } from "express";
import { db, productsTable, productCategoriesTable } from "@workspace/db";
import { eq, asc, count, and } from "drizzle-orm";
import { requireAuth, verifyToken } from "../lib/auth";
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

const PageDataSchema = z.object({
  heroSubtitle: z.string().optional(),
  heroDescription: z.string().optional(),
  features: z.array(z.object({ title: z.string(), text: z.string() })).optional(),
  detailCards: z.array(z.object({ title: z.string(), text: z.string(), imageUrl: z.string().optional() })).optional(),
  useCases: z.array(z.string()).optional(),
  advantages: z.array(z.string()).optional(),
  featureTiles: z.array(z.object({ title: z.string(), text: z.string() })).optional(),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
});

const PrivateDataSchema = z.object({
  costPrice: z.string().optional(),
  salePrice: z.string().optional(),
  materials: z.array(z.string()).optional(),
});

const ProductCategoryBody = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
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
});

const ProductBody = z.object({
  categoryId: z.coerce.number().int().optional().nullable(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  specs: z.array(ProductSpecSchema).optional(),
  sortOrder: z.coerce.number().int().optional(),
  published: z.boolean().optional(),
  pageSlug: z.string().optional().nullable(),
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
router.get("/product-categories", async (_req, res): Promise<void> => {
  const rows = await db.select().from(productCategoriesTable).orderBy(asc(productCategoriesTable.sortOrder));
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
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let query = db.select().from(productsTable).orderBy(asc(productsTable.sortOrder)).$dynamic();
  let countQuery = db.select({ count: count() }).from(productsTable).$dynamic();

  if (whereClause) {
    query = query.where(whereClause);
    countQuery = countQuery.where(whereClause);
  }

  const [rows, [totalRow]] = await Promise.all([
    query.limit(limit).offset(offset),
    countQuery,
  ]);

  const isAdmin = checkIsAdmin(req);
  const items = isAdmin ? rows : rows.map(stripPrivate);
  res.json({ items, total: totalRow?.count ?? 0 });
});

router.post("/products", requireAuth, async (req, res): Promise<void> => {
  const parsed = ProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [product] = await db.insert(productsTable).values(parsed.data).returning();
  res.status(201).json(product);
});

router.get("/products/by-slug/:slug", async (req, res): Promise<void> => {
  const slug = req.params["slug"]!;
  const [product] = await db.select().from(productsTable).where(eq(productsTable.pageSlug, slug));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const isAdmin = checkIsAdmin(req);
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
  res.json(isAdmin ? product : stripPrivate(product));
});

router.patch("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const parsed = ProductBody.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
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
