import { useState, useEffect } from "react";
import { ArrowDownToLine, ArrowLeft, ArrowRight } from "lucide-react";
import { useListSliders } from "@workspace/api-client-react";
import CatalogModal from "./CatalogModal";
import type { Slider } from "@workspace/api-client-react";

function hexToRgba(hex: string, pct: number): string {
  try {
    const h = hex.replace("#", "");
    if (h.length !== 6) return `rgba(2,20,35,${(pct / 100).toFixed(2)})`;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${(pct / 100).toFixed(2)})`;
  } catch {
    return `rgba(2,20,35,${(pct / 100).toFixed(2)})`;
  }
}

function buildOverlayStyle(hero: Slider): React.CSSProperties {
  if (hero.overlayEnabled === false) return { display: "none" };
  const color = hero.overlayColor ?? "#021423";
  const from = hero.overlayFromOpacity ?? 92;
  const to = hero.overlayToOpacity ?? 12;
  return {
    background: `linear-gradient(to right, ${hexToRgba(color, from)}, ${hexToRgba(color, to)})`,
  };
}

export default function Hero() {
  const { data: allSliders, isLoading, isError } = useListSliders();
  const sliders = (allSliders ?? [])
    .filter((s) => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const [current, setCurrent] = useState(0);
  const [catalogOpen, setCatalogOpen] = useState(false);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % sliders.length), 6000);
    return () => clearInterval(id);
  }, [sliders.length]);

  const hero = sliders[current];
  const showFallback = isError || (!isLoading && !hero);

  if (isLoading) {
    return (
      <section className="relative isolate h-[620px] overflow-hidden bg-oxynavy-950 sm:h-[600px] lg:h-[570px]">
        <div className="absolute inset-0 animate-pulse bg-oxynavy-900" />
        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-[590px] space-y-6 pt-6">
            <div className="h-4 w-32 rounded bg-white/10" />
            <div className="space-y-3">
              <div className="h-14 w-80 rounded bg-white/10" />
              <div className="h-14 w-64 rounded bg-white/10" />
            </div>
            <div className="h-1 w-16 bg-white/10" />
            <div className="space-y-2">
              <div className="h-4 w-96 rounded bg-white/10" />
              <div className="h-4 w-72 rounded bg-white/10" />
            </div>
            <div className="flex gap-3 pt-2">
              <div className="h-12 w-36 rounded bg-white/10" />
              <div className="h-12 w-36 rounded bg-white/10" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const heroTextColor = hero?.textColor ?? "#ffffff";
  const primaryBg = hero?.ctaPrimaryBg ?? "#021423";
  const secondaryBg = hero?.ctaSecondaryBg || "rgba(255,255,255,0.06)";

  return (
    <>
      <section className="relative isolate h-[620px] overflow-hidden bg-oxynavy-950 sm:h-[600px] lg:h-[570px]">
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

        {!showFallback && hero ? (
          <div className="absolute inset-0" style={buildOverlayStyle(hero)} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-oxynavy-950/92 via-oxynavy-950/58 to-oxynavy-950/12" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(255,255,255,0.22),transparent_26%),linear-gradient(180deg,rgba(2,20,35,0.08),rgba(2,20,35,0.25))]" />

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          {!showFallback && hero ? (
            <div className="max-w-[590px] pt-6" style={{ color: heroTextColor }}>
              {hero.subtitle && (
                <p className="text-sm font-bold uppercase tracking-widest" style={{ opacity: 0.78 }}>
                  {hero.subtitle}
                </p>
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
              <div className="mt-8 h-1 w-16" style={{ background: heroTextColor }} />
              {hero.description && (
                <p className="mt-8 max-w-[420px] text-base font-medium leading-8 sm:text-lg" style={{ opacity: 0.88 }}>
                  {hero.description}
                </p>
              )}
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                {hero.ctaPrimaryText && hero.ctaPrimaryHref && (
                  <a
                    href={hero.ctaPrimaryHref}
                    style={{ backgroundColor: primaryBg }}
                    className="inline-flex items-center justify-center gap-2 rounded px-7 py-4 text-xs font-extrabold text-white shadow-[0_10px_30px_rgba(2,20,35,0.22)] transition hover:opacity-90"
                  >
                    {hero.ctaPrimaryText}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
                {hero.ctaSecondaryText && hero.ctaSecondaryHref && (
                  <a
                    href={hero.ctaSecondaryHref}
                    style={{ backgroundColor: secondaryBg }}
                    className="inline-flex items-center justify-center gap-2 rounded border border-white/72 px-7 py-4 text-xs font-extrabold text-white backdrop-blur-sm transition hover:opacity-90"
                  >
                    {hero.ctaSecondaryText}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
                {hero.showCatalogButton && (
                  <button
                    onClick={() => setCatalogOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded border border-white/72 bg-white/6 px-7 py-4 text-xs font-extrabold text-white backdrop-blur-sm transition hover:bg-white/14"
                  >
                    KATALOG İNDİR
                    <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-[590px] pt-6 text-white">
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
                <button
                  onClick={() => setCatalogOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded border border-white/72 bg-white/6 px-7 py-4 text-xs font-extrabold text-white backdrop-blur-sm transition hover:bg-white/14"
                >
                  KATALOG İNDİR
                  <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
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

      {catalogOpen && <CatalogModal onClose={() => setCatalogOpen(false)} />}
    </>
  );
}
