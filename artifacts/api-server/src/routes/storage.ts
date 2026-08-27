import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "stream";
import { once } from "node:events";
import {
  RequestMediaUploadUrlBody,
  RequestMediaUploadUrlResponse,
} from "@workspace/api-zod";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";
import { requireAuth } from "../lib/auth";
import { mediaUploadRateLimiter, validateMediaUploadMetadata } from "../lib/security";
import {
  dedupeFetch,
  getCachedMedia,
  openCachedMedia,
  putCachedMedia,
  type CachedMedia,
} from "../lib/mediaCache";
import {
  fetchPublicMedia,
  isSafeMediaPath,
  normalizeMediaPath,
} from "../lib/publicMedia";

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
    // Normalize before anything else so the authorization check, the cache key
    // and the in-flight dedupe key all agree on one spelling of the path.
    const filePath = normalizeMediaPath(Array.isArray(raw) ? raw.join("/") : raw);

    // Reject traversal attempts before they reach the storage layer.
    if (!isSafeMediaPath(filePath)) {
      res.status(400).json({ error: "Invalid path" });
      return;
    }

    // Fast path. A hit here answers the request without touching object storage
    // at all, which is the whole point: an uncached hit costs 3–4.5s of
    // time-to-first-byte because every lookup is a separate sidecar round trip.
    // Only bytes that already passed fetchPublicMedia's authorization check can
    // be in the cache, so a hit is safe to serve as-is.
    const cached = await getCachedMedia(filePath);
    if (cached && (await serveCached(req, res, cached))) {
      return;
    }

    const fetched = await dedupeFetch(filePath, () => fetchPublicMedia(filePath));

    if (!fetched) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const stored = await putCachedMedia(filePath, fetched.body, fetched.contentType);
    // If the cache write failed we still have the bytes in hand — serve them
    // rather than failing the request, just without a strong validator.
    sendMedia(req, res, fetched.contentType, stored?.etag, fetched.body.length, () =>
      Readable.from(fetched.body),
    );
  } catch (error) {
    req.log.error({ err: error }, "Error serving public object");
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to serve public object" });
    }
  }
});

/**
 * Serve a cache hit, returning false if the cached file turned out to be
 * unreadable so the caller can fall back to object storage.
 *
 * The file handle is acquired BEFORE any header is written: eviction or an
 * admin deletion can remove an entry between the lookup and the read, and
 * discovering that mid-response would leave the client with a truncated image
 * and no way to recover.
 */
async function serveCached(
  req: Request,
  res: Response,
  cached: CachedMedia,
): Promise<boolean> {
  let stream: NodeJS.ReadableStream;
  try {
    stream = openCachedMedia(cached);
    await once(stream as Readable, "open");
  } catch {
    return false;
  }

  sendMedia(req, res, cached.contentType, cached.etag, cached.size, () => stream);
  return true;
}

/**
 * Emit a media response with a strong validator so repeat requests — including
 * crawler revalidations, which do not reuse a warm browser cache — cost a 304
 * instead of a full body.
 */
function sendMedia(
  req: Request,
  res: Response,
  contentType: string,
  etag: string | undefined,
  size: number,
  openStream: () => NodeJS.ReadableStream,
): void {
  res.setHeader("Content-Type", contentType);
  // Uploaded objects are content-addressed by a UUID minted at upload time, so
  // a given URL's bytes never change and can be cached indefinitely.
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

  if (etag) {
    res.setHeader("ETag", etag);
    const ifNoneMatch = req.headers["if-none-match"];
    if (ifNoneMatch && ifNoneMatch.split(",").some((tag) => tag.trim() === etag)) {
      res.status(304).end();
      return;
    }
  }

  res.setHeader("Content-Length", String(size));
  openStream().pipe(res);
}

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
