---
name: Product & category card data model
description: Why home/catalog cards must come from DB product/category rows, with home curation owned by product rows.
---

# Product and category cards are DB-driven

The home page's featured cards and the catalog cards must render entirely from
`products` rows, while category lists/details render from `product_categories`
and their product relationships. Never reintroduce:

- a positional image/description array indexed by the category's position in the
  list (`IMAGES[i]`, `descriptions[i]`),
- a `.slice(0, N)` cap that decides which products are featured,
- hardcoded JSX cards appended next to the DB-driven ones.

**Why:** all three were live at once. Because the blurb and artwork were keyed by
list position rather than by category, adding, reordering or hiding a single
category silently shifted every card's image and text onto the wrong category —
a category card was showing another category's product photo and description.
The hardcoded cards additionally could not be renamed, translated, reordered,
recategorised or unpublished from the admin panel, and they duplicated rows that
also existed in the database.

**How to apply:** products own `imageUrl`, `showOnHome` and `homeSortOrder`.
The home page filters selected products, sorts by `homeSortOrder`, and renders
at most four. Product names use `pickLocalizedName` with Turkish fallback.
Categories still own `imageUrl`, descriptions, `sortOrder` and `visible` for
category/catalog contexts; a category with no artwork falls back to a neutral
placeholder, never another category's image.

## Legacy dental/GCP pages

The four legacy product pages (`amalgam-separator`, `dental-vakum-pompasi`,
`dental-vakum-sistemi`, `kat-kontrol-panosu`) keep settings-driven *detail*
pages, registered as static routes that take precedence over `/urunler/:slug`.
Only their catalog card moved to the product row: the card image is
`products.imageUrl`, and the old `<prefix>_card_image` settings keys are dead.
The three dental admin pages link out to Ürün Yönetimi; the GCP admin page
edits the same product row inline. Either way, never reintroduce a card editor
backed by a settings key.

## Category slugs are not stable across installs

The electrical/data category is seeded as `elektrik-data-sistemleri` but some
installs renamed it to `alarm-izleme-sistemleri`, and `dental-sistemler` exists
only in installs that ran the card migration.

**Why:** a data migration keyed on slug silently skipped the renamed category
(leaving a placeholder card) and hard-failed on the missing one. Because the
migration runs from `post-merge.sh` under `set -e`, that failure aborted the
whole post-merge setup.

**How to apply:** slug-keyed migrations must alias known renames and create a
missing category instead of throwing. Test any such script against a scratch
database built from `seed.ts`, not just the dev database — the dev database has
drifted from the seed and will hide both bugs.

## Visibility must cascade

Hiding a category also hides its products from the public product list.

**Why:** otherwise the products stay reachable through the unfiltered catalog and
through a direct `?categoryId=` query, so "hidden" is not actually hidden.

**How to apply:** the public branch of the product/category list endpoints filters
on `visible`; admin callers (valid bearer token) see everything. Both endpoints
therefore return credential-dependent bodies and must send
`Vary: Authorization` — the same rule that already applies to news drafts and to
`privateData` stripping.
