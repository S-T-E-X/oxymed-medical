import { DraftingCompass, Factory, Headphones, ShieldCheck, TimerReset } from "lucide-react";
import { features, type IconKey } from "../../data/home";

const featureIconMap = {
  production: Factory,
  design: DraftingCompass,
  safety: ShieldCheck,
  support: Headphones,
  durability: TimerReset
} satisfies Record<IconKey, typeof Factory>;

type FeatureBarProps = {
  variant?: "dark" | "light";
  compact?: boolean;
};

export default function FeatureBar({ variant = "dark", compact = false }: FeatureBarProps) {
  const isLight = variant === "light";

  return (
    <section className={isLight ? "bg-white text-oxynavy-950" : "bg-oxynavy-900 text-white"}>
      <div
        className={`mx-auto grid max-w-7xl grid-cols-1 divide-y px-4 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-6 lg:grid-cols-5 lg:px-8 ${
          isLight ? "divide-steel-200" : "divide-white/12"
        }`}
      >
        {features.map((feature) => {
          const Icon = featureIconMap[feature.icon];
          return (
            <div
              key={feature.title}
              className={`flex items-start gap-4 ${compact ? "py-5 sm:px-5 lg:px-6" : "py-7 sm:px-5 lg:px-6"}`}
            >
              <span
                className={`flex shrink-0 items-center justify-center rounded-full border ${
                  compact ? "h-11 w-11" : "h-12 w-12"
                } ${
                  isLight ? "border-oxynavy-200 text-oxynavy-900" : "border-white/28 text-white/90"
                }`}
              >
                <Icon className={`${compact ? "h-5 w-5" : "h-6 w-6"} stroke-[1.4]`} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-[12px] font-extrabold">{feature.title}</h2>
                <p className={`mt-2 text-[12px] leading-5 ${isLight ? "text-steel-700" : "text-white/72"}`}>
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
