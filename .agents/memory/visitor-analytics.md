---
name: Visitor analytics (dashboard)
description: How cookie-consent-gated visitor tracking + admin analytics dashboard is wired
---

Anonymous, privacy-friendly visitor analytics for the public site, surfaced on the admin Kontrol Paneli.

- **Consent gate**: tracking only fires when `localStorage["oxymed_cookie_consent"] === "accepted"`. Decline/undecided → zero requests. This is the contract; do not weaken it.
- **First-hit capture**: route-change alone misses the landing page view (consent is granted *after* first render). `CookieBanner` dispatches a `window` event `"oxymed-consent-accepted"` on accept; `VisitorTracker` listens and sends the current page immediately. Keep both sides in sync if renaming the event.
- **Anonymity**: visitorId (localStorage) + sessionId (sessionStorage) are client-generated UUIDs. **No IP or PII is stored** in `visitor_events` — KVKK/cookie-consent requirement. Do not add IP columns.
- **Abuse control**: public `POST /api/analytics/track` uses a best-effort in-memory per-IP rate limit (single-process assumption). Client-generated IDs are accepted by design (standard for privacy-first analytics like Plausible/Umami); a server-issued-ID redesign was deliberately deemed disproportionate for this corporate-site use case.
- **Aggregation**: `GET /api/analytics/summary?days=7|30` (auth-only) returns time series, top pages, device + referrer breakdown, top interactions, and summary metrics. `visitorChangePct` compares the range vs the immediately preceding equal-length range.
- **eventType discriminator**: `visitor_events.eventType` is `'pageview'` (default) or `'click'`; interactions also set `label`. CRITICAL: every page-view aggregation (totals/today/prev/series/topPages/device/referrer) MUST filter `eventType='pageview'` or clicks pollute page-view counts. Interaction aggregation filters `eventType='click'` + label not null. Client `trackInteraction(label)` in VisitorTracker is consent-gated identically to page views.

## Retention / cleanup
Old visitor_events pruned automatically by an in-server scheduler (startVisitorCleanupScheduler in api-server lib), first run ~30s after startup then every 24h. Retention default 365 days, override via VISITOR_EVENTS_RETENTION_DAYS. Manual run: `pnpm --filter @workspace/scripts run cleanup-visitor-events [days]`.
