---
name: DB product page localization
description: Locale-aware content rules for generic database-driven product detail pages and legacy settings.
---

Generic product detail content keeps Turkish base fields and stores translated page sections under `pageData.locales`. The requested locale overlays the base content; Turkish intentionally uses the base content.

**Why:** Product titles and static UI dictionaries alone cannot translate database-sourced hero copy, feature lists, FAQs, advantages, or technical specifications.

**How to apply:** When adding or editing generic product content, preserve existing locale overlays, translate missing locales as a data operation, and use locale-aware settings helpers for legacy pages so plain Turkish overrides never leak into non-Turkish URLs.