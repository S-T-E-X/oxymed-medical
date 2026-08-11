import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, isLocale, type Locale } from "./config";
import { LOCALE_STORAGE_KEY, rememberLocale, useI18n } from "./I18nProvider";
import { equivalentPath } from "./routes";

const DISMISS_KEY = "oxymed-locale-suggestion-dismissed";

/** Best matching site locale for the browser's language list, if any. */
function detectBrowserLocale(): Locale | null {
  const candidates = typeof navigator !== "undefined" ? navigator.languages ?? [navigator.language] : [];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const base = candidate.toLowerCase().split("-")[0];
    if (isLocale(base)) return base;
    // Persian is also reported as "pes"/"prs" on some platforms.
    if (base === "fas" || base === "pes") return "fa";
  }
  return null;
}

/** Text of the suggestion bar in the language being offered. */
const SUGGESTION_COPY: Record<Locale, { message: string; action: string; dismiss: string }> = {
  tr: { message: "Bu sayfayı Türkçe görüntüleyin.", action: "Türkçe'ye geç", dismiss: "Kapat" },
  en: { message: "View this page in English.", action: "Switch to English", dismiss: "Dismiss" },
  de: { message: "Diese Seite auf Deutsch ansehen.", action: "Zu Deutsch wechseln", dismiss: "Schließen" },
  fr: { message: "Voir cette page en français.", action: "Passer au français", dismiss: "Fermer" },
  it: { message: "Visualizza questa pagina in italiano.", action: "Passa all'italiano", dismiss: "Chiudi" },
  ar: { message: "اعرض هذه الصفحة باللغة العربية.", action: "التبديل إلى العربية", dismiss: "إغلاق" },
  ru: { message: "Посмотреть эту страницу на русском.", action: "Перейти на русский", dismiss: "Закрыть" },
  fa: { message: "این صفحه را به فارسی ببینید.", action: "تغییر به فارسی", dismiss: "بستن" },
  ka: { message: "ნახეთ ეს გვერდი ქართულად.", action: "ქართულზე გადართვა", dismiss: "დახურვა" },
  bg: { message: "Вижте тази страница на български.", action: "Превключи на български", dismiss: "Затвори" },
  az: { message: "Bu səhifəni Azərbaycan dilində görün.", action: "Azərbaycan dilinə keç", dismiss: "Bağla" },
};

/**
 * Offers the visitor their browser language instead of silently redirecting.
 * Auto-redirecting on a detected language hides other language versions from
 * crawlers, so the choice stays with the visitor — and is remembered once made.
 */
export default function LocaleSuggestion() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();
  const [suggested, setSuggested] = useState<Locale | null>(null);

  useEffect(() => {
    let stored: string | null = null;
    let dismissed: string | null = null;
    try {
      stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      dismissed = window.localStorage.getItem(DISMISS_KEY);
    } catch {
      return;
    }

    // A visitor who already picked a language should never be nagged again.
    if (dismissed === "true") return;

    // A locale-prefixed URL is an explicit request for that language, so a
    // stored preference must never override it — only a bare Turkish URL
    // (the default, which may just be the site root) can be redirected.
    const onDefaultUrl = locale === DEFAULT_LOCALE && !pathname.startsWith(`/${DEFAULT_LOCALE}`);

    // Returning visitors go straight to the language they chose last time.
    if (onDefaultUrl && stored && isLocale(stored) && stored !== locale) {
      navigate(`${equivalentPath(pathname, stored)}${search}${hash}`, { replace: true });
      return;
    }

    const detected = detectBrowserLocale();
    if (!detected || detected === locale) return;

    if (!stored) setSuggested(detected);
    // Only evaluated on the first render of a session; deps intentionally minimal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!suggested || suggested === locale) return null;

  const copy = SUGGESTION_COPY[suggested] ?? SUGGESTION_COPY[DEFAULT_LOCALE];
  const meta = LOCALE_META[suggested];

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISS_KEY, "true");
    } catch {
      // Non-fatal: the bar simply reappears next session.
    }
    setSuggested(null);
  }

  function accept() {
    if (!suggested) return;
    rememberLocale(suggested);
    try {
      window.localStorage.setItem(DISMISS_KEY, "true");
    } catch {
      // Preference just won't persist; navigation still works.
    }
    setSuggested(null);
    navigate(`${equivalentPath(pathname, suggested)}${search}${hash}`);
  }

  return (
    <div
      lang={meta.htmlLang}
      dir={meta.dir}
      className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-oxynavy-900 px-4 py-2.5 text-center text-xs text-white"
    >
      <span className="text-white/85">{copy.message}</span>
      <button
        type="button"
        onClick={accept}
        className="rounded bg-white px-3 py-1.5 text-[11px] font-bold text-oxynavy-950 transition hover:bg-white/90"
      >
        {copy.action}
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label={copy.dismiss}
        className="inline-flex h-6 w-6 items-center justify-center rounded text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

export { LOCALES };
