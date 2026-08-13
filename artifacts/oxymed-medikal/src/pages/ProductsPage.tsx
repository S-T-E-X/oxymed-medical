import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CatalogModal from "../components/home/CatalogModal";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowRight,
  Boxes,
  Factory,
  Headphones,
  Medal,
  ShieldCheck,
} from "lucide-react";
import { useListProductCategories, useListProducts, useListSettings, type ProductCategory } from "@workspace/api-client-react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import Seo from "../components/common/Seo";
import { trackInteraction } from "../components/common/VisitorTracker";
import { productPageFeatures } from "../data/products";
import { useI18n } from "../i18n/I18nProvider";
import { useLocalizedPath } from "../i18n/useLocalizedPath";
import { routeKeyForTurkishSlug } from "../i18n/routes";
import { pickLocalizedName } from "../i18n/pickLocalizedName";

const featureIconMap = {
  production: Factory,
  certified: Medal,
  modular: Boxes,
  durability: ShieldCheck,
  support: Headphones,
};

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      {message}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white text-oxynavy-950">
      <Seo routeKey="products" />
      <Header />
      <main className="bg-steel-50">
        <ProductsHero />
        <ProductsContent />
      </main>
      <Footer />
    </div>
  );
}

function ProductsHero() {
  const { t } = useI18n();
  const { data: rawSettings } = useListSettings();
  const settings = rawSettings as Record<string, string> | undefined;

  const title = settings?.["products_banner_title"] || t("products.hero.title");
  const description = settings?.["products_banner_description"] || t("products.hero.description");
  const imageUrl = settings?.["products_banner_image_url"] || "/assets/images/hero-medical-suite.png";

  return (
    <section className="relative isolate h-[252px] overflow-hidden bg-oxynavy-950 text-white">
      <img
        src={imageUrl}
        alt={t("products.hero.imageAlt")}
        className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-oxynavy-950 via-oxynavy-950/78 to-oxynavy-950/18" />
      <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-[470px]">
          <h1 className="text-[38px] font-extrabold leading-none tracking-tight sm:text-[46px]">
            {title}
          </h1>
          <div className="mt-4 h-[2px] w-12 bg-white" />
          <p className="mt-4 text-sm font-medium leading-7 text-white/90">{description}</p>
        </div>
      </div>
    </section>
  );
}

function ProductsContent() {
  const { t, locale } = useI18n();
  const path = useLocalizedPath();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const selectedCategoryId = categoryParam ? parseInt(categoryParam, 10) : undefined;
  const [catalogOpen, setCatalogOpen] = useState(false);
  const { data: categories = [], isLoading: catsLoading, isError: catsError } = useListProductCategories();
  const { data: productsData, isLoading: prodsLoading, isError: prodsError } = useListProducts({
    categoryId: selectedCategoryId,
    published: true,
    limit: 50,
  });
  const products = productsData?.items ?? [];

  // The API only knows Turkish slugs. Special legacy pages have translated
  // route slugs; generic DB-driven pages keep the Turkish product slug under
  // the current locale so the detail page still resolves the visitor's locale.
  function productHref(slug: string): string {
    const routeKey = routeKeyForTurkishSlug(slug);
    return routeKey ? path(routeKey) : path("products", [slug]);
  }

  const activeCategory = categories.find((c) => c.id === selectedCategoryId);
  const activeCategoryName = activeCategory ? pickLocalizedName(activeCategory, "name", locale) : undefined;

  function handleCategorySelect(id: number | undefined) {
    const next = new URLSearchParams(searchParams);
    if (id !== undefined) {
      next.set("category", id.toString());
    } else {
      next.delete("category");
    }
    setSearchParams(next, { replace: true });
  }

  return (
    <section className="relative pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ProductFeatureStrip />

        <div className="grid gap-8 pt-8 lg:grid-cols-[250px_minmax(0,1fr)]">
          <ProductsSidebar
            categories={categories}
            isLoading={catsLoading}
            isError={catsError}
            selectedCategoryId={selectedCategoryId}
            onSelect={handleCategorySelect}
            onCatalogOpen={() => setCatalogOpen(true)}
          />

          <div>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-[27px] font-extrabold leading-tight text-oxynavy-950">
                  {activeCategoryName ?? t("products.results.allTitle")}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-steel-700">
                  {activeCategory
                    ? t("products.results.categoryDescription").replace("{{category}}", activeCategoryName ?? "")
                    : t("products.results.allDescription")}
                </p>
              </div>
              {products.length > 0 && (
                <span className="inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded border border-oxynavy-200 px-4 text-xs font-bold text-steel-600">
                  {t("products.results.counter").replace("{{count}}", String(products.length))}
                </span>
              )}
            </div>

            {prodsError ? (
              <div className="mt-6">
                <ErrorMessage message={t("products.results.loadError")} />
              </div>
            ) : prodsLoading ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-64 animate-pulse rounded-lg bg-steel-200" />)}
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => {
                  const localizedTitle = pickLocalizedName(product, "title", locale);
                  const card = (
                    <article
                      className="group overflow-hidden rounded-lg border border-steel-100 bg-white shadow-[0_12px_30px_rgba(2,20,35,0.07)] transition hover:shadow-[0_16px_40px_rgba(2,20,35,0.13)] cursor-pointer"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-steel-100">
                        <img
                          src={product.imageUrl ?? "/assets/images/product-bed-head-unit.png"}
                          alt={localizedTitle}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-bold text-oxynavy-950">{localizedTitle}</h3>
                      </div>
                    </article>
                  );
                  return product.pageSlug ? (
                    <Link
                      key={product.id}
                      to={productHref(product.pageSlug)}
                      className="block"
                      onClick={() => trackInteraction(`Ürün: ${product.title}`)}
                    >
                      {card}
                    </Link>
                  ) : (
                    <div key={product.id}>{card}</div>
                  );
                })}
                {products.length === 0 && (
                  <p className="col-span-full rounded-lg border border-steel-100 bg-white px-5 py-8 text-center text-sm text-steel-600">
                    {t("products.results.empty")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {catalogOpen && <CatalogModal onClose={() => setCatalogOpen(false)} />}
    </section>
  );
}

function ProductFeatureStrip() {
  const { t } = useI18n();
  return (
    <div className="-mt-8 ms-auto rounded-lg border border-steel-100 bg-white px-5 py-4 shadow-[0_14px_35px_rgba(2,20,35,0.08)] lg:w-[calc(100%-270px)]">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 lg:divide-x lg:divide-steel-200">
        {productPageFeatures.map((feature) => {
          const Icon = featureIconMap[feature.icon as keyof typeof featureIconMap];
          return (
            <div key={feature.key} className="flex items-start gap-4 lg:px-5 first:lg:ps-0 last:lg:pe-0">
              <Icon className="mt-1 h-8 w-8 shrink-0 stroke-[1.35] text-oxynavy-900" aria-hidden="true" />
              <div>
                <h3 className="text-[12px] font-extrabold text-oxynavy-950">
                  {t(`products.features.${feature.key}.title`)}
                </h3>
                <p className="mt-1.5 text-[12px] leading-5 text-steel-700">
                  {t(`products.features.${feature.key}.description`)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type SidebarProps = {
  categories: ProductCategory[];
  isLoading: boolean;
  isError: boolean;
  selectedCategoryId: number | undefined;
  onSelect: (id: number | undefined) => void;
  onCatalogOpen: () => void;
};

function ProductsSidebar({ categories, isLoading, isError, selectedCategoryId, onSelect, onCatalogOpen }: SidebarProps) {
  const { t, locale } = useI18n();
  return (
    <aside className="space-y-5">
      <nav className="overflow-hidden rounded-lg border border-steel-100 bg-white shadow-[0_12px_30px_rgba(2,20,35,0.05)]">
        <button
          onClick={() => onSelect(undefined)}
          className={`flex h-12 w-full items-center px-5 text-sm font-bold transition border-b border-steel-100 ${
            !selectedCategoryId ? "bg-oxynavy-950 text-white" : "text-oxynavy-950 hover:bg-steel-50"
          }`}
        >
          {t("products.sidebar.allProducts")}
        </button>
        {isError ? (
          <div className="px-5 py-3 text-[12px] text-red-600">{t("products.sidebar.categoriesError")}</div>
        ) : isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse bg-steel-50" />)
        ) : (
          categories.map((category) => {
            const active = selectedCategoryId === category.id;
            const catName = pickLocalizedName(category, "name", locale);
            return (
              <button
                key={category.id}
                onClick={() => onSelect(active ? undefined : category.id)}
                className={`flex h-12 w-full items-center border-b border-steel-100 px-5 text-sm font-bold transition last:border-b-0 ${
                  active ? "bg-oxynavy-950 text-white" : "text-oxynavy-950 hover:bg-steel-50"
                }`}
              >
                {catName}
              </button>
            );
          })
        )}
      </nav>

      <button
        type="button"
        onClick={onCatalogOpen}
        className="flex w-full items-center gap-4 rounded-lg border border-steel-100 bg-white p-5 shadow-[0_12px_30px_rgba(2,20,35,0.05)] transition hover:shadow-[0_14px_35px_rgba(2,20,35,0.08)]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-steel-200 text-oxynavy-950">
          <ArrowDownToLine className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 text-start">
          <span className="block text-sm font-extrabold text-oxynavy-950">{t("products.sidebar.catalogTitle")}</span>
          <span className="mt-1 block text-xs text-steel-600">{t("products.sidebar.catalogSize")}</span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-oxynavy-950 rtl:-scale-x-100" aria-hidden="true" />
      </button>
    </aside>
  );
}
