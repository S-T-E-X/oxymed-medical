import { Router, type IRouter } from "express";
import { db, corporateSectionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { z } from "zod/v4";

const router: IRouter = Router();

const CorporateSectionBody = z.object({
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

router.get("/corporate", async (_req, res): Promise<void> => {
  const rows = await db.select().from(corporateSectionsTable);
  res.json(rows);
});

router.get("/corporate/:sectionKey", async (req, res): Promise<void> => {
  const sectionKey = Array.isArray(req.params["sectionKey"]) ? req.params["sectionKey"][0] : req.params["sectionKey"];
  const [section] = await db
    .select()
    .from(corporateSectionsTable)
    .where(eq(corporateSectionsTable.sectionKey, sectionKey!));
  if (!section) {
    res.status(404).json({ error: "Section not found" });
    return;
  }
  res.json(section);
});

router.put("/corporate/:sectionKey", requireAuth, async (req, res): Promise<void> => {
  const sectionKey = Array.isArray(req.params["sectionKey"]) ? req.params["sectionKey"][0] : req.params["sectionKey"];
  const parsed = CorporateSectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Geçersiz istek gövdesi" });
    return;
  }

  const existing = await db
    .select()
    .from(corporateSectionsTable)
    .where(eq(corporateSectionsTable.sectionKey, sectionKey!));

  let section;
  if (existing.length > 0) {
    [section] = await db
      .update(corporateSectionsTable)
      .set(parsed.data)
      .where(eq(corporateSectionsTable.sectionKey, sectionKey!))
      .returning();
  } else {
    [section] = await db
      .insert(corporateSectionsTable)
      .values({ sectionKey: sectionKey!, ...parsed.data })
      .returning();
  }
  res.json(section);
});

export default router;
