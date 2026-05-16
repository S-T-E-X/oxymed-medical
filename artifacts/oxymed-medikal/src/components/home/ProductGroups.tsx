import { ArrowRight } from "lucide-react";
import { productGroups } from "../../data/home";

export default function ProductGroups() {
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
          {productGroups.map((product) => (
            <article
              key={product.title}
              className="group overflow-hidden rounded-lg border border-steel-100 bg-white shadow-[0_8px_24px_rgba(2,20,35,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(2,20,35,0.08)]"
            >
              <div className="aspect-[1.35] overflow-hidden bg-steel-100">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                />
              </div>
              <div className="p-6">
                <h3 className="text-base font-extrabold text-oxynavy-950">{product.title}</h3>
                <p className="mt-4 min-h-[72px] text-sm leading-6 text-steel-700">{product.description}</p>
                <a
                  href={product.href}
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
