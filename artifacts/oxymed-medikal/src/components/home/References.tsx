import { AlertCircle } from "lucide-react";
import { useListReferences } from "@workspace/api-client-react";

export default function References() {
  const { data: refsData, isLoading, isError } = useListReferences({ limit: 12 });
  const refs = refsData?.items ?? [];

  return (
    <section id="referanslar" className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-sm font-extrabold text-oxynavy-950">REFERANSLARIMIZDAN BAZILARI</h2>

        {isError ? (
          <div className="mt-8 flex items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            Referanslar yüklenirken bir hata oluştu.
          </div>
        ) : isLoading ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[86px] animate-pulse rounded border border-steel-100 bg-steel-100" />
            ))}
          </div>
        ) : refs.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {refs.map((ref) => (
              <div
                key={ref.id}
                className="flex min-h-[86px] items-center justify-center rounded border border-steel-100 bg-white px-4 py-5 text-center shadow-[0_8px_18px_rgba(2,20,35,0.035)]"
              >
                <div>
                  <p className="text-sm font-extrabold text-oxynavy-800 sm:text-base">{ref.title}</p>
                  {ref.city ? (
                    <p className="mt-1 text-[10px] font-bold uppercase text-steel-500">{ref.city}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
