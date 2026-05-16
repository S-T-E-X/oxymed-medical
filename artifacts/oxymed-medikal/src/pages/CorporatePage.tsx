import { ArrowRight, Building2, Eye, Gem, Globe2, MapPinned, ShieldCheck, Target, UsersRound } from "lucide-react";
import ImageSlot from "../components/common/ImageSlot";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import { corporateAbout, corporateHero, corporateStats, corporateValues, qualityCards } from "../data/corporate";

const valueIconMap = {
  target: Target,
  eye: Eye,
  gem: Gem,
  shield: ShieldCheck
};

const statIconMap = [Building2, MapPinned, MapPinned, UsersRound, Globe2];

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
  return (
    <section className="relative isolate overflow-hidden bg-oxynavy-950 text-white">
      <ImageSlot
        tone="facility"
        image="/assets/images/corporate-hero-facility.png"
        alt="Oxymed Medikal üretim tesisi"
        className="absolute inset-0 h-full w-full opacity-70"
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
          <h1 className="mt-7 text-4xl font-extrabold tracking-tight sm:text-5xl">{corporateHero.title}</h1>
          <div className="mt-5 h-1 w-14 bg-white" />
          <p className="mt-7 max-w-[470px] text-sm font-medium leading-7 text-white/88 sm:text-base">
            {corporateHero.description}
          </p>
        </div>
      </div>
    </section>
  );
}

function CorporateIntro() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.25fr_0.95fr] lg:items-center lg:px-8">
        <div>
          <p className="text-xs font-extrabold text-oxynavy-700">{corporateAbout.eyebrow}</p>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight text-oxynavy-950 sm:text-4xl">
            {corporateAbout.title}
          </h2>
          <div className="mt-7 space-y-5 text-sm leading-7 text-steel-700">
            {corporateAbout.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <a
            href="#kalite"
            className="mt-8 inline-flex items-center gap-3 rounded bg-oxynavy-950 px-6 py-3.5 text-xs font-bold text-white transition hover:bg-oxynavy-800"
          >
            Daha Fazla Bilgi
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="overflow-hidden rounded-lg border border-steel-100 shadow-[0_14px_35px_rgba(2,20,35,0.08)]">
          <ImageSlot
            tone="factory"
            image="/assets/images/corporate-production-floor.png"
            alt="Oxymed üretim tesisi"
            className="aspect-[1.6]"
          />
        </div>

        <div className="space-y-6">
          {corporateValues.map((item) => {
            const Icon = valueIconMap[item.icon as keyof typeof valueIconMap];
            return (
              <article key={item.title} className="flex gap-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-oxynavy-950 text-white">
                  <Icon className="h-6 w-6 stroke-[1.6]" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-oxynavy-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-steel-700">{item.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CorporateStats() {
  return (
    <section className="bg-oxynavy-900 text-white">
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
