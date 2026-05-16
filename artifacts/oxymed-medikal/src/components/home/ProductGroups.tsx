import { ArrowRight } from "lucide-react";
import { useListProductCategories } from "@workspace/api-client-react";

const CATEGORY_IMAGES = [
  "/assets/images/product-bed-head-unit.png",
  "/assets/images/product-pendant-system.png",
  "/assets/images/product-medical-gas.png",
  "/assets/images/product-electrical-data.png",
];

const CATEGORY_DESCS = [
  "Elektrik, medikal gaz ve data üniteleri ile güvenli ve konforlu çözümler.",
  "Ameliyathane, yoğun bakım ve acil üniteler için esnek pendant çözümleri.",
  "Oksijen, vakum, hava, AGS ve azot gaz sistemleri.",
  "Elektrik, zayıf akım ve data sistemleri ile kesintisiz iletişim.",
];

export default function ProductGroups() {
  const { data: categories = [], isLoading } = useListProductCategories();
  const displayed = categories.slice(0, 4);

  return (
    <section id="urunler" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-extrabold text-oxynavy-700">ÜRÜN GRUPLARIMIZ</p>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight text-oxynavy-950 sm:text-4xl lg:text-[42px]">
            İleri Teknoloji, Üstün Performans
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-steel-700 sm:text-base">
            Hastaneler, klinikler ve sağlık merkezleri için geliştirdiğimiz yenilikçi ürün
            gruplarıyla yaşam alanlarını daha güvenli ve verimli hale getiriyoruz.
          </p>
        </div>

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
                      alt={cat.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-base font-extrabold text-oxynavy-950">{cat.name.toUpperCase()}</h3>
                    <p className="mt-4 min-h-[72px] text-sm leading-6 text-steel-700">
                      {CATEGORY_DESCS[i] ?? "Medikal ekipman ve çözümlerimiz."}
                    </p>
                    <a
                      href={`/urunler`}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-oxynavy-900 transition hover:text-oxynavy-500"
                    >
                      Detaylı İncele
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
        </div>
      </div>
    </section>
  );
}
