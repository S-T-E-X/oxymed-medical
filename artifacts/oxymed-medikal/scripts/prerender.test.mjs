import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import { jsonLdScript, distFileFor } from "./prerender.mjs";

/**
 * Prerendered pages inline admin-authored product/article text into a
 * <script type="application/ld+json"> block. These lock the two ways CMS
 * content could break out of the generated HTML.
 */

test("a </script> in CMS text cannot close the JSON-LD block", () => {
  // The classic breakout: JSON.stringify does NOT escape this sequence.
  const productLd = {
    "@type": "Product",
    name: 'Pump </script><script>alert("xss")</script>',
    description: "</SCRIPT ><img src=x onerror=alert(1)>",
  };

  const serialized = jsonLdScript(productLd);
  const html = `<script type="application/ld+json">${serialized}</script>`;

  assert.ok(!serialized.includes("<"), "no raw < may survive serialization");
  assert.ok(!serialized.includes(">"), "no raw > may survive serialization");
  assert.ok(!/<\/script/i.test(serialized), "must not contain a closing script tag");

  // Exactly one opening and one closing script tag: the payload added none.
  assert.equal(html.match(/<script/gi).length, 1);
  assert.equal(html.match(/<\/script>/gi).length, 1);
  assert.ok(!/<img/i.test(html), "no injected element");

  // Still valid JSON, and the text round-trips unchanged for search engines.
  const parsed = JSON.parse(serialized);
  assert.equal(parsed.name, productLd.name);
  assert.equal(parsed.description, productLd.description);
});

test("line and paragraph separators are escaped", () => {
  // Raw U+2028/U+2029 are newlines to a JS parser and break inline scripts.
  const serialized = jsonLdScript({ name: "a\u2028b\u2029c" });
  assert.ok(!serialized.includes("\u2028"));
  assert.ok(!serialized.includes("\u2029"));
  assert.equal(JSON.parse(serialized).name, "a\u2028b\u2029c");
});

test("ampersands survive as valid JSON", () => {
  const serialized = jsonLdScript({ name: "Gas & Vacuum" });
  assert.equal(JSON.parse(serialized).name, "Gas & Vacuum");
});

test("valid route paths resolve to their own index.html", () => {
  const distRoot = path.resolve(import.meta.dirname, "..", "dist/public");

  assert.equal(distFileFor("/"), path.join(distRoot, "index.html"));
  assert.equal(distFileFor("/urunler/ok-slug"), path.join(distRoot, "urunler/ok-slug/index.html"));
  assert.equal(distFileFor("/en/products/ok-slug"), path.join(distRoot, "en/products/ok-slug/index.html"));
});

test("route paths cannot escape the dist directory", () => {
  for (const evil of ["/urunler/../../../../tmp/pwned", "/../../etc/passwd"]) {
    assert.throws(() => distFileFor(evil), /Refusing to write/, `${evil} must be refused`);
  }
});

test("route paths cannot overwrite a DIFFERENT page inside dist", () => {
  // The dangerous case that a containment-only check misses: this resolves to
  // dist/public/en/index.html — inside the tree, but it clobbers the English
  // home page instead of writing the product's own file.
  assert.throws(() => distFileFor("/urunler/../en"), /non-canonical/, "must not overwrite /en");

  for (const evil of [
    "/urunler/..",
    "/urunler/./slug",
    "/urunler//slug",
    "/urunler/slug/",
    "/urunler/../../index",
    "/urunler/back\\slash",
  ]) {
    assert.throws(() => distFileFor(evil), /Refusing to write/, `${evil} must be refused`);
  }
});

test("route paths must be absolute strings", () => {
  for (const bad of ["urunler/slug", "", null, undefined, 42]) {
    assert.throws(() => distFileFor(bad), /Refusing to write/, `${bad} must be refused`);
  }
});
