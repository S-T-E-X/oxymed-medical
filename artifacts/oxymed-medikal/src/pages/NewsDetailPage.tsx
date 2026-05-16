import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Tag, AlertCircle, Loader2 } from "lucide-react";
import { useListNews } from "@workspace/api-client-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, isError } = useListNews({
    slug: slug,
    published: true,
    limit: 1,
  });

  const news = data?.items?.[0];

  return (
    <div className="min-h-screen bg-white text-oxynavy-950">
      <Header />
      <main>
        {isLoading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-oxynavy-400" />
          </div>
        ) : isError || !news ? (
          <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              Haber bulunamadı. Silinmiş veya yayından kaldırılmış olabilir.
            </div>
            <Link
              to="/haberler"
              className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-oxynavy-900 transition hover:text-oxynavy-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Haberlere Dön
            </Link>
          </div>
        ) : (
          <>
            <div className="w-full bg-oxynavy-950">
              <img
                src={news.imageUrl ?? "/assets/images/product-medical-gas.png"}
                alt={news.title}
                className="mx-auto block max-h-[520px] w-full max-w-6xl object-cover"
              />
            </div>

            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
              <Link
                to="/haberler"
                className="inline-flex items-center gap-2 text-xs font-extrabold text-oxynavy-500 transition hover:text-oxynavy-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Tüm Haberler
              </Link>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {news.category && (
                  <span className="inline-flex items-center gap-1.5 rounded bg-oxynavy-50 px-2.5 py-1 text-[11px] font-extrabold text-oxynavy-700">
                    <Tag className="h-3 w-3" />
                    {news.category}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-[11px] text-steel-500">
                  <Clock className="h-3 w-3" />
                  {formatDate(news.publishedAt)}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-oxynavy-950 sm:text-4xl">
                {news.title}
              </h1>

              {news.excerpt && (
                <p className="mt-5 text-base font-medium leading-7 text-steel-600 border-l-4 border-oxynavy-200 pl-4">
                  {news.excerpt}
                </p>
              )}

              {news.content && (
                <div className="mt-8 space-y-4 text-[15px] leading-8 text-steel-800 whitespace-pre-wrap">
                  {news.content}
                </div>
              )}

              <div className="mt-12 border-t border-steel-100 pt-8">
                <Link
                  to="/haberler"
                  className="inline-flex items-center gap-2 text-sm font-extrabold text-oxynavy-900 transition hover:text-oxynavy-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Haberlere Dön
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
