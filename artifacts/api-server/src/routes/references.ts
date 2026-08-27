import { Router, type IRouter } from "express";
import { db, referencesTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { parsePageLimit } from "../lib/security";
import { writeAdminAuditLog } from "../lib/audit";
import { z } from "zod/v4";
import { translateLocaleOverlays } from "../lib/translateLocaleOverlays";

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
  locales: z.record(
    z.string(),
    z.object({
      projectType: z.string().optional(),
      capacity: z.string().optional(),
      category: z.string().optional(),
    }),
  ).optional(),
});
const TranslateReferenceBody = z.object({
  projectType: z.string().min(1),
  capacity: z.string().optional().default(""),
  category: z.string().optional().default(""),
});

function parseId(raw: string | string[]): number {
  // Strict positive-integer parsing: malformed input yields 0, which matches
  // no serial primary key, so callers fall through to their normal 404 path
  // instead of passing NaN into a SQL query.
  const str = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(str);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
}

router.get("/references", async (req, res): Promise<void> => {
  const { limit, offset } = parsePageLimit(req.query as Record<string, unknown>, 50);
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
  await writeAdminAuditLog(req, {
    action: "reference.delete",
    targetType: "reference",
    targetId: id,
    details: { title: deleted.title },
  });
  res.sendStatus(204);
});

router.post("/references/translate-fields", requireAuth, async (req, res): Promise<void> => {
  const parsed = TranslateReferenceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    res.json({ locales: await translateLocaleOverlays(parsed.data, "reference projects") });
  } catch {
    res.status(502).json({ error: "Çeviri servisi eksik veya geçersiz bir yanıt döndürdü" });
  }
});

export default router;
