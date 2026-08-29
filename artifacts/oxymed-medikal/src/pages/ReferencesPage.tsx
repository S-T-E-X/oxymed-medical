import { useState } from "react";
import { BedDouble, Building2, HeartHandshake, Stethoscope, Timer, Users, AlertCircle } from "lucide-react";
import { useListReferences, useListSettings } from "@workspace/api-client-react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import Seo from "../components/common/Seo";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { useI18n } from "../i18n/I18nProvider";
import { pickLocaleOverlay } from "../i18n/pickLocaleOverlay";
import { useLocalizedPath } from "../i18n/useLocalizedPath";
import { publicMediaUrl } from "../lib/mediaUrl";

const overviewIconMap = [Building2, Stethoscope, Users, HeartHandshake, BedDouble, Timer];

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      {message}
    </div>
  );
}

export default function ReferencesPage() {
  const { t } = useI18n();
  const path = useLocalizedPath();

  return (
    <div className="min-h-screen bg-white text-oxynavy-950">
      <Seo routeKey="references" />
      {/* The hero draws its own trail, so the shared component contributes the
          machine-readable hierarchy only. */}
      <Breadcrumbs
        jsonLdOnly
        items={[
          { label: t("references.breadcrumb.home"), to: path("home") },
          { label: t("references.breadcrumb.current") },
        ]}
      />
      <Header />
      <main>
        <ReferencesHero />
        <OverviewStats />
        <ProjectsSection />
        <MapSection />
      </main>
      <Footer />
    </div>
  );
}

function ReferencesHero() {
  const { t } = useI18n();
  const path = useLocalizedPath();
  const { data: refsData } = useListReferences({ limit: 1 });

  const breadcrumb = [
    { label: t("references.breadcrumb.home"), to: path("home") },
    { label: t("references.breadcrumb.current") },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-oxynavy-950 text-white">
      <img
        src="/assets/images/corporate-hero-facility.png"
        alt={t("references.hero.imageAlt")}
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-oxynavy-950 via-oxynavy-950/80 to-oxynavy-950/30" />
      <div className="relative mx-auto min-h-[300px] max-w-7xl px-4 py-12 sm:px-6 lg:min-h-[360px] lg:px-8 lg:py-16">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-xs font-medium text-white/78">
            {breadcrumb.map((item, index) => (
              <span key={item.label} className="inline-flex items-center gap-2">
                {item.to ? (
                  <a href={item.to} className="hover:text-white transition">{item.label}</a>
                ) : (
                  <span>{item.label}</span>
                )}
                {index < breadcrumb.length - 1 ? <span className="text-white/44">›</span> : null}
              </span>
            ))}
          </div>
          <p className="mt-7 text-sm font-extrabold text-white/82">{t("references.hero.eyebrow")}</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {refsData?.total ? `${refsData.total}+ ${t("references.hero.titleSuffix")}` : t("references.hero.title")}
          </h1>
          <div className="mt-5 h-1 w-14 bg-white" />
          <p className="mt-7 max-w-[470px] text-sm font-medium leading-7 text-white/88 sm:text-base">
            {t("references.hero.description")}
          </p>
        </div>
      </div>
    </section>
  );
}

function OverviewStats() {
  const { t } = useI18n();
  const { data: rawSettings } = useListSettings();
  const settings = rawSettings as Record<string, string> | undefined;
  const { data: refsData } = useListReferences({ limit: 1 });

  const overviewStats = [
    { value: refsData?.total ? `${refsData.total}+` : "170+", label: t("references.stats.projects") },
    { value: "120+", label: t("references.stats.public") },
    { value: "50+", label: t("references.stats.private") },
    { value: settings?.["exportCountries"] ?? "50+", label: t("references.stats.regions") },
    { value: "1.000+", label: t("references.stats.beds") },
    { value: settings?.["yearsExperience"] ?? "15+", label: t("references.stats.years") },
  ];

  return (
    <section className="border-b border-steel-100 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-steel-100 px-4 sm:grid-cols-3 sm:px-6 lg:grid-cols-6 lg:divide-y-0 lg:px-8">
        {overviewStats.map((stat, index) => {
          const Icon = overviewIconMap[index];
          return (
            <div key={stat.label} className="flex flex-col items-center gap-2 py-8 text-center">
              <Icon className="h-8 w-8 text-oxynavy-700 stroke-[1.4]" aria-hidden="true" />
              <strong className="mt-1 block text-3xl font-light text-oxynavy-950">{stat.value}</strong>
              <span className="text-[11px] font-extrabold text-steel-500">{stat.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ProjectsSection() {
  const { t, locale } = useI18n();
  const [activeCategory, setActiveCategory] = useState<string | undefined>();

  const allCategoryLabel = t("references.allCategory");

  const {
    data: allRefsData,
    isLoading: allLoading,
    isError: allError,
  } = useListReferences({ limit: 500 });
  const allRefs = allRefsData?.items ?? [];
  const categories = [allCategoryLabel, ...Array.from(new Set(allRefs.map((r) => r.category).filter(Boolean) as string[]))];

  const {
    data: filteredData,
    isLoading: filteredLoading,
    isError: filteredError,
  } = useListReferences({
    category: activeCategory,
    limit: 50,
  });
  const displayRefs = filteredData?.items ?? [];

  return (
    <section className="bg-steel-50 py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap gap-2">
          {allLoading
            ? [1, 2, 3, 4].map((i) => <div key={i} className="h-9 w-36 animate-pulse rounded bg-steel-200" />)
            : categories.map((cat) => {
                const isAll = cat === allCategoryLabel;
                const active = isAll ? !activeCategory : activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(isAll ? undefined : cat)}
                    className={`rounded px-4 py-2 text-[12px] font-extrabold transition ${
                      active
                        ? "bg-oxynavy-950 text-white"
                        : "border border-steel-200 bg-white text-oxynavy-950 hover:bg-oxynavy-950 hover:text-white"
                    }`}
                  >
                    {isAll
                      ? cat
                      : pickLocaleOverlay(
                          allRefs.find((item) => item.category === cat) ?? {},
                          "category",
                          locale,
                          cat,
                        )}
                  </button>
                );
              })}
        </div>

        {allError && <ErrorMessage message={t("references.errors.categories")} />}

        {filteredError ? (
          <ErrorMessage message={t("references.errors.list")} />
        ) : filteredLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-lg bg-steel-200" />
            ))}
          </div>
        ) : displayRefs.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-steel-200 py-16 text-center">
            <p className="text-steel-500">{t("references.empty")}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayRefs.map((project) => (
              <article
                key={project.id}
                className="group overflow-hidden rounded-lg border border-steel-100 bg-white shadow-[0_8px_24px_rgba(2,20,35,0.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(2,20,35,0.08)]"
              >
                <div className="aspect-[1.6] overflow-hidden">
                  <img
                    src={publicMediaUrl(project.imageUrl) ?? "/assets/images/corporate-hero-facility.png"}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2">
                    {project.projectType && (
                      <span className="rounded bg-oxynavy-50 px-2.5 py-1 text-[11px] font-extrabold text-oxynavy-700">
                        {pickLocaleOverlay(project, "projectType", locale, project.projectType)}
                      </span>
                    )}
                    {project.capacity && (
                      <span className="text-[11px] font-semibold text-steel-500">
                        {pickLocaleOverlay(project, "capacity", locale, project.capacity)}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-base font-extrabold text-oxynavy-950">{project.title}</h3>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function MapSection() {
  const { t } = useI18n();
  return (
    <section className="bg-oxynavy-950 py-14 text-white lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold sm:text-3xl">{t("references.map.title")}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/78">{t("references.map.description")}</p>
        </div>
        <div className="mt-10 flex justify-center overflow-hidden">
          <img
            src="/assets/turkiyeharitasi.webp"
            alt={t("references.map.imageAlt")}
            loading="lazy"
            decoding="async"
            className="block h-auto w-auto max-h-[260px] max-w-[260px] shrink-0 object-contain opacity-90"
          />
        </div>
      </div>
    </section>
  );
}
