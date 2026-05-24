import { Router, type IRouter } from "express";
import { db, quoteForms, quoteFormItems } from "@workspace/db";
import { eq, desc, like, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { z } from "zod/v4";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  return parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
}

async function generateQuoteNo(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const prefix = `OXM-TFL-${year}-${day}${month}`;

  const [last] = await db
    .select({ quoteNo: quoteForms.quoteNo })
    .from(quoteForms)
    .where(like(quoteForms.quoteNo, `${prefix}%`))
    .orderBy(desc(quoteForms.quoteNo))
    .limit(1);

  let seq = 1;
  if (last) {
    const lastSeq = parseInt(last.quoteNo.slice(-2), 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  return `${prefix}${String(seq).padStart(2, "0")}`;
}

const QuoteFormBody = z.object({
  firmaAdi: z.string().optional().nullable(),
  firmaAdres: z.string().optional().nullable(),
  firmaTelefon: z.string().optional().nullable(),
  firmaEmail: z.string().optional().nullable(),
  firmaVergiDairesi: z.string().optional().nullable(),
  firmaVergiNo: z.string().optional().nullable(),
  teslimatAdresi: z.string().optional().nullable(),
  teslimatSuresi: z.string().optional().nullable(),
  odemeSekli: z.string().optional().nullable(),
  status: z.string().optional(),
  paraBirimi: z.string().optional(),
  hizmetler: z.array(z.string()).optional(),
  sartlar: z.array(z.string()).optional(),
  notlar: z.string().optional().nullable(),
  iskonto: z.string().optional().nullable(),
  iskontoTipi: z.enum(["yuzde", "tutar"]).optional(),
  kdv: z.string().optional().nullable(),
  hazirlayan: z.string().optional().nullable(),
  hazirlayanTelefon: z.string().optional().nullable(),
  hazirlayanEmail: z.string().optional().nullable(),
  hazirlayanImzaUrl: z.string().optional().nullable(),
  onaylayan: z.string().optional().nullable(),
  onaytayanGorev: z.string().optional().nullable(),
  onayTarihi: z.string().optional().nullable(),
});

const QuoteFormItemBody = z.object({
  productId: z.coerce.number().int().optional().nullable(),
  title: z.string().min(1),
  bullets: z.array(z.string()).optional(),
  modelCode: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(1).optional(),
  unit: z.string().optional(),
  unitPrice: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().optional(),
});

// List quote forms
router.get("/quote-forms", requireAuth, async (req, res): Promise<void> => {
  const limit = parseInt((req.query["limit"] as string) ?? "50", 10);
  const offset = parseInt((req.query["offset"] as string) ?? "0", 10);

  const rows = await db
    .select()
    .from(quoteForms)
    .orderBy(desc(quoteForms.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({ items: rows });
});

// Get single quote form with items
router.get("/quote-forms/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [form] = await db.select().from(quoteForms).where(eq(quoteForms.id, id));
  if (!form) {
    res.status(404).json({ error: "Quote form not found" });
    return;
  }
  const items = await db
    .select()
    .from(quoteFormItems)
    .where(eq(quoteFormItems.formId, id))
    .orderBy(quoteFormItems.sortOrder);
  res.json({ ...form, items });
});

// Create quote form
router.post("/quote-forms", requireAuth, async (req, res): Promise<void> => {
  const parsed = QuoteFormBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const quoteNo = await generateQuoteNo();
  const [form] = await db
    .insert(quoteForms)
    .values({ ...parsed.data, quoteNo })
    .returning();
  res.status(201).json(form);
});

// Update quote form
router.patch("/quote-forms/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const parsed = QuoteFormBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [form] = await db
    .update(quoteForms)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(quoteForms.id, id))
    .returning();
  if (!form) {
    res.status(404).json({ error: "Quote form not found" });
    return;
  }
  res.json(form);
});

// Delete quote form
router.delete("/quote-forms/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  await db.delete(quoteFormItems).where(eq(quoteFormItems.formId, id));
  const [deleted] = await db.delete(quoteForms).where(eq(quoteForms.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Quote form not found" });
    return;
  }
  res.sendStatus(204);
});

// List items for a form
router.get("/quote-forms/:id/items", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const items = await db
    .select()
    .from(quoteFormItems)
    .where(eq(quoteFormItems.formId, id))
    .orderBy(quoteFormItems.sortOrder);
  res.json(items);
});

// Add item
router.post("/quote-forms/:id/items", requireAuth, async (req, res): Promise<void> => {
  const formId = parseId(req.params["id"]!);
  const parsed = QuoteFormItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db
    .insert(quoteFormItems)
    .values({ ...parsed.data, formId })
    .returning();
  res.status(201).json(item);
});

// Update item
router.patch("/quote-forms/:id/items/:itemId", requireAuth, async (req, res): Promise<void> => {
  const itemId = parseId(req.params["itemId"]!);
  const parsed = QuoteFormItemBody.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db
    .update(quoteFormItems)
    .set(parsed.data)
    .where(eq(quoteFormItems.id, itemId))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.json(item);
});

// Delete item
router.delete("/quote-forms/:id/items/:itemId", requireAuth, async (req, res): Promise<void> => {
  const itemId = parseId(req.params["itemId"]!);
  const [deleted] = await db
    .delete(quoteFormItems)
    .where(eq(quoteFormItems.id, itemId))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.sendStatus(204);
});

// Replace all items for a form (bulk set)
router.put("/quote-forms/:id/items", requireAuth, async (req, res): Promise<void> => {
  const formId = parseId(req.params["id"]!);
  const parsed = z.array(QuoteFormItemBody).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await db.delete(quoteFormItems).where(eq(quoteFormItems.formId, formId));
  if (parsed.data.length === 0) {
    res.json([]);
    return;
  }
  const items = await db
    .insert(quoteFormItems)
    .values(parsed.data.map((item, i) => ({ ...item, formId, sortOrder: item.sortOrder ?? i })))
    .returning();
  res.json(items);
});

export default router;
