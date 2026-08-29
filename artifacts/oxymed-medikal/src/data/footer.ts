import type { Locale } from "../i18n/config";
import { resolvePath, type DictionaryNode } from "../i18n/dictionary";
import { footerColumns } from "./home";

export const FOOTER_SETTING_KEY = "footer_content_i18n";

export type FooterLinkContent = {
  key: string;
  label: string;
  href: string;
  visible: boolean;
};

export type FooterColumnContent = {
  key: string;
  title: string;
  visible: boolean;
  links: FooterLinkContent[];
};

export type FooterLocaleContent = {
  tagline: string;
  contactTitle: string;
  copyright: string;
  kvkk: string;
  privacy: string;
  terms: string;
  columns: FooterColumnContent[];
};

export type FooterConfig = Partial<Record<Locale, FooterLocaleContent>>;

type FooterTextGetter = (key: string, fallback?: string) => string;

function readDictionaryText(dictionary: DictionaryNode, key: string): string {
  const value = resolvePath(dictionary, key);
  return typeof value === "string" ? value : key;
}

export function createFooterContent(getText: FooterTextGetter): FooterLocaleContent {
  return {
    tagline: getText("common.footer.tagline"),
    contactTitle: getText("common.footer.contactTitle"),
    copyright: getText("common.footer.copyright"),
    kvkk: getText("common.footer.kvkk"),
    privacy: getText("common.footer.privacy"),
    terms: getText("common.footer.terms"),
    columns: footerColumns.map((column) => ({
      key: column.key,
      title: getText(`common.footer.columns.${column.key}.title`),
      visible: true,
      links: column.links.map((link) => ({
        key: link.key,
        label: getText(`common.footer.columns.${column.key}.${link.key}`),
        href: link.href,
        visible: true,
      })),
    })),
  };
}

export function createFooterContentFromDictionary(dictionary: DictionaryNode): FooterLocaleContent {
  return createFooterContent((key) => readDictionaryText(dictionary, key));
}

export function mergeFooterContent(
  base: FooterLocaleContent,
  override: FooterLocaleContent | undefined,
): FooterLocaleContent {
  if (!override) return base;

  const columns = base.columns.map((column) => {
    const customColumn = override.columns?.find((candidate) => candidate.key === column.key);
    if (!customColumn) return column;

    const links = column.links.map((link) => {
      const customLink = customColumn.links?.find((candidate) => candidate.key === link.key);
      return customLink ? { ...link, ...customLink } : link;
    });
    const extraLinks = (customColumn.links ?? []).filter(
      (link) => !column.links.some((baseLink) => baseLink.key === link.key),
    );

    return {
      ...column,
      ...customColumn,
      links: [...links, ...extraLinks],
    };
  });
  const extraColumns = (override.columns ?? []).filter(
    (column) => !base.columns.some((baseColumn) => baseColumn.key === column.key),
  );

  const merged = {
    ...base,
    ...override,
    columns: [...columns, ...extraColumns],
  };

  // A previously saved admin override can outlive the source dictionaries.
  // Keep the current copyright year consistent without changing any other
  // editor-authored footer text.
  return {
    ...merged,
    copyright: merged.copyright.replace(/\b2024\b/g, "2026"),
  };
}

export function parseFooterConfig(raw: string | undefined): FooterConfig {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as FooterConfig;
  } catch {
    return {};
  }
}