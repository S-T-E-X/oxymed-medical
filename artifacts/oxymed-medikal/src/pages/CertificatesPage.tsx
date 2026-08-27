import { Award, Download, FileText } from "lucide-react";
import { useListCertificates } from "@workspace/api-client-react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import Seo from "../components/common/Seo";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { useI18n } from "../i18n/I18nProvider";
import { useLocalizedPath } from "../i18n/useLocalizedPath";
import { resolvePublicDocumentUrl } from "../lib/documentUrl";
import { pickLocaleOverlay } from "../i18n/pickLocaleOverlay";

export default function CertificatesPage() {
  const { t, locale } = useI18n();
  const path = useLocalizedPath();
  const { data: certificates = [], isLoading, isError } = useListCertificates();

  return (
    <div className="min-h-screen bg-steel-50 text-oxynavy-950">
      <Seo routeKey="certificates" />
      <Breadcrumbs
        jsonLdOnly
        items={[
          { label: t("common.breadcrumb.home"), to: path("home") },
          { label: t("certificates.hero.title") },
        ]}
      />
      <Header />
      <main>
        <section className="bg-oxynavy-950 py-16 text-white sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-extrabold tracking-[0.2em] text-white/65">{t("certificates.hero.eyebrow")}</p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">{t("certificates.hero.title")}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
              {t("certificates.hero.description")}
            </p>
          </div>
        </section>

        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-white shadow-sm" />)}
              </div>
            ) : isError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                {t("certificates.error")}
              </div>
            ) : certificates.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-steel-200 bg-white px-6 py-16 text-center">
                <Award className="mx-auto h-11 w-11 text-steel-300" aria-hidden="true" />
                <h2 className="mt-4 text-lg font-bold text-oxynavy-950">{t("certificates.empty.title")}</h2>
                <p className="mt-2 text-sm text-steel-600">{t("certificates.empty.description")}</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-steel-200 bg-white shadow-[0_14px_35px_rgba(2,20,35,0.07)]">
                {certificates.map((certificate, index) => (
                  <a
                    key={certificate.id}
                    href={resolvePublicDocumentUrl(certificate.fileUrl)}
                    download
                    className={`group flex items-center gap-4 px-5 py-5 transition hover:bg-steel-50 sm:px-7 ${
                      index > 0 ? "border-t border-steel-100" : ""
                    }`}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-oxynavy-50 text-oxynavy-700">
                      <FileText className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm text-oxynavy-950 sm:text-base">
                        {pickLocaleOverlay(certificate, "title", locale, certificate.title)}
                      </strong>
                      <span className="mt-1 block text-xs text-steel-500">{t("certificates.downloadHint")}</span>
                    </span>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-steel-200 text-oxynavy-800 transition group-hover:border-oxynavy-800 group-hover:bg-oxynavy-800 group-hover:text-white">
                      <Download className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                  </a>
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
