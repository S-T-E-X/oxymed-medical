---
name: News multilingual model
description: How news articles are translated per locale, and the rules that keep untranslated languages from leaking Turkish content or dead URLs.
---

# Turkish source row + per-locale translation rows

News uses a **row-per-language** model, unlike sliders/products which use per-locale
*columns*. The Turkish article is the source row; every other language is its own
translation row (own title, slug, excerpt, content, category, published flag, SEO fields).

**Why:** article bodies are long free text and each language needs its own URL slug and
its own publish schedule. Widening the table to 11 columns per field (as sliders did)
does not work when each language must be independently publishable and independently
addressable. Turkish is never stored as a translation row.

**How to apply:** when adding a field to an article, add it to BOTH the source row and
the translation row, or decide deliberately that it is shared (images are shared —
only text is translated).

# Foreign-language pages must fail closed

A non-Turkish list query INNER JOINs translations, so an untranslated article is simply
absent from that language. A foreign article URL with no published translation renders a
localized "not found", never Turkish text.

**Why:** serving Turkish copy on a `/de/...` URL is duplicate/mismatched-language content
that search engines penalise, and it looks broken to visitors.

**How to apply:** a language version is public only when the translation AND its source
row are both published. Unpublishing the Turkish source must hide every language. This
extends to *any* per-field fallback: an untranslated category is omitted rather than
falling back to the Turkish label, and category filtering matches only the localized
value. A "harmless" field-level fallback is still Turkish text on a foreign page.

# Draft visibility is decided by credentials, not by the query string

The news list is a single route serving both the public site and the admin table. It
must not trust a `published` query parameter from an anonymous caller — the parameter is
honoured only for a caller with a valid admin token, and forced to published-only for
everyone else. The same applies to fetching one article by id.

**Why:** an unauthenticated caller could otherwise ask for drafts directly and read
unpublished articles and draft translations through the public API.

**How to apply:** any public read whose result depends on credentials must also send
`Vary: Authorization`, or a shared cache can hand an admin's draft-bearing response to
an anonymous visitor. When adding a new public list route, decide the anonymous default
first, then widen it for admins — never the reverse.

# hreflang and the language switcher are data-driven

Static marketing pages exist in all 11 languages, so `alternatesFor(routeKey)` works for
them. Articles do not — each article has its own set of existing languages, so the API
returns an `alternates` list (locale + that language's slug) and the page feeds it
straight into hreflang, the sitemap, and the switcher.

**Why:** emitting hreflang for a language that 404s, or switching language onto a dead
article URL, is worse than offering fewer languages.

**How to apply:** never build article hreflang from the locale list. For a language with
no published translation the switcher falls back to that language's news *list*, not the
article URL. Pages register per-locale destinations through the locale-path override
context that the switcher reads.

# Slug uniqueness is per language, not global

The same slug may exist in two different languages; it may not be reused by two articles
within one language. Violations return 409 with a Turkish message the admin UI surfaces.

**How to apply:** auto-suggested slugs must never be empty — a naive slugify of an
Arabic/Georgian/Russian title strips to nothing, so fall back to a non-empty derived
value and let the admin edit it.

# DB-backed SEO must be generated inside the build, not by hand

Crawler-visible metadata for this site is baked into static HTML after the bundle
is built, because the app is a client-rendered SPA. Anything whose content lives in
the database therefore has to be pulled from the database *during the build*: the
sitemap step runs first and writes both the sitemap and a generated JSON handoff of
published article versions, then the prerender step turns each of those into a real
HTML file, then the verifier checks each one exists with its own title, canonical,
hreflang, og:type=article and JSON-LD.

**Why:** a checked-in sitemap and list-only prerendering silently rot — publishing,
unpublishing, retranslating or re-slugging an article left the deployed sitemap
advertising stale URLs while the article pages themselves served the bare SPA shell,
so social/link previews had no title or image.

**How to apply:** never hand-run the sitemap script as a release step and never
commit its output. The handoff file is generated, gitignored, and the prerender step
must hard-fail when it is absent rather than quietly emitting fewer pages — that
failure is the only thing preventing a silent regression to shell-only article pages.
Adding another DB-driven page type means extending the same three steps together.

# Sitemap counts are a floor, not a fixed grid

The prerender verifier used to assert `locales × routes` exactly. Article URLs come from
the database and vary per build, so the check is now a minimum.

**How to apply:** adding any DB-driven URL type to the sitemap means revisiting that
assertion instead of bumping a hardcoded number.
