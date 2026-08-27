/**
 * Build the public URL for an uploaded object.
 *
 * Two admin surfaces need this (the upload hook and the media library picker)
 * and they used to build the string independently. One of them concatenated a
 * path that already starts with "/" and produced `public-objects//objects/...`.
 * That double slash is not cosmetic: it is a different cache key from the
 * canonical form, so the affected image was never covered by the media cache
 * warmer and paid the full multi-second storage round trip on every cold hit.
 *
 * The URL must also stay RELATIVE. Pasting an absolute URL that embeds the
 * current Replit dev domain bakes a temporary hostname into the database, and
 * the image 404s once the site is served from its real domain.
 */
export function publicMediaUrl(objectPath: string): string {
  return `/api/storage/public-objects/${objectPath.replace(/^\/+/, "")}`;
}
