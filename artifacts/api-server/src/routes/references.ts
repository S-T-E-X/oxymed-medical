import { Router, type IRouter } from "express";
import { db, referencesTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { z } from "zod/v4";

const router: IRouter = Router();

const ReferenceBody = z.object({
  title: z.string().min(1),
  projectType: z.string().min(1),
  capacity: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  showInMarquee: z.boolean().optional(),
  category: z.string().optional(),
});

function parseId(raw: string | string[]): number {
  return parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
}

router.get("/references", async (req, res): Promise<void> => {
  const page = parseInt((req.query["page"] as string) ?? "1", 10);
  const limit = parseInt((req.query["limit"] as string) ?? "50", 10);
  const offset = (page - 1) * limit;
  const category = req.query["category"] as string | undefined;
  const showInMarquee = req.query["showInMarquee"] === "true";

  let query = db.select().from(referencesTable).orderBy(desc(referencesTable.createdAt)).$dynamic();
  let countQuery = db.select({ count: count() }).from(referencesTable).$dynamic();

  if (category && category !== "TÜM PROJELER") {
    query = query.where(eq(referencesTable.category, category));
    countQuery = countQuery.where(eq(referencesTable.category, category));
  }

  if (showInMarquee) {
    query = query.where(eq(referencesTable.showInMarquee, true));
    countQuery = countQuery.where(eq(referencesTable.showInMarquee, true));
  }

  const [items, [totalRow]] = await Promise.all([
    query.limit(limit).offset(offset),
    countQuery,
  ]);
  res.json({ items, total: totalRow?.count ?? 0 });
});

router.get("/references/:id", async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [ref] = await db.select().from(referencesTable).where(eq(referencesTable.id, id));
  if (!ref) {
    res.status(404).json({ error: "Reference not found" });
    return;
  }
  res.json(ref);
});

router.post("/references", requireAuth, async (req, res): Promise<void> => {
  const parsed = ReferenceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [ref] = await db.insert(referencesTable).values(parsed.data).returning();
  res.status(201).json(ref);
});

router.patch("/references/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const parsed = ReferenceBody.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [ref] = await db.update(referencesTable).set(parsed.data).where(eq(referencesTable.id, id)).returning();
  if (!ref) {
    res.status(404).json({ error: "Reference not found" });
    return;
  }
  res.json(ref);
});

router.delete("/references/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [deleted] = await db.delete(referencesTable).where(eq(referencesTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Reference not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
