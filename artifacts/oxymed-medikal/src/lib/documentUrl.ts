/**
 * Convert a stored document path into a browser-readable public URL.
 *
 * Older catalog records stored the repository path
 * `artifacts/<artifact>/public/...` instead of the public asset path.
 * Keep accepting absolute/external and storage API URLs unchanged.
 */
export function resolvePublicDocumentUrl(value: string): string {
  const url = value.trim();
  if (!url) return url;

  if (
    url.startsWith("/") ||
    /^(?:https?:|\/\/|data:|blob:)/i.test(url)
  ) {
    return url;
  }

  const publicMarker = "/public/";
  const markerIndex = url.indexOf(publicMarker);
  if (markerIndex >= 0) {
    return `/${url.slice(markerIndex + publicMarker.length)}`;
  }

  return `/${url}`;
}