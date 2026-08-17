import DentalProductAdminPage, { type DentalProductConfig } from "./DentalProductAdminPage";

const config: DentalProductConfig = {
  heading: "Medikal Vakum Santrali Sayfası",
  prefix: "dvp",
  pageSlug: "dental-vakum-pompasi",
  defaultHero: {
    eyebrow: "OXYMED MEDİKAL",
    title: "MEDİKAL VAKUM SANTRALİ",
    desc1: "Oxymed Medikal Vakum Santrali, hastaneler ve sağlık tesisleri için güvenilir, sessiz ve kesintisiz merkezi vakum çözümü sunar.",
    desc2: "Yüksek performanslı motor yapısı ve dayanıklı tasarımıyla uzun ömürlü, ekonomik ve hijyenik bir kullanım sağlar.",
  },
  galleryCount: 3,
  galleryLabel: "Galeri Kart Görselleri (3 Adet)",
  defaultSpecs: [
    ["Ürün Adı", "Medikal Vakum Santrali"],
    ["Pompa Adedi", "3 Adet"],
    ["Tank Tipi", "Yatay Çelik Tank"],
    ["Gövde Yapısı", "Çelik, Toz Boyalı"],
    ["Tank Hacmi", "270 - 300 L (Opsiyonel)"],
    ["Çalışma Sistemi", "Yağsız Vakum Sistemi"],
    ["Maks. Vakum", "-0,85 bar"],
    ["Bağlantılar", "Vakum Girişi: 1 1/4\" / Tahliye: 1/2\""],
    ["Kullanım Alanı", "Hastaneler, poliklinikler ve sağlık tesisleri"],
    ["Bakım Kolaylığı", "Modüler yapı, kolay servis ve bakım"],
  ],
};

export default function DentalVacuumPumpAdminPage() {
  return <DentalProductAdminPage config={config} />;
}
