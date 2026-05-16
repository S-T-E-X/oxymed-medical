import { useState, useEffect } from "react";
import { ArrowDownToLine, ArrowLeft, ArrowRight } from "lucide-react";
import { useListSliders } from "@workspace/api-client-react";

export default function Hero() {
  const { data: allSliders = [] } = useListSliders();
  const sliders = allSliders
    .filter((s) => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % sliders.length), 6000);
    return () => clearInterval(id);
  }, [sliders.length]);

  const hero = sliders[current];

  return (
    <section className="relative isolate min-h-[620px] overflow-hidden bg-oxynavy-950 sm:min-h-[600px] lg:min-h-[570px]">
      {hero?.imageUrl ? (
        <img
          key={hero.id}
          src={hero.imageUrl}
          alt={hero.title}
          className="absolute inset-0 h-full w-full object-cover object-[63%_center] transition-opacity duration-700"
        />
      ) : (
        <img
          src="/assets/images/hero-medical-suite.png"
          alt="Modern hastane odasında yatak başı ünitesi ve pendant sistemi"
          className="absolute inset-0 h-full w-full object-cover object-[63%_center]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-oxynavy-950/92 via-oxynavy-950/58 to-oxynavy-950/12" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(255,255,255,0.22),transparent_26%),linear-gradient(180deg,rgba(2,20,35,0.08),rgba(2,20,35,0.25))]" />

      <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-4 py-16 sm:min-h-[600px] sm:px-6 lg:min-h-[570px] lg:px-8">
        <div className="max-w-[590px] pt-6 text-white">
          {hero ? (
            <>
              {hero.subtitle && (
                <p className="text-sm font-bold uppercase tracking-widest text-white/78">{hero.subtitle}</p>
              )}
              <h1 className="mt-3 text-[44px] font-extrabold leading-[1.08] sm:text-6xl lg:text-[68px]">
                {hero.title.split(" ").map((word, i, arr) =>
                  i === Math.floor(arr.length / 2) ? (
                    <span key={i} className="block">{word}</span>
                  ) : (
                    <span key={i}>{word} </span>
                  )
                )}
              </h1>
              <div className="mt-8 h-1 w-16 bg-white" />
              {hero.description && (
                <p className="mt-8 max-w-[420px] text-base font-medium leading-8 text-white/88 sm:text-lg">
                  {hero.description}
                </p>
              )}
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                {hero.ctaPrimaryText && hero.ctaPrimaryHref && (
                  <a
                    href={hero.ctaPrimaryHref}
                    className="inline-flex items-center justify-center gap-2 rounded bg-oxynavy-950 px-7 py-4 text-xs font-extrabold text-white shadow-[0_10px_30px_rgba(2,20,35,0.22)] transition hover:bg-oxynavy-800"
                  >
                    {hero.ctaPrimaryText}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
                {hero.ctaSecondaryText && hero.ctaSecondaryHref && (
                  <a
                    href={hero.ctaSecondaryHref}
                    className="inline-flex items-center justify-center gap-2 rounded border border-white/72 bg-white/6 px-7 py-4 text-xs font-extrabold text-white backdrop-blur-sm transition hover:bg-white/14"
                  >
                    {hero.ctaSecondaryText}
                    <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            </>
          ) : (
            <>
              <h1 className="text-[44px] font-extrabold leading-[1.08] sm:text-6xl lg:text-[68px]">
                HAYAT İÇİN
                <span className="block">TEKNOLOJİ</span>
              </h1>
              <div className="mt-8 h-1 w-16 bg-white" />
              <p className="mt-8 max-w-[420px] text-base font-medium leading-8 text-white/88 sm:text-lg">
                Yatak başı üniteleri, pendant sistemleri ve medikal gaz çözümleri ile güvenli,
                konforlu ve teknolojik ortamlar sunuyoruz.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/urunler"
                  className="inline-flex items-center justify-center gap-2 rounded bg-oxynavy-950 px-7 py-4 text-xs font-extrabold text-white shadow-[0_10px_30px_rgba(2,20,35,0.22)] transition hover:bg-oxynavy-800"
                >
                  ÜRÜNLERİMİZ
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="#katalog"
                  className="inline-flex items-center justify-center gap-2 rounded border border-white/72 bg-white/6 px-7 py-4 text-xs font-extrabold text-white backdrop-blur-sm transition hover:bg-white/14"
                >
                  KATALOG İNDİR
                  <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {sliders.length > 1 && (
        <div className="absolute bottom-6 right-6 flex items-center gap-3">
          <button
            onClick={() => setCurrent((c) => (c - 1 + sliders.length) % sliders.length)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm hover:bg-white/28"
            aria-label="Önceki"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-1.5">
            {sliders.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? "w-6 bg-white" : "w-1.5 bg-white/42"}`}
                aria-label={`Slider ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrent((c) => (c + 1) % sliders.length)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm hover:bg-white/28"
            aria-label="Sonraki"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
