---
name: Self-hosting this project outside Replit
description: What actually breaks when the site is moved to a plain Ubuntu VPS, and which parts are portable. Read before promising a customer that the app can be self-hosted.
---

## The one blocking dependency: object storage

Uploaded media (product/slider/news images, catalog and certificate PDFs) is served
through the API's object-storage layer, which authenticates and signs URLs against a
**Replit-only sidecar on `127.0.0.1:1106`**. There is no environment variable that
redirects it — the host is a constant, and the code raises "make sure you're running on
Replit" when the sidecar is absent.

Compounding this: image locations are persisted in the DB as `/api/storage/public-objects/...`
paths (and at least one row holds a full absolute `*.replit.dev` URL). So moving the DB
moves the broken references with it — **existing** images break, not just new uploads.

**Why:** the storage layer was written against the Replit sidecar contract, not against a
generic S3/GCS client, so it has no credential path of its own.

**How to apply:** any "can we host this ourselves?" answer must state up front that media
is the blocker and needs either real GCS credentials wired into the storage layer, a
local-disk rewrite, or staying on Replit. Everything else — pages, i18n, admin, quotes,
Postgres, prerendered SEO — is portable with only env vars and a reverse proxy.

## Other Replit couplings worth knowing

- **Auth cookie is unconditionally `secure: true`** → a self-hosted deployment must have
  HTTPS before admin login works at all. There is no dev/prod branch on this.
- **PDF generation** falls back to a hardcoded `/nix/store/...` chromium path; outside
  Replit `CHROMIUM_PATH` must be set explicitly (Ubuntu's snap-packaged chromium does not
  work headless — a real Chrome `.deb` does).
- **AI translation** goes through the Replit AI proxy; self-hosting needs the operator's
  own OpenAI key and base URL.
- **`vite.config.ts` imports the Replit runtime-error plugin unconditionally**, so the
  plugin must stay installed even on a VPS build (cartographer/dev-banner are correctly
  gated behind `REPL_ID`).
- **CORS** is permissive when `ALLOWED_ORIGINS` is empty — self-hosted deployments must
  set it, or any origin is accepted.

## Deployment shape that works

The web artifact is **fully static** after build; there is no Node server for it in the
repo. Only the API is long-running. So: nginx serves `dist/public` with
`try_files $uri $uri/index.html $uri.html /index.html`, proxies `/api/` to the API port,
and the API runs under systemd with an `EnvironmentFile`. Nothing in the project loads
`.env` itself — env must come from systemd or the shell.

Because pages are prerendered at build time, **content edits in the admin panel do not
appear in the static HTML until the site is rebuilt**. Any self-hosting plan needs a
rebuild trigger (cron or manual) or the SEO benefit silently goes stale.
