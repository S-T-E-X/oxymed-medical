---
name: Public media cache and its authorization invariant
description: Why object-storage images are cached on disk, and the single-gate rule that keeps the cache from becoming a private-bucket bypass.
---

# Public media cache

## The latency problem it solves

Serving one image straight out of Replit object storage costs several *sequential*
round trips through the storage sidecar (an existence probe per public search path,
a metadata fetch, then the read stream). Measured end to end that is **3–4.5 seconds
of time-to-first-byte for a 65 KB image**, paid on every request.

`Cache-Control: immutable` alone does not fix this. It only helps a client that has
already fetched the file once — it does nothing for a first-time visitor, for
Googlebot (which does not reuse a warm HTTP cache across crawls), or for the
prerender pass. Those are exactly the requests whose latency shows up in Core Web
Vitals and crawl budget.

The fix is a server-side on-disk cache plus a startup warmer. Warm hits serve in
~2–3 ms.

## The invariant — read this before touching anything media-related

**The request fast path serves a cache hit without re-checking authorization.
Therefore the cache is only as safe as its least careful writer.**

Two code paths write into it: the request handler and the background warmer. A
warmer that fetched objects directly — bypassing the `media_files` registration
check — would let any CMS URL pointing at an unregistered private object prime the
cache and expose it publicly through the unauthenticated route. That bug was
written and caught in review; it is the reason the authorization logic lives in one
shared module rather than being reimplemented per call site.

**Rule: bytes may only enter the public media cache through the single shared
authorization gate.** If you add a third writer (a prefetcher, a resize pipeline, an
import script), route it through that same gate. Never call the object-storage
entity fetch directly and then cache the result.

The gate enforces: objects under the configured public search paths are public by
configuration; objects in the private dir are served **only** when an admin has
registered them. Public search paths are consulted first, so a path present in both
resolves to the public copy.

## Revocation is the weak spot

Cached entries are deliberately long-lived because uploaded objects are
content-addressed by a UUID and never change. Deletion is the only event that
invalidates them, and it only reaches the instance that handled the delete.

Mitigations in place: explicit invalidation on media delete, plus a periodic pass
that re-checks everything already cached against the current allowlist and prunes
what is no longer servable. That bounds how long a revoked object survives on any
other instance to one prune interval.

Still true and worth knowing: the long `immutable` max-age means a browser or CDN
that already downloaded a since-deleted object can keep serving it. That predates
the cache and is inherent to content-addressed immutable URLs — if an object ever
needs hard revocation, it must be deleted from the bucket, not just unregistered.

**Why:** a public, unauthenticated route in front of a private bucket is the highest
-consequence surface in this app. The single-gate rule is what makes it auditable.

**How to apply:** any change that adds a caller which reads private-dir objects, or
that adds a new way to serve media, must go through the shared gate and must be
tested with an unregistered-but-existing object (expected: 404, and nothing written
to the cache).

## Stored media URLs must be relative and canonical

Media URLs are persisted in the database, so a malformed one is durable and silent.
Two failure modes have actually occurred, both from admin surfaces building the URL
string by hand:

- **A doubled slash** (`public-objects//objects/...`) is a *different cache key* from
  the canonical form. The row still renders, so nothing looks broken — but the
  warmer, which matches the canonical prefix, never covers it, and every cold hit
  pays the full multi-second storage round trip. This is invisible unless you time
  the individual URLs.
- **An absolute URL embedding the current Replit dev domain** works in the workspace
  and 404s in production, because that hostname is temporary.

The route now collapses leading slashes before deriving the cache/dedupe/auth key,
and the admin surfaces share one URL builder instead of concatenating their own.

**Why:** both bugs render fine in the workspace and only surface as "one image is
slow" or "one image is broken on the live site" — the kind of thing that survives
for months.

**How to apply:** never build a public media URL inline; use the shared builder. When
media appears slow, time the *individual* stored URLs rather than the page — a
single non-canonical row is enough to look like a general regression. A scan for
`replit.dev` and `public-objects//` across media columns catches both classes.
