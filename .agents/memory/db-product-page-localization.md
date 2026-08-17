---
name: DB product page localization
description: Locale publish rules and untrusted-CMS-content policy for database-driven product pages.
---

## A language is published or it is not served

Translated body content lives alongside the Turkish source, and a locale counts as published only when it has BOTH translated body content and its own localized title. Missing translations resolve to absent, never to the Turkish source value.

**Why:** A partially-translated page that self-canonicalises invites search engines to index Turkish copy as the English/German version. Silent fallback to the source language is worse than serving nothing, because it looks correct to everyone except the reader.

**How to apply:** Sitemap generation, static prerendering, and the runtime page must all call one shared eligibility helper — never re-derive it locally, or build-time and runtime disagree and hydration overwrites the baked head. Unpublished locale URLs get a not-found state with noindex, no canonical, and no hreflang alternates.

**Data asymmetry to re-check before tightening:** products carry localized titles, categories carry none. Requiring localized category names would unpublish every currently-translated page.

## CMS text is untrusted at every sink, and containment is not validation

Admin-authored strings reach two dangerous sinks: they become part of a build-output file path, and they are inlined into public HTML.

**Why:** Two real defects, both from trusting the writer:
- Inline JSON-LD needs script-safe escaping. `JSON.stringify` does not escape `</script>`, so a product title can close the tag and inject markup into every prerendered page.
- A path guard that only asks "does this resolve inside the output directory?" is insufficient. A slug of `../en` stays inside the tree yet resolves to the English home page's file and overwrites it. The guard must assert the path is exactly the one the route names — validate each segment and reject empty, `.`, and `..` — not merely that it landed somewhere acceptable.

**How to apply:** Validate at the write boundary AND independently at the sink; the build must not assume the API is the only way rows enter the database. When published data violates the contract, fail the build loudly rather than skipping the row — invalid data means something bypassed the API, and a silent skip hides that. Any new DB-driven route that becomes a prerendered file needs the same treatment.
