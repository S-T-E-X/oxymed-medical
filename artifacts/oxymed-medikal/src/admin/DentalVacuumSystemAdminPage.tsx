import DentalProductAdminPage, { type DentalProductConfig } from "./DentalProductAdminPage";

const config: DentalProductConfig = {
  heading: "Dental Vakum Sistemi Sayfası",
  prefix: "dvs",
  pageSlug: "dental-vakum-sistemi",
  defaultHero: {
    eyebrow: "OXY-DVS SERIES",
    title: "MERKEZİ DENTAL VAKUM SİSTEMİ",
    desc1: "Dental kliniklerin merkezi vakum ihtiyacını karşılamak için tasarlanmış, yüksek performanslı ve güvenilir sistem çözümü.",
    desc2: "Kesintisiz vakum gücü, sessiz çalışma ve uzun ömürlü yapı ile sağlık tesislerinde maksimum verimlilik sağlar.",
  },
  galleryCount: 3,
  galleryLabel: "Görsel Kart Görselleri (3 Adet)",
  defaultSpecs: [
    ["Ürün Adı", "OXY-DVS Dental Vakum Sistemi"],
    ["Vakum Kapasitesi", "100 - 840 m³/h (isteğe bağlı)"],
    ["Çalışma Vakumu", "-0,6 / -0,8 bar"],
    ["Pompa Adedi", "2 - 4 adet (yedekli)"],
    ["Motor Gücü", "2,2 - 4 kW (pompa başı)"],
    ["Güç Beslemesi", "380 VAC - 50 Hz"],
    ["Ses Seviyesi", "≤ 70 dB(A)"],
    ["Manifold Malzemesi", "Paslanmaz Çelik (AISI 304)"],
    ["Bağlantı Çapı", "DN40 - DN65"],
    ["Çalışma Sıcaklığı", "-10 °C / +50 °C"],
    ["Koruma Sınıfı", "IP54"],
    ["Boyutlar (YxGxD)", "1300 x 600 x 1200 mm (örnek)"],
  ],
};

export default function DentalVacuumSystemAdminPage() {
  return <DentalProductAdminPage config={config} />;
}
