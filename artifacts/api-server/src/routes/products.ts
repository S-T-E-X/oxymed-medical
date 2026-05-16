import { Router, type IRouter } from "express";
import { db, productsTable, productCategoriesTable } from "@workspace/db";
import { eq, asc, count } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { z } from "zod/v4";

const router: IRouter = Router();

const ProductSpecSchema = z.object({ label: z.string(), value: z.string() });

const ProductCategoryBody = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

const ProductBody = z.object({
  categoryId: z.coerce.number().int().optional().nullable(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  specs: z.array(ProductSpecSchema).optional(),
  sortOrder: z.coerce.number().int().optional(),
  published: z.boolean().optional(),
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

  let query = db.select().from(productsTable).orderBy(asc(productsTable.sortOrder)).$dynamic();
  let countQuery = db.select({ count: count() }).from(productsTable).$dynamic();

  if (categoryIdStr) {
    const catId = parseInt(categoryIdStr, 10);
    query = query.where(eq(productsTable.categoryId, catId));
    countQuery = countQuery.where(eq(productsTable.categoryId, catId));
  }

  if (publishedStr !== undefined) {
    const pub = publishedStr === "true";
    query = query.where(eq(productsTable.published, pub));
    countQuery = countQuery.where(eq(productsTable.published, pub));
  }

  const [items, [totalRow]] = await Promise.all([
    query.limit(limit).offset(offset),
    countQuery,
  ]);

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

router.get("/products/:id", async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(product);
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
