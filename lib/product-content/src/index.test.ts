import assert from "node:assert/strict";
import { test } from "node:test";
import {
  PRODUCT_SLUG_MAX_LENGTH,
  availableProductLocales,
  contentForLocale,
  hasProductContent,
  isProductLocaleAvailable,
  isProductPubliclyVisible,
  isValidProductSlug,
  localizedName,
} from "./index.ts";

/**
 * These lock the publish-eligibility contract that the public product page,
 * gen-sitemap, and prerender all share. If they drift apart again, a language
 * gets advertised (or served) without real content.
 */

const allTitles = {
  title: "Yoğun Bakım Ünitesi",
  titleEn: "Intensive Care Unit",
  titleDe: "Intensivstation",
};

test("a locale with no entry is not available", () => {
  const pageData = { heroDescription: "Türkçe", locales: { en: { heroDescription: "English" } } };
  assert.deepEqual(availableProductLocales(pageData, { product: allTitles }), ["tr", "en"]);
  assert.equal(isProductLocaleAvailable(pageData, "de", { product: allTitles }), false);
});

test("an empty or whitespace-only locale entry is not available", () => {
  const pageData = {
    heroDescription: "Türkçe",
    locales: { de: {}, fr: { heroSubtitle: "   " } },
  };
  const available = availableProductLocales(pageData, { product: allTitles });
  assert.ok(!available.includes("de"), "empty object must not count as content");
  assert.ok(!available.includes("fr"), "whitespace-only text must not count as content");
});

test("non-hero content still makes a locale available", () => {
  const pageData = { locales: { en: { faq: [{ question: "q", answer: "a" }] } } };
  assert.ok(availableProductLocales(pageData, { product: allTitles }).includes("en"));
});

test("a body translation without a localized title is NOT published", () => {
  // Otherwise the page body would be German while the <h1> stayed Turkish.
  const pageData = { locales: { de: { heroDescription: "Deutsche Beschreibung" } } };
  const titlesWithoutGerman = { title: "Türkçe Başlık", titleDe: "   " };
  assert.equal(isProductLocaleAvailable(pageData, "de", { product: titlesWithoutGerman }), false);
  assert.equal(isProductLocaleAvailable(pageData, "de", { product: allTitles }), true);
});

test("Turkish stays available on the card description alone", () => {
  assert.deepEqual(availableProductLocales({}, { fallbackDescription: "kart metni" }), ["tr"]);
  assert.deepEqual(availableProductLocales({}, {}), []);
});

test("Turkish never leaks into another locale's content", () => {
  const pageData = { heroDescription: "Türkçe", specs: [{ label: "Güç", value: "5kW" }] };
  assert.deepEqual(contentForLocale(pageData, "de"), undefined);
  assert.equal(hasProductContent(contentForLocale(pageData, "de")), false);
  assert.equal((contentForLocale(pageData, "tr") as { heroDescription?: string })?.heroDescription, "Türkçe");
});

test("valid product slugs are single lowercase URL segments", () => {
  for (const slug of ["dental-vakum-pompasi", "urun2", "a", "a-1-b"]) {
    assert.equal(isValidProductSlug(slug), true, `${slug} should be valid`);
  }
});

test("product slugs that could escape the build output directory are rejected", () => {
  // The build writes dist/public/<...>/<slug>/index.html, so any of these
  // could clobber or escape the output tree.
  const dangerous = [
    "../../../etc/passwd",
    "..",
    ".",
    "a/../../b",
    "nested/slug",
    "back\\slash",
    "with space",
    "UPPER",
    "trailing-",
    "-leading",
    "double--hyphen",
    "null\u0000byte",
    "new\nline",
    "",
    "a".repeat(PRODUCT_SLUG_MAX_LENGTH + 1),
  ];
  for (const slug of dangerous) {
    assert.equal(isValidProductSlug(slug), false, `${JSON.stringify(slug)} must be rejected`);
  }
  for (const notAString of [null, undefined, 42, {}, ["a"]]) {
    assert.equal(isValidProductSlug(notAString), false);
  }
});

test("localizedName has no Turkish fallback", () => {
  assert.equal(localizedName(allTitles, "title", "en"), "Intensive Care Unit");
  assert.equal(localizedName(allTitles, "title", "fr"), undefined);
  assert.equal(localizedName(allTitles, "title", "tr"), "Yoğun Bakım Ünitesi");
  assert.equal(localizedName({ name: "Kategori" }, "name", "de"), undefined);
});

test("an unpublished product is never publicly visible, however complete", () => {
  // Publication is a separate axis from translation: fully translated content
  // must still disappear the moment the product is withdrawn.
  const withdrawn = { published: false, ...allTitles };
  assert.equal(isProductPubliclyVisible(withdrawn), false);
  assert.equal(isProductPubliclyVisible(withdrawn, { categoryVisible: true }), false);

  // Anything other than an explicit true fails closed.
  for (const published of [undefined, null, 0, "true", "1", 1]) {
    assert.equal(isProductPubliclyVisible({ published }), false, `published=${String(published)}`);
  }
  assert.equal(isProductPubliclyVisible(null), false);
  assert.equal(isProductPubliclyVisible(undefined), false);
});

test("a published product is hidden when its category is hidden", () => {
  const live = { published: true, ...allTitles };
  assert.equal(isProductPubliclyVisible(live), true);
  assert.equal(isProductPubliclyVisible(live, { categoryVisible: true }), true);
  // Uncategorised products are unaffected.
  assert.equal(isProductPubliclyVisible(live, { categoryVisible: null }), true);
  assert.equal(isProductPubliclyVisible(live, { categoryVisible: false }), false);
});
