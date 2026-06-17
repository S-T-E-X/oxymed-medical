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

## Footer "lonely page" rule
The signature/terms footer attaches under the last item page. If that page is too heavy (weight > attachBudget: 16 continuation / 10 first), do NOT emit a footer-only trailing page (looks empty). Instead **peel the trailing unit** down onto a new footer page:
- The unit is the last single/group item, or — if the page ends mid-group — the *whole group block* (walk back over `child` rows to the header) so a child is never detached from its header.
- Only peel when at least one item stays above AND the unit weight ≤ 16; otherwise fall back to a standalone footer page.
