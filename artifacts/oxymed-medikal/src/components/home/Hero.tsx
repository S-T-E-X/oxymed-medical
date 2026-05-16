import { ArrowDownToLine, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative isolate min-h-[620px] overflow-hidden bg-oxynavy-950 sm:min-h-[600px] lg:min-h-[570px]">
      <img
        src="/assets/images/hero-medical-suite.png"
        alt="Modern hastane odasında yatak başı ünitesi ve pendant sistemi"
        className="absolute inset-0 h-full w-full object-cover object-[63%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-oxynavy-950/92 via-oxynavy-950/58 to-oxynavy-950/12" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(255,255,255,0.22),transparent_26%),linear-gradient(180deg,rgba(2,20,35,0.08),rgba(2,20,35,0.25))]" />

      <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-4 py-16 sm:min-h-[600px] sm:px-6 lg:min-h-[570px] lg:px-8">
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
              href="#urunler"
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
        </div>
      </div>
    </section>
  );
}
