import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgeCheck,
  Bed,
  Box,
  Building2,
  Cable,
  Cpu,
  Droplets,
  Gauge,
  HeartPulse,
  Hospital,
  Layers,
  Lightbulb,
  Microscope,
  Monitor,
  PlugZap,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  Thermometer,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";

export const PRODUCT_ICON_OPTIONS = [
  { key: "sparkles", label: "Parıltı", Icon: Sparkles },
  { key: "layers", label: "Katmanlar", Icon: Layers },
  { key: "hospital", label: "Hastane", Icon: Hospital },
  { key: "stethoscope", label: "Stetoskop", Icon: Stethoscope },
  { key: "bed", label: "Yatak", Icon: Bed },
  { key: "building", label: "Bina", Icon: Building2 },
  { key: "heart-pulse", label: "Kalp / Nabız", Icon: HeartPulse },
  { key: "activity", label: "Aktivite", Icon: Activity },
  { key: "shield-check", label: "Güvenlik", Icon: ShieldCheck },
  { key: "badge-check", label: "Onay", Icon: BadgeCheck },
  { key: "lightbulb", label: "Aydınlatma", Icon: Lightbulb },
  { key: "settings", label: "Ayarlar", Icon: Settings },
  { key: "wrench", label: "Bakım", Icon: Wrench },
  { key: "gauge", label: "Performans", Icon: Gauge },
  { key: "zap", label: "Enerji", Icon: Zap },
  { key: "plug-zap", label: "Elektrik", Icon: PlugZap },
  { key: "cable", label: "Bağlantı", Icon: Cable },
  { key: "monitor", label: "Monitör", Icon: Monitor },
  { key: "droplets", label: "Sıvı", Icon: Droplets },
  { key: "wind", label: "Hava", Icon: Wind },
  { key: "thermometer", label: "Sıcaklık", Icon: Thermometer },
  { key: "syringe", label: "Enjektör", Icon: Syringe },
  { key: "microscope", label: "Laboratuvar", Icon: Microscope },
  { key: "box", label: "Ürün", Icon: Box },
  { key: "cpu", label: "Teknoloji", Icon: Cpu },
] as const;

export type ProductIconKey = (typeof PRODUCT_ICON_OPTIONS)[number]["key"];

export const PRODUCT_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  PRODUCT_ICON_OPTIONS.map(({ key, Icon }) => [key, Icon]),
);

export function getProductIcon(
  key: string | undefined,
  fallback: ProductIconKey,
): LucideIcon {
  return PRODUCT_ICON_MAP[key ?? ""] ?? PRODUCT_ICON_MAP[fallback];
}