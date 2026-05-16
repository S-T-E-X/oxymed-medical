import { Router, type IRouter } from "express";
import { db, newsTable } from "@workspace/db";
import { and, eq, desc, count } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { z } from "zod/v4";

const router: IRouter = Router();

const NewsBody = z.object({
  title: z.string().min(1),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  category: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  slug: z.string().min(1),
  published: z.boolean().optional(),
  publishedAt: z.string().optional(),
});

function parseId(raw: string | string[]): number {
  return parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
}

router.get("/news", async (req, res): Promise<void> => {
  const page = parseInt((req.query["page"] as string) ?? "1", 10);
  const limit = parseInt((req.query["limit"] as string) ?? "20", 10);
  const offset = (page - 1) * limit;
  const category = req.query["category"] as string | undefined;
  const publishedStr = req.query["published"] as string | undefined;
  const slug = req.query["slug"] as string | undefined;

  const conditions = [];
  if (slug) conditions.push(eq(newsTable.slug, slug));
  if (category && category !== "TÜM HABERLER") conditions.push(eq(newsTable.category, category));
  if (publishedStr !== undefined) conditions.push(eq(newsTable.published, publishedStr === "true"));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const baseQuery = db.select().from(newsTable).orderBy(desc(newsTable.publishedAt));
  const baseCount = db.select({ count: count() }).from(newsTable);

  const [items, [totalRow]] = await Promise.all([
    (whereClause ? baseQuery.where(whereClause) : baseQuery).limit(limit).offset(offset),
    (whereClause ? baseCount.where(whereClause) : baseCount),
  ]);

  res.json({ items, total: totalRow?.count ?? 0 });
});

router.post("/news", requireAuth, async (req, res): Promise<void> => {
  const parsed = NewsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(newsTable).values({
    ...parsed.data,
    publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : new Date(),
  }).returning();
  res.status(201).json(item);
});

router.get("/news/:id", async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [item] = await db.select().from(newsTable).where(eq(newsTable.id, id));
  if (!item) {
    res.status(404).json({ error: "News item not found" });
    return;
  }
  res.json(item);
});

router.patch("/news/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const parsed = NewsBody.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.publishedAt) {
    updateData["publishedAt"] = new Date(parsed.data.publishedAt);
  }
  const [item] = await db.update(newsTable).set(updateData).where(eq(newsTable.id, id)).returning();
  if (!item) {
    res.status(404).json({ error: "News item not found" });
    return;
  }
  res.json(item);
});

router.delete("/news/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [deleted] = await db.delete(newsTable).where(eq(newsTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "News item not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
