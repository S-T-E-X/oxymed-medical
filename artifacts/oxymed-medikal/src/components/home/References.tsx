import { AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useListReferences } from "@workspace/api-client-react";

export default function References() {
  const { data: refsData, isLoading, isError } = useListReferences({ limit: 48 });
  const refs = refsData?.items ?? [];

  return (
    <section id="referanslar" className="bg-white py-12 sm:py-14">
      <h2 className="text-center text-sm font-extrabold text-oxynavy-950">
        REFERANSLARIMIZDAN BAZILARI
      </h2>

      {isError ? (
        <div className="mx-auto mt-8 flex max-w-7xl items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          Referanslar yüklenirken bir hata oluştu.
        </div>
      ) : isLoading ? (
        <div className="mt-8 flex gap-5 overflow-hidden px-10">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[72px] w-[190px] shrink-0 animate-pulse rounded border border-steel-100 bg-steel-100" />
          ))}
        </div>
      ) : refs.length > 0 ? (
        <Marquee refs={refs} />
      ) : null}
    </section>
  );
}

type Ref = { id: number; title: string; city?: string | null };

function Marquee({ refs }: { refs: Ref[] }) {
  const navigate = useNavigate();
  const doubled = [...refs, ...refs];

  function handleCardClick(e: React.MouseEvent) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/referanslar");
  }

  return (
    <div
      className="marquee-container mt-8 overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)",
      }}
    >
      <div className="marquee-track flex w-max">
        {doubled.map((ref, i) => (
          <Link
            key={`${ref.id}-${i}`}
            to="/referanslar"
            onClick={handleCardClick}
            className="mx-3 flex h-[72px] w-[200px] shrink-0 flex-col items-center justify-center rounded border border-steel-100 bg-white px-4 shadow-[0_4px_14px_rgba(2,20,35,0.045)] transition hover:border-oxynavy-200 hover:shadow-[0_6px_18px_rgba(2,20,35,0.08)]"
            aria-label={`${ref.title} referansına git`}
          >
            <p className="text-center text-[13px] font-extrabold leading-tight text-oxynavy-800">
              {ref.title}
            </p>
            {ref.city && (
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-steel-500">
                {ref.city}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
