import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { LOCALES, LOCALE_META, type Locale } from "../../i18n/config";
import { rememberLocale, useI18n } from "../../i18n/I18nProvider";
import { equivalentPath } from "../../i18n/routes";

type LanguageSwitcherProps = {
  /** `bar` is the compact dark top bar; `panel` is the full-width mobile menu list. */
  variant?: "bar" | "panel";
  onSelect?: () => void;
};

export default function LanguageSwitcher({ variant = "bar", onSelect }: LanguageSwitcherProps) {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function changeLocale(target: Locale) {
    setOpen(false);
    onSelect?.();
    if (target === locale) return;
    // An explicit pick is a real preference, so it is worth remembering.
    rememberLocale(target);
    // Keep the visitor on the same page, just in the other language.
    navigate(`${equivalentPath(pathname, target)}${search}${hash}`);
  }

  if (variant === "panel") {
    return (
      <div className="grid grid-cols-3 gap-2 py-4">
        {LOCALES.map((candidate) => {
          const meta = LOCALE_META[candidate];
          const isActive = candidate === locale;
          return (
            <button
              key={candidate}
              type="button"
              lang={meta.htmlLang}
              onClick={() => changeLocale(candidate)}
              aria-current={isActive ? "true" : undefined}
              className={`rounded border px-2 py-2 text-[11px] font-bold transition ${
                isActive
                  ? "border-oxynavy-950 bg-oxynavy-950 text-white"
                  : "border-steel-200 text-oxynavy-950 hover:border-oxynavy-950"
              }`}
            >
              {meta.nativeName}
            </button>
          );
        })}
      </div>
    );
  }

  const activeMeta = LOCALE_META[locale];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={activeMeta.nativeName}
        className="inline-flex items-center gap-1.5 px-1 text-white/78 transition hover:text-white"
      >
        <Globe className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="font-semibold">{activeMeta.code}</span>
        <ChevronDown className="h-3 w-3" aria-hidden="true" />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute end-0 top-full z-50 mt-2 max-h-[70vh] w-44 overflow-auto rounded border border-steel-200 bg-white py-1 text-oxynavy-950 shadow-[0_14px_35px_rgba(2,20,35,0.18)]"
        >
          {LOCALES.map((candidate) => {
            const meta = LOCALE_META[candidate];
            const isActive = candidate === locale;
            return (
              <li key={candidate}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  lang={meta.htmlLang}
                  dir={meta.dir}
                  onClick={() => changeLocale(candidate)}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition hover:bg-steel-50 ${
                    isActive ? "font-bold" : "font-medium"
                  }`}
                >
                  <span>{meta.nativeName}</span>
                  {isActive ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
