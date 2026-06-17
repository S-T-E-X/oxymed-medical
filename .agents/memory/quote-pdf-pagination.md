---
name: Quote PDF pagination flag semantics
description: What the three per-item page-control flags mean and the footer "lonely page" rule
---

# Quote PDF pagination

Per-item page-control flags drive the multi-page paginator in `QuoteTemplateView.tsx` (`chunkItems`/`flush`). The three flags are **mutually exclusive** in the editor (toggling one ON clears the other two).

- `pageBreakBefore` ("alt sayfaya taşı") — flush before this item so it starts a fresh page.
- `keepWithNext` ("alt sayfaya indir") — **also a push-down**: single click moves this item (and following content) to the next page. It is NOT glue-to-next chaining. Mechanically equals `pageBreakBefore`; kept as a separate button because users reach for "indir" and a single click must visibly work.
- `keepWithPrevious` ("üst sayfaya sıkıştır") — skip the automatic overflow flush so the item stays on the upper page.

**Why push-down for keepWithNext:** glue/chain semantics required flagging the item *just before* the break, so single clicks felt non-functional. Push-down makes one click do the obvious thing.

## Footer placement is MEASURED, not heuristic (source of truth)
Footer/last-page placement is decided at runtime from **real rendered pixel heights**, not the `itemVisualWeight` heuristic. The heuristic is unreliable per-item (e.g. items with many bullets+image render ~120px but the model scored them ~7 units ≈ 2× too heavy), which orphaned trailing items on a sparse penultimate page.

**Why:** ground-truth puppeteer measurement showed several trailing items + footer physically fit one A4 page while the weight model said they didn't. No recalibration of weights fixes per-item variance — only measurement does.

**How it works (`QuoteTemplateView.tsx`, multi-page only):** a hidden off-screen clone of `lastRaw` + footer is rendered; after its images load, a `useEffect` measures row heights, repeat-header, table overhead, footer, and page height, then either attaches the footer under the whole last page (if it fits) or moves as many trailing rows as fit onto the footer page (advancing the cut off `child` rows so a group header is never split). A `SAFE` px margin guards sub-pixel variance. The weight heuristic survives only as a pre-measurement fallback and for single-page docs.

**PDF coupling:** once measured, `<main data-quote-ready="1">` is set; the puppeteer PDF route waits for that selector before `pdf()` so it captures the measured layout (graceful timeout fallback to heuristic). The clone is `display:none` in print media → no phantom PDF pages. Any change to the measuring clone, the ready flag, or the route's wait must stay in lockstep or PDFs silently fall back to the old heuristic.

## Per-item flags still apply (group-aware peel)
The three mutually-exclusive editor flags above still control `chunkItems` page grouping; the measured pass only decides footer placement on the resulting last page. When peeling, never detach a `child` row from its group header.
