---
name: Locale resolution and remembered language
description: How the marketing site decides which language to show, and the rule that keeps stored preferences from hijacking explicit locale URLs.
---

# Locale resolution order

The URL is the single source of truth for the active language. Turkish is unprefixed
(`/`, `/urunler`, ...); every other locale is prefixed and uses translated slugs.

**Rule:** a stored language preference may only redirect a *bare default-locale* URL.
It must never override a URL that already carries a locale prefix.

**Why:** an earlier version persisted the locale of every page the visitor viewed, then
redirected on that stored value. Opening `/de/...` after having seen `/en/...` bounced the
visitor back to English, and localized links became unreachable. Search crawlers hitting a
localized URL would likewise be redirected away from the page they were asked to index.

**How to apply:**
- Only persist a locale the visitor picked *deliberately* (language switcher, or accepting
  the browser-language suggestion bar). Viewing a URL is not a preference.
- Gate the stored-preference redirect on "this is the bare default-locale URL".
- Never auto-redirect on detected browser language — offer it, let the visitor choose.
  Silent redirects hide the other language versions from crawlers.

# Verifying `lang` / `dir` in tests

`<html lang>` and `dir` are set by a React effect after hydration, not by the served HTML
(the prerendered files do carry the right values, but the SPA re-applies them on load).
A test that reads `document.documentElement.lang` immediately after navigation can observe
the stale value from `index.html` (`tr`) and report a false failure. Settle briefly after
load before asserting on these attributes.
