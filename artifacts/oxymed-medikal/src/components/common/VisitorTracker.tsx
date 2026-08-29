import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackVisitorEvent } from "@workspace/api-client-react";

const CONSENT_KEY = "oxymed_cookie_consent";
const VISITOR_KEY = "oxymed_visitor_id";
const SESSION_KEY = "oxymed_session_id";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = makeId();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = makeId();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function getDeviceType(): "desktop" | "mobile" | "tablet" {
  const ua = navigator.userAgent;
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    return "tablet";
  }
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

function getReferrerSource(): string {
  const ref = document.referrer;
  if (!ref) return "direct";
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    if (host === window.location.hostname.replace(/^www\./, "")) return "internal";
    if (/google\./i.test(host)) return "Google";
    if (/bing\./i.test(host)) return "Bing";
    if (/yandex\./i.test(host)) return "Yandex";
    if (/facebook\.|fb\./i.test(host)) return "Facebook";
    if (/instagram\./i.test(host)) return "Instagram";
    if (/linkedin\./i.test(host)) return "LinkedIn";
    if (/t\.co|twitter\.|x\.com/i.test(host)) return "Twitter";
    if (/youtube\./i.test(host)) return "YouTube";
    return host;
  } catch {
    return "direct";
  }
}

function isTrackablePath(path: string): boolean {
  return !(
    path.startsWith("/admin") ||
    path.startsWith("/teklif-goruntule") ||
    path.startsWith("/servis-raporu") ||
    path.startsWith("/taslak")
  );
}

/**
 * Records an anonymous interaction (e.g. a CTA or product card click).
 * Consent-gated identically to page-view tracking: nothing is sent unless the
 * visitor has accepted cookies. Failures never block the visitor, but remain
 * visible in the browser console so a broken production API is diagnosable.
 */
export function trackInteraction(label: string): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(CONSENT_KEY) !== "accepted") return;
  const path = window.location.pathname;
  if (!isTrackablePath(path)) return;

  trackVisitorEvent({
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    path,
    eventType: "click",
    label,
    referrerSource: getReferrerSource(),
    deviceType: getDeviceType(),
  }).catch((error: unknown) => {
    console.warn("[analytics] interaction could not be recorded", error);
  });
}

export default function VisitorTracker() {
  const location = useLocation();
  const lastPath = useRef<string | null>(null);

  const send = (path: string) => {
    if (localStorage.getItem(CONSENT_KEY) !== "accepted") return;
    if (!isTrackablePath(path)) return;
    if (lastPath.current === path) return;
    lastPath.current = path;

    trackVisitorEvent({
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      path,
      eventType: "pageview",
      referrerSource: getReferrerSource(),
      deviceType: getDeviceType(),
    }).catch((error: unknown) => {
      console.warn("[analytics] page view could not be recorded", error);
    });
  };

  // Track on route change (only fires once consent is accepted).
  useEffect(() => {
    send(location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Capture the current page immediately when consent is granted,
  // so the first (landing) page view is not missed.
  useEffect(() => {
    const onConsent = () => send(window.location.pathname);
    window.addEventListener("oxymed-consent-accepted", onConsent);
    return () => window.removeEventListener("oxymed-consent-accepted", onConsent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
