import { Router, type IRouter } from "express";
import { db, slidersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { z } from "zod/v4";

const router: IRouter = Router();

const SliderBody = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  ctaPrimaryText: z.string().optional(),
  ctaPrimaryHref: z.string().optional(),
  ctaSecondaryText: z.string().optional(),
  ctaSecondaryHref: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

const SliderUpdateBody = SliderBody.partial();

function parseId(raw: string | string[]): number {
  const str = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(str, 10);
}

router.get("/sliders", async (req, res): Promise<void> => {
  let rows = await db.select().from(slidersTable).orderBy(asc(slidersTable.sortOrder));
  const activeOnly = req.query["activeOnly"] === "true";
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
  res.sendStatus(204);
});

export default router;
