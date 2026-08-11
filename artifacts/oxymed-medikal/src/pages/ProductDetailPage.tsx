import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  FileCheck2,
  HelpCircle,
  Layers,
  Loader2,
  Settings,
  Sparkles,
} from "lucide-react";
import { useGetProductBySlug, useListProductCategories } from "@workspace/api-client-react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import { useI18n } from "../i18n/I18nProvider";
import { pickLocalizedName } from "../i18n/pickLocalizedName";
import "./ProductDetailPage.css";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const { locale } = useI18n();
  const { data: product, isLoading, isError } = useGetProductBySlug(slug ?? "");
  const { data: categories = [] } = useListProductCategories();

  if (isLoading) {
    return (
      <div className="pdp-page">
        <Header />
        <main className="pdp-main">
          <div className="pdp-state">
            <Loader2 className="pdp-spinner" aria-hidden="true" />
            <p>Ürün yükleniyor…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="pdp-page">
        <Header />
        <main className="pdp-main">
          <div className="pdp-state">
            <p>Ürün bulunamadı.</p>
            <Link to="/urunler" className="pdp-back-link">Ürünlere dön</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const pd = product.pageData ?? {};
  const category = categories.find((c) => c.id === product.categoryId);
  const localizedTitle = pickLocalizedName(product, "title", locale);
  const eyebrow = category ? pickLocalizedName(category, "name", locale) : "OXYMED MEDİKAL";
  const features = (pd.features ?? []).slice(0, 4);
  const detailCards = pd.detailCards ?? [];
  const specs = product.specs ?? [];
  const useCases = pd.useCases ?? [];
  const advantages = pd.advantages ?? [];
  const featureTiles = pd.featureTiles ?? [];
  const faq = pd.faq ?? [];

  return (
    <div className="pdp-page">
      <Header />

      <main className="pdp-main">
        <section className="pdp-hero">
          <div className="pdp-container pdp-hero__grid">
            <div className="pdp-hero__content">
              <div className="pdp-eyebrow">{eyebrow}</div>
              <h1>{localizedTitle}</h1>
              {pd.heroSubtitle && <p className="pdp-hero__subtitle">{pd.heroSubtitle}</p>}
              <div className="pdp-title-line" />
              {(pd.heroDescription || product.description) && (
                <p className="pdp-hero__desc">{pd.heroDescription || product.description}</p>
              )}

              {features.length > 0 && (
                <div className="pdp-hero-features">
                  {features.map((feature) => (
                    <article key={feature.title}>
                      <Sparkles aria-hidden="true" />
                      <div>
                        <h2>{feature.title}</h2>
                        <span>{feature.text}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="pdp-hero__visual" aria-label={`${localizedTitle} ürün görseli`}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={localizedTitle} />
              ) : (
                <div className="pdp-hero-photo-slot" />
              )}
            </div>
          </div>
        </section>

        {detailCards.length > 0 && (
          <section className="pdp-container pdp-detail-grid" aria-label="Ürün detay görselleri">
            {detailCards.map((card) => (
              <article key={card.title}>
                {card.imageUrl ? (
                  <div className="pdp-image-slot" style={{ backgroundImage: `url(${card.imageUrl})` }} />
                ) : (
                  <div className="pdp-image-slot" />
                )}
                <h2>{card.title}</h2>
                <p>{card.text}</p>
              </article>
            ))}
          </section>
        )}

        {(specs.length > 0 || advantages.length > 0) && (
          <section className="pdp-container pdp-technical-panel">
            {specs.length > 0 && (
              <article className="pdp-specs">
                <header>
                  <Settings aria-hidden="true" />
                  <h2>TEKNİK ÖZELLİKLER</h2>
                </header>
                <dl>
                  {specs.map((s) => (
                    <div key={s.label}>
                      <dt>{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            )}

            {advantages.length > 0 && (
              <article className="pdp-advantages">
                <header>
                  <BadgeCheck aria-hidden="true" />
                  <h2>AVANTAJLAR</h2>
                </header>
                <ul>
                  {advantages.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            )}
          </section>
        )}

        {useCases.length > 0 && (
          <section className="pdp-container pdp-usage-band">
            <h2>KULLANIM ALANLARI</h2>
            <div>
              {useCases.map((item) => (
                <article key={item}>
                  <Layers aria-hidden="true" />
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {featureTiles.length > 0 && (
          <section className="pdp-container pdp-tiles">
            {featureTiles.map((tile) => (
              <article key={tile.title}>
                <BadgeCheck aria-hidden="true" />
                <h3>{tile.title}</h3>
                <p>{tile.text}</p>
              </article>
            ))}
          </section>
        )}

        {faq.length > 0 && (
          <section className="pdp-container pdp-faq">
            <header>
              <HelpCircle aria-hidden="true" />
              <h2>S.S.S.</h2>
            </header>
            <div className="pdp-faq__grid">
              {faq.map((item, index) => (
                <details key={item.question} open={index === 0}>
                  <summary>
                    <span>{item.question}</span>
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className="pdp-quote-strip">
          <div className="pdp-container pdp-quote-strip__inner">
            <FileCheck2 aria-hidden="true" />
            <div>
              <h2>Hızlı Teklif Al</h2>
              <p>Projeniz için uygun çözüm ve fiyat teklifi almak için bizimle iletişime geçin.</p>
            </div>
            <Link to="/teklif-al">
              Teklif İste
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
