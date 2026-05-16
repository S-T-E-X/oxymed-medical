import { useListReferences } from "@workspace/api-client-react";

export default function References() {
  const { data: refsData } = useListReferences({ limit: 12 });
  const refs = refsData?.items ?? [];

  return (
    <section id="referanslar" className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-sm font-extrabold text-oxynavy-950">REFERANSLARIMIZDAN BAZILARI</h2>
        {refs.length > 0 ? (
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
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {["ACIBADEM", "MEDICANA", "T.C. SAĞLIK BAKANLIĞI", "ŞİŞLİ ETFAl", "İ.Ü. CERRAHPAŞA", "LÖSANTE"].map((name) => (
              <div
                key={name}
                className="flex min-h-[86px] items-center justify-center rounded border border-steel-100 bg-white px-4 py-5 text-center shadow-[0_8px_18px_rgba(2,20,35,0.035)] animate-pulse"
              >
                <p className="text-sm font-extrabold text-oxynavy-800">{name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
