---
name: Static SEO / prerender pipeline
description: Why DB-driven pages need a build-time head, and the rule that runtime and build-time must advertise an identical language set.
---

The site is a client-rendered SPA, so crawlers get correct metadata only because a build step bakes a per-URL `<head>` into the emitted HTML. A new DB-driven page type must be threaded through every stage — URL/language selection, the handoff data, the head-baking step, and the verifier that fails the build when a stage was missed.

**Why:** skipping a stage fails silently. The build stays green and the page still works for humans, so the gap surfaces only as lost rankings, long after the change.

## Runtime and build-time must advertise the identical language set

Eligibility — "does this record have real content in this language?" — belongs in exactly ONE dependency-free shared module that the browser bundle, the build scripts, and the API all import. Never re-derive it on one side.

**Why:** after hydration the client rewrites the baked `<head>`. If the runtime derives languages from the global locale list while the build derives them from actual content, hydration silently replaces a correct baked head with links to versions that were never published. Only a crawler executing JS sees it.

**How to apply:** the alternate-locale OG tags must come from the page's resolved alternate set rather than the global locale list — same failure mode, different tag — and the default-language fallback entry should exist only when the default language itself qualifies. Assert in the verifier that the baked set is *exactly* the expected set; a superset check misses the bug, because advertising extra languages is the bug. Verify the hydrated head, not just the built file.
