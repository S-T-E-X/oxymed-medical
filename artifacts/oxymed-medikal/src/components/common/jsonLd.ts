/**
 * Shared helpers for the JSON-LD blocks the app injects at runtime.
 *
 * Every script written here is tagged with `data-seo-jsonld="<id>"` so a
 * navigation can replace or remove exactly the block it owns without
 * disturbing structured data baked into the HTML at build time.
 */
export function setJsonLd(id: string, data: unknown | null) {
  const existing = document.head.querySelector<HTMLScriptElement>(`script[data-seo-jsonld="${id}"]`);
  if (!data) {
    existing?.remove();
    return;
  }
  const script = existing ?? document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute("data-seo-jsonld", id);
  script.textContent = JSON.stringify(data);
  if (!existing) document.head.appendChild(script);
}

export type JsonLdSlot = {
  /** Publish (or update) this claimant's data. */
  claim: (owner: symbol, data: unknown | null) => void;
  /** Drop this claimant; the next one in line takes over the slot. */
  release: (owner: symbol) => void;
};

/**
 * A `<head>` slot that at most one component may own at a time.
 *
 * A page should expose exactly one of some structured-data types — a second
 * BreadcrumbList would describe a second, contradictory hierarchy. Without
 * arbitration two mounted components sharing an id would overwrite each
 * other's payload, and whichever unmounted first would delete the survivor's
 * script. The slot keeps claimants in mount order, always renders the first,
 * and hands ownership to the next when the current owner releases.
 */
export function createJsonLdSlot(id: string): JsonLdSlot {
  const claimants: Array<{ owner: symbol; data: unknown | null }> = [];

  const render = () => setJsonLd(id, claimants[0]?.data ?? null);

  return {
    claim(owner, data) {
      const existing = claimants.find((claimant) => claimant.owner === owner);
      if (existing) existing.data = data;
      else claimants.push({ owner, data });
      render();
    },
    release(owner) {
      const index = claimants.findIndex((claimant) => claimant.owner === owner);
      if (index !== -1) claimants.splice(index, 1);
      render();
    },
  };
}
