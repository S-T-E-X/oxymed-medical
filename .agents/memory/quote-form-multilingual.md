---
name: Quote form multi-language + AI translation
description: How the oxymed quote-form system supports many languages and AI translation — architecture decisions to stay consistent with.
---

The quote form supports 14 languages (tr + 13 others). Two independent layers:

1. **Static document-chrome UI strings** (labels like "Teklif No", column headers,
   trust badges) — pre-translated once and hardcoded per-language in
   `QuoteTemplateView.tsx`'s `STRINGS`/`trustItemsByLang` dicts. No runtime API
   cost. If adding a language, generate its static strings with a one-off LLM
   call (translate the `tr` dict's ~44 keys), don't hand-type.
2. **Per-quote free-text content** (item titles/bullets, notes, terms,
   delivery/payment terms, approver title) — translated live via OpenAI only
   when the admin clicks "Translate", never pre-baked.

**Why split this way:** static chrome never changes per-quote, so translating
it live on every request would be wasted latency/cost; free-text content is
unique per quote and can't be pre-baked.

**Translate = duplicate, not mutate.** Clicking "Translate" creates a *new*
quote form row (new quoteNo, status reset to draft) with translated content;
the source quote is left untouched. Backend shares one
`copyQuoteFormWithItems()` helper between `/duplicate` and `/translate` in
`artifacts/api-server/src/routes/quote-forms.ts`. On translation failure
(OpenAI error or bad JSON), the partially-created duplicate is deleted so no
untranslated orphan draft is left behind.

**Language list lives in two places, kept in sync by code, not by a shared
package:** `artifacts/oxymed-medikal/src/lib/quoteLanguages.ts` (frontend,
Turkish admin-facing labels) and `artifacts/api-server/src/lib/quoteLanguages.ts`
(backend, English names for the OpenAI prompt). Frontend doesn't import
`@workspace/db` or any api-server code, so this duplication is intentional —
add a new language code to both files, in the same order, when extending.

**What gets sent to the OpenAI translation call:** only the free-text fields
(delivery/payment terms, notes, services list, terms list, approver title,
item titles/bullets) as a flat JSON manifest keyed by item id. Proper nouns —
company name/address, preparer's name, signature — are intentionally excluded
and just copied over unchanged by the duplicate.

**Known limitation (flagged, not solved):** no RTL layout for Arabic/Farsi —
content renders correctly in-script but LTR box direction is unchanged.

**Group/single-item templates** (`quote_group_templates` table) only ever
have `tr`/`titleEn`-style TR/EN mirror fields, not all 14 languages. Template
picker fallback (`pickTemplateText` in `QuoteFormEditPage.tsx`) stays "use EN
only if lang==='en', else TR" — this is deliberate, not a bug to widen.
