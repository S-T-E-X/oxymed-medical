import type { StatItem } from "./home";

export const corporateHero = {
  breadcrumb: ["Anasayfa", "Kurumsal"],
  title: "KURUMSAL",
  description:
    "OXYMED Medikal, 15 yılı aşkın deneyimi, mühendislik gücü ve kaliteli üretim anlayışıyla sağlık sektörüne güvenilir ve teknolojik çözümler sunar."
};

export const corporateAbout = {
  eyebrow: "HAKKIMIZDA",
  title: "Sağlık İçin Teknoloji, Güvenilir Çözümler",
  paragraphs: [
    "OXYMED Medikal, medikal gaz sistemleri, yatak başı üniteleri, pendant sistemleri ve ameliyathane çözümleri alanlarında tasarım, üretim ve uygulama yapan yerli bir medikal teknoloji firmasıdır.",
    "Kurulduğumuz günden bu yana, modern üretim altyapımız, deneyimli ekibimiz ve kalite odaklı yaklaşımımızla; Türkiye'de ve yurt dışında birçok hastane, klinik ve sağlık kuruluşuna çözümler sunmaya devam ediyoruz."
  ]
};

export const corporateValues = [
  {
    icon: "target",
    title: "Misyonumuz",
    description:
      "Sağlık alanında teknolojiyi yakından takip ederek, insan hayatını destekleyen güvenilir ve yenilikçi çözümler üretmek."
  },
  {
    icon: "eye",
    title: "Vizyonumuz",
    description:
      "Ulusal ve uluslararası pazarda tercih edilen, kalitesi ve gücüyle öne çıkan bir medikal teknoloji markası olmak."
  },
  {
    icon: "gem",
    title: "Değerlerimiz",
    description:
      "Güven, kalite, yenilikçilik, müşteri memnuniyeti ve sürdürülebilirlik temel değerlerimizdir."
  },
  {
    icon: "shield",
    title: "Kalite Anlayışımız",
    description:
      "ISO 9001, ISO 13485 ve CE standartlarına uygun üretim yaparak, en yüksek kaliteyi sunuyoruz."
  }
];

export const corporateStats: StatItem[] = [
  { value: "15+", label: "Yıllık Tecrübe" },
  { value: "170+", label: "Tamamlanan Proje" },
  { value: "50+", label: "İl & Bölge" },
  { value: "100+", label: "Uzman Ekip" },
  { value: "10+", label: "Ülkeye İhracat" }
];

export const qualityCards = [
  { type: "visual", tone: "macro" },
  { type: "visual", tone: "line" },
  {
    type: "content",
    title: "ÜRETİMDEN UYGULAMAYA KALİTE",
    description:
      "Modern üretim tesisimizde, her bir ürünümüz kalite kontrol süreçlerinden geçerek yüksek standartlarda üretilmektedir.",
    note:
      "Mühendislikten montaja, satış sonrası desteğe kadar tüm süreçlerde müşteri memnuniyetini önceliğimiz olarak benimsiyoruz.",
    link: "Üretim Tesisimizi İnceleyin"
  },
  { type: "visual", tone: "warehouse" }
];
