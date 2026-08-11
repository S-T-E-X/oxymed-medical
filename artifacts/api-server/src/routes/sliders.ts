import { Router, type IRouter } from "express";
import { db, slidersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { z } from "zod/v4";

const router: IRouter = Router();

const localeTextFields = {
  titleEn: z.string().optional(),
  titleDe: z.string().optional(),
  titleFr: z.string().optional(),
  titleIt: z.string().optional(),
  titleAr: z.string().optional(),
  titleRu: z.string().optional(),
  titleFa: z.string().optional(),
  titleKa: z.string().optional(),
  titleBg: z.string().optional(),
  titleAz: z.string().optional(),
  subtitleEn: z.string().optional(),
  subtitleDe: z.string().optional(),
  subtitleFr: z.string().optional(),
  subtitleIt: z.string().optional(),
  subtitleAr: z.string().optional(),
  subtitleRu: z.string().optional(),
  subtitleFa: z.string().optional(),
  subtitleKa: z.string().optional(),
  subtitleBg: z.string().optional(),
  subtitleAz: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionDe: z.string().optional(),
  descriptionFr: z.string().optional(),
  descriptionIt: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionRu: z.string().optional(),
  descriptionFa: z.string().optional(),
  descriptionKa: z.string().optional(),
  descriptionBg: z.string().optional(),
  descriptionAz: z.string().optional(),
  ctaPrimaryTextEn: z.string().optional(),
  ctaPrimaryTextDe: z.string().optional(),
  ctaPrimaryTextFr: z.string().optional(),
  ctaPrimaryTextIt: z.string().optional(),
  ctaPrimaryTextAr: z.string().optional(),
  ctaPrimaryTextRu: z.string().optional(),
  ctaPrimaryTextFa: z.string().optional(),
  ctaPrimaryTextKa: z.string().optional(),
  ctaPrimaryTextBg: z.string().optional(),
  ctaPrimaryTextAz: z.string().optional(),
  ctaSecondaryTextEn: z.string().optional(),
  ctaSecondaryTextDe: z.string().optional(),
  ctaSecondaryTextFr: z.string().optional(),
  ctaSecondaryTextIt: z.string().optional(),
  ctaSecondaryTextAr: z.string().optional(),
  ctaSecondaryTextRu: z.string().optional(),
  ctaSecondaryTextFa: z.string().optional(),
  ctaSecondaryTextKa: z.string().optional(),
  ctaSecondaryTextBg: z.string().optional(),
  ctaSecondaryTextAz: z.string().optional(),
};

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
  showCatalogButton: z.boolean().optional(),
  overlayEnabled: z.boolean().optional(),
  overlayColor: z.string().optional(),
  overlayFromOpacity: z.coerce.number().int().min(0).max(100).optional(),
  overlayToOpacity: z.coerce.number().int().min(0).max(100).optional(),
  textColor: z.string().optional(),
  ctaPrimaryBg: z.string().optional(),
  ctaSecondaryBg: z.string().optional(),
  ...localeTextFields,
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
