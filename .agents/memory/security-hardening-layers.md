---
name: Security hardening layers
description: Summary of what was hardened in the CMS/API security pass and what remains deferred — so future work starts from the right baseline rather than re-discovering it.
---

# Security hardening layers

## Applied hardening (all in production code)

**app.ts**
- Helmet, trust-proxy-1, x-powered-by off, allowlist CORS, 1 MB body cap, global per-IP rate limit (`/api`), last-resort opaque error handler.

**auth.ts**
- JWT: HS256 only, 8 h lifetime, issuer + audience checked.
- `requireAuth` re-loads admin from DB on every request (deleting account = immediate revocation).
- `isAdminRequest` helper for dual-view endpoints (returns public-safe data to anon, full data to admin).
- Dummy bcrypt compare uses `randomUUID()` per process — no fixed credential in source.

**security.ts**
- Rate limiters: `loginRateLimiter`, `mediaUploadRateLimiter`, `publicSubmissionRateLimiter`, `publicLookupRateLimiter`, `expensiveAdminRateLimiter`.
- `validateMediaUploadMetadata`: MIME/extension match, 15 MB cap, filename character safety.
- `parsePageLimit` / `parseLimitOffset`: clamp `limit` to 200, reject negative page/offset — prevents unbounded table pulls.

**ID parsing**
- All `parseId` helpers replaced with `Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0` — NaN/float/negative never reach SQL.

**Draft/published enforcement (server-side)**
- `GET /products`: anonymous callers always get `published=true`, sets `Vary: Authorization`.
- `GET /news`: same pattern (was already there, confirmed correct).
- `GET /sliders`: inactive sliders hidden from anon callers regardless of `activeOnly` param.
- `GET /catalogs`: inactive catalogs hidden from anon callers.

**Public form inputs**
- `POST /quotes`: `publicSubmissionRateLimiter`, field length caps, generic error message.
- `POST /warranty/devices/:id/claims`: `publicSubmissionRateLimiter`, device existence check, field length caps.
- Public lookups (`/warranty/devices/by-serial/:sn`, `/by-qr/:qr`, `/service-reports/public/*`): `publicLookupRateLimiter`, token/serial length cap.

**Audit logging**
- `admin_audit_logs` table with `writeAdminAuditLog` helper.
- Covers: login (success/failure), admin create/delete/change-password, settings update, product/category/news/slider/reference/catalog/certificate/media delete.

**Settings redaction**
- `GET /settings` anon: excludes keys matching `secret`, `password`, `token`, `api_key`, `smtp` patterns.

**Storage**
- Presigned upload URL endpoint: auth + rate limit gate.
- Private-object fallback on `/storage/public-objects/*`: only serves paths registered in `media_files`.
- Path traversal (`..`, `\0`) rejected before storage layer.

**Dependencies updated**
- `react-router-dom` bumped to 7.18.0 (CVE-2026-55685 fix).
- `multer` 2.2.0, `nodemailer` 9.0.1, `vite` 7.3.5.

## Still deferred (tracked as follow-up tasks)

- **Admin token storage**: `localStorage` JWT → HttpOnly + SameSite=Strict cookie (Task #110).
- **Audit log viewer in admin panel** (Task #111).
- **Automated tests for draft-visibility guards** (Task #112).
- **Fine-grained admin role separation**: all authenticated admins have the same privileges; no per-user or per-operation access control beyond "admin or not".

**Why:** Each of these is a significant standalone piece of work. They were descoped from the initial security pass to keep it reviewable and land cleanly.
