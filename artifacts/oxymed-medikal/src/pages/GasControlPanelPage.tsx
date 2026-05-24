import { useGetProductBySlug } from "@workspace/api-client-react";
import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import {
  ShieldCheck,
  SlidersHorizontal,
  Bell,
  Wrench,
  Hospital,
  HeartPulse,
  Building2,
  FileCheck2,
  Layers3,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
} from "lucide-react";
import { useState } from "react";

const PAGE_SLUG = "kat-kontrol-panosu";

const ICON_SET = [ShieldCheck, SlidersHorizontal, Bell, Wrench, Hospital, HeartPulse, Building2, FileCheck2, Layers3];

const DEFAULT_FEATURES = [
  { title: "Yüksek Güvenlik", text: "EN ISO 7396-1 standardına uygun güvenli gaz dağıtımı" },
  { title: "Akıllı Kontrol", text: "Dijital manometreler ile anlık basınç izleme" },
  { title: "Alarm Sistemi", text: "Sesli ve görsel alarm bildirimleri" },
  { title: "Kolay Montaj", text: "Modüler yapı, hızlı kurulum ve servis" },
];
const DEFAULT_DETAIL_CARDS = [
  { title: "Gaz Bağlantı Ünitesi", text: "Oksijen, hava ve vakum hatları için DISS/NIST standart hızlı bağlantı sistemleri.", imageUrl: "" },
  { title: "Akıllı Kontrol Paneli", text: "Dijital manometreler, alarm röleleri ve zon izolasyon valfleri entegre edilmiştir.", imageUrl: "" },
  { title: "Dayanıklı Yapı", text: "316L paslanmaz çelik gövde, hastane sterilizasyon prosedürlerine uyumlu.", imageUrl: "" },
];
const DEFAULT_USE_CASES = [
  "Hastane klinikleri ve servis odaları",
  "Ameliyathaneler",
  "Yoğun bakım üniteleri",
  "Acil servisler",
  "Endoskopi ve DSA üniteleri",
];
const DEFAULT_ADVANTAGES = [
  "EN ISO 7396-1 ve HTM 02-01 standartlarına tam uyum",
  "Modüler tasarım sayesinde esnek konfigürasyon",
  "7/24 teknik destek ve yedek parça garantisi",
  "10 yıl yedek parça stok taahhüdü",
  "CE işaretli bileşenler",
];
const DEFAULT_FEATURE_TILES = [
  { title: "Çoklu Gaz Desteği", text: "O₂, N₂O, Hava, Vakum, CO₂ hatları tek panelde yönetilir." },
  { title: "Dijital İzleme", text: "Gerçek zamanlı basınç görüntüleme ve kayıt." },
  { title: "Alarm Yönetimi", text: "Zon bazlı sesli/görsel alarmlar, merkezi alarm sistemine entegre." },
  { title: "Kolay Bakım", text: "Çıkarılabilir modüller sayesinde sahada hızlı servis." },
];
const DEFAULT_FAQ = [
  { question: "Kaç farklı gaz türü için kurulum yapılabilir?", answer: "Standart modeller 3 ve 5 gazlı konfigürasyonlarda sunulmaktadır. Özel ihtiyaçlar için talebe özel tasarım hizmeti sağlanmaktadır." },
  { question: "Mevcut tesisat altyapısına uyumlu mu?", answer: "Evet. Farklı boru çapı adaptörlerimiz ile mevcut tesisat altyapısına kolayca entegre edilmektedir." },
  { question: "Kurulum süresi ne kadar?", answer: "Standart bir kat kontrol panosu kurulumu ortalama 4–8 saat içinde tamamlanmaktadır." },
  { question: "Bakım süresi ve garantisi nedir?", answer: "Ürünlerimiz 2 yıl resmi garanti kapsamındadır. Yıllık bakım sözleşmeleri sunulmaktadır." },
  { question: "Servis ekibi hangi bölgelere hizmet veriyor?", answer: "Türkiye genelinde yetkili servis ağımız mevcuttur. 24 saat içinde yerinde müdahale garantisi sunulmaktadır." },
  { question: "Ürünler hangi standartlara uygundur?", answer: "Tüm ürünlerimiz EN ISO 7396-1, HTM 02-01 ve TSE standartlarına uygundur. CE işaretlidir." },
];
const DEFAULT_SPECS = [
  { label: "Standart", value: "EN ISO 7396-1" },
  { label: "Gaz Türleri", value: "O₂, N₂O, Med. Hava, Vakum, CO₂" },
  { label: "Çalışma Basıncı", value: "0 – 16 bar" },
  { label: "Alarm Çıkışı", value: "Kuru kontak röle (NO/NC)" },
  { label: "Gövde Malzemesi", value: "316L Paslanmaz Çelik" },
  { label: "Bağlantı", value: "DISS / NIST" },
  { label: "Boyutlar", value: "600 × 400 × 150 mm (standart)" },
  { label: "Ağırlık", value: "Yaklaşık 18 kg" },
  { label: "Sertifikasyon", value: "CE, TSE" },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-slate-800 hover:text-oxynavy-700"
      >
        {question}
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed text-slate-600">{answer}</p>}
    </div>
  );
}

export default function GasControlPanelPage() {
  const { data: product, isLoading } = useGetProductBySlug(PAGE_SLUG);

  const pd = product?.pageData ?? {};
  const title = product?.title ?? "Kat Kontrol Panosu";
  const heroSubtitle = pd.heroSubtitle ?? "3 Gazlı";
  const heroDescription =
    pd.heroDescription ??
    "Hastane ve klinikler için EN ISO 7396-1 standartlarında üretilmiş, modüler yapıda tıbbi gaz dağıtım kontrol panelleri. Güvenli, izlenebilir ve alarm özellikli çözümler.";
  const features = pd.features?.length ? pd.features : DEFAULT_FEATURES;
  const detailCards = pd.detailCards?.length ? pd.detailCards : DEFAULT_DETAIL_CARDS;
  const useCases = pd.useCases?.length ? pd.useCases : DEFAULT_USE_CASES;
  const advantages = pd.advantages?.length ? pd.advantages : DEFAULT_ADVANTAGES;
  const featureTiles = pd.featureTiles?.length ? pd.featureTiles : DEFAULT_FEATURE_TILES;
  const faq = pd.faq?.length ? pd.faq : DEFAULT_FAQ;
  const specs = product?.specs?.length ? (product.specs as { label: string; value: string }[]) : DEFAULT_SPECS;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-br from-oxynavy-950 via-oxynavy-900 to-oxynavy-800 pb-20 pt-32 text-white">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center gap-2 text-sm text-oxynavy-300">
              <Link to="/urunler" className="hover:text-white">
                Ürünler
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white">{title}</span>
            </div>
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-12 w-3/4 animate-pulse rounded bg-white/10" />
                <div className="h-6 w-1/3 animate-pulse rounded bg-white/10" />
              </div>
            ) : (
              <>
                <div className="mb-3 inline-block rounded-full border border-oxynavy-600 bg-oxynavy-800/50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-oxynavy-300">
                  {heroSubtitle}
                </div>
                <h1 className="mb-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{title}</h1>
                <p className="mb-10 max-w-2xl text-lg leading-relaxed text-oxynavy-200">{heroDescription}</p>
              </>
            )}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {features.slice(0, 4).map((f, i) => {
                const Icon = ICON_SET[i % ICON_SET.length]!;
                return (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <Icon className="mb-2 h-6 w-6 text-oxynavy-300" />
                    <p className="text-sm font-bold">{f.title}</p>
                    <p className="mt-1 text-xs text-oxynavy-300">{f.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* DETAIL CARDS */}
        {detailCards.length > 0 && (
          <section className="bg-white py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-6 md:grid-cols-3">
                {detailCards.map((card, i) => (
                  <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-6 shadow-sm">
                    {card.imageUrl && (
                      <img src={card.imageUrl} alt={card.title} className="mb-4 h-40 w-full rounded-xl object-cover" />
                    )}
                    <h3 className="mb-2 text-base font-bold text-slate-900">{card.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{card.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SPECS TABLE */}
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="mb-6 text-2xl font-black text-slate-900">Teknik Özellikler</h2>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full">
                    <tbody className="divide-y divide-slate-100">
                      {specs.map((spec, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                          <td className="px-5 py-3 text-sm font-semibold text-slate-500">{spec.label}</td>
                          <td className="px-5 py-3 text-sm font-bold text-slate-900">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10">
                <div className="text-center text-slate-400">
                  <Layers3 className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                  <p className="text-sm font-semibold">Teknik Çizim</p>
                  <p className="mt-1 text-xs">Talep üzerine temin edilebilir</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* USE CASES + ADVANTAGES */}
        {(useCases.length > 0 || advantages.length > 0) && (
          <section className="bg-white py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-12 lg:grid-cols-2">
                {useCases.length > 0 && (
                  <div>
                    <h2 className="mb-6 text-2xl font-black text-slate-900">Kullanım Alanları</h2>
                    <ul className="space-y-3">
                      {useCases.map((uc, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-oxynavy-100">
                            <div className="h-2 w-2 rounded-full bg-oxynavy-600" />
                          </div>
                          <span className="text-sm leading-relaxed text-slate-700">{uc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {advantages.length > 0 && (
                  <div>
                    <h2 className="mb-6 text-2xl font-black text-slate-900">Avantajlar</h2>
                    <ul className="space-y-3">
                      {advantages.map((adv, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                          <span className="text-sm leading-relaxed text-slate-700">{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* FEATURE TILES */}
        {featureTiles.length > 0 && (
          <section className="bg-oxynavy-900 py-16 text-white">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <h2 className="mb-10 text-center text-2xl font-black">Ürün Özellikleri</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {featureTiles.map((tile, i) => {
                  const Icon = ICON_SET[(i + 4) % ICON_SET.length]!;
                  return (
                    <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5">
                      <Icon className="mb-3 h-7 w-7 text-oxynavy-300" />
                      <p className="mb-1.5 font-bold">{tile.title}</p>
                      <p className="text-sm leading-relaxed text-oxynavy-300">{tile.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        {faq.length > 0 && (
          <section className="bg-white py-16">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2 className="mb-8 text-center text-2xl font-black text-slate-900">Sıkça Sorulan Sorular</h2>
              <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white px-6 shadow-sm">
                {faq.map((item, i) => (
                  <FaqItem key={i} question={item.question ?? ""} answer={item.answer ?? ""} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h2 className="mb-4 text-3xl font-black text-slate-900">Teklif Almak İster misiniz?</h2>
            <p className="mb-8 text-slate-600">Projenize özel fiyat teklifi ve teknik danışmanlık için bizimle iletişime geçin.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/teklif-al"
                className="inline-flex items-center gap-2 rounded-xl bg-oxynavy-700 px-7 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-oxynavy-800"
              >
                Teklif Al
              </Link>
              <a
                href="tel:+902324610230"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <Phone className="h-4 w-4" /> Arayın
              </a>
              <a
                href="mailto:info@oxymed.com.tr"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <Mail className="h-4 w-4" /> E-posta
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
