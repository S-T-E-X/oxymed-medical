---
name: Changing the canonical site origin
description: Every place the site's own domain is baked in, and why a client-side change alone is not a domain migration.
---

## The rule

The canonical origin is **not** a single constant. Changing the site's domain means
changing it in the browser config, the sitemap generator, the prerenderer, the prerender
verifier, and `robots.txt` — the build scripts each read `SITE_ORIGIN` with their **own
hardcoded default**, so missing one produces a build that silently emits the old host in
`sitemap.xml` or in baked `<link rel="canonical">` tags while the running app says
something else.

**Why:** the prerender pipeline runs as standalone Node scripts outside the Vite bundle,
so they cannot import the app's config; each duplicates the default. Two env vars exist
for the same value — `SITE_ORIGIN` for build-time scripts and `VITE_SITE_ORIGIN` for the
browser bundle — and setting only one gives a split-brain deployment.

**How to apply:** when the domain changes, grep for the old host across the whole repo
including `.mjs` build scripts and `public/robots.txt`, and set both env vars at deploy
time. Never assume a single edit to the app config covers it.

## Displaying the domain in UI/print output

Quote and print templates need the bare hostname (no scheme) as visible text. Derive it
from the configured origin rather than typing the domain into JSX — otherwise every
future domain change leaves stale strings in customer-facing PDFs, which nobody notices
until a customer calls the wrong address.

## What a domain change does NOT do

Client-side canonical tags cannot redirect a retired host. `www` and apex both answering
200 with identical content is a duplicate-content split that only an HTTP 301 at the
edge/reverse proxy can fix. Treat that as a separate, infra-side action item and say so
explicitly — it is invisible from inside the codebase and easy to assume was handled.
