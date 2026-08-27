import { Router, type IRouter, type Request, type Response } from "express";
import { db, mediaFilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  getLocalMediaFile,
  isSafeLocalMediaObjectPath,
  openLocalMediaFile,
} from "../lib/localMedia";

const router: IRouter = Router();

/**
 * Local-disk media is deliberately served through this route in every
 * environment. The database allowlist prevents manually created/orphaned files
 * from becoming public, and the row keeps the correct MIME type even though
 * UUID object filenames do not have an extension.
 */
router.get("/storage/public-objects/*filePath", async (req: Request, res: Response) => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join("/") : raw;
    const objectPath = `/${filePath.replace(/^\/+/, "")}`;

    if (!isSafeLocalMediaObjectPath(objectPath)) {
      res.status(400).json({ error: "Invalid path" });
      return;
    }

    const [registered] = await db
      .select({ mimeType: mediaFilesTable.mimeType })
      .from(mediaFilesTable)
      .where(eq(mediaFilesTable.objectPath, objectPath));
    if (!registered) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const entry = await getLocalMediaFile(objectPath);
    if (!entry) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    res.setHeader("Content-Type", registered.mimeType ?? "application/octet-stream");
    // UUID paths are immutable for normal uploads, while the one-day TTL keeps
    // the existing PNG/WebP-to-JPEG conversion feature observable promptly.
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("ETag", entry.etag);
    const ifNoneMatch = req.headers["if-none-match"];
    if (ifNoneMatch && ifNoneMatch.split(",").some((tag) => tag.trim() === entry.etag)) {
      res.status(304).end();
      return;
    }

    res.setHeader("Content-Length", String(entry.size));
    openLocalMediaFile(entry.filePath).pipe(res);
  } catch (error) {
    req.log.error({ err: error }, "Error serving local media");
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to serve media" });
    }
  }
});

export default router;