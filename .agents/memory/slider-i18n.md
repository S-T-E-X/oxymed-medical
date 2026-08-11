---
name: Slider i18n columns
description: How hero slider text is stored and displayed per locale; column naming and fallback pattern.
---

# Slider multi-language implementation

## Schema

50 new nullable text columns added to `sliders` table (5 fields × 10 non-TR locales):
- Fields: `title`, `subtitle`, `description`, `ctaPrimaryText`, `ctaSecondaryText`
- Locales: `en`, `de`, `fr`, `it`, `ar`, `ru`, `fa`, `ka`, `bg`, `az`
- Naming: `{field}_{locale}` in DB → `{field}{LocalePascal}` in JS (e.g. `title_en` → `titleEn`)
- Turkish remains the base/required field; locale columns are all nullable.

## Fallback rule

`pickSliderText(slider, baseField, locale)` in `Hero.tsx`:
- If locale is `"tr"`, return the base field directly.
- Otherwise, build the locale key (e.g. `"titleEn"`) and return it if non-empty.
- Falls back to the Turkish base field when the locale value is null/empty.

**Why:** Guarantees no slider ever shows empty text; existing TR content continues to work without any migration.

## Admin UI

`SlidersPage.tsx` → `SliderModal` shows language tab row (TR, EN, DE, FR, IT, AR, RU, FA, KA, BG, AZ).
- TR tab: all base fields + image, links, settings.
- Non-TR tabs: title, subtitle, description, ctaPrimaryText, ctaSecondaryText only (links/settings are language-agnostic).
- Hint shown on non-TR tabs: "Boş bırakılan alanlar Türkçe içeriğe düşer."

## API

`SliderBody` Zod schema in `artifacts/api-server/src/routes/sliders.ts` includes all 50 locale fields as optional strings.
Codegen via `pnpm --filter @workspace/api-spec codegen` regenerates client + zod types from `lib/api-spec/openapi.yaml`.

**How to apply:** Any new translatable text field on sliders must be added to the schema, openapi spec, Zod body, modal UI, and `pickSliderText` switch — in lockstep.
