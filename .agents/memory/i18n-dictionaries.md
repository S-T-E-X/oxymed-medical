---
name: Marketing site translation dictionaries
description: How locale dictionaries are authored, generated and kept in sync, and which content is deliberately left untranslated.
---

# Authoring

Turkish is the hand-authored source language and is bundled synchronously so a missing key
falls back to real copy instead of a raw key. All other locales are generated from Turkish
by the translation script and lazy-loaded per visitor.

**Workflow for new UI text:** add the key to the Turkish namespace file first, wire the
component to it, then run the translation script. The script fills only missing values, so
it is safe to re-run and it never clobbers existing translations.

**Invariant:** every locale must have the exact same key set as Turkish. Worth asserting
with a flatten-and-compare check after generating, since a partial generation run fails
silently at runtime (it just falls back to Turkish).

# Deliberately untranslated

- Technical values, units, model codes, standards and identifiers are preserved verbatim.
- Quote-form option values submitted to the API stay canonical Turkish strings even when the
  visible label is translated — existing records and backend logic depend on those exact
  strings. Translate the label, never the submitted value.

# Database-sourced copy is not covered

Hero slider text, product titles and category names come from the admin-managed database and
render Turkish in every language. The dictionaries cannot fix this; it needs per-locale
columns or a translations table on those records. Before hunting for a "missing translation"
in a locale file, check whether the string is actually API content.

**Why:** i18n audits keep re-discovering the same leftover Turkish and mistaking it for
hardcoded strings.
