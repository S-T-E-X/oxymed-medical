import { Router, type IRouter } from "express";
import { db, mediaFilesTable } from "@workspace/db";
import { eq, desc, count, inArray } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";
import {
  expensiveAdminRateLimiter,
  mediaUploadRateLimiter,
  validateMediaUploadMetadata,
} from "../lib/security";
import { writeAdminAuditLog } from "../lib/audit";
import { invalidateCachedMedia } from "../lib/mediaCache";
import { z } from "zod/v4";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";

const router: IRouter = Router();
const storage = new ObjectStorageService();
const execFileAsync = promisify(execFile);

/**
 * Media upload flow (two steps):
 *  1. POST /api/media/request-upload-url — request a GCS presigned URL
 *     Client receives { uploadURL, objectPath }
 *  2. Client PUTs file bytes directly to uploadURL (GCS, not this server)
 *  3. POST /api/media/upload — register the uploaded file's metadata in DB
 *     Server verifies the object exists in GCS before saving
 */

const MediaRegisterBody = z.object({
  filename: z.string().min(1).max(180),
  objectPath: z.string().min(1).max(512).startsWith("/objects/"),
  mimeType: z.string().max(120).optional(),
  size: z.number().int().positive().optional(),
  alt: z.string().max(500).optional(),
});

const PresignedUrlBody = z.object({
  name: z.string().min(1).max(180),
  size: z.number().int().positive(),
  contentType: z.string().min(1).max(120),
});

const MediaConversionBody = z.object({
  ids: z.array(z.number().int().positive()).min(1).optional(),
  dryRun: z.boolean().optional().default(false),
});

type ConversionStatus =
  | "convertible"
  | "converted"
  | "skipped-transparent"
  | "skipped-animated"
  | "skipped-jpeg"
  | "failed";

type ConversionItem = {
  id: number;
  filename: string;
  status: ConversionStatus;
  previousSize: number | null;
  size: number | null;
  error: string | null;
};

/**
 * Clamp client-supplied paging so a single request cannot ask the database for
 * an unbounded result set.
 */
function parsePagination(
  query: Record<string, unknown>,
  defaultLimit: number,
): { limit: number; offset: number } {
  const pageRaw = Number.parseInt(String(query["page"] ?? "1"), 10);
  const limitRaw = Number.parseInt(String(query["limit"] ?? String(defaultLimit)), 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : defaultLimit;
  return { limit, offset: (page - 1) * limit };
}

function parseId(raw: string | string[]): number {
  // Strict positive-integer parsing: malformed input yields 0, which matches
  // no serial primary key, so callers fall through to their normal 404 path
  // instead of passing NaN into a SQL query.
  const str = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(str);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
}

function isJpegMedia(filename: string, mimeType?: string | null): boolean {
  return mimeType?.toLowerCase() === "image/jpeg" || /\.(jpe?g)$/i.test(filename);
}

function isPngOrWebpMedia(filename: string, mimeType?: string | null): boolean {
  const mime = mimeType?.toLowerCase();
  return mime === "image/png" || mime === "image/webp" || /\.(png|webp)$/i.test(filename);
}

async function magickValue(args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("magick", args, {
    maxBuffer: 1024 * 1024,
  });
  return stdout.trim();
}

function jpgFilename(filename: string): string {
  const withoutExtension = basename(filename, extname(filename));
  return `${withoutExtension || "image"}.jpg`;
}

async function convertMediaFile(
  media: typeof mediaFilesTable.$inferSelect,
  dryRun: boolean,
): Promise<ConversionItem> {
  if (isJpegMedia(media.filename, media.mimeType)) {
    return {
      id: media.id,
      filename: media.filename,
      status: "skipped-jpeg",
      previousSize: media.size ?? null,
      size: media.size ?? null,
      error: null,
    };
  }

  const filename = media.filename;
  const tempDir = await mkdtemp(join(tmpdir(), "oxymed-media-"));
  const inputPath = join(tempDir, "source");
  const outputPath = join(tempDir, "converted.jpg");

  try {
    const objectFile = await storage.getObjectEntityFile(media.objectPath);
    const [sourceBuffer] = await objectFile.download();
    await writeFile(inputPath, sourceBuffer);

    const opaque = (await magickValue([inputPath, "-format", "%[opaque]", "info:"])).toLowerCase() === "true";
    if (!opaque) {
      return {
        id: media.id,
        filename,
        status: "skipped-transparent",
        previousSize: media.size ?? sourceBuffer.byteLength,
        size: media.size ?? sourceBuffer.byteLength,
        error: null,
      };
    }

    const pages = Number(await magickValue([inputPath, "-format", "%n", "info:"]));
    if (Number.isFinite(pages) && pages > 1) {
      return {
        id: media.id,
        filename,
        status: "skipped-animated",
        previousSize: media.size ?? sourceBuffer.byteLength,
        size: media.size ?? sourceBuffer.byteLength,
        error: null,
      };
    }

    if (dryRun) {
      return {
        id: media.id,
        filename,
        status: "convertible",
        previousSize: media.size ?? sourceBuffer.byteLength,
        size: media.size ?? sourceBuffer.byteLength,
        error: null,
      };
    }

    await execFileAsync("magick", [
      inputPath,
      "-auto-orient",
      "-strip",
      "-quality",
      "86",
      "-interlace",
      "Plane",
      outputPath,
    ], { maxBuffer: 1024 * 1024 });

    const jpegBuffer = await readFile(outputPath);
    const nextFilename = jpgFilename(filename);

    // Keep the object path stable. Existing product, slider, quote, and
    // settings records store the public URL rather than the media id.
    await objectFile.save(jpegBuffer, {
      resumable: false,
      metadata: {
        contentType: "image/jpeg",
        cacheControl: "public, max-age=86400",
      },
    });
    const [updated] = await db.update(mediaFilesTable)
      .set({
        filename: nextFilename,
        mimeType: "image/jpeg",
        size: jpegBuffer.byteLength,
      })
      .where(eq(mediaFilesTable.id, media.id))
      .returning();

    return {
      id: media.id,
      filename: updated?.filename ?? nextFilename,
      status: "converted",
      previousSize: media.size ?? sourceBuffer.byteLength,
      size: jpegBuffer.byteLength,
      error: null,
    };
  } catch (error) {
    return {
      id: media.id,
      filename,
      status: "failed",
      previousSize: media.size ?? null,
      size: null,
      error: error instanceof Error ? error.message.slice(0, 240) : "Unknown conversion error",
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

router.get("/media", requireAuth, async (req, res): Promise<void> => {
  const { limit, offset } = parsePagination(req.query as Record<string, unknown>, 20);

  const [items, [totalRow]] = await Promise.all([
    db.select().from(mediaFilesTable).orderBy(desc(mediaFilesTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(mediaFilesTable),
  ]);
  res.json({ items, total: totalRow?.count ?? 0 });
});

router.post("/media/convert-opaque", requireAuth, expensiveAdminRateLimiter, async (req, res): Promise<void> => {
  const parsed = MediaConversionBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const mediaRows = parsed.data.ids
      ? await db.select().from(mediaFilesTable).where(inArray(mediaFilesTable.id, parsed.data.ids))
      : await db.select().from(mediaFilesTable).orderBy(desc(mediaFilesTable.createdAt));
    const candidates = mediaRows.filter((media) => isPngOrWebpMedia(media.filename, media.mimeType) || isJpegMedia(media.filename, media.mimeType));
    const items: ConversionItem[] = [];

    // Process sequentially so a large media library cannot exhaust memory or
    // create a burst of concurrent ImageMagick processes.
    for (const media of candidates) {
      items.push(await convertMediaFile(media, parsed.data.dryRun));
    }

    const convertible = items.filter((item) => item.status === "convertible").length;
    const converted = items.filter((item) => item.status === "converted").length;
    const failed = items.filter((item) => item.status === "failed").length;
    res.json({
      inspected: items.length,
      convertible,
      converted,
      skipped: items.length - converted - failed,
      failed,
      items,
    });
  } catch (error) {
    req.log.error({ err: error }, "Opaque media conversion failed");
    res.status(500).json({ error: "Media conversion failed" });
  }
});

/**
 * Step 1: Request a GCS presigned upload URL.
 * Returns { uploadURL, objectPath } — client must PUT file bytes to uploadURL.
 */
router.post("/media/request-upload-url", requireAuth, mediaUploadRateLimiter, async (req, res): Promise<void> => {
  const parsed = PresignedUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const validation = validateMediaUploadMetadata(parsed.data);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
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
  // The public media route caches bytes on disk keyed by the request path, and
  // those entries are deliberately long-lived because uploaded objects are
  // immutable. Deletion is the one event that invalidates them, so drop the
  // entry here or the file stays servable until the cache ages out.
  await invalidateCachedMedia(deleted.objectPath.replace(/^\//, ""));

  await writeAdminAuditLog(req, {
    action: "media.delete",
    targetType: "media_file",
    targetId: id,
    details: { objectPath: deleted.objectPath },
  });
  res.sendStatus(204);
});

export default router;
