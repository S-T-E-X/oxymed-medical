import { AlertCircle } from "lucide-react";
import { useListSettings } from "@workspace/api-client-react";

export default function StatsSection() {
  const { data: settings, isError } = useListSettings();
  const s = settings as Record<string, string> | undefined;

  const statsData = [
    { value: s?.["yearsExperience"] ?? "15+", label: "YILLIK TECRÜBE" },
    { value: s?.["completedProjects"] ?? "200+", label: "TAMAMLANAN PROJE" },
    { value: s?.["exportCountries"] ?? "50+", label: "ÜLKEYE İHRACAT" },
    { value: s?.["customerSatisfaction"] ?? "100%", label: "MÜŞTERİ MEMNUNİYETİ" },
  ];

  return (
    <section id="kurumsal" className="bg-oxynavy-950 text-white">
      {isError && (
        <div className="flex items-center justify-center gap-2 bg-red-900/40 px-4 py-2 text-xs text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          İstatistikler yüklenemedi, varsayılan değerler gösteriliyor.
        </div>
      )}
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[0.95fr_0.8fr_1.45fr]">
        <div className="relative min-h-[260px] overflow-hidden lg:min-h-[310px]">
          <img
            src="/assets/images/stats-facility.png"
            alt="Modern medikal üretim tesisi"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-oxynavy-950/72" />
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-r from-transparent to-oxynavy-950 lg:block" />
        </div>

        <div className="flex items-center px-4 py-10 sm:px-8 lg:px-10">
          <div className="max-w-md">
            <p className="text-sm font-extrabold text-white">NEDEN OXYMED?</p>
            <p className="mt-5 text-sm leading-7 text-white/78">
              Müşteri memnuniyetini ön planda tutan anlayışımız, kalite standartlarımız ve
              tecrübeli ekibimizle sektörde fark yaratıyoruz.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 items-center divide-x divide-y divide-white/10 px-4 pb-10 sm:px-8 lg:grid-cols-4 lg:divide-y-0 lg:px-10 lg:pb-0">
          {statsData.map((item) => (
            <div key={item.label} className="px-4 py-7 text-center lg:py-0">
              <strong className="block text-4xl font-light leading-none text-white sm:text-5xl lg:text-[54px]">
                {item.value}
              </strong>
              <span className="mt-4 block text-[11px] font-extrabold text-white/86">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
