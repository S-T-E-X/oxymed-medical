import { Router, type IRouter } from "express";
import { db, productsTable, productStock, materialStock } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { z } from "zod/v4";

const router: IRouter = Router();

// ── Product Stock ──────────────────────────────────────────────────────────────

router.get("/products", requireAuth, async (req, res) => {
  const prods = await db
    .select({
      id: productsTable.id,
      title: productsTable.title,
      imageUrl: productsTable.imageUrl,
    })
    .from(productsTable)
    .where(eq(productsTable.published, true))
    .orderBy(asc(productsTable.sortOrder), asc(productsTable.id));

  const stocks = await db.select().from(productStock);
  const stockMap = new Map(stocks.map((s) => [s.productId, s]));

  const result = prods.map((p) => {
    const s = stockMap.get(p.id);
    return {
      productId: p.id,
      title: p.title,
      imageUrl: p.imageUrl,
      quantity: s?.quantity ?? 0,
      location: s?.location ?? null,
      notes: s?.notes ?? null,
      updatedAt: s?.updatedAt ?? null,
    };
  });

  res.json(result);
});

const ProductStockBody = z.object({
  quantity: z.number().int().min(0),
  location: z.string().optional(),
  notes: z.string().optional(),
});

router.put("/products/:productId", requireAuth, async (req, res) => {
  const productId = Number(req.params.productId);
  if (isNaN(productId)) { res.status(400).json({ error: "Geçersiz ürün ID" }); return; }

  const parsed = ProductStockBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { quantity, location, notes } = parsed.data;

  const existing = await db.select().from(productStock).where(eq(productStock.productId, productId)).limit(1);
  if (existing.length > 0) {
    const [updated] = await db
      .update(productStock)
      .set({ quantity, location: location ?? null, notes: notes ?? null, updatedAt: new Date() })
      .where(eq(productStock.productId, productId))
      .returning();
    res.json(updated);
  } else {
    const [created] = await db
      .insert(productStock)
      .values({ productId, quantity, location: location ?? null, notes: notes ?? null })
      .returning();
    res.status(201).json(created);
  }
});

// ── Material Stock ─────────────────────────────────────────────────────────────

router.get("/materials", requireAuth, async (_req, res) => {
  const items = await db.select().from(materialStock).orderBy(asc(materialStock.name));
  res.json(items);
});

const MaterialBody = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional().nullable(),
  productCode: z.string().optional().nullable(),
  supplier: z.string().optional(),
  price: z.string().optional(),
  quantity: z.number().int().min(0).default(0),
  minStock: z.number().int().min(0).default(0),
  unit: z.string().default("adet"),
  notes: z.string().optional(),
});

router.post("/materials", requireAuth, async (req, res) => {
  const parsed = MaterialBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [created] = await db.insert(materialStock).values({
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    category: parsed.data.category ?? null,
    productCode: parsed.data.productCode ?? null,
    supplier: parsed.data.supplier ?? null,
    price: parsed.data.price ?? null,
    quantity: parsed.data.quantity,
    minStock: parsed.data.minStock,
    unit: parsed.data.unit,
    notes: parsed.data.notes ?? null,
  }).returning();
  res.status(201).json(created);
});

router.patch("/materials/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Geçersiz ID" }); return; }

  const parsed = MaterialBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [updated] = await db
    .update(materialStock)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(materialStock.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Malzeme bulunamadı" }); return; }
  res.json(updated);
});

router.delete("/materials/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Geçersiz ID" }); return; }

  await db.delete(materialStock).where(eq(materialStock.id, id));
  res.status(204).send();
});

export default router;
