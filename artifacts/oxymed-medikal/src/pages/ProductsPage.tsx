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
  Settings,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useListProductCategories, useListProducts, useListSettings } from "@workspace/api-client-react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import { productHero, productPageFeatures } from "../data/products";

const featureIconMap = {
  production: Factory,
  certified: Medal,
  modular: Boxes,
  durability: ShieldCheck,
  support: Headphones
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
  const { data: rawSettings } = useListSettings();
  const settings = rawSettings as Record<string, string> | undefined;

  const title = settings?.["products_banner_title"] || productHero.title;
  const description = settings?.["products_banner_description"] || productHero.description;
  const imageUrl = settings?.["products_banner_image_url"] || "/assets/images/hero-medical-suite.png";

  return (
    <section className="relative isolate h-[252px] overflow-hidden bg-oxynavy-950 text-white">
      <img
        src={imageUrl}
        alt="Ürünler sayfa banner görseli"
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

  const activeCategory = categories.find((c) => c.id === selectedCategoryId);

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
                  {activeCategory?.name ?? "Tüm Ürünler"}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-steel-700">
                  {activeCategory
                    ? `${activeCategory.name} kategorisindeki ürünlerimiz.`
                    : "Hastaneler, klinikler ve sağlık merkezleri için geliştirdiğimiz medikal çözümler."}
                </p>
              </div>
              {products.length > 0 && (
                <span className="inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded border border-oxynavy-200 px-4 text-xs font-bold text-steel-600">
                  {products.length} ürün
                </span>
              )}
            </div>

            {!selectedCategoryId && (
              <div className="mt-6">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-steel-400">Diş Kliniği Ürünleri</p>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {([
                    { slug: "amalgam-separator", title: "Amalgam Separatörü" },
                    { slug: "dental-vakum-pompasi", title: "Dental Vakum Pompası" },
                    { slug: "dental-vakum-sistemi", title: "Dental Vakum Sistemi" },
                  ] as const).map((p) => (
                    <Link
                      key={p.slug}
                      to={`/urunler/${p.slug}`}
                      className="group block overflow-hidden rounded-lg border border-steel-100 bg-white shadow-[0_12px_30px_rgba(2,20,35,0.07)] transition hover:shadow-[0_16px_40px_rgba(2,20,35,0.13)]"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-steel-100" />
                      <div className="p-3">
                        <h3 className="text-sm font-bold text-oxynavy-950">{p.title}</h3>
                        <p className="mt-0.5 text-xs text-steel-500">Ürün detaylarını görüntüle →</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-6 border-t border-steel-100 pt-6">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-steel-400">Diğer Ürünler</p>
                </div>
              </div>
            )}

            {prodsError ? (
              <div className="mt-6">
                <ErrorMessage message="Ürünler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin." />
              </div>
            ) : prodsLoading ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-64 animate-pulse rounded-lg bg-steel-200" />)}
              </div>
            ) : products.length === 0 ? (
              <div className="mt-6 rounded-xl border-2 border-dashed border-steel-200 py-16 text-center">
                <p className="text-steel-400">Bu kategoride ürün bulunamadı.</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => {
                  const card = (
                    <article
                      className="group overflow-hidden rounded-lg border border-steel-100 bg-white shadow-[0_12px_30px_rgba(2,20,35,0.07)] transition hover:shadow-[0_16px_40px_rgba(2,20,35,0.13)] cursor-pointer"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-steel-100">
                        <img
                          src={product.imageUrl ?? "/assets/images/product-bed-head-unit.png"}
                          alt={product.title}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-bold text-oxynavy-950">{product.title}</h3>
                      </div>
                    </article>
                  );
                  return product.pageSlug ? (
                    <Link key={product.id} to={`/urunler/${product.pageSlug}`} className="block">
                      {card}
                    </Link>
                  ) : (
                    <div key={product.id}>{card}</div>
                  );
                })}
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
  return (
    <div className="-mt-8 ml-auto rounded-lg border border-steel-100 bg-white px-5 py-4 shadow-[0_14px_35px_rgba(2,20,35,0.08)] lg:w-[calc(100%-270px)]">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 lg:divide-x lg:divide-steel-200">
        {productPageFeatures.map((feature) => {
          const Icon = featureIconMap[feature.icon as keyof typeof featureIconMap];
          return (
            <div key={feature.title} className="flex items-start gap-4 lg:px-5 first:lg:pl-0 last:lg:pr-0">
              <Icon className="mt-1 h-8 w-8 shrink-0 stroke-[1.35] text-oxynavy-900" aria-hidden="true" />
              <div>
                <h3 className="text-[12px] font-extrabold text-oxynavy-950">{feature.title}</h3>
                <p className="mt-1.5 text-[12px] leading-5 text-steel-700">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type SidebarProps = {
  categories: { id: number; name: string; slug: string }[];
  isLoading: boolean;
  isError: boolean;
  selectedCategoryId: number | undefined;
  onSelect: (id: number | undefined) => void;
  onCatalogOpen: () => void;
};

function ProductsSidebar({ categories, isLoading, isError, selectedCategoryId, onSelect, onCatalogOpen }: SidebarProps) {
  return (
    <aside className="space-y-5">
      <nav className="overflow-hidden rounded-lg border border-steel-100 bg-white shadow-[0_12px_30px_rgba(2,20,35,0.05)]">
        <button
          onClick={() => onSelect(undefined)}
          className={`flex h-12 w-full items-center px-5 text-sm font-bold transition border-b border-steel-100 ${
            !selectedCategoryId ? "bg-oxynavy-950 text-white" : "text-oxynavy-950 hover:bg-steel-50"
          }`}
        >
          Tüm Ürünler
        </button>
        {isError ? (
          <div className="px-5 py-3 text-[12px] text-red-600">Kategoriler yüklenemedi.</div>
        ) : isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse bg-steel-50" />)
        ) : (
          categories.map((category) => {
            const active = selectedCategoryId === category.id;
            return (
              <button
                key={category.id}
                onClick={() => onSelect(active ? undefined : category.id)}
                className={`flex h-12 w-full items-center border-b border-steel-100 px-5 text-sm font-bold transition last:border-b-0 ${
                  active ? "bg-oxynavy-950 text-white" : "text-oxynavy-950 hover:bg-steel-50"
                }`}
              >
                {category.name}
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
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold text-oxynavy-950">Ürün Kataloğumuzu İndirin</span>
          <span className="mt-1 block text-xs text-steel-600">PDF / 12.4 MB</span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-oxynavy-950" aria-hidden="true" />
      </button>
    </aside>
  );
}
