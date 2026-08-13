---
name: Product and category name i18n
description: How per-locale name/title columns are added to products and product_categories tables, and how they are rendered and edited.
---

# Schema
- `product_categories` has `nameEn`, `nameDe`, `nameFr`, `nameIt`, `nameAr`, `nameRu`, `nameFa`, `nameKa`, `nameBg`, `nameAz` nullable text columns.
- `products` has `titleEn`, `titleDe`, `titleFr`, `titleIt`, `titleAr`, `titleRu`, `titleFa`, `titleKa`, `titleBg`, `titleAz` nullable text columns.
- Turkish (`name` / `title`) is the base; locale columns fall back to Turkish when NULL or empty.

# Frontend utility
`artifacts/oxymed-medikal/src/i18n/pickLocalizedName.ts` — `pickLocalizedName(record: object, baseField, locale)` mirrors the `pickSliderText` pattern from Hero.tsx.

# Display
- `ProductsPage.tsx`: sidebar buttons use `pickLocalizedName(category, "name", locale)`, product card titles use `pickLocalizedName(product, "title", locale)`.
- `ProductGroups.tsx`: curated home product card titles use `pickLocalizedName(product, "title", locale)`.

# Admin editing
- **Categories**: `admin/ProductsPage.tsx` — clicking the edit pencil on a category opens `CategoryEditModal` which shows TR name + 10 locale inputs.
- **Products**: `admin/ProductEditPage.tsx` — the "Temel Bilgiler" tab shows a collapsible grid of locale title inputs (TITLE_LOCALES constant, `titleEn`…`titleAz` fields in form).

# API and types
- `artifacts/api-server/src/routes/products.ts` — `ProductCategoryBody` and `ProductBody` Zod schemas accept the locale fields.
- `lib/api-client-react/src/generated/api.schemas.ts` and `dist/generated/api.schemas.d.ts` updated manually (no codegen script — edit both src and dist).
- `lib/api-spec/openapi.yaml` updated for ProductCategory, ProductCategoryInput, ProductCategoryUpdate, Product, ProductInput, ProductUpdate schemas.

**Why:** DB-sourced copy (product names, category names) is not covered by static i18n dictionaries and must be handled with per-locale columns. Same pattern as slider i18n (see slider-i18n.md).
