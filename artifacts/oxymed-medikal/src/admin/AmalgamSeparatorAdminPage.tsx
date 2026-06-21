import DentalProductAdminPage, { type DentalProductConfig } from "./DentalProductAdminPage";

const config: DentalProductConfig = {
  heading: "Amalgam Separatörü Sayfası",
  prefix: "ams",
  defaultHero: {
    eyebrow: "OXYMED MEDİKAL",
    title: "AMALGAM SEPARATÖRÜ",
    desc1: "Oxymed Amalgam Separatörü, diş ünitelerinden aspirasyon sistemleriyle oluşan amalgam partiküllerini etkin şekilde ayırarak çevreye karışmasını önler.",
    desc2: "Hijyenik, dayanıklı ve verimli tasarımıyla güvenli bir çalışma ortamı sunar.",
  },
  galleryCount: 4,
  galleryLabel: "Detay Kart Görselleri (4 Adet)",
  defaultSpecs: [
    ["Ürün Adı", "Amalgam Separatörü"],
    ["Kullanım Alanı", "Diş üniteleri ve vakum sistemleri"],
    ["Gövde Malzemesi", "Paslanmaz Çelik (AISI 304)"],
    ["Bağlantı Yapısı", "Standart dental vakum hatlarına uygun"],
    ["Temizlik / Bakım", "Kolay sökülebilir yapı ve pürüzsüz yüzey"],
    ["Montaj Tipi", "Dikey montaj"],
    ["Uyumluluk", "Tüm dental vakum sistemleri ile uyumlu"],
    ["Yüzey Yapısı", "Pürüzsüz, hijyenik, korozyona dayanıklı"],
  ],
};

export default function AmalgamSeparatorAdminPage() {
  return <DentalProductAdminPage config={config} />;
}
