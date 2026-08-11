import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { DEFAULT_LOCALE, LOCALE_META, type Locale } from "./config";
import { localeFromPath } from "./routes";
import {
  loadDictionary,
  resolvePath,
  TR_DICTIONARY,
  type DictionaryNode,
  type DictionaryValue,
} from "./dictionary";

export const LOCALE_STORAGE_KEY = "oxymed-locale";

/**
 * Persist a language the visitor picked *deliberately* (switcher or suggestion
 * bar). Merely viewing a URL must not be recorded as a preference — otherwise a
 * remembered language would fight every locale-prefixed link the visitor opens.
 */
export function rememberLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage can be unavailable (private mode); language still works per-URL.
  }
}

type I18nContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  /** Translate a dotted key to a string, falling back to Turkish then the key. */
  t: (key: string, fallback?: string) => string;
  /** Read a structured value (array or object) for list-shaped content. */
  tv: <T>(key: string, fallback: T) => T;
  /** True while a non-Turkish dictionary is still being fetched. */
  isLoading: boolean;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function toDisplayString(value: DictionaryValue | undefined): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return undefined;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const locale = localeFromPath(pathname);

  const [dictionary, setDictionary] = useState<DictionaryNode>(() =>
    locale === DEFAULT_LOCALE ? TR_DICTIONARY : TR_DICTIONARY,
  );
  const [loadedLocale, setLoadedLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    if (locale === DEFAULT_LOCALE) {
      setDictionary(TR_DICTIONARY);
      setLoadedLocale(DEFAULT_LOCALE);
      return;
    }

    let cancelled = false;
    void loadDictionary(locale).then((next) => {
      if (cancelled) return;
      setDictionary(next);
      setLoadedLocale(locale);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  // Keep <html lang/dir> in sync so screen readers, browsers and search
  // engines see the right language, and RTL locales flip layout direction.
  useEffect(() => {
    const meta = LOCALE_META[locale];
    document.documentElement.lang = meta.htmlLang;
    document.documentElement.dir = meta.dir;
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    const activeDictionary = loadedLocale === locale ? dictionary : TR_DICTIONARY;

    return {
      locale,
      dir: LOCALE_META[locale].dir,
      isLoading: loadedLocale !== locale,
      t: (key, fallback) =>
        toDisplayString(resolvePath(activeDictionary, key)) ??
        toDisplayString(resolvePath(TR_DICTIONARY, key)) ??
        fallback ??
        key,
      tv: <T,>(key: string, fallback: T): T => {
        const resolved = resolvePath(activeDictionary, key) ?? resolvePath(TR_DICTIONARY, key);
        return (resolved as T | undefined) ?? fallback;
      },
    };
  }, [dictionary, loadedLocale, locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside <I18nProvider>");
  }
  return context;
}

/** Shorthand for components that only need the translate function. */
export function useT(): I18nContextValue["t"] {
  return useI18n().t;
}
