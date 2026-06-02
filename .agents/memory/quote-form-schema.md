---
name: Quote form item schema (no codegen)
description: Where quote_form_items field validation lives and why codegen does not cover it
---

# Quote form item fields

Quote form items are validated by an **inline Zod schema** (`QuoteFormItemBody`) defined directly in the API route file, NOT in `lib/api-spec/openapi.yaml`. The quote editor talks to the API via a hand-rolled `authFetch`, not the Orval-generated React Query hooks.

**Why:** the OpenAPI spec has no quote-item schema, so adding/changing a quote-item field does NOT require `pnpm --filter @workspace/api-spec run codegen`.

**How to apply:** when adding a field to a quote item, wire these in lockstep:
- DB column in `lib/db/src/schema/quoteForms.ts` (then `pnpm --filter @workspace/db run push`)
- `QuoteFormItemBody` Zod in `artifacts/api-server/src/routes/quote-forms.ts` (bulk PUT inserts via `...item` spread, so no manual insert mapping needed)
- `ItemDraft` type + every literal that builds an item (newItem, newGroup, apiItemToDraft, apiItemsToHierarchical, addFromProduct, template apply, saveItems body push) in `QuoteFormEditPage.tsx` — TS will flag any missed object literal
- View/print pass-through in `QuoteTemplateView.tsx` + `QuotePrintPage.tsx`

Generated `api.schemas.ts` will NOT contain quote-item fields; that is expected, not a bug.
