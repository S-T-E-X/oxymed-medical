import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Boxes,
  CircuitBoard,
  Factory,
  Headphones,
  Medal,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Stethoscope,
  Wrench
} from "lucide-react";
import { useListProductCategories, useListProducts } from "@workspace/api-client-react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import { productHero, productPageFeatures } from "../data/products";

const categoryIcons = [Factory, Wrench, Boxes, CircuitBoard, Stethoscope, SlidersHorizontal, Settings, Wrench];

const featureIconMap = {
  production: Factory,
  certified: Medal,
  modular: Boxes,
  durability: ShieldCheck,
  support: Headphones
};

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
  return (
    <section className="relative isolate h-[252px] overflow-hidden bg-oxynavy-950 text-white">
      <img
        src="/assets/images/hero-medical-suite.png"
        alt="Yatak başı ünitesi ve medikal ekipman"
        className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-oxynavy-950 via-oxynavy-950/78 to-oxynavy-950/18" />
      <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-[470px]">
          <h1 className="text-[38px] font-extrabold leading-none tracking-tight sm:text-[46px]">
            {productHero.title}
          </h1>
          <div className="mt-4 h-[2px] w-12 bg-white" />
          <p className="mt-4 text-sm font-medium leading-7 text-white/90">{productHero.description}</p>
        </div>
      </div>
    </section>
  );
}

function ProductsContent() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const { data: categories = [], isLoading: catsLoading } = useListProductCategories();
  const { data: productsData, isLoading: prodsLoading } = useListProducts({
    categoryId: selectedCategoryId,
    published: true,
    limit: 50,
  });
  const products = productsData?.items ?? [];

  const activeCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <section className="relative pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ProductFeatureStrip />

        <div className="grid gap-8 pt-8 lg:grid-cols-[250px_minmax(0,1fr)]">
          <ProductsSidebar
            categories={categories}
            isLoading={catsLoading}
            selectedCategoryId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
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

            {prodsLoading ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 animate-pulse rounded-lg bg-steel-200" />)}
              </div>
            ) : products.length === 0 ? (
              <div className="mt-6 rounded-xl border-2 border-dashed border-steel-200 py-16 text-center">
                <p className="text-steel-400">Bu kategoride ürün bulunamadı.</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => {
                  const specs = (product.specs ?? []) as { label: string; value: string }[];
                  return (
                    <article
                      key={product.id}
                      className="overflow-hidden rounded-lg border border-steel-100 bg-white shadow-[0_12px_30px_rgba(2,20,35,0.07)]"
                    >
                      <div className="aspect-[1.72] overflow-hidden bg-steel-100">
                        <img
                          src={product.imageUrl ?? "/assets/images/product-bed-head-unit.png"}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-extrabold text-oxynavy-950">{product.title}</h3>
                        {product.description && (
                          <p className="mt-3 text-sm leading-6 text-steel-700 line-clamp-2">{product.description}</p>
                        )}
                        {specs.length > 0 && (
                          <div className="mt-5 grid grid-cols-3 gap-2 text-[11px]">
                            {specs.slice(0, 3).map((spec) => (
                              <div key={spec.label}>
                                <span className="block text-steel-500">{spec.label}</span>
                                <strong className="mt-1 block font-bold text-oxynavy-950">{spec.value}</strong>
                              </div>
                            ))}
                          </div>
                        )}
                        <a href="#" className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold text-oxynavy-950">
                          DETAYLARI İNCELE
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
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
  selectedCategoryId: number | undefined;
  onSelect: (id: number | undefined) => void;
};

function ProductsSidebar({ categories, isLoading, selectedCategoryId, onSelect }: SidebarProps) {
  return (
    <aside className="space-y-5">
      <nav className="overflow-hidden rounded-lg border border-steel-100 bg-white shadow-[0_12px_30px_rgba(2,20,35,0.05)]">
        <button
          onClick={() => onSelect(undefined)}
          className={`flex h-14 w-full items-center gap-4 border-b border-steel-100 px-5 text-sm font-bold transition ${
            !selectedCategoryId ? "bg-oxynavy-950 text-white" : "text-oxynavy-950 hover:bg-steel-50"
          }`}
        >
          <Factory className="h-5 w-5 shrink-0 stroke-[1.55]" aria-hidden="true" />
          Tüm Ürünler
        </button>
        {isLoading
          ? [1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse bg-steel-50" />)
          : categories.map((category, index) => {
              const Icon = categoryIcons[index % categoryIcons.length];
              const active = selectedCategoryId === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => onSelect(active ? undefined : category.id)}
                  className={`flex h-14 w-full items-center gap-4 border-b border-steel-100 px-5 text-sm font-bold transition last:border-b-0 ${
                    active ? "bg-oxynavy-950 text-white" : "text-oxynavy-950 hover:bg-steel-50"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0 stroke-[1.55]" aria-hidden="true" />
                  {category.name}
                </button>
              );
            })}
      </nav>

      <a
        href="#katalog"
        className="flex items-center gap-4 rounded-lg border border-steel-100 bg-white p-5 shadow-[0_12px_30px_rgba(2,20,35,0.05)] transition hover:shadow-[0_14px_35px_rgba(2,20,35,0.08)]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-steel-200 text-oxynavy-950">
          <ArrowDownToLine className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold text-oxynavy-950">Ürün Kataloğumuzu İndirin</span>
          <span className="mt-1 block text-xs text-steel-600">PDF / 12.4 MB</span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-oxynavy-950" aria-hidden="true" />
      </a>
    </aside>
  );
}
