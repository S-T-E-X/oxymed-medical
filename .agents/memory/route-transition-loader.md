---
name: Route transition loader
description: Global page-navigation loading overlay that waits for above-the-fold images, and how lazy-loaded images opt out of it.
---

Global animated overlay (RouteTransitionLoader + PageLoader, mounted once in App.tsx inside BrowserRouter) shows on in-app route changes and stays up until the new page's eager `<img>` elements finish loading (or a 4s safety timeout).

**Why:** SPA navigation swaps page content instantly even while its images are still fetching, causing layout pop-in; users wanted a branded wait state instead. A hard "wait for network idle" approach can't distinguish "will load soon" from "loads on scroll", so it keys off standard `loading="lazy"` markup instead of guessing.

**How to apply:**
- Detects navigation via the React docs "adjust state during render" pattern (compare `location.pathname` to a tracked ref/state inside the render body, not in an effect) so the overlay is visible in the *same commit* as the new route mounting — no flash of the old/empty page.
- Only images WITHOUT `loading="lazy"` gate the overlay (checked via `img.getAttribute("loading") !== "lazy"`); below-the-fold images marked lazy (e.g. References page project cards/map) are correctly ignored and load on scroll as normal.
- Does not fire on the very first page load, only on subsequent client-side navigations (tracked path starts equal to initial location).
- Any new page's above-the-fold images should stay as plain eager `<img>` (default) so the loader can detect and wait for them; anything using CSS `background-image` for hero content (e.g. gas-control-panel-style pages) won't be tracked by this mechanism — acceptable for now since it degrades gracefully (loader just resolves instantly via the 0-images-pending path), not a hard requirement to fix.
