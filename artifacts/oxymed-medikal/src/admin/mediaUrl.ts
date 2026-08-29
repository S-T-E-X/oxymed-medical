import { publicMediaUrl as normalizePublicMediaUrl } from "../lib/mediaUrl";

/**
 * Build the canonical relative URL for an uploaded object.
 * Existing absolute storage URLs are normalized as well, so old records do
 * not keep pointing at a temporary Replit hostname.
 */
export function publicMediaUrl(objectPath: string): string {
  const normalized = normalizePublicMediaUrl(objectPath);
  if (normalized?.startsWith("/api/storage/public-objects/")) return normalized;
  return `/api/storage/public-objects/${objectPath.replace(/^\/+/, "")}`;
}
