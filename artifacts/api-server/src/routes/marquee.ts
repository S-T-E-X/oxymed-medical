import { Router, type IRouter } from "express";
import { db, marqueeItemsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { z } from "zod/v4";

const router: IRouter = Router();

const MarqueeItemBody = z.object({
  logoUrl: z.string().nullable().optional(),
  text: z.string().nullable().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

const MarqueeItemUpdateBody = MarqueeItemBody.partial();

function parseId(raw: string | string[]): number {
  const str = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(str, 10);
}

router.get("/marquee", async (req, res): Promise<void> => {
  let rows = await db.select().from(marqueeItemsTable).orderBy(asc(marqueeItemsTable.sortOrder));
  const activeOnly = req.query["activeOnly"] === "true";
  if (activeOnly) {
    rows = rows.filter((r) => r.isActive);
  }
  res.json(rows);
});

router.post("/marquee", requireAuth, async (req, res): Promise<void> => {
  const parsed = MarqueeItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(marqueeItemsTable).values(parsed.data).returning();
  res.status(201).json(item);
});

router.get("/marquee/:id", async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [item] = await db.select().from(marqueeItemsTable).where(eq(marqueeItemsTable.id, id));
  if (!item) {
    res.status(404).json({ error: "Marquee item not found" });
    return;
  }
  res.json(item);
});

router.patch("/marquee/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const parsed = MarqueeItemUpdateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db
    .update(marqueeItemsTable)
    .set(parsed.data)
    .where(eq(marqueeItemsTable.id, id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Marquee item not found" });
    return;
  }
  res.json(item);
});

router.delete("/marquee/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [deleted] = await db.delete(marqueeItemsTable).where(eq(marqueeItemsTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Marquee item not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
