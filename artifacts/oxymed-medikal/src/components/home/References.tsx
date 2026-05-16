import { references } from "../../data/home";

export default function References() {
  return (
    <section id="referanslar" className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-sm font-extrabold text-oxynavy-950">REFERANSLARIMIZDAN BAZILARI</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {references.map((reference) => (
            <div
              key={reference.name}
              className="flex min-h-[86px] items-center justify-center rounded border border-steel-100 bg-white px-4 py-5 text-center shadow-[0_8px_18px_rgba(2,20,35,0.035)]"
            >
              <div>
                <p className="text-sm font-extrabold text-oxynavy-800 sm:text-base">{reference.name}</p>
                {reference.detail ? (
                  <p className="mt-1 text-[10px] font-bold uppercase text-steel-500">{reference.detail}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
