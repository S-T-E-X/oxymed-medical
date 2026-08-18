import { useEffect, useMemo, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE_ORIGIN } from "../../i18n/config";
import { useI18n } from "../../i18n/I18nProvider";
import { createJsonLdSlot } from "./jsonLd";
import "./Breadcrumbs.css";

/**
 * A page describes exactly one breadcrumb hierarchy, so every instance
 * arbitrates for a single shared script tag instead of overwriting or
 * deleting another instance's structured data.
 */
const breadcrumbSlot = createJsonLdSlot("breadcrumb");

export type Crumb = {
  label: string;
  /** Root-relative, already-localized path. Omit for the current page. */
  to?: string;
};

export type BreadcrumbsProps = {
  items: Crumb[];
  /**
   * Emit only the structured data and render nothing. Used by pages that
   * already draw their own trail in a bespoke hero style, so they gain the
   * machine-readable hierarchy without showing a second visible breadcrumb.
   */
  jsonLdOnly?: boolean;
  /** Palette for the surface the trail sits on. Dark heroes need "dark". */
  tone?: "light" | "dark";
};

/**
 * Visible breadcrumb trail plus the matching BreadcrumbList structured data.
 *
 * Two jobs in one component so the two can never drift: search engines and
 * answer engines are told the same hierarchy the visitor sees. Deep product
 * and article pages use this to expose their place in the topic cluster
 * instead of looking like isolated leaves.
 */
export default function Breadcrumbs({ items, jsonLdOnly = false, tone = "light" }: BreadcrumbsProps) {
  const { t } = useI18n();

  // Callers build the trail inline, so a fresh array arrives on every render.
  // Keying the memo on the serialized trail — not the array identity — keeps
  // the injected script stable instead of rewriting it on each re-render.
  const itemsKey = JSON.stringify(items);
  const jsonLd = useMemo(() => {
    const crumbs: Crumb[] = JSON.parse(itemsKey);
    if (crumbs.length < 2) return null;
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.label,
        // The last crumb is the current page and carries no item URL, which is
        // what Google expects for the trailing entry.
        ...(crumb.to ? { item: `${SITE_ORIGIN}${crumb.to}` } : {}),
      })),
    };
  }, [itemsKey]);

  const ownerRef = useRef<symbol>(undefined as unknown as symbol);
  if (ownerRef.current === undefined) ownerRef.current = Symbol("breadcrumbs");

  useEffect(() => {
    const owner = ownerRef.current;
    breadcrumbSlot.claim(owner, jsonLd);
    return () => breadcrumbSlot.release(owner);
  }, [jsonLd]);

  if (items.length < 2 || jsonLdOnly) return null;

  return (
    <nav
      className={`oxy-breadcrumbs${tone === "dark" ? " oxy-breadcrumbs--dark" : ""}`}
      aria-label={t("common.breadcrumb.ariaLabel")}
    >
      <ol>
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${crumb.label}-${index}`}>
              {crumb.to && !isLast ? (
                <Link to={crumb.to}>{crumb.label}</Link>
              ) : (
                <span aria-current="page">{crumb.label}</span>
              )}
              {!isLast && <ChevronRight aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
