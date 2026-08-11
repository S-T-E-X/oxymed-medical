/**
 * Quote page option lists and benefit tiles. Labels live in the `quote.*`
 * dictionary; these arrays fix the order, icons and stable option values.
 */
export const quoteBenefits = [
  { key: "fastResponse", icon: "clock" },
  { key: "reliable", icon: "shield" },
  { key: "expert", icon: "support" },
] as const;

/** Option keys resolve to `quote.options.projectTypes.<key>` labels. */
export const projectTypeKeys = ["bedHead", "pendant", "medicalGas", "electrical"] as const;

export const cityKeys = ["izmir", "ankara", "istanbul", "bursa", "antalya", "other"] as const;

export const applicationAreaKeys = ["hospital", "clinic", "icu", "operatingRoom", "emergency", "other"] as const;

/**
 * Canonical Turkish strings that are SUBMITTED to the API.
 * These must never change per language — the backend and existing records rely on them.
 */
export const PROJECT_TYPE_VALUES: Record<(typeof projectTypeKeys)[number], string> = {
  bedHead: "Yatak Başı Ünitesi",
  pendant: "Pendant Sistemi",
  medicalGas: "Medikal Gaz Sistemi",
  electrical: "Elektrik Tesisatı",
};

export const CITY_VALUES: Record<(typeof cityKeys)[number], string> = {
  izmir: "İzmir",
  ankara: "Ankara",
  istanbul: "İstanbul",
  bursa: "Bursa",
  antalya: "Antalya",
  other: "Diğer",
};

export const APPLICATION_AREA_VALUES: Record<(typeof applicationAreaKeys)[number], string> = {
  hospital: "Hastane",
  clinic: "Klinik",
  icu: "Yoğun Bakım",
  operatingRoom: "Ameliyathane",
  emergency: "Acil Servis",
  other: "Diğer",
};
