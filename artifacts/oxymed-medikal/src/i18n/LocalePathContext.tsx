import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "./config";

/**
 * A page can register per-locale path overrides here so the language switcher
 * navigates to the SAME article in the target language instead of falling back
 * to equivalentPath (which cannot know per-article slugs).
 *
 * Pages that do NOT register overrides get the switcher's default behaviour.
 */
export type LocalePathOverrides = Partial<Record<Locale, string>>;

type LocalePathContextValue = {
  overrides: LocalePathOverrides;
};

const LocalePathContext = createContext<LocalePathContextValue>({ overrides: {} });

export function LocalePathProvider({
  overrides,
  children,
}: {
  overrides: LocalePathOverrides;
  children: ReactNode;
}) {
  return (
    <LocalePathContext.Provider value={{ overrides }}>
      {children}
    </LocalePathContext.Provider>
  );
}

export function useLocalePathOverrides(): LocalePathOverrides {
  return useContext(LocalePathContext).overrides;
}
