---
name: Chromium / Puppeteer PDF generation
description: How chromium is set up for PDF generation via puppeteer-core in the API server
---

# Chromium path for puppeteer-core

`@sparticuz/chromium-min` does NOT work in Replit — its `bin/` directory is absent so `executablePath()` throws.

**Fix:** Install `chromium` as a Nix system dep and use its path directly.

```
installSystemDependencies({ packages: ["chromium"] })
```

Installed path (may change after Nix updates):
`/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium`

The code reads `process.env["CHROMIUM_PATH"]` first, then falls back to the hardcoded nix store path. If it ever breaks, run `which chromium` to get the new path.

**Why:** @sparticuz/chromium-min requires its own binary download which doesn't happen in Replit's environment. System chromium installed via Nix works fine.

**How to apply:** Both `/service-reports/:id/generate-pdf` and `/service-reports/:id/send-email` routes in `artifacts/api-server/src/routes/service-reports.ts` use this pattern.
