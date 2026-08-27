import express, { Router, type IRouter } from "express";
import { db, mediaFilesTable } from "@workspace/db";
import { eq, desc, count, inArray } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import {
  detectMediaContentType,
  expensiveAdminRateLimiter,
  MAX_MEDIA_UPLOAD_BYTES,
  mediaUploadRateLimiter,
  validateMediaUploadMetadata,
} from "../lib/security";
import { writeAdminAuditLog } from "../lib/audit";
import {
  discardStagedLocalMedia,
  finalizeLocalMediaDeletion,
  publishStagedLocalMedia,
  readLocalMedia,
  replaceLocalMedia,
  restoreStagedLocalMediaDeletion,
  stageLocalMedia,
  stageLocalMediaDeletion,
} from "../lib/localMedia";
import { z } from "zod/v4";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";

const router: IRouter = Router();
const execFileAsync = promisify(execFile);

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

function mediaFilename(req: express.Request): string | null {
  const encoded = req.get("x-media-filename");
  if (!encoded || encoded.length > 600) return null;
  try {
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
}

function requestContentType(req: express.Request): string {
  return (req.get("content-type") ?? "").split(";", 1)[0]!.trim().toLowerCase();
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
    const sourceBuffer = await readLocalMedia(media.objectPath);
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
    await replaceLocalMedia(media.objectPath, jpegBuffer);
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
 * Receive a single media body directly into server-local storage. The browser
 * sends the raw bytes with Content-Type and an encoded display filename header;
 * neither header affects the disk path.
 */
router.post(
  "/media/upload",
  requireAuth,
  mediaUploadRateLimiter,
  express.raw({ type: () => true, limit: MAX_MEDIA_UPLOAD_BYTES }),
  async (req, res): Promise<void> => {
    const filename = mediaFilename(req);
    const contentType = requestContentType(req);
    const body = req.body;

    if (!filename || !Buffer.isBuffer(body)) {
      res.status(400).json({ error: "Missing or invalid media upload data" });
      return;
    }

    const validation = validateMediaUploadMetadata({
      name: filename,
      size: body.length,
      contentType,
    });
    if (!validation.ok) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const detectedType = detectMediaContentType(body);
    if (detectedType !== contentType) {
      res.status(415).json({ error: "Dosya içeriği belirtilen türle eşleşmiyor" });
      return;
    }

    let staged;
    let media: typeof mediaFilesTable.$inferSelect | undefined;
    try {
      staged = await stageLocalMedia(body);
      [media] = await db.insert(mediaFilesTable).values({
        filename,
        objectPath: staged.objectPath,
        mimeType: contentType,
        size: body.length,
      }).returning();
      await publishStagedLocalMedia(staged);
    } catch (error) {
      if (staged) {
        await discardStagedLocalMedia(staged).catch(() => undefined);
      }
      if (media) {
        await db.delete(mediaFilesTable).where(eq(mediaFilesTable.id, media.id)).catch(() => undefined);
      }
      req.log.error({ err: error }, "Local media upload failed");
      res.status(500).json({ error: "Media upload failed" });
      return;
    }

    await writeAdminAuditLog(req, {
      action: "media.create",
      targetType: "media_file",
      targetId: media!.id,
      details: { objectPath: media!.objectPath, size: media!.size },
    });
    res.status(201).json(media);
  },
);

router.delete("/media/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [existing] = await db.select().from(mediaFilesTable).where(eq(mediaFilesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Media file not found" });
    return;
  }

  let stagedDeletion;
  try {
    stagedDeletion = await stageLocalMediaDeletion(existing.objectPath);
    const [deleted] = await db.delete(mediaFilesTable).where(eq(mediaFilesTable.id, id)).returning();
    if (!deleted) {
      if (stagedDeletion) await restoreStagedLocalMediaDeletion(stagedDeletion);
      res.status(404).json({ error: "Media file not found" });
      return;
    }
  } catch (error) {
    if (stagedDeletion) {
      await restoreStagedLocalMediaDeletion(stagedDeletion).catch(() => undefined);
    }
    req.log.error({ err: error, mediaId: id }, "Local media deletion failed");
    res.status(500).json({ error: "Media deletion failed" });
    return;
  }

  if (stagedDeletion) {
    await finalizeLocalMediaDeletion(stagedDeletion).catch((error) =>
      req.log.warn({ err: error, mediaId: id }, "Local media trash cleanup failed"),
    );
  }
  await writeAdminAuditLog(req, {
    action: "media.delete",
    targetType: "media_file",
    targetId: id,
    details: { objectPath: existing.objectPath },
  });
  res.sendStatus(204);
});

export default router;