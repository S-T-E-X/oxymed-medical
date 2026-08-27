---
name: Self-hosting this project outside Replit
description: The deployment constraints for moving the site to a plain Ubuntu VPS. Read before promising a customer that the app can be self-hosted.
---

## Media on a self-hosted VPS

Uploaded media (product/slider/news images, catalog and certificate PDFs) is served
from the application's local persistent media directory. The URL shape remains
`/api/storage/public-objects/objects/uploads/<UUID>`, so existing database references do
not need a mass rewrite when the media archive is restored onto the VPS.

**Rule:** keep this legacy URL routed through the API rather than Nginx directly aliasing the
media directory.

**Why:** public object names are extensionless UUIDs, so Nginx cannot infer their response MIME
type; more importantly, only the API can check the `media_files` registration allowlist. A
direct alias could expose orphaned/manual files on disk.

**How to apply:** set `MEDIA_STORAGE_DIR` to an absolute persistent directory outside the
release tree, restore the verified media archive there, grant write access only to the API
service user, and proxy `/api/` normally. API startup reconciles interrupted staging/trash
operations before it accepts traffic.

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
