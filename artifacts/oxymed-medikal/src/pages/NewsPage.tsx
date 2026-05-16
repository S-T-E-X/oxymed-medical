import { useState } from "react";
import { ArrowRight, Clock, AlertCircle } from "lucide-react";
import { useListNews } from "@workspace/api-client-react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import { newsHero } from "../data/news";

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      {message}
    </div>
  );
}

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-white text-oxynavy-950">
      <Header />
      <main>
        <NewsHero />
        <NewsContent />
      </main>
      <Footer />
    </div>
  );
}

function NewsHero() {
  return (
    <section className="relative isolate overflow-hidden bg-oxynavy-950 text-white">
      <img
        src="/assets/images/corporate-production-floor.png"
        alt="Haberler"
        className="absolute inset-0 h-full w-full object-cover opacity-55"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-oxynavy-950 via-oxynavy-950/80 to-oxynavy-950/30" />
      <div className="relative mx-auto min-h-[240px] max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-xs font-medium text-white/78">
            {newsHero.breadcrumb.map((item, index) => (
              <span key={item} className="inline-flex items-center gap-2">
                {item}
                {index < newsHero.breadcrumb.length - 1 ? <span className="text-white/44">›</span> : null}
              </span>
            ))}
          </div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">{newsHero.title}</h1>
          <div className="mt-4 h-1 w-14 bg-white" />
          <p className="mt-5 max-w-[470px] text-sm font-medium leading-7 text-white/88">{newsHero.description}</p>
        </div>
      </div>
    </section>
  );
}

function NewsContent() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>();

  const {
    data: allNewsData,
    isLoading: allLoading,
    isError: allError,
  } = useListNews({ published: true, limit: 200 });
  const allItems = allNewsData?.items ?? [];

  const categories = ["TÜM HABERLER", ...Array.from(
    new Set(allItems.map((n) => n.category).filter(Boolean) as string[])
  )];

  const displayItems = activeCategory
    ? allItems.filter((n) => n.category === activeCategory)
    : allItems;

  const {
    data: popularData,
    isLoading: popularLoading,
    isError: popularError,
  } = useListNews({ published: true, limit: 5 });
  const popularNews = popularData?.items ?? [];

  return (
    <section className="bg-steel-50 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {allError ? (
          <ErrorMessage message="Haberler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin." />
        ) : (
          <>
            <div className="mb-8 flex flex-wrap gap-2">
              {allLoading
                ? [1, 2, 3, 4].map((i) => <div key={i} className="h-9 w-28 animate-pulse rounded bg-steel-200" />)
                : categories.map((cat) => {
                    const isAll = cat === "TÜM HABERLER";
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
                        {cat}
                      </button>
                    );
                  })}
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div>
                {allLoading ? (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-72 animate-pulse rounded-lg bg-steel-200" />
                    ))}
                  </div>
                ) : displayItems.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-steel-200 py-16 text-center">
                    <p className="text-steel-500">Bu kategoride haber bulunamadı.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {displayItems.map((post) => (
                      <article
                        key={post.id}
                        className="group overflow-hidden rounded-lg border border-steel-100 bg-white shadow-[0_8px_24px_rgba(2,20,35,0.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(2,20,35,0.08)]"
                      >
                        <div className="aspect-[1.6] overflow-hidden">
                          <img
                            src={post.imageUrl ?? "/assets/images/product-medical-gas.png"}
                            alt={post.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                          />
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-3">
                            {post.category && (
                              <span className="rounded bg-oxynavy-50 px-2 py-0.5 text-[11px] font-extrabold text-oxynavy-700">
                                {post.category}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-[11px] text-steel-500">
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              {formatDate(post.publishedAt)}
                            </span>
                          </div>
                          <h3 className="mt-3 text-base font-extrabold text-oxynavy-950 leading-tight">{post.title}</h3>
                          {post.excerpt && (
                            <p className="mt-2 text-[13px] leading-6 text-steel-700 line-clamp-3">{post.excerpt}</p>
                          )}
                          <a href="#" className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-oxynavy-900 transition hover:text-oxynavy-500">
                            Devamını Oku
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <aside>
                <div className="sticky top-6 rounded-lg border border-steel-100 bg-white p-5 shadow-[0_8px_24px_rgba(2,20,35,0.06)]">
                  <h2 className="text-sm font-extrabold text-oxynavy-950">Popüler İçerikler</h2>
                  {popularError ? (
                    <p className="mt-3 text-[12px] text-red-600">Popüler içerikler yüklenemedi.</p>
                  ) : popularLoading ? (
                    <div className="mt-5 space-y-4">
                      {[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded bg-steel-100" />)}
                    </div>
                  ) : (
                    <div className="mt-5 space-y-4">
                      {popularNews.map((post) => (
                        <a key={post.id} href="#" className="flex gap-3 group">
                          <div className="h-14 w-20 shrink-0 overflow-hidden rounded">
                            <img
                              src={post.imageUrl ?? "/assets/images/product-medical-gas.png"}
                              alt={post.title}
                              className="h-full w-full object-cover transition group-hover:scale-[1.05]"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-oxynavy-950 leading-tight line-clamp-2 group-hover:text-oxynavy-700 transition">{post.title}</p>
                            <p className="mt-1 text-[11px] text-steel-500">{formatDate(post.publishedAt)}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
