import QuoteTemplateView, { type QuoteViewData } from "./QuoteTemplateView";

const DEMO_DATA: QuoteViewData = {
  quoteNo: "OXM-TFL-2026-240501",
  quoteDate: "24.05.2026",
  firmaAdi: "Ankara Şehir Hastanesi",
  firmaAdres: "Bilkent Mah. Üniversiteler Cad. No: 1 Çankaya / Ankara",
  firmaTelefon: "0(312) 552 60 00",
  firmaEmail: "satinalma@ankarahastane.gov.tr",
  firmaVergiDairesi: "Çankaya",
  firmaVergiNo: "062 145 7890",
  teslimatAdresi: "Ankara Şehir Hastanesi Teknik Depo",
  teslimatSuresi: "Sipariş onayından sonra 21 iş günü",
  odemeSekli: "%40 sipariş, %60 teslimat öncesi",
  paraBirimi: "EUR",
  hizmetler: [
    "Projeye özel teknik keşif ve mühendislik desteği",
    "Montaj ve devreye alma hizmeti",
    "Kullanıcı eğitimi",
    "Garanti kapsamındaki yedek parça ve işçilik",
    "Periyodik bakım ve teknik destek",
    "7/24 teknik destek ve danışmanlık",
  ],
  sartlar: [
    "Bu teklif formu 30 gün süreyle geçerlidir.",
    "Fiyatlara KDV dahil değildir.",
    "Teslimat süresi, sipariş onayının ardından belirtilecektir.",
    "Ödeme, belirtilen vade ve koşullarda yapılacaktır.",
    "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.",
    "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır.",
  ],
  notlar:
    "Bu teklif, medikal gaz sistemleri kapsamında belirtilen ürünlerin temini, montaj hazırlığı ve teknik destek süreçleri için hazırlanmıştır. Nihai ölçülendirme saha keşfi ve proje onayı sonrasında kesinleştirilecektir.",
  iskonto: 5,
  iskontoTipi: "yuzde",
  kdv: 20,
  showKdv: true,
  showGenelToplam: true,
  hazirlayan: "Ahmet Yılmaz",
  hazirlayanTelefon: "0(312) 385 49 12",
  hazirlayanEmail: "ahmet.yilmaz@oxymedmedical.com",
  hazirlayanImzaUrl: "",
  onaylayan: "Mehmet Kaya",
  onaytayanGorev: "Proje Müdürü",
  onayTarihi: "24.05.2026",
  items: [
    { no: "1", itemType: "single", title: "OXY-DVS Dental Vakum Sistemi", bullets: ["Yağsız, sessiz çalışan vakum pompaları", "Otomatik çalışma panosu", "300 L vakum tankı", "Basınç şalteri ve emniyet valfleri", "CE uygunluk"], code: "OXM-DVS-300", quantity: 1, unit: "ADET", unitPrice: 4850 },
    { no: "2", itemType: "single", title: "OXY-MGS Medikal Gaz Santrali", bullets: ["Oksijen, Azot ve Hava üretim sistemi", "PSA teknolojisi ile yüksek saflıkta gaz üretimi", "Otomatik kontrol ve izleme sistemi", "CE uygunluk"], code: "OXM-MGS-20", quantity: 1, unit: "ADET", unitPrice: 7900 },
    { no: "3", itemType: "single", title: "Yatak Başı Ünitesi", bullets: ["O2, Vakum, Hava çıkışları", "LED aydınlatma", "Çağrı sistemi uyumu", "Alüminyum gövde"], code: "OXM-YBU-01", quantity: 5, unit: "ADET", unitPrice: 620 },
    { no: "4", itemType: "single", title: "Pendant Sistemi (Çift Kollu)", bullets: ["Motorize hareketli kol sistemi", "Gaz, elektrik ve data çıkışları", "360° döner yapı", "LED çalışma lambası"], code: "OXM-PND-02", quantity: 2, unit: "ADET", unitPrice: 2350 },
    { no: "5", itemType: "single", title: "Medikal Gaz Alarm Paneli", bullets: ["Anlık basınç izleme", "Sesli ve görsel alarm", "Modüler sensör girişi", "Kolay servis erişimi"], code: "OXM-ALR-06", quantity: 3, unit: "ADET", unitPrice: 410 },
    { no: "6", itemType: "group", title: "Medikal Gaz Bakır Boru Tesisatı", bullets: [], code: "OXM-COP", quantity: 0, unit: "" , unitPrice: 0 },
    { no: "6.1", itemType: "child", title: "Ø22mm Bakır Boru", bullets: ["Antibakteriyel temizlenmiş", "Hat etiketleme dahil"], code: "OXM-COP-22", quantity: 50, unit: "METRE", unitPrice: 18 },
    { no: "6.2", itemType: "child", title: "Ø15mm Bakır Boru", bullets: ["Antibakteriyel temizlenmiş", "Lehimli bağlantı sistemi"], code: "OXM-COP-15", quantity: 80, unit: "METRE", unitPrice: 12 },
    { no: "6.3", itemType: "child", title: "Gaz Prizi Seti", bullets: ["DIN standardına uygun bağlantı", "Renk kodlu kullanım"], code: "OXM-GPS-03", quantity: 12, unit: "ADET", unitPrice: 85 },
    { no: "7", itemType: "single", title: "Vakum Regülatörü", bullets: ["Hassas vakum ayarı", "Kolay okunabilir gösterge", "Duvar tipi kullanım", "Medikal standartlara uygun"], code: "OXM-VRG-01", quantity: 6, unit: "ADET", unitPrice: 145 },
  ],
};

export default function QuoteTemplatePage() {
  return <QuoteTemplateView data={DEMO_DATA} />;
}
