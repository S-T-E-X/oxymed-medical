import { BookOpen, Download, FileText } from "lucide-react";
import { useListCatalogs } from "@workspace/api-client-react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import { resolvePublicDocumentUrl } from "../lib/documentUrl";
import { useI18n } from "../i18n/I18nProvider";
import { trackInteraction } from "../components/common/VisitorTracker";

const LANGUAGE_LABELS: Record<string, string> = {
  TR: "Türkçe",
  EN: "English",
  DE: "Deutsch",
  FR: "Français",
  AR: "العربية",
  IT: "Italiano",
  RU: "Русский",
  FA: "فارسی",
  KA: "ქართული",
  BG: "Български",
  AZ: "Azərbaycan",
};

export default function CatalogsPage() {
  const { t } = useI18n();
  const { data: catalogs = [], isLoading, isError } = useListCatalogs({ activeOnly: true });

  const grouped = catalogs.reduce<Record<string, typeof catalogs>>((groups, catalog) => {
    (groups[catalog.language] ??= []).push(catalog);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-steel-50 text-oxynavy-950">
      <Header />
      <main>
        <section className="relative overflow-hidden bg-oxynavy-950 py-16 text-white sm:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(68,145,190,0.3),transparent_36%)]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-extrabold tracking-[0.2em] text-white/65">{t("common.catalog.pageEyebrow")}</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">{t("common.catalog.pageTitle")}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">{t("common.catalog.pageSubtitle")}</p>
          </div>
        </section>

        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((item) => <div key={item} className="h-[390px] animate-pulse rounded-2xl bg-white shadow-sm" />)}
              </div>
            ) : isError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{t("common.catalog.error")}</div>
            ) : catalogs.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-steel-200 bg-white px-6 py-20 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-steel-300" aria-hidden="true" />
                <p className="mt-4 text-sm text-steel-500">{t("common.catalog.empty")}</p>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(grouped).map(([language, items]) => (
                  <section key={language} aria-labelledby={`catalog-language-${language}`}>
                    <div className="mb-5 flex items-center gap-3">
                      <h2 id={`catalog-language-${language}`} className="text-sm font-extrabold uppercase tracking-[0.18em] text-oxynavy-950">
                        {LANGUAGE_LABELS[language] ?? language}
                      </h2>
                      <span className="h-px flex-1 bg-steel-200" />
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {[...items].sort((a, b) => a.sortOrder - b.sortOrder).map((catalog) => {
                        const documentUrl = resolvePublicDocumentUrl(catalog.pdfUrl);
                        return (
                          <article key={catalog.id} className="group overflow-hidden rounded-2xl border border-steel-200 bg-white shadow-[0_14px_35px_rgba(2,20,35,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(2,20,35,0.12)]">
                            <div className="relative aspect-[3/4] overflow-hidden bg-steel-100">
                              <iframe
                                title={`${catalog.title} — ${t("common.catalog.preview")}`}
                                src={`${documentUrl}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                                className="pointer-events-none h-[calc(100%+44px)] w-full -translate-y-1 bg-white"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-oxynavy-950/25 via-transparent to-transparent" />
                              <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-oxynavy-800 shadow-sm">
                                <FileText className="h-5 w-5" aria-hidden="true" />
                              </div>
                            </div>
                            <div className="p-5">
                              <h3 className="min-h-12 text-base font-extrabold leading-6 text-oxynavy-950">{catalog.title}</h3>
                              {catalog.category && <p className="mt-1 text-xs text-steel-500">{catalog.category}</p>}
                              <a
                                href={documentUrl}
                                download
                                onClick={() => trackInteraction(`Katalog İndir: ${catalog.title}`)}
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-oxynavy-950 px-4 py-3 text-xs font-extrabold text-white transition hover:bg-oxynavy-800"
                              >
                                <Download className="h-4 w-4" aria-hidden="true" />
                                {t("common.catalog.download")}
                              </a>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}