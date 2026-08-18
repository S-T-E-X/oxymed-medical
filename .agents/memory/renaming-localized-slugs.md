---
name: Renaming a localized URL slug
description: How to rename a product page's URL segment across locales without breaking inbound links or admin routing.
---

# Renaming a localized URL slug

Renaming a page's URL segment touches three separate concerns that are easy to
conflate.

**1. The URL slug table is mirrored in four files.** App routing, sitemap
generation, prerendering and prerender verification each carry their own copy.
Change all four or the sitemap will advertise URLs the app cannot resolve.

**2. Old URLs must keep resolving.** Keep the previous slugs in a legacy table
and generate explicit redirect routes from them to the new paths. Register those
redirects *before* the catch-all 404 route, otherwise renamed pages return
"not found" for every inbound link and ranking signal already in the index.

**3. The database `page_slug` is NOT the URL slug.** The lookup that maps a
product row to its hardcoded page component keys off the Turkish **database**
slug, not the URL segment. So a URL rename does not break product-card links,
and conversely renaming the database slug silently breaks admin routing and the
product-card → page mapping.

**Why:** these three were designed to be independent so marketing can rename a
public URL without a data migration. The cost is that "rename the slug" means
different things in different layers, and only the redirect layer is
externally visible when it is wrong.

**How to apply:** after any rename, rebuild and assert that the old slug appears
zero times in the generated sitemap, the new slug appears once per locale, and
the prerendered page count is unchanged.
