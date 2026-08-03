---
name: Generic DB-driven product page template
description: Preferred path for adding new admin-manageable product pages in oxymed-medikal, vs. the legacy hardcoded-page pattern.
---

The site has two coexisting product page systems:
1. **Legacy hardcoded pages** (e.g. gas control panel, amalgam separator, vacuum pump/system) — fixed React components + routes in `App.tsx`, editable copy stored in the generic key-value settings store, each needing its own bespoke admin sub-page.
2. **Generic DB-driven system** — `productsTable.pageData` (features, detailCards, useCases, advantages, featureTiles, faq, specs, etc.), rendered by a single reusable `ProductDetailPage` at route `/urunler/:slug`, fully editable today through the existing generic `/admin/products` + `ProductEditPage` UI with zero extra admin code.

**Decision:** for any new admin-manageable product page request, use path (2) — build/extend the generic template rather than hand-rolling another bespoke hardcoded page + custom admin sub-page. This is now wired up and is the default going forward.

**Why:** path (2) was already fully built on the data/admin side but the public render route was never finished; finishing it once means all future products (not just the one requested) get an admin-editable page for free, instead of accumulating more one-off bespoke pages each needing their own admin UI.

**Gotcha found while wiring this up:** the `/api/products` list endpoint used Drizzle's `$dynamic()` query builder and called `.where()` twice (once for `categoryId`, once for `published`) — the second call silently **replaces** the first instead of ANDing, so category filtering combined with the published filter returns all products. Fix: collect conditions into an array and pass them through a single `and(...conditions)` call. Watch for this pattern (repeated `.where()` on the same dynamic query) elsewhere in the API.
