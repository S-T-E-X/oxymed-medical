/**
 * Return a media URL that is safe to use from the current site.
 *
 * Older database rows may contain an absolute Replit URL for an object that
 * is now served by this VPS.  Storage object URLs are portable, so keep only
 * their path and let the browser resolve it against the current host.
 * External URLs that are not our storage endpoint remain untouched.
 */
export function publicMediaUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const raw = value.trim();
  if (!raw) return undefined;

  const normalizePath = (path: string, search = "") => {
    const match = path.match(/\/api\/storage\/public-objects\/(.+)$/);
    if (!match) return null;
    return `/api/storage/public-objects/${match[1].replace(/^\/+/, "")}${search}`;
  };

  if (raw.startsWith("/")) {
    return normalizePath(raw) ?? raw;
  }
  if (raw.startsWith("public-objects/")) {
    return `/api/storage/${raw}`;
  }
  if (raw.startsWith("objects/uploads/")) {
    return `/api/storage/public-objects/${raw}`;
  }

  try {
    const parsed = new URL(raw, "https://oxymed.invalid");
    return normalizePath(parsed.pathname, parsed.search) ?? raw;
  } catch {
    return raw;
  }
}