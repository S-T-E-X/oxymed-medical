---
name: Adding a site locale
description: Everything that enumerates locales on the Oxymed site, and the two traps that let a half-added locale look like it worked.
---

# Adding a locale

Adding a language is not a config change — the locale list and the localized
URL-slug table are duplicated across the app, the SEO build pipeline, the
hand-maintained API contract and the database.

**Why:** the slug table is deliberately mirrored in four files so the build
scripts stay dependency-free (they cannot import the app's TS module). Nothing
enforces the mirroring, so a missed copy produces a locale whose pages build but
whose sitemap or prerendered head is wrong.

**How to apply:** when adding locale `X`, sweep for the existing locale list and
mirror it in all of these:

- app locale list + locale metadata (`dir`, `ogLocale`, native name)
- the localized slug table in the app **and** in each build script that
  reproduces it (sitemap generator, prerenderer, prerender verifier) — the
  prerenderer also keeps its own trimmed locale-metadata map
- the language-suggestion banner's per-locale copy
- per-locale Drizzle columns for slider / product / category text, then push and
  restart the API server (see `api-server-schema-reload.md`)
- `lib/api-spec/openapi.yaml` and the generated clients under
  `lib/api-client-react` and `lib/api-zod` — these are generated files with **no
  codegen script wired up**, so they are edited by hand and must be kept
  consistent with the Drizzle columns
- the API routes' own runtime Zod request bodies. These are separate from the
  generated client types, and Zod strips unknown keys, so a locale missing here
  type-checks everywhere and still discards the new language on save — the
  failure is silent, with no error in any log
- the admin edit form's per-locale field list *and* its form type/initial-state/
  load/submit blocks
- the translation scripts' target-language lists

Namespace dictionaries do **not** need registering: they are picked up by an
`import.meta.glob` over the locales directory, and a missing namespace silently
falls back to Turkish.

## Two traps

**Scripted insertion into compact object literals.** The slug tables in the
build scripts pack several keys per line. Anchoring an insertion on the last key
of a line and copying "the indentation" copies the *preceding keys on that line*
too. JS accepts duplicate object keys silently, so the build still passes and
emits correct output — only `tsc` catches it. Verify by counting keys per record,
not by checking that the build succeeded.

**`pnpm -r run typecheck` is not the typecheck.** It runs each package's own
script and skips the root `tsc --build` that rebuilds the workspace libraries, so
the artifacts typecheck against stale `.d.ts` in `dist/` and real errors vanish.
Always use the root `pnpm run typecheck`.

## Verification

The prerender verifier prints the page count; it must equal
`locales × static routes` plus translated news articles plus DB product pages.
After adding a 12th locale to 10 static routes the static count moves 110 → 120.
