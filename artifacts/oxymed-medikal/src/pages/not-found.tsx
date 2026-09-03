import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Seo from "../components/common/Seo";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import { useI18n } from "../i18n/I18nProvider";
import { useLocalizedPath } from "../i18n/useLocalizedPath";
import "./not-found.css";

export default function NotFound() {
  const { t } = useI18n();
  const path = useLocalizedPath();

  return (
    <div className="min-h-screen bg-white">
      <Seo
        routeKey="home"
        title={t("common.notFound.metaTitle")}
        description={t("common.notFound.description")}
        noindex
        alternates={[]}
      />
      <Header />

      <main className="not-found-page">
        <div className="not-found-glow not-found-glow--one" aria-hidden="true" />
        <div className="not-found-glow not-found-glow--two" aria-hidden="true" />

        <section className="not-found-content" aria-labelledby="not-found-title">
          <div className="not-found-visual" aria-hidden="true">
            <span className="not-found-number">4</span>

            <span className="not-found-orbit">
              <span className="not-found-orbit-dot" />
              <svg className="not-found-pulse" viewBox="0 0 120 44" role="presentation">
                <path
                  d="M2 23h25l7-12 12 27 12-35 13 27 8-12 7 5h32"
                  pathLength="1"
                />
              </svg>
            </span>

            <span className="not-found-number">4</span>
          </div>

          <p className="not-found-eyebrow">404 · {t("common.notFound.eyebrow")}</p>
          <h1 id="not-found-title">{t("common.notFound.title")}</h1>
          <p className="not-found-description">
            {t("common.notFound.description")}
          </p>

          <div className="not-found-actions">
            <Link to={path("home")} className="not-found-primary">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              {t("common.notFound.backHome")}
            </Link>
            <Link to={path("products")} className="not-found-secondary">
              {t("common.notFound.browseProducts")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer compact />
    </div>
  );
}
