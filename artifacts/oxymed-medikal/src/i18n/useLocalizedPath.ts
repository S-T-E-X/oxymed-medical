import { useCallback } from "react";
import { useI18n } from "./I18nProvider";
import { localizedPath, type RouteKey } from "./routes";

/**
 * Build in-app links that stay in the visitor's current language.
 * Example: `const path = useLocalizedPath(); <Link to={path("quote")} />`
 */
export function useLocalizedPath() {
  const { locale } = useI18n();
  return useCallback(
    (routeKey: RouteKey, extraSegments: string[] = []) => localizedPath(routeKey, locale, extraSegments),
    [locale],
  );
}
