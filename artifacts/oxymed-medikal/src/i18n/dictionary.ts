import { DEFAULT_LOCALE, type Locale } from "./config";

/**
 * A namespace file is a nested tree of strings / string arrays / objects.
 * Turkish files are hand-authored (the source of truth); the other locales
 * are generated from them by scripts/translate-i18n.mjs.
 */
export type DictionaryValue = string | number | boolean | DictionaryNode | DictionaryValue[];
export type DictionaryNode = { [key: string]: DictionaryValue };

/** All namespaces bundled per locale. */
export const NAMESPACES = [
  "common",
  "seo",
  "home",
  "products",
  "gcp",
  "ams",
  "dvp",
  "dvs",
  "service",
  "quote",
  "news",
] as const;

export type Namespace = (typeof NAMESPACES)[number];

// Turkish is the source language and always available synchronously so a
// missing translation can fall back to real copy instead of a raw key.
import trCommon from "./locales/tr/common.json";
import trSeo from "./locales/tr/seo.json";
import trHome from "./locales/tr/home.json";
import trProducts from "./locales/tr/products.json";
import trGcp from "./locales/tr/gcp.json";
import trAms from "./locales/tr/ams.json";
import trDvp from "./locales/tr/dvp.json";
import trDvs from "./locales/tr/dvs.json";
import trService from "./locales/tr/service.json";
import trQuote from "./locales/tr/quote.json";
import trNews from "./locales/tr/news.json";

export const TR_DICTIONARY: DictionaryNode = {
  common: trCommon as DictionaryNode,
  seo: trSeo as DictionaryNode,
  home: trHome as DictionaryNode,
  products: trProducts as DictionaryNode,
  gcp: trGcp as DictionaryNode,
  ams: trAms as DictionaryNode,
  dvp: trDvp as DictionaryNode,
  dvs: trDvs as DictionaryNode,
  service: trService as DictionaryNode,
  quote: trQuote as DictionaryNode,
  news: trNews as DictionaryNode,
};

// Non-Turkish namespace files are loaded on demand so each visitor downloads
// only their own language.
const localeModules = import.meta.glob<{ default: DictionaryNode }>("./locales/*/*.json");

export async function loadDictionary(locale: Locale): Promise<DictionaryNode> {
  if (locale === DEFAULT_LOCALE) return TR_DICTIONARY;

  const entries = await Promise.all(
    NAMESPACES.map(async (namespace) => {
      const loader = localeModules[`./locales/${locale}/${namespace}.json`];
      if (!loader) return [namespace, TR_DICTIONARY[namespace]] as const;
      try {
        const module = await loader();
        return [namespace, module.default] as const;
      } catch {
        return [namespace, TR_DICTIONARY[namespace]] as const;
      }
    }),
  );

  return Object.fromEntries(entries) as DictionaryNode;
}

/** Read a dotted path such as "common.nav.products" out of a dictionary. */
export function resolvePath(dictionary: DictionaryNode | undefined, path: string): DictionaryValue | undefined {
  if (!dictionary) return undefined;
  let current: DictionaryValue | undefined = dictionary;
  for (const segment of path.split(".")) {
    if (current === null || typeof current !== "object" || Array.isArray(current)) return undefined;
    current = (current as DictionaryNode)[segment];
    if (current === undefined) return undefined;
  }
  return current;
}
