import { createHash } from "crypto";
import { createReadStream } from "fs";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { logger } from "./logger";

/**
 * On-disk cache for publicly served object-storage media.
 *
 * WHY THIS EXISTS
 * ---------------
 * Serving one image out of object storage costs several sequential round trips
 * through the storage sidecar: an existence probe per public search path, a
 * metadata fetch, and finally the read stream. Measured end to end that is
 * 3–4.5 seconds of time-to-first-byte for a 65 KB image — on every single
 * request, because nothing between the API and the bucket caches anything.
 *
 * The `Cache-Control: immutable` header the download path already sets only
 * helps a browser that has *already* fetched the file once. It does nothing for
 * a first-time visitor, for a crawler (Googlebot does not reuse a warm HTTP
 * cache across crawls), or for the prerender pass. Those are exactly the
 * requests whose latency shows up in Core Web Vitals and in the crawl budget.
 *
 * Uploaded objects are content-addressed — the object name is a UUID minted at
 * upload time and its bytes never change afterwards — so a cached copy can
 * never go stale in the "content changed under the same key" sense. The only
 * staleness risk is an object that gets deleted, which is handled by explicit
 * invalidation from the media delete route plus a conservative max age.
 */

const CACHE_DIR =
  process.env["MEDIA_CACHE_DIR"] ?? path.join(os.tmpdir(), "oxymed-media-cache");

/** Total bytes the cache is allowed to occupy before least-recently-used eviction. */
const MAX_CACHE_BYTES = Number(process.env["MEDIA_CACHE_MAX_BYTES"] ?? 512 * 1024 * 1024);

/**
 * Hard upper bound on a single cached entry. Uploads are already capped well
 * below this; the check exists so an unexpectedly large object cannot evict the
 * entire working set in one go.
 */
const MAX_ENTRY_BYTES = 32 * 1024 * 1024;

/**
 * Entries older than this are refetched even though the content is immutable.
 * This is the backstop for objects deleted out of band, where no invalidation
 * event ever reaches this process.
 */
const MAX_ENTRY_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export type CachedMedia = {
  bodyPath: string;
  contentType: string;
  size: number;
  etag: string;
};

type CacheMeta = {
  contentType: string;
  size: number;
  etag: string;
  storedAt: number;
  /**
   * The path this entry was cached under. Keys are hashes, so without this the
   * cache could never be audited back to the object it holds — which is what
   * pruning entries for deleted media requires.
   */
  objectPath?: string;
};

let initPromise: Promise<void> | null = null;

function ensureDir(): Promise<void> {
  initPromise ??= fs.mkdir(CACHE_DIR, { recursive: true }).then(() => undefined);
  return initPromise;
}

/**
 * Cache keys are derived by hashing rather than by sanitising the caller's
 * path. A hash cannot contain a separator or a traversal sequence, so an
 * attacker-controlled object path can never escape the cache directory no
 * matter what the upstream route lets through.
 */
function keyFor(objectPath: string): string {
  return createHash("sha256").update(objectPath).digest("hex");
}

function bodyPathFor(key: string): string {
  return path.join(CACHE_DIR, `${key}.bin`);
}

function metaPathFor(key: string): string {
  return path.join(CACHE_DIR, `${key}.json`);
}

/**
 * Look up a previously cached object. Returns null on any miss, including a
 * corrupt or partially written entry — a cache is never allowed to turn a
 * working request into a failing one.
 */
export async function getCachedMedia(objectPath: string): Promise<CachedMedia | null> {
  try {
    await ensureDir();
    const key = keyFor(objectPath);
    const metaRaw = await fs.readFile(metaPathFor(key), "utf8");
    const meta = JSON.parse(metaRaw) as CacheMeta;

    if (!meta || typeof meta.size !== "number" || typeof meta.etag !== "string") {
      return null;
    }
    if (Date.now() - meta.storedAt > MAX_ENTRY_AGE_MS) {
      return null;
    }

    const bodyPath = bodyPathFor(key);
    const stat = await fs.stat(bodyPath);
    // A size mismatch means the write was interrupted; treat it as a miss so
    // the caller refetches instead of serving a truncated image.
    if (stat.size !== meta.size) {
      return null;
    }

    // Best-effort recency marker for LRU eviction. Failure is harmless.
    const now = new Date();
    void fs.utimes(bodyPath, now, now).catch(() => {});

    return {
      bodyPath,
      contentType: meta.contentType,
      size: meta.size,
      etag: meta.etag,
    };
  } catch {
    return null;
  }
}

/**
 * Store an object's bytes. Writes go to a temporary file that is renamed into
 * place, so a concurrent reader either sees the previous state or the complete
 * entry, never a half-written one.
 */
export async function putCachedMedia(
  objectPath: string,
  body: Buffer,
  contentType: string,
): Promise<CachedMedia | null> {
  if (body.length === 0 || body.length > MAX_ENTRY_BYTES) {
    return null;
  }

  try {
    await ensureDir();
    const key = keyFor(objectPath);
    const etag = `"${createHash("sha256").update(body).digest("hex").slice(0, 32)}"`;
    const meta: CacheMeta = {
      contentType,
      size: body.length,
      etag,
      storedAt: Date.now(),
      objectPath,
    };

    const suffix = `${process.pid}-${Math.random().toString(36).slice(2)}`;
    const tmpBody = path.join(CACHE_DIR, `.${key}.${suffix}.bin`);
    const tmpMeta = path.join(CACHE_DIR, `.${key}.${suffix}.json`);

    await fs.writeFile(tmpBody, body);
    await fs.writeFile(tmpMeta, JSON.stringify(meta));
    // Body first: a reader that finds meta must always find a complete body.
    await fs.rename(tmpBody, bodyPathFor(key));
    await fs.rename(tmpMeta, metaPathFor(key));

    void evictIfOverBudget();

    return { bodyPath: bodyPathFor(key), contentType, size: body.length, etag };
  } catch (err) {
    logger.warn({ err }, "media cache write failed; serving without caching");
    return null;
  }
}

/** Drop a cached object, e.g. when the admin deletes the underlying media file. */
export async function invalidateCachedMedia(objectPath: string): Promise<void> {
  try {
    const key = keyFor(objectPath);
    await Promise.all([
      fs.rm(bodyPathFor(key), { force: true }),
      fs.rm(metaPathFor(key), { force: true }),
    ]);
  } catch (err) {
    logger.warn({ err, objectPath }, "media cache invalidation failed");
  }
}

export function openCachedMedia(entry: CachedMedia): NodeJS.ReadableStream {
  return createReadStream(entry.bodyPath);
}

/**
 * Every object path currently held in the cache. Lets a caller re-check the
 * authorization of what is already stored — the cache serves hits without
 * consulting the database, so revoked media has to be actively pruned.
 */
export async function listCachedPaths(): Promise<string[]> {
  try {
    await ensureDir();
    const names = await fs.readdir(CACHE_DIR);
    const paths: string[] = [];

    for (const name of names) {
      if (!name.endsWith(".json") || name.startsWith(".")) continue;
      try {
        const meta = JSON.parse(
          await fs.readFile(path.join(CACHE_DIR, name), "utf8"),
        ) as CacheMeta;
        if (meta.objectPath) paths.push(meta.objectPath);
      } catch {
        // Unreadable metadata; getCachedMedia treats it as a miss anyway.
      }
    }
    return paths;
  } catch {
    return [];
  }
}

let evicting = false;

/**
 * Least-recently-used eviction driven by file access time. Runs opportunistically
 * after writes and never blocks a request.
 */
async function evictIfOverBudget(): Promise<void> {
  if (evicting) return;
  evicting = true;
  try {
    const names = await fs.readdir(CACHE_DIR);
    const entries: Array<{ key: string; size: number; atimeMs: number }> = [];
    let total = 0;

    for (const name of names) {
      if (!name.endsWith(".bin") || name.startsWith(".")) continue;
      const key = name.slice(0, -".bin".length);
      try {
        const stat = await fs.stat(path.join(CACHE_DIR, name));
        entries.push({ key, size: stat.size, atimeMs: stat.atimeMs });
        total += stat.size;
      } catch {
        // Entry vanished mid-scan; nothing to account for.
      }
    }

    if (total <= MAX_CACHE_BYTES) return;

    entries.sort((a, b) => a.atimeMs - b.atimeMs);
    for (const entry of entries) {
      if (total <= MAX_CACHE_BYTES) break;
      await Promise.all([
        fs.rm(bodyPathFor(entry.key), { force: true }),
        fs.rm(metaPathFor(entry.key), { force: true }),
      ]);
      total -= entry.size;
    }
  } catch (err) {
    logger.warn({ err }, "media cache eviction failed");
  } finally {
    evicting = false;
  }
}

/**
 * Collapses concurrent misses for the same object into a single upstream fetch.
 * Without this, the first page view after a cold start fires one storage round
 * trip per image *per concurrent visitor*.
 */
const inFlight = new Map<string, Promise<{ body: Buffer; contentType: string } | null>>();

export function dedupeFetch(
  objectPath: string,
  fetcher: () => Promise<{ body: Buffer; contentType: string } | null>,
): Promise<{ body: Buffer; contentType: string } | null> {
  const existing = inFlight.get(objectPath);
  if (existing) return existing;

  const promise = fetcher().finally(() => {
    inFlight.delete(objectPath);
  });
  inFlight.set(objectPath, promise);
  return promise;
}
