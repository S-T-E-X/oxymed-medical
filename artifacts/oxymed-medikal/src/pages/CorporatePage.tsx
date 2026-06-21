import { AlertCircle, ArrowRight, Building2, Eye, Gem, Globe2, MapPinned, ShieldCheck, Target, UsersRound } from "lucide-react";
import { useListCorporateSections, useListSettings } from "@workspace/api-client-react";
import ImageSlot from "../components/common/ImageSlot";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import { corporateHero, qualityCards } from "../data/corporate";

const valueIconMap = {
  vision: Eye,
  mission: Target,
  values: Gem,
  quality: ShieldCheck,
} as const;

const defaultValueIcons = [Target, Eye, Gem, ShieldCheck];
const statIconMap = [Building2, MapPinned, MapPinned, UsersRound, Globe2];

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
        <QualitySection />
      </main>
      <Footer />
    </div>
  );
}

function CorporateHero() {
  const { data: rawSettings } = useListSettings();
  const settings = rawSettings as Record<string, string> | undefined;

  const title = settings?.["corporate_hero_title"] || corporateHero.title;
  const description = settings?.["corporate_hero_description"] || corporateHero.description;
  const imageUrl = settings?.["corporate_hero_image_url"] || "/assets/images/corporate-hero-facility.png";

  return (
    <section className="relative isolate overflow-hidden bg-oxynavy-950 text-white">
      <img
        src={imageUrl}
        alt="Oxymed Medikal üretim tesisi"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-oxynavy-950 via-oxynavy-950/84 to-oxynavy-950/28" />
      <div className="relative mx-auto min-h-[300px] max-w-7xl px-4 py-12 sm:px-6 lg:min-h-[360px] lg:px-8 lg:py-16">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-xs font-medium text-white/78">
            {corporateHero.breadcrumb.map((item, index) => (
              <span key={item} className="inline-flex items-center gap-2">
                {item}
                {index < corporateHero.breadcrumb.length - 1 ? <span className="text-white/44">›</span> : null}
              </span>
            ))}
          </div>
          <h1 className="mt-7 text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
          <div className="mt-5 h-1 w-14 bg-white" />
          <p className="mt-7 max-w-[470px] text-sm font-medium leading-7 text-white/88 sm:text-base">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

function CorporateIntro() {
  const { data: sections = [], isLoading, isError } = useListCorporateSections();
  const { data: rawSettings } = useListSettings();
  const settings = rawSettings as Record<string, string> | undefined;

  const about = sections.find((s) => s.sectionKey === "about");
  const valueSections = sections.filter((s) =>
    ["vision", "mission", "values", "quality"].includes(s.sectionKey)
  );

  if (isError) {
    return (
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ErrorMessage message="Kurumsal içerik yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin." />
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-48 animate-pulse rounded-lg bg-steel-100" />)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.25fr_0.95fr] lg:items-center lg:px-8">
        <div>
          <p className="text-xs font-extrabold text-oxynavy-700">HAKKIMIZDA</p>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight text-oxynavy-950 sm:text-4xl">
            {about?.title ?? "Sağlık İçin Teknoloji, Güvenilir Çözümler"}
          </h2>
          <div className="mt-7 space-y-5 text-sm leading-7 text-steel-700">
            {about?.content
              ? about.content.split("\n\n").filter(Boolean).map((para, i) => <p key={i}>{para}</p>)
              : (
                <>
                  <p>OXYMED Medikal, medikal gaz sistemleri, yatak başı üniteleri, pendant sistemleri ve ameliyathane çözümleri alanlarında tasarım, üretim ve uygulama yapan yerli bir medikal teknoloji firmasıdır.</p>
                  <p>Kurulduğumuz günden bu yana, modern üretim altyapımız, deneyimli ekibimiz ve kalite odaklı yaklaşımımızla; Türkiye'de ve yurt dışında birçok hastane, klinik ve sağlık kuruluşuna çözümler sunmaya devam ediyoruz.</p>
                </>
              )
            }
          </div>
          <a
            href={settings?.["corporate_about_button_url"] || "#kalite"}
            className="mt-8 inline-flex items-center gap-3 rounded bg-oxynavy-950 px-6 py-3.5 text-xs font-bold text-white transition hover:bg-oxynavy-800"
          >
            {settings?.["corporate_about_button_text"] || "Daha Fazla Bilgi"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="overflow-hidden rounded-lg border border-steel-100 shadow-[0_14px_35px_rgba(2,20,35,0.08)]">
          <ImageSlot
            tone="factory"
            image={about?.imageUrl ?? "/assets/images/corporate-production-floor.png"}
            alt="Oxymed üretim tesisi"
            className="aspect-[1.6]"
          />
        </div>

        <div className="space-y-6">
          {valueSections.length > 0
            ? valueSections.map((section, i) => {
                const Icon = valueIconMap[section.sectionKey as keyof typeof valueIconMap] ?? defaultValueIcons[i % 4];
                return (
                  <article key={section.id} className="flex gap-5">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-oxynavy-950 text-white">
                      <Icon className="h-6 w-6 stroke-[1.6]" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-extrabold text-oxynavy-950">{section.title}</h3>
                      {section.content && (
                        <p className="mt-2 text-sm leading-6 text-steel-700">{section.content}</p>
                      )}
                    </div>
                  </article>
                );
              })
            : [
                { icon: Target, title: "Misyonumuz", description: "Sağlık alanında teknolojiyi yakından takip ederek, insan hayatını destekleyen güvenilir ve yenilikçi çözümler üretmek." },
                { icon: Eye, title: "Vizyonumuz", description: "Ulusal ve uluslararası pazarda tercih edilen, kalitesi ve gücüyle öne çıkan bir medikal teknoloji markası olmak." },
                { icon: Gem, title: "Değerlerimiz", description: "Güven, kalite, yenilikçilik, müşteri memnuniyeti ve sürdürülebilirlik temel değerlerimizdir." },
                { icon: ShieldCheck, title: "Kalite Anlayışımız", description: "ISO 9001, ISO 13485 ve CE standartlarına uygun üretim yaparak, en yüksek kaliteyi sunuyoruz." },
              ].map((item) => (
                <article key={item.title} className="flex gap-5">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-oxynavy-950 text-white">
                    <item.icon className="h-6 w-6 stroke-[1.6]" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold text-oxynavy-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-steel-700">{item.description}</p>
                  </div>
                </article>
              ))
          }
        </div>
      </div>
    </section>
  );
}

function CorporateStats() {
  const { data: rawSettings, isError } = useListSettings();
  const settings = rawSettings as Record<string, string> | undefined;

  const corporateStats = [
    { value: settings?.["yearsExperience"] ?? "15+", label: "Yıllık Tecrübe" },
    { value: settings?.["completedProjects"] ?? "170+", label: "Tamamlanan Proje" },
    { value: settings?.["exportCountries"] ?? "50+", label: "İl & Bölge" },
    { value: "100+", label: "Uzman Ekip" },
    { value: "10+", label: "Ülkeye İhracat" },
  ];

  return (
    <section className="bg-oxynavy-900 text-white">
      {isError && (
        <div className="flex items-center justify-center gap-2 bg-red-900/40 px-4 py-2 text-xs text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          İstatistikler yüklenemedi, varsayılan değerler gösteriliyor.
        </div>
      )}
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/12 px-4 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-6 lg:grid-cols-5 lg:px-8">
        {corporateStats.map((stat, index) => {
          const Icon = statIconMap[index];
          return (
            <div key={stat.label} className="flex items-center gap-5 py-8 sm:px-6">
              <Icon className="h-9 w-9 shrink-0 stroke-[1.4] text-white/86" aria-hidden="true" />
              <div>
                <strong className="block text-3xl font-light leading-none">{stat.value}</strong>
                <span className="mt-2 block text-sm font-semibold text-white/82">{stat.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function QualitySection() {
  return (
    <section id="kalite" className="bg-steel-50 py-5 lg:py-6">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:h-[220px] lg:grid-cols-[1fr_1fr_0.88fr_1.65fr] lg:px-8">
        {qualityCards.map((card, index) => {
          if (card.type === "content") {
            return (
              <article
                key={card.title}
                className="h-[220px] overflow-hidden rounded-lg bg-oxynavy-900 p-5 text-white shadow-[0_14px_35px_rgba(2,20,35,0.08)] lg:h-full"
              >
                <h2 className="text-base font-extrabold leading-tight lg:text-lg">{card.title}</h2>
                <p className="mt-4 text-[12px] font-medium leading-5 text-white/82">{card.description}</p>
                <p className="mt-3 text-[12px] font-medium leading-5 text-white/82">{card.note}</p>
              </article>
            );
          }

          const imageMap = [
            "/assets/images/corporate-quality-macro.png",
            "/assets/images/corporate-bedhead-line.png",
            "/assets/images/corporate-warehouse.png"
          ];
          const visualIndex = qualityCards.slice(0, index).filter((item) => item.type === "visual").length;

          return (
            <div
              key={`${card.tone}-${index}`}
              className="h-[220px] overflow-hidden rounded-lg border border-steel-100 shadow-[0_14px_35px_rgba(2,20,35,0.08)] lg:h-full"
            >
              <ImageSlot
                tone={card.tone as "macro" | "line" | "warehouse"}
                image={imageMap[visualIndex]}
                alt="Oxymed kalite ve üretim görseli"
                className="h-full"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
