import { AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useListProductCategories } from "@workspace/api-client-react";
import { useI18n } from "../../i18n/I18nProvider";
import { useLocalizedPath } from "../../i18n/useLocalizedPath";
import { pickLocalizedName } from "../../i18n/pickLocalizedName";

const CATEGORY_IMAGES = [
  "/assets/images/product-bed-head-unit.png",
  "/assets/images/product-pendant-system.png",
  "/assets/images/product-medical-gas.png",
  "/assets/images/product-electrical-data.png",
];

export default function ProductGroups() {
  const { data: categories = [], isLoading, isError } = useListProductCategories();
  const displayed = categories.slice(0, 4);
  const { t, tv, locale } = useI18n();
  const path = useLocalizedPath();
  const productsHref = path("products");

  // Category names come from the API in Turkish; the supporting blurbs are
  // translated per position so every language reads naturally.
  const descriptions = tv<string[]>("home.productGroups.descriptions", []);

  return (
    <section id="urunler" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-extrabold text-oxynavy-700">{t("home.productGroups.eyebrow")}</p>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight text-oxynavy-950 sm:text-4xl lg:text-[42px]">
            {t("home.productGroups.title")}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-steel-700 sm:text-base">
            {t("home.productGroups.description")}
          </p>
        </div>

        {isError ? (
          <div className="mt-10 flex items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            {t("home.productGroups.loadError")}
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-72 animate-pulse rounded-lg bg-steel-100" />
                ))
              : displayed.map((cat, i) => (
                  <article
                    key={cat.id}
                    className="group overflow-hidden rounded-lg border border-steel-100 bg-white shadow-[0_8px_24px_rgba(2,20,35,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(2,20,35,0.08)]"
                  >
                    <div className="aspect-[1.35] overflow-hidden bg-steel-100">
                      <img
                        src={CATEGORY_IMAGES[i] ?? CATEGORY_IMAGES[0]}
                        alt={pickLocalizedName(cat, "name", locale)}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-base font-extrabold text-oxynavy-950">{pickLocalizedName(cat, "name", locale).toUpperCase()}</h3>
                      <p className="mt-4 min-h-[72px] text-sm leading-6 text-steel-700">
                        {descriptions[i] ?? t("home.productGroups.fallbackDescription")}
                      </p>
                      <Link
                        to={productsHref}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-oxynavy-900 transition hover:text-oxynavy-500"
                      >
                        {t("common.cta.reviewDetails")}
                        <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                ))}
          </div>
        )}
      </div>
    </section>
  );
}
