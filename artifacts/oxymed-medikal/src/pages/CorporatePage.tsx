import { AlertCircle, Award, Building2, Globe2 } from "lucide-react";
import { useListCorporateSections, useListSettings } from "@workspace/api-client-react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";

const DEFAULT_ABOUT_TITLE = "Sağlık İçin Güvenilir Sistemler";
const DEFAULT_ABOUT_CONTENT = `1999 yılında kurulan firmamız, medikal gaz sistemleri ve tıbbi cihazların üretimi, satışı, projelendirilmesi ve uygulaması alanlarında faaliyet göstermektedir. Kurulduğumuz günden bu yana sağlık sektörünün ihtiyaçlarını doğru analiz eden, güvenilir ve sürdürülebilir çözümler geliştiren bir anlayışla çalışmalarımızı sürdürmekteyiz.

Faaliyetlerimizin ilk yıllarından itibaren üretimini gerçekleştirdiğimiz medikal gaz sistemi ekipmanları ve hayata geçirdiğimiz sağlık tesisi projeleriyle kalite, güvenilirlik ve teknik yeterlilik konularında sektörde güçlü bir konum elde ettik. Hastaneler, klinikler ve çeşitli sağlık kuruluşlarında tamamladığımız uygulamalar sayesinde markamız, yüksek ürün kalitesi ve mühendislik yaklaşımıyla anılan bir yapıya kavuşmuştur.

Yıllar içerisinde üretim ve proje faaliyetlerimizin yanı sıra ithalat ve ihracat alanlarında da faaliyet göstererek hizmet ağımızı genişlettik. Ulusal ve uluslararası pazarlarda geliştirdiğimiz iş birlikleriyle ürün ve çözümlerimizi farklı coğrafyalardaki sağlık projelerine ulaştırmaya devam ediyoruz.

Teknik bilgi birikimimiz, deneyimli ekibimiz ve yıllar içerisinde başarıyla tamamladığımız projeler, bugün sahip olduğumuz mühendislik gücünün temelini oluşturmaktadır. Üretimden projelendirmeye, montajdan devreye almaya, satış sonrası teknik destekten periyodik bakım hizmetlerine kadar tüm süreçlerde kalite ve sürekliliği ön planda tutuyoruz.

Amacımız; geçmişten gelen tecrübemizi günümüz teknolojileriyle birleştirerek sağlık sektörüne güvenilir, verimli ve uzun ömürlü çözümler sunmaktır. Sürekli gelişimi esas alan yaklaşımımızla ürün kalitemizi, mühendislik kabiliyetimizi ve hizmet standartlarımızı her geçen gün daha ileriye taşımayı hedefliyoruz.

25 yılı aşkın tecrübemizle, sağlık tesisleri için güvenilir sistemler geliştiriyor; iş ortaklarımıza yalnızca ürün değil, uzun vadeli çözüm ortaklığı sunuyoruz.`;

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      {message}
    </div>
  );
}

export default function CorporatePage() {
  return (
    <div className="min-h-screen bg-white text-oxynavy-950">
      <Header />
      <main>
        <CorporateHero />
        <CorporateIntro />
        <CorporateStats />
      </main>
      <Footer />
    </div>
  );
}

function CorporateHero() {
  const { data: rawSettings } = useListSettings();
  const settings = rawSettings as Record<string, string> | undefined;
  const title = settings?.["corporate_hero_title"] || "Kurumsal";
  const description = settings?.["corporate_hero_description"] || "25 yılı aşkın deneyimimizle sağlık tesisleri için güvenilir sistemler geliştiriyoruz.";
  const imageUrl = settings?.["corporate_hero_image_url"] || "/assets/images/corporate-hero-facility.png";

  return (
    <section className="relative isolate overflow-hidden bg-oxynavy-950 text-white">
      <img src={imageUrl} alt="Oxymed Medikal" className="absolute inset-0 h-full w-full object-cover opacity-65" />
      <div className="absolute inset-0 bg-gradient-to-r from-oxynavy-950 via-oxynavy-950/82 to-oxynavy-950/35" />
      <div className="relative mx-auto flex min-h-[320px] max-w-7xl items-center px-4 py-14 sm:px-6 lg:min-h-[390px] lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold tracking-[0.22em] text-white/70">OXYMED MEDİKAL</p>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
          <div className="mt-5 h-1 w-14 bg-white" />
          <p className="mt-7 max-w-xl text-sm font-medium leading-7 text-white/88 sm:text-base">{description}</p>
        </div>
      </div>
    </section>
  );
}

function CorporateIntro() {
  const { data: sections = [], isLoading, isError } = useListCorporateSections();
  const about = sections.find((section) => section.sectionKey === "about");
  const content = about?.content || DEFAULT_ABOUT_CONTENT;
  const title = about?.title || DEFAULT_ABOUT_TITLE;

  if (isError) {
    return <section className="bg-white py-16"><div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"><ErrorMessage message="Kurumsal içerik yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin." /></div></section>;
  }
  if (isLoading) {
    return <section className="bg-white py-16"><div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"><div className="h-72 animate-pulse rounded-2xl bg-steel-100" /></div></section>;
  }

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold tracking-[0.16em] text-oxynavy-700">HAKKIMIZDA</p>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight text-oxynavy-950 sm:text-4xl">{title}</h2>
        </div>
        <div className="mt-10 space-y-6 text-[15px] leading-8 text-steel-700 sm:text-base">
          {content.split("\n\n").filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>
    </section>
  );
}

function CorporateStats() {
  const { data: rawSettings, isError } = useListSettings();
  const settings = rawSettings as Record<string, string> | undefined;
  const stats = [
    { value: settings?.["corporate_years_experience"] || "15+", label: "Yıllık Tecrübe", Icon: Building2 },
    { value: settings?.["corporate_completed_projects"] || "200+", label: "Tamamlanan Proje", Icon: Award },
    { value: settings?.["corporate_export_countries"] || "10+", label: "Ülkeye İhracat", Icon: Globe2 },
  ];

  return (
    <section className="bg-oxynavy-900 text-white">
      {isError && <div className="bg-red-900/40 px-4 py-2 text-center text-xs text-red-100">İstatistikler yüklenemedi; varsayılan değerler gösteriliyor.</div>}
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/12 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
        {stats.map(({ value, label, Icon }) => (
          <div key={label} className="flex items-center justify-center gap-5 py-8 sm:px-6">
            <Icon className="h-9 w-9 shrink-0 stroke-[1.4] text-white/86" aria-hidden="true" />
            <div>
              <strong className="block text-3xl font-light leading-none">{value}</strong>
              <span className="mt-2 block text-sm font-semibold text-white/82">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}