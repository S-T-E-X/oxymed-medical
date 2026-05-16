import { Building2, Factory, Hospital, Settings2, Warehouse } from "lucide-react";

type ImageSlotTone = "facility" | "clinical" | "factory" | "macro" | "line" | "warehouse";

type ImageSlotProps = {
  tone?: ImageSlotTone;
  className?: string;
  image?: string;
  alt: string;
};

const toneStyles = {
  facility: {
    icon: Building2,
    className: "from-oxynavy-950 via-oxynavy-800 to-oxynavy-500"
  },
  clinical: {
    icon: Hospital,
    className: "from-white via-steel-100 to-steel-200"
  },
  factory: {
    icon: Factory,
    className: "from-steel-50 via-white to-steel-200"
  },
  macro: {
    icon: Settings2,
    className: "from-oxynavy-950 via-steel-700 to-steel-200"
  },
  line: {
    icon: Hospital,
    className: "from-steel-100 via-white to-oxynavy-100"
  },
  warehouse: {
    icon: Warehouse,
    className: "from-steel-200 via-steel-100 to-oxynavy-100"
  }
};

export default function ImageSlot({ tone = "clinical", className = "", image, alt }: ImageSlotProps) {
  const style = toneStyles[tone];
  const Icon = style.icon;
  const isLightTone = ["clinical", "factory", "line", "warehouse"].includes(tone);

  if (image) {
    return <img src={image} alt={alt} className={`h-full w-full object-cover ${className}`} />;
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative isolate overflow-hidden bg-gradient-to-br ${style.className} ${className}`}
    >
      <div
        className={`absolute inset-0 opacity-[0.2] ${
          isLightTone
            ? "[background-image:linear-gradient(rgba(4,29,49,.42)_1px,transparent_1px),linear-gradient(90deg,rgba(4,29,49,.42)_1px,transparent_1px)]"
            : "[background-image:linear-gradient(rgba(255,255,255,.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.55)_1px,transparent_1px)]"
        } [background-size:44px_44px]`}
      />
      <div className={`absolute -right-12 -top-12 h-48 w-48 rounded-full border ${isLightTone ? "border-oxynavy-950/12" : "border-white/35"}`} />
      <div className={`absolute bottom-8 left-8 h-28 w-28 rounded-full border ${isLightTone ? "border-oxynavy-950/10" : "border-white/25"}`} />
      <Icon
        className={`absolute right-8 top-8 h-14 w-14 stroke-[1.2] ${isLightTone ? "text-oxynavy-950/18" : "text-white/45"}`}
        aria-hidden="true"
      />
      <div className={`absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t ${isLightTone ? "from-oxynavy-950/10" : "from-oxynavy-950/38"} to-transparent`} />
    </div>
  );
}
