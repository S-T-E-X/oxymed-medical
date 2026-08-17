# Threat Model

## Project Overview

Oxymed Medikal is a Turkish corporate website with a full CMS backend. Public visitors
browse products, references, news, catalogs and warranty/service information, and submit
quote requests and warranty claims. A small number of company staff sign into an admin
panel to manage every piece of site content, plus production orders, stock, quote forms,
service reports and warranty devices.

Stack: React 19 + Vite SPA, Express 5 API, PostgreSQL via Drizzle ORM, Replit Object
Storage (GCS) for media, SMTP for outbound mail, OpenAI via the Replit AI proxy for
translation. Authentication is JWT bearer tokens issued to admin accounts; there are no
end-user accounts.

## Assets

- **Admin credentials and sessions** — bcrypt password hashes in `admin_users` and the
  signed JWTs derived from them. A single compromised admin account grants full control
  over every page of the public site, all customer submissions, and the production and
  warranty records.
- **Customer PII** — quote requests (name, e-mail, phone, company), warranty claims
  (claimant contact details, fault descriptions), warranty device owners (customer firm,
  installation site) and service reports. This is the most sensitive data the system holds
  and it is entered by anonymous visitors through public forms.
- **Business data** — product catalog, pricing inside quote forms, production orders, BOM
  and material stock, supplier-facing service reports. Exposure would leak commercial
  terms; tampering would corrupt manufacturing records.
- **Application secrets** — `DATABASE_URL`, `JWT_SECRET`, SMTP credentials, object storage
  configuration and the AI proxy key. All are supplied as environment secrets and must
  never reach a response body, a log line, or the client bundle.
- **Stored media** — uploaded images, catalog PDFs and generated quote/service PDFs in
  object storage. The private object dir also holds objects that were never intended for
  publication.

## Trust Boundaries

- **Browser to API** — every request from the SPA and from anonymous visitors crosses this
  boundary. The client is untrusted; all validation, authorization and business rules are
  enforced server-side in `artifacts/api-server/src/routes/`.
- **Anonymous to authenticated** — content reads, quote submission, warranty claim
  submission, serial/QR lookup and analytics tracking are public. Everything else requires
  `requireAuth`. Draft/unpublished content must not cross this boundary.
- **API to PostgreSQL** — the API holds full database credentials. All access goes through
  Drizzle's parameterized query builder; there is no string-concatenated SQL.
- **API to object storage** — the server mints presigned PUT URLs. A presigned URL is a
  write capability against the project's bucket, so issuing one is an authenticated,
  rate-limited operation.
- **API to external services** — SMTP and the OpenAI proxy are called with secrets held
  server-side. Admin-triggered outbound mail and AI translation are the only paths that
  reach them.
- **Development to production** — the dev workspace and the published deployment share the
  same codebase but have separate databases and secrets. Seeded default credentials are a
  development convenience and must be rotated before or immediately after publishing.

## Scan Anchors

- Production entry points: `artifacts/api-server/src/app.ts` (middleware chain, CORS, body
  limits, global rate limit, error handler) and `artifacts/api-server/src/routes/index.ts`
  (route registration).
- Highest-risk code: `routes/auth.ts` (login, admin user management), `routes/storage.ts`
  and `routes/media.ts` (upload URLs, object serving, ImageMagick conversion),
  `routes/settings.ts` (key-value site config), `routes/quotes.ts`, `routes/warranty.ts`
  and `routes/service-reports.ts` (anonymous input and public lookups),
  `lib/auth.ts` (JWT verification), `lib/objectStorage.ts`.
- Public surfaces: content GETs (products, categories, sliders, news, references,
  catalogs, certificates, corporate, settings), `POST /api/quotes`,
  `POST /api/warranty/devices/:id/claims`, `POST /api/analytics/track`, warranty and
  service-report lookups by serial number / QR token / verification token, and
  `GET /api/storage/public-objects/*`.
- Admin surfaces: everything behind `requireAuth`, including all CMS mutations, media
  management, production, stock, quote forms, e-mail logs and SMTP testing.
- Usually out of scope: `artifacts/mockup-sandbox` is a design-time preview server and is
  not part of the published product.

## Threat Categories

### Spoofing

Admin identity rests entirely on a bearer JWT. Tokens MUST be verified with a fixed
algorithm (HS256) and matching issuer and audience, so a token signed for another purpose
cannot be replayed here. A valid signature alone is not sufficient: every authenticated
request MUST re-load the admin account from the database, so deleting an account revokes
its outstanding tokens immediately. Token lifetime is bounded (hours, not days). The login
endpoint MUST return the same error and take the same time whether the e-mail exists or
not, so it cannot be used to enumerate staff accounts, and it MUST be rate limited per IP.

### Tampering

All CMS content, pricing and production data is writable only through authenticated
routes. Every mutation body MUST be parsed with a Zod schema before it reaches the
database, and every path identifier MUST be validated as a positive integer rather than
passed through a bare `parseInt` — a `NaN` reaching a query is a bug, not a filter. Public
submissions MUST NOT be able to create rows that reference non-existent parents (a
warranty claim is rejected unless its device exists). Setting keys MUST match a restrictive
character pattern, since they are used as object keys on the public site.

### Repudiation

Sensitive admin operations — login attempts, admin account creation and deletion, password
changes, settings updates, and deletion of products, categories, news, sliders,
references, catalogs, certificates and media — MUST be recorded in `admin_audit_logs` with
the acting admin id, action, target and timestamp. Audit writes MUST be best-effort: a
logging failure is reported to the server log but never blocks or reverses the operation
the admin requested.

### Information Disclosure

Unpublished and draft content MUST NOT be reachable without a valid admin token; the
published/draft filter is applied server-side, not in the client. The anonymous
`/api/settings` response MUST exclude internal keys (anything matching secret, password,
token, api key or SMTP patterns) while still serving the site copy the public pages need.
Error responses to anonymous callers MUST be generic: raw Zod parser output and stack
traces reveal internal field structure and MUST NOT be echoed. The global error handler
MUST convert every unhandled exception into an opaque 500 while logging the detail
server-side. Request logs MUST redact `authorization` and `cookie` headers. The public
object route MUST serve private-bucket objects only when the object path is registered in
`media_files`, so unregistered private objects cannot be reached by guessing a path, and
path traversal sequences MUST be rejected before reaching the storage layer.

### Denial of Service

The API is exposed to the open internet with no CDN in front of it. A global per-IP rate
limit MUST apply to `/api`, with tighter limits on the paths that cost the most or are the
most attractive to abuse: login, anonymous form submission, serial/QR enumeration, media
upload URL issuance, and expensive admin operations (image conversion, SMTP tests).
Request bodies MUST be capped (1 MB JSON) and uploads validated to a maximum size before a
presigned URL is issued. Every list endpoint MUST clamp client-supplied `limit`/`offset`
so a single request cannot pull an entire table. Free-text fields on public forms MUST
have explicit maximum lengths.

### Elevation of Privilege

There is a single admin role: any authenticated admin can perform any admin action. The
guarantee the system upholds today is narrower — an admin MUST NOT be able to change
another admin's password (only their own, and only after re-entering their current
password), and an admin MUST NOT be able to delete the last remaining account. Presigned
upload URLs MUST be issued only to authenticated callers. Uploaded media MUST be validated
for declared MIME type, matching file extension, and size, and filenames MUST be rejected
if they contain path separators or control characters. Server-side image conversion runs
an external binary against stored objects; its inputs MUST come from registered media rows
rather than from client-supplied paths.
