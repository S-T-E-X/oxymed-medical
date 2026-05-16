import { Router, type IRouter } from "express";
import { db, mediaFilesTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { ObjectStorageService } from "../lib/objectStorage";
import { z } from "zod/v4";

const router: IRouter = Router();
const storage = new ObjectStorageService();

const MediaUploadBody = z.object({
  filename: z.string().min(1),
  objectPath: z.string().min(1),
  mimeType: z.string().optional(),
  size: z.number().int().optional(),
  alt: z.string().optional(),
});

const PresignedUrlBody = z.object({
  name: z.string().min(1),
  size: z.number().int(),
  contentType: z.string().min(1),
});

function parseId(raw: string | string[]): number {
  return parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
}

router.get("/media", requireAuth, async (req, res): Promise<void> => {
  const page = parseInt((req.query["page"] as string) ?? "1", 10);
  const limit = parseInt((req.query["limit"] as string) ?? "20", 10);
  const offset = (page - 1) * limit;

  const [items, [totalRow]] = await Promise.all([
    db.select().from(mediaFilesTable).orderBy(desc(mediaFilesTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(mediaFilesTable),
  ]);
  res.json({ items, total: totalRow?.count ?? 0 });
});

router.post("/media/request-upload-url", requireAuth, async (req, res): Promise<void> => {
  const parsed = PresignedUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const uploadURL = await storage.getObjectEntityUploadURL();
  const objectPath = storage.normalizeObjectEntityPath(uploadURL);
  res.json({ uploadURL, objectPath });
});

router.post("/media/upload", requireAuth, async (req, res): Promise<void> => {
  const parsed = MediaUploadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [media] = await db.insert(mediaFilesTable).values(parsed.data).returning();
  res.status(201).json(media);
});

router.delete("/media/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [deleted] = await db.delete(mediaFilesTable).where(eq(mediaFilesTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Media file not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
