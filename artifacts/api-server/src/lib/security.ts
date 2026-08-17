import { rateLimit } from "express-rate-limit";

const MAX_PAGE_LIMIT = 200;

/**
 * Clamp client-supplied paging. Without an upper bound, `?limit=1000000` lets
 * any caller pull a whole table in one request.
 */
export function parsePageLimit(
  query: Record<string, unknown>,
  defaultLimit: number,
): { limit: number; offset: number } {
  const pageRaw = Number.parseInt(String(query["page"] ?? "1"), 10);
  const limitRaw = Number.parseInt(String(query["limit"] ?? String(defaultLimit)), 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, MAX_PAGE_LIMIT) : defaultLimit;
  return { limit, offset: (page - 1) * limit };
}

/**
 * Same clamping for endpoints that take an explicit `offset` instead of a page.
 */
export function parseLimitOffset(
  query: Record<string, unknown>,
  defaultLimit: number,
): { limit: number; offset: number } {
  const limitRaw = Number.parseInt(String(query["limit"] ?? String(defaultLimit)), 10);
  const offsetRaw = Number.parseInt(String(query["offset"] ?? "0"), 10);
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, MAX_PAGE_LIMIT) : defaultLimit;
  const offset = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0;
  return { limit, offset };
}

const MAX_MEDIA_UPLOAD_BYTES = 15 * 1024 * 1024;
const MAX_FILENAME_LENGTH = 180;

const allowedMediaTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "application/pdf",
]);

const extensionByType: Record<string, RegExp> = {
  "image/jpeg": /\.(jpe?g)$/i,
  "image/png": /\.png$/i,
  "image/webp": /\.webp$/i,
  "image/avif": /\.avif$/i,
  "application/pdf": /\.pdf$/i,
};

export function validateMediaUploadMetadata(input: {
  name: string;
  size: number;
  contentType: string;
}): { ok: true } | { ok: false; error: string } {
  const name = input.name.trim();
  const contentType = input.contentType.trim().toLowerCase();

  if (!name || name.length > MAX_FILENAME_LENGTH || /[\u0000-\u001f\\/:]/.test(name)) {
    return { ok: false, error: "Geçersiz dosya adı" };
  }
  if (!Number.isSafeInteger(input.size) || input.size < 1 || input.size > MAX_MEDIA_UPLOAD_BYTES) {
    return { ok: false, error: "Dosya boyutu 15 MB'dan küçük olmalı" };
  }
  if (!allowedMediaTypes.has(contentType)) {
    return { ok: false, error: "Bu dosya türüne izin verilmiyor" };
  }
  if (!extensionByType[contentType]!.test(name)) {
    return { ok: false, error: "Dosya uzantısı içerik türüyle eşleşmiyor" };
  }

  return { ok: true };
}

/**
 * Blanket ceiling for every API call. Generous on purpose: a single page view
 * fans out into several requests and an office NAT shares one IP. It exists to
 * stop scraping and brute-force floods, not to shape normal traffic.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin." },
});

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Çok fazla giriş denemesi yapıldı. Lütfen daha sonra tekrar deneyin." },
});

export const mediaUploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Çok fazla dosya yükleme isteği gönderildi. Lütfen daha sonra tekrar deneyin." },
});

/**
 * Anonymous form submissions (quote requests, warranty claims). Tight enough
 * to stop scripted spam, loose enough for a shared office IP.
 */
export const publicSubmissionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Çok fazla form gönderimi yapıldı. Lütfen daha sonra tekrar deneyin." },
});

/**
 * Anonymous lookups by serial number / QR token. These are guessable
 * identifiers, so throttle enumeration attempts.
 */
export const publicLookupRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Çok fazla sorgu yapıldı. Lütfen daha sonra tekrar deneyin." },
});

export const expensiveAdminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Bu işlem için istek sınırı aşıldı. Lütfen daha sonra tekrar deneyin." },
});