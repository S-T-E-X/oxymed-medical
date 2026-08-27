---
name: Choosing an i18n storage pattern for DB content
description: Three patterns coexist in this project (per-locale columns, jsonb locale overlay, row-per-language). Which to reach for, and why.
---

# Which i18n storage pattern to use

This project deliberately uses **three different** patterns for translated
database content. Picking the wrong one for new work creates schema sprawl or
breaks queries, so match the pattern to the shape of the data.

## 1. Per-locale columns — short scalar names

Used for product titles, category names, slider text. One column per field per
locale (`title_en`, `title_de`, …), read through a small "pick the locale column,
fall back to the base column" helper.

Reach for this when the value is a **short name that code needs to query, sort,
group, or search on directly in SQL**, and when the field count is small enough
that `fields × locales` stays manageable.

## 2. jsonb `locales` overlay — page body content

Used for product page content and for the E-E-A-T pages (corporate sections,
certificates, references). A single jsonb column holding
`Partial<Record<NonTrLocale, { ...translatable fields }>>`.

Reach for this when the content is **page body text with several fields**, where
per-locale columns would explode the schema. Localizing three E-E-A-T tables with
columns would have meant ~77 new columns; as jsonb overlays it is three.

Turkish stays in the existing base columns as the source of truth. The overlay is
read through an overlay-picking helper with fallback to the base value, so a
missing translation degrades to Turkish rather than rendering blank.

## 3. Row per language — independently published documents

Used for news. Each language is its own row with its own publish state.

Reach for this when translations have **independent lifecycles** — published
separately, written by different people, or allowed to not exist at all. Note that
news deliberately *fails closed*: a language with no row is not served, and
hreflang/switcher data must come from the API's alternates, never the locale list.

## Two traps that keep recurring

**Fields that double as keys must not be localized in place.** `references.category`
is both display text and a grouping key. Group and filter on the Turkish base value;
use the localized value for display only. Same reasoning applies to any slug or
enum-like text column.

**Proper nouns are not translatable content.** Institution names and city names stay
as written. Translating them is wrong for SEO and produces nonsense; exclude them
from both the schema overlay and the AI translation prompt.

**Why:** these three patterns were each chosen for a real reason, and a change that
mixes them (or localizes a grouping key) surfaces as broken grouping or missing
content long after the change lands.

**How to apply:** before adding translated fields to a table, classify the content as
scalar name / body content / independently published document, then follow the
matching pattern and its existing helper.
