import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "stream";
import {
  RequestMediaUploadUrlBody,
  RequestMediaUploadUrlResponse,
} from "@workspace/api-zod";
import { db, mediaFilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";
import { requireAuth } from "../lib/auth";
import { mediaUploadRateLimiter, validateMediaUploadMetadata } from "../lib/security";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

/**
 * POST /storage/uploads/request-url
 *
 * Request a presigned URL for file upload.
 * The client sends JSON metadata (name, size, contentType) — NOT the file.
 * Then uploads the file directly to the returned presigned URL.
 *
 * Admin-only: a presigned PUT URL is a write capability against the project's
 * bucket, so it must never be handed out to anonymous callers.
 */
router.post(
  "/storage/uploads/request-url",
  requireAuth,
  mediaUploadRateLimiter,
  async (req: Request, res: Response) => {
    const parsed = RequestMediaUploadUrlBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Missing or invalid required fields" });
      return;
    }

    const { name, size, contentType } = parsed.data;
    const validation = validateMediaUploadMetadata({ name, size, contentType });
    if (!validation.ok) {
      res.status(400).json({ error: validation.error });
      return;
    }

    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

      res.json(
        RequestMediaUploadUrlResponse.parse({
          uploadURL,
          objectPath,
          metadata: { name, size, contentType },
        }),
      );
    } catch (error) {
      req.log.error({ err: error }, "Error generating upload URL");
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  },
);

/**
 * GET /storage/public-objects/*
 *
 * Serve public assets from PUBLIC_OBJECT_SEARCH_PATHS.
 * These are unconditionally public — no authentication or ACL checks.
 * IMPORTANT: Always provide this endpoint when object storage is set up.
 */
router.get("/storage/public-objects/*filePath", async (req: Request, res: Response) => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join("/") : raw;

    // Reject traversal attempts before they reach the storage layer.
    if (filePath.includes("..") || filePath.includes("\0")) {
      res.status(400).json({ error: "Invalid path" });
      return;
    }

    // First try the genuinely public search paths.
    let file = await objectStorageService.searchPublicObject(filePath);

    if (!file) {
      // Fall back to the private object dir ONLY for objects the admin has
      // explicitly registered as site media. Without this allowlist the public
      // route would expose every object in the private bucket to anyone who
      // can guess a path.
      const normalizedPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
      if (normalizedPath.startsWith("/objects/")) {
        const [registered] = await db
          .select({ id: mediaFilesTable.id })
          .from(mediaFilesTable)
          .where(eq(mediaFilesTable.objectPath, normalizedPath));

        if (registered) {
          try {
            file = await objectStorageService.getObjectEntityFile(normalizedPath);
          } catch {
            // not found in private dir either
          }
        }
      }
    }

    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const response = await objectStorageService.downloadObject(file, undefined, {
      forcePublic: true,
    });

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    req.log.error({ err: error }, "Error serving public object");
    res.status(500).json({ error: "Failed to serve public object" });
  }
});

/**
 * GET /storage/objects/*
 *
 * Serve object entities from PRIVATE_OBJECT_DIR.
 * These are served from a separate path from /public-objects and can optionally
 * be protected with authentication or ACL checks based on the use case.
 */
router.get("/storage/objects/*path", requireAuth, async (req: Request, res: Response) => {
  try {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
    if (wildcardPath.includes("..") || wildcardPath.includes("\0")) {
      res.status(400).json({ error: "Invalid path" });
      return;
    }
    const objectPath = `/objects/${wildcardPath}`;
    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);

    const response = await objectStorageService.downloadObject(objectFile);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      req.log.warn({ err: error }, "Object not found");
      res.status(404).json({ error: "Object not found" });
      return;
    }
    req.log.error({ err: error }, "Error serving object");
    res.status(500).json({ error: "Failed to serve object" });
  }
});

export default router;
