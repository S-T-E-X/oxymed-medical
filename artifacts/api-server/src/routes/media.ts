import { Router, type IRouter } from "express";
import { db, mediaFilesTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";
import { z } from "zod/v4";

const router: IRouter = Router();
const storage = new ObjectStorageService();

/**
 * Media upload flow (two steps):
 *  1. POST /api/media/request-upload-url — request a GCS presigned URL
 *     Client receives { uploadURL, objectPath }
 *  2. Client PUTs file bytes directly to uploadURL (GCS, not this server)
 *  3. POST /api/media/upload — register the uploaded file's metadata in DB
 *     Server verifies the object exists in GCS before saving
 */

const MediaRegisterBody = z.object({
  filename: z.string().min(1),
  objectPath: z.string().min(1).startsWith("/objects/"),
  mimeType: z.string().optional(),
  size: z.number().int().positive().optional(),
  alt: z.string().optional(),
});

const PresignedUrlBody = z.object({
  name: z.string().min(1),
  size: z.number().int().positive(),
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

/**
 * Step 1: Request a GCS presigned upload URL.
 * Returns { uploadURL, objectPath } — client must PUT file bytes to uploadURL.
 */
router.post("/media/request-upload-url", requireAuth, async (req, res): Promise<void> => {
  const parsed = PresignedUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const uploadURL = await storage.getObjectEntityUploadURL();
  const objectPath = storage.normalizeObjectEntityPath(uploadURL);
  req.log.info({ objectPath }, "Presigned upload URL generated");
  res.json({ uploadURL, objectPath });
});

/**
 * Step 3: Register a successfully uploaded file's metadata.
 * Verifies the object exists in GCS before saving to DB.
 * Call this AFTER the client has PUT the file to the presigned URL.
 */
router.post("/media/upload", requireAuth, async (req, res): Promise<void> => {
  const parsed = MediaRegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Verify the object actually exists in GCS before registering it
  try {
    await storage.getObjectEntityFile(parsed.data.objectPath);
  } catch (err) {
    if (err instanceof ObjectNotFoundError) {
      req.log.warn({ objectPath: parsed.data.objectPath }, "Object not found in storage during media registration");
      res.status(422).json({
        error: "Object not found in storage. Upload the file to the presigned URL first, then register it.",
      });
      return;
    }
    throw err;
  }

  const [media] = await db.insert(mediaFilesTable).values(parsed.data).returning();
  req.log.info({ mediaId: media.id, objectPath: media.objectPath }, "Media file registered");
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
