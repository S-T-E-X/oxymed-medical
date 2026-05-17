export type IconKey = "production" | "design" | "safety" | "support" | "durability";

export type FeatureItem = {
  icon: IconKey;
  title: string;
  description: string;
};

export type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

export const languages = ["TR", "EN"];

export const navItems = [
  { label: "ANASAYFA", href: "/" },
  { label: "KURUMSAL", href: "/kurumsal", hasChildren: true },
  { label: "ÜRÜNLER", href: "/urunler", hasChildren: true },
  { label: "REFERANSLAR", href: "/referanslar" },
  { label: "HABERLER", href: "/haberler" },
  { label: "SERVİS", href: "/servis" },
  { label: "İLETİŞİM", href: "/#iletisim" }
];

export const features: FeatureItem[] = [
  {
    icon: "production",
    title: "YERLİ ÜRETİM",
    description: "%100 yerli sermaye ile yüksek kalite üretim"
  },
  {
    icon: "design",
    title: "MODERN TASARIM",
    description: "Estetik, ergonomik ve fonksiyonel çözümler"
  },
  {
    icon: "safety",
    title: "GÜVENLİK",
    description: "Uluslararası standartlara uygun güvenli sistemler"
  },
  {
    icon: "support",
    title: "TEKNİK DESTEK",
    description: "Satış öncesi ve sonrası kesintisiz teknik destek"
  },
  {
    icon: "durability",
    title: "UZUN ÖMÜRLÜ",
    description: "Dayanıklı malzeme ve uzun ömürlü kullanım"
  }
];

export const footerColumns: FooterColumn[] = [
  {
    title: "KURUMSAL",
    links: [
      { label: "Hakkımızda", href: "/kurumsal" },
      { label: "Vizyon & Misyon", href: "/kurumsal#vizyon" },
      { label: "Kalite Belgelerimiz", href: "/kurumsal#kalite" },
      { label: "İnsan Kaynakları", href: "/kurumsal#insan-kaynaklari" }
    ]
  },
  {
    title: "ÜRÜNLER",
    links: [
      { label: "Yatak Başı Üniteleri", href: "/urunler#yatak-basi-uniteleri" },
      { label: "Pendant Sistemleri", href: "/urunler#pendant-sistemleri" },
      { label: "Medikal Gaz Sistemleri", href: "/urunler#medikal-gaz-sistemleri" },
      { label: "Elektrik & Data Sistemleri", href: "/urunler#elektrik-data-sistemleri" }
    ]
  },
  {
    title: "HİZMETLERİMİZ",
    links: [
      { label: "Projelendirme", href: "/hizmetler#projelendirme" },
      { label: "Üretim", href: "/hizmetler#uretim" },
      { label: "Montaj", href: "/hizmetler#montaj" },
      { label: "Teknik Servis", href: "/hizmetler#teknik-servis" }
    ]
  },
  {
    title: "REFERANSLAR",
    links: [
      { label: "Tamamlanan Projeler", href: "/referanslar" },
      { label: "Kamu Projeleri", href: "/referanslar#kamu-projeleri" },
      { label: "Özel Projeler", href: "/referanslar#ozel-projeler" }
    ]
  }
];
