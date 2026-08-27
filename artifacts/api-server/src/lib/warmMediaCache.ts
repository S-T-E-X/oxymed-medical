import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { logger } from "./logger";
import {
  getCachedMedia,
  invalidateCachedMedia,
  listCachedPaths,
  putCachedMedia,
} from "./mediaCache";
import { fetchPublicMedia, isPubliclyServable, isSafeMediaPath } from "./publicMedia";

/**
 * Keeps the on-disk media cache warm and honest.
 *
 * WARMING: a cache hit serves an image in ~3ms; a miss costs 3–4.5 seconds of
 * sidecar round trips. Without warming that penalty is just moved onto whoever
 * requests each image first after a restart — often a crawler, and always at
 * least one real visitor per image. Warming pays it once, in the background.
 *
 * PRUNING: the request fast path serves cache hits without re-consulting the
 * database, so an admin deleting a media file only revokes it on the instance
 * that handled the delete. The prune pass re-checks what is already cached
 * against the current allowlist and drops anything no longer servable, which
 * bounds how long a revoked object can survive on any other instance.
 *
 * IMPORTANT: every fetch here goes through fetchPublicMedia, the same
 * authorization gate the request handler uses. Warming must never be able to
 * put an object into the cache that a request would have refused to serve.
 */

const CONCURRENCY = 6;
const REWARM_INTERVAL_MS = 6 * 60 * 60 * 1000;
const PREFIX = "/api/storage/public-objects/";

/**
 * Every column across the site that can hold a media URL. Kept as raw SQL
 * because these live in unrelated tables and the warmer only ever reads them.
 */
async function collectReferencedPaths(): Promise<string[]> {
  const result = await db.execute<{ url: string }>(sql`
    SELECT DISTINCT url FROM (
      SELECT image_url AS url FROM products
      UNION ALL SELECT image_url FROM product_categories
      UNION ALL SELECT image_url FROM sliders
      UNION ALL SELECT image_url FROM news
      UNION ALL SELECT image_url FROM "references"
      UNION ALL SELECT logo_url FROM "references"
      UNION ALL SELECT image_url FROM corporate_sections
    ) t
    WHERE url IS NOT NULL AND url LIKE ${PREFIX + "%"}
  `);

  const rows = Array.isArray(result) ? result : (result.rows ?? []);
  return rows.map((row) => String(row.url).slice(PREFIX.length)).filter(isSafeMediaPath);
}

async function warmOne(filePath: string): Promise<"cached" | "hit" | "miss"> {
  if (await getCachedMedia(filePath)) return "hit";

  const fetched = await fetchPublicMedia(filePath);
  if (!fetched) return "miss";

  await putCachedMedia(filePath, fetched.body, fetched.contentType);
  return "cached";
}

async function runPool<T>(items: T[], worker: (item: T) => Promise<void>): Promise<void> {
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (cursor < items.length) {
        await worker(items[cursor++]!);
      }
    }),
  );
}

/** Drop cached entries whose media is no longer publicly servable. */
async function pruneRevoked(): Promise<number> {
  const cachedPaths = await listCachedPaths();
  let pruned = 0;

  await runPool(cachedPaths, async (filePath) => {
    try {
      if (!(await isPubliclyServable(filePath))) {
        await invalidateCachedMedia(filePath);
        pruned++;
      }
    } catch (err) {
      logger.debug({ err, filePath }, "media cache prune check failed");
    }
  });

  return pruned;
}

async function warmCycle(): Promise<void> {
  const pruned = await pruneRevoked();

  const paths = await collectReferencedPaths();
  if (paths.length === 0) {
    if (pruned > 0) logger.info({ pruned }, "Media cache prune complete");
    return;
  }

  const started = Date.now();
  const counts = { cached: 0, hit: 0, miss: 0, failed: 0 };

  await runPool(paths, async (filePath) => {
    try {
      counts[await warmOne(filePath)]++;
    } catch (err) {
      counts.failed++;
      logger.debug({ err, filePath }, "media cache warm failed for one object");
    }
  });

  logger.info(
    { ...counts, pruned, total: paths.length, ms: Date.now() - started },
    "Media cache warm complete",
  );
}

export function startMediaCacheWarmer(): void {
  const cycle = async () => {
    try {
      await warmCycle();
    } catch (err) {
      // Warming is an optimisation; the request path still works without it.
      logger.warn({ err }, "Media cache warm skipped");
    }
  };

  void cycle();
  setInterval(() => void cycle(), REWARM_INTERVAL_MS).unref();
}
