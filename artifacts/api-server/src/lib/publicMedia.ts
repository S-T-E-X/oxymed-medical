import type { File } from "@google-cloud/storage";
import { db, mediaFilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ObjectStorageService } from "./objectStorage";

/**
 * Single authorization gate for everything served through
 * `/api/storage/public-objects/*`.
 *
 * WHY THIS IS ITS OWN MODULE
 * --------------------------
 * Two code paths put bytes into the public media cache: the request handler and
 * the startup warmer. The cache fast path serves whatever it finds *without*
 * re-checking anything, so the cache is only as safe as the least careful of
 * those writers. Keeping the check in one exported function makes it impossible
 * for a second writer to quietly skip it — which is exactly the bug this
 * module was extracted to prevent.
 *
 * The rule it enforces:
 *   - objects under PUBLIC_OBJECT_SEARCH_PATHS are public by configuration;
 *   - objects in the private dir are served ONLY when an admin has registered
 *     them in `media_files`. Without that allowlist the public route would hand
 *     out every object in the private bucket to anyone who can guess a path.
 */

const objectStorageService = new ObjectStorageService();

export function isSafeMediaPath(filePath: string): boolean {
  return (
    filePath.length > 0 && !filePath.includes("..") && !filePath.includes("\0")
  );
}

function normalize(filePath: string): string {
  return filePath.startsWith("/") ? filePath : `/${filePath}`;
}

/**
 * Cheap authorization check that touches only the local database. Used to prune
 * cache entries whose underlying media has since been deleted, without paying a
 * storage round trip per entry.
 */
export async function isPubliclyServable(filePath: string): Promise<boolean> {
  if (!isSafeMediaPath(filePath)) return false;

  const normalizedPath = normalize(filePath);
  if (!normalizedPath.startsWith("/objects/")) {
    // Not a private-dir object; the public search paths govern it and the
    // storage lookup itself is the authority.
    return true;
  }

  const [registered] = await db
    .select({ id: mediaFilesTable.id })
    .from(mediaFilesTable)
    .where(eq(mediaFilesTable.objectPath, normalizedPath));

  return Boolean(registered);
}

/**
 * Resolve a public-object request to a storage file.
 *
 * Public search paths are consulted FIRST, preserving the precedence the route
 * has always had: if a path exists in both a configured public location and the
 * private dir, the public copy wins.
 */
export async function resolvePublicFile(filePath: string): Promise<File | null> {
  if (!isSafeMediaPath(filePath)) return null;

  const fromPublic = await objectStorageService.searchPublicObject(filePath);
  if (fromPublic) return fromPublic;

  const normalizedPath = normalize(filePath);
  if (!normalizedPath.startsWith("/objects/")) return null;

  if (!(await isPubliclyServable(filePath))) return null;

  try {
    return await objectStorageService.getObjectEntityFile(normalizedPath);
  } catch {
    return null;
  }
}

/**
 * Fetch the bytes of a publicly servable object, or null when the path is not
 * authorized or does not exist. This is the ONLY way bytes should ever enter
 * the public media cache.
 */
export async function fetchPublicMedia(
  filePath: string,
): Promise<{ body: Buffer; contentType: string } | null> {
  const file = await resolvePublicFile(filePath);
  if (!file) return null;

  const response = await objectStorageService.downloadObject(file, undefined, {
    forcePublic: true,
  });
  const body = Buffer.from(await response.arrayBuffer());
  const contentType =
    response.headers.get("content-type") ?? "application/octet-stream";
  return { body, contentType };
}
