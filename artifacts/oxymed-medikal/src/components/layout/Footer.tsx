import { Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { contact, footerColumns, socialLinks } from "../../data/home";

const socialIconMap = {
  LinkedIn: Linkedin,
  Instagram,
  YouTube: Youtube
};

type FooterProps = {
  compact?: boolean;
};

export default function Footer({ compact = false }: FooterProps) {
  return (
    <footer id="iletisim" className="bg-oxynavy-950 text-white">
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${compact ? "py-8" : "py-14 lg:py-16"}`}>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2.7fr_1.25fr]">
          <div>
            <Logo inverted />
            <p className={`${compact ? "mt-4" : "mt-7"} max-w-[330px] text-sm leading-7 text-white/72`}>
              Yatak başı üniteleri, pendant sistemleri ve medikal gaz çözümleri ile güvenli,
              konforlu ve teknolojik ortamlar sunuyoruz.
            </p>
            <div className={`${compact ? "mt-4" : "mt-7"} flex items-center gap-4`}>
              {socialLinks.map((link) => {
                const Icon = socialIconMap[link.label as keyof typeof socialIconMap];
                return (
                  <a key={link.label} href={link.href} aria-label={link.label} className="text-white/72 transition hover:text-white">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:border-l lg:border-r lg:border-white/10 lg:px-12">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h2 className="text-sm font-extrabold">{column.title}</h2>
                <ul className={`${compact ? "mt-4 space-y-3" : "mt-6 space-y-4"} text-sm text-white/74`}>
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
            <h2 className="text-sm font-extrabold">İLETİŞİM</h2>
            <ul className={`${compact ? "mt-4 space-y-4" : "mt-6 space-y-5"} text-sm leading-6 text-white/74`}>
              <li className="flex gap-3">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-white" aria-hidden="true" />
                <span>{contact.address}</span>
              </li>
              <li>
                <a href={`tel:${contact.phone}`} className="flex gap-3 transition hover:text-white">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white" aria-hidden="true" />
                  {contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="flex gap-3 transition hover:text-white">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white" aria-hidden="true" />
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={`flex flex-col gap-5 border-t border-white/10 text-xs text-white/62 md:flex-row md:items-center md:justify-between ${
            compact ? "mt-7 pt-5" : "mt-12 pt-7"
          }`}
        >
          <p>© 2024 Oxymed Medikal. Tüm hakları saklıdır.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link to="/kvkk" className="transition hover:text-white">KVKK</Link>
            <span className="text-white/28">|</span>
            <Link to="/gizlilik-politikasi" className="transition hover:text-white">Gizlilik Politikası</Link>
            <span className="text-white/28">|</span>
            <Link to="/kullanim-sartlari" className="transition hover:text-white">Kullanım Şartları</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
