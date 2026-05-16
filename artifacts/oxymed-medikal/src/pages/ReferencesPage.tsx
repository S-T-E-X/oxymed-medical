import { useState } from "react";
import { useListReferences } from "@workspace/api-client-react";
import { Building2, ChevronRight, Circle, Globe2, HeartHandshake, Hospital, MapPinned, Play, Quote, ShieldCheck, Sparkles, Stethoscope, Truck, Users } from "lucide-react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import { referencesHero, referencesMap, referenceMetrics, referenceTabs } from "../data/references";
import { Link } from "react-router-dom";

export default function ReferencesPage() {
  return (
    <div className="min-h-screen bg-white text-oxynavy-950">
      <Header />
      <main>
        <HeroSection />
        <MetricsSection />
        <ReferencesGrid />
        <MapSection />
      </main>
      <Footer />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-oxynavy-950 text-white">
      <img
        src={referencesHero.image}
        alt={referencesHero.title}
        className="absolute inset-0 h-full w-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-oxynavy-950 via-oxynavy-950/85 to-oxynavy-950/35" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <div className="text-sm font-medium text-white/68">
            {referencesHero.breadcrumb.join(" › ")}
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-white/64">
            {referencesHero.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            {referencesHero.title}
          </h1>
          <div className="mt-6 h-1 w-14 bg-white" />
          <p className="mt-6 max-w-xl text-base leading-8 text-white/88 sm:text-lg sm:leading-9">
            {referencesHero.description}
          </p>
        </div>
      </div>
    </section>
  );
}

function MetricsSection() {
  return (
    <section className="border-b border-steel-100 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-steel-100 px-4 sm:grid-cols-3 sm:px-6 lg:grid-cols-6 lg:divide-y-0 lg:px-8">
        {referenceMetrics.map((metric) => (
          <div key={metric.label} className="flex flex-col items-center justify-center px-4 py-8 text-center sm:py-10">
            <metric.icon className="h-10 w-10 text-oxynavy-700" aria-hidden="true" />
            <div className="mt-3 text-3xl font-black text-oxynavy-950">{metric.value}</div>
            <div className="mt-1 text-xs font-semibold text-steel-500">{metric.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReferencesGrid() {
  const { data: refsData } = useListReferences({ limit: 500 });
  const refs = refsData?.items ?? [];
  const categories = ["TÜM PROJELER", ...Array.from(new Set(refs.map((ref) => ref.category).filter(Boolean) as string[]))];
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const filteredRefs = activeCategory ? refs.filter((ref) => ref.category === activeCategory) : refs;

  return (
    <section className="bg-steel-50 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === "TÜM PROJELER" ? undefined : cat)}
              className={`rounded px-4 py-2 text-[12px] font-extrabold transition ${
                (cat === "TÜM PROJELER" && !activeCategory) || activeCategory === cat
                  ? "bg-oxynavy-950 text-white"
                  : "border border-steel-200 bg-white text-oxynavy-950 hover:bg-oxynavy-950 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRefs.map((ref) => (
            <article
              key={ref.id}
              className="group overflow-hidden rounded-xl border border-steel-100 bg-white shadow-[0_8px_24px_rgba(2,20,35,0.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(2,20,35,0.08)]"
            >
              <div className="aspect-[1.6] overflow-hidden">
                <img
                  src={ref.imageUrl ?? "/assets/images/product-medical-gas.png"}
                  alt={ref.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <span className="rounded bg-oxynavy-50 px-2 py-0.5 text-[11px] font-extrabold text-oxynavy-700">{ref.category}</span>
                  {ref.city && <span className="text-[11px] text-steel-500">{ref.city}</span>}
                </div>
                <h3 className="mt-3 text-lg font-extrabold leading-tight text-oxynavy-950">{ref.title}</h3>
                <p className="mt-2 text-sm leading-6 text-steel-700">{ref.city ?? ""}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MapSection() {
  return (
    <section className="bg-oxynavy-950 py-14 text-white lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold sm:text-3xl">{referencesMap.title}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/78">{referencesMap.description}</p>
        </div>
        <div className="mt-10 flex justify-center">
          <img
            src="/assets/turkiyeharitasi.webp"
            alt="Türkiye Referans Haritası"
            className="w-full max-w-[16rem] opacity-90"
          />
        </div>
      </div>
    </section>
  );
}
