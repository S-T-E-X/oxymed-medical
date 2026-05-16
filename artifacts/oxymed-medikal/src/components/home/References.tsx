import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useListReferences } from "@workspace/api-client-react";

export default function References() {
  const { data: refsData, isLoading, isError } = useListReferences({ limit: 24 });
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
        <div className="mt-8 flex gap-6 overflow-hidden px-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-[72px] w-[180px] shrink-0 animate-pulse rounded border border-steel-100 bg-steel-100"
            />
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
  const doubled = [...refs, ...refs];

  return (
    <Link
      to="/referanslar"
      className="mt-8 block cursor-pointer overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
      aria-label="Tüm referansları görüntüle"
    >
      <div className="flex w-max animate-marquee">
        {doubled.map((ref, i) => (
          <div
            key={`${ref.id}-${i}`}
            className="mx-4 flex h-[72px] w-[200px] shrink-0 flex-col items-center justify-center rounded border border-steel-100 bg-white px-5 shadow-[0_4px_14px_rgba(2,20,35,0.045)]"
          >
            <p className="text-center text-[13px] font-extrabold leading-tight text-oxynavy-800">
              {ref.title}
            </p>
            {ref.city && (
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-steel-500">
                {ref.city}
              </p>
            )}
          </div>
        ))}
      </div>
    </Link>
  );
}
