export type IconKey = "production" | "design" | "safety" | "support" | "durability";

export type FeatureItem = {
  icon: IconKey;
  title: string;
  description: string;
};

export type ProductGroup = {
  title: string;
  description: string;
  image: string;
  href: string;
};

export type StatItem = {
  value: string;
  label: string;
};

export type ReferenceLogo = {
  name: string;
  detail?: string;
};

export type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

export const contact = {
  phone: "+90 232 870 0 222",
  email: "info@oxymed.com.tr",
  address: "10016 Sk. No:5 AOSB Çiğli / İzmir / TÜRKİYE"
};

export const languages = ["TR", "EN"];

export const navItems = [
  { label: "ANASAYFA", href: "/" },
  { label: "KURUMSAL", href: "/kurumsal", hasChildren: true },
  { label: "ÜRÜNLER", href: "/urunler", hasChildren: true },
  { label: "REFERANSLAR", href: "/referanslar" },
  { label: "HABERLER", href: "/haberler" },
  { label: "İLETİŞİM", href: "/#iletisim" }
];

export const socialLinks = [
  { label: "LinkedIn", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" }
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

export const productGroups: ProductGroup[] = [
  {
    title: "YATAK BAŞI ÜNİTELERİ",
    description: "Elektrik, medikal gaz ve data üniteleri ile güvenli ve konforlu çözümler.",
    image: "/assets/images/product-bed-head-unit.png",
    href: "/urunler#yatak-basi-uniteleri"
  },
  {
    title: "PENDANT SİSTEMLERİ",
    description: "Ameliyathane, yoğun bakım ve acil üniteler için esnek pendant çözümleri.",
    image: "/assets/images/product-pendant-system.png",
    href: "/urunler#pendant-sistemleri"
  },
  {
    title: "MEDİKAL GAZ SİSTEMLERİ",
    description: "Oksijen, vakum, hava, AGS ve azot gaz sistemleri.",
    image: "/assets/images/product-medical-gas.png",
    href: "/urunler#medikal-gaz-sistemleri"
  },
  {
    title: "ELEKTRİK & DATA SİSTEMLERİ",
    description: "Elektrik, zayıf akım ve data sistemleri ile kesintisiz iletişim.",
    image: "/assets/images/product-electrical-data.png",
    href: "/urunler#elektrik-data-sistemleri"
  }
];

export const stats: StatItem[] = [
  { value: "15+", label: "YILLIK TECRÜBE" },
  { value: "200+", label: "TAMAMLANAN PROJE" },
  { value: "50+", label: "ÜLKEYE İHRACAT" },
  { value: "100%", label: "MÜŞTERİ MEMNUNİYETİ" }
];

export const references: ReferenceLogo[] = [
  { name: "ACIBADEM", detail: "Healthcare Services" },
  { name: "MEDICANA", detail: "Sağlık Grubu" },
  { name: "T.C. SAĞLIK BAKANLIĞI" },
  { name: "ŞİŞLİ HAMİDİYE ETFAL" },
  { name: "İSTANBUL ÜNİVERSİTESİ CERRAHPAŞA" },
  { name: "LÖSANTE", detail: "Çocuk ve Yetişkin Hastanesi" }
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
