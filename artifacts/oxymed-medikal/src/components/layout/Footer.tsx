import { Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { useListSettings } from "@workspace/api-client-react";
import Logo from "./Logo";
import { footerColumns } from "../../data/home";
import { trackInteraction } from "../common/VisitorTracker";

const socialIconMap = {
  LinkedIn: Linkedin,
  Instagram,
  YouTube: Youtube
};

type FooterProps = {
  compact?: boolean;
};

export default function Footer({ compact = false }: FooterProps) {
  const { data: rawSettings } = useListSettings();
  const settings = rawSettings as Record<string, string> | undefined;

  const phone = settings?.["phone"] ?? "+90 232 870 0 222";
  const email = settings?.["email"] ?? "info@oxymed.com.tr";
  const address = settings?.["address"] ?? "10016 Sk. No:5 AOSB Çiğli / İzmir / TÜRKİYE";

  const socialLinks = [
    { label: "LinkedIn", href: settings?.["linkedin"] ?? "#" },
    { label: "Instagram", href: settings?.["instagram"] ?? "#" },
    { label: "YouTube", href: settings?.["youtube"] ?? "#" },
  ];

  return (
    <footer id="iletisim" className="bg-oxynavy-950 text-white">
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${compact ? "py-6" : "py-10 lg:py-12"}`}>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_2.7fr_1.25fr]">
          <div>
            <Logo inverted />
            <p className="mt-4 max-w-[300px] text-xs leading-5 text-white/68">
              Yatak başı üniteleri, pendant sistemleri ve medikal gaz çözümleri ile güvenli,
              konforlu ve teknolojik ortamlar sunuyoruz.
            </p>
            <div className="mt-4 flex items-center gap-3">
              {socialLinks.map((link) => {
                const Icon = socialIconMap[link.label as keyof typeof socialIconMap];
                return (
                  <a key={link.label} href={link.href} aria-label={link.label} className="text-white/68 transition hover:text-white">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:border-l lg:border-r lg:border-white/10 lg:px-10">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h2 className="text-[11px] font-extrabold tracking-wide">{column.title}</h2>
                <ul className="mt-3 space-y-2 text-xs text-white/68 leading-4">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.href} className="transition hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-[11px] font-extrabold tracking-wide">İLETİŞİM</h2>
            <ul className="mt-3 space-y-3 text-xs leading-5 text-white/68">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" aria-hidden="true" />
                <span>{address}</span>
              </li>
              <li>
                <a
                  href={`tel:${phone}`}
                  className="flex gap-2.5 transition hover:text-white"
                  onClick={() => trackInteraction("Telefon (Alt Bilgi)")}
                >
                  <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" aria-hidden="true" />
                  {phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex gap-2.5 transition hover:text-white"
                  onClick={() => trackInteraction("E-posta (Alt Bilgi)")}
                >
                  <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" aria-hidden="true" />
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={`flex flex-col gap-4 border-t border-white/10 text-[11px] text-white/56 md:flex-row md:items-center md:justify-between ${
            compact ? "mt-6 pt-4" : "mt-8 pt-5"
          }`}
        >
          <p>© 2024 Oxymed Medikal. Tüm hakları saklıdır.</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Link to="/kvkk" className="transition hover:text-white">KVKK</Link>
            <span className="text-white/24">|</span>
            <Link to="/gizlilik-politikasi" className="transition hover:text-white">Gizlilik Politikası</Link>
            <span className="text-white/24">|</span>
            <Link to="/kullanim-sartlari" className="transition hover:text-white">Kullanım Şartları</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
