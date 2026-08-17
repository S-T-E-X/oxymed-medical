export type IconKey = "production" | "design" | "safety" | "support" | "durability";

export type FeatureItem = {
  icon: IconKey;
  /** Dictionary key under `home.features` — resolved at render time. */
  key: IconKey;
};

export type FooterColumnDef = {
  /** Dictionary key under `common.footer.columns`. */
  key: "corporate" | "products" | "services" | "references";
  links: { key: string; href: string }[];
};

export type NavItemDef = {
  /** Dictionary key under `common.nav`. */
  key: "home" | "corporate" | "products" | "references" | "news" | "service" | "contact";
  /** Route key for translated pages, or a raw href for Turkish-only pages. */
  route?: "home" | "products" | "service" | "quote" | "news";
  href?: string;
  dropdown?: "categories" | "corporate";
};

export const navItems: NavItemDef[] = [
  { key: "home", route: "home" },
  { key: "corporate", href: "/kurumsal", dropdown: "corporate" },
  { key: "products", route: "products", dropdown: "categories" },
  { key: "references", href: "/referanslar" },
  // "news" is a translated route so hrefFor() resolves the per-locale segment.
  { key: "news", route: "news" },
  { key: "service", route: "service" },
  { key: "contact", route: "quote" },
];

export const features: FeatureItem[] = [
  { icon: "production", key: "production" },
  { icon: "design", key: "design" },
  { icon: "safety", key: "safety" },
  { icon: "support", key: "support" },
  { icon: "durability", key: "durability" },
];

export const footerColumns: FooterColumnDef[] = [
  {
    key: "corporate",
    links: [
      { key: "about", href: "/kurumsal" },
      { key: "vision", href: "/kurumsal" },
      { key: "quality", href: "/kurumsal#kalite" },
      { key: "catalogs", href: "/kataloglar" },
    ],
  },
  {
    key: "products",
    links: [
      { key: "bedHead", href: "#yatak-basi-uniteleri" },
      { key: "pendant", href: "#pendant-sistemleri" },
      { key: "medicalGas", href: "#medikal-gaz-sistemleri" },
      { key: "electrical", href: "#elektrik-data-sistemleri" },
    ],
  },
  {
    key: "services",
    links: [
      { key: "engineering", href: "/hizmetler#projelendirme" },
      { key: "manufacturing", href: "/hizmetler#uretim" },
      { key: "installation", href: "/hizmetler#montaj" },
      { key: "technicalService", href: "/hizmetler#teknik-servis" },
    ],
  },
  {
    key: "references",
    links: [
      { key: "completed", href: "/referanslar" },
      { key: "public", href: "/referanslar#kamu-projeleri" },
      { key: "private", href: "/referanslar#ozel-projeler" },
    ],
  },
];
