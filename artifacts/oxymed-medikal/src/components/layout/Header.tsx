import { useState } from "react";
import { ChevronDown, Instagram, Linkedin, Mail, Menu, Phone, X, Youtube } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { contact, languages, navItems, socialLinks } from "../../data/home";

const socialIconMap = {
  LinkedIn: Linkedin,
  Instagram,
  YouTube: Youtube
};

function isActivePath(currentPath: string, href: string) {
  if (href === "/") {
    return currentPath === "/";
  }
  return currentPath === href.split("#")[0];
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="relative z-30 bg-white shadow-[0_2px_16px_rgba(2,20,35,0.05)]">
      <div className="bg-oxynavy-950 text-white">
        <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-between gap-4 px-4 text-[11px] font-medium sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-white/82">
            <a className="inline-flex items-center gap-2 transition hover:text-white" href={`tel:${contact.phone}`}>
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {contact.phone}
            </a>
            <a className="inline-flex items-center gap-2 transition hover:text-white" href={`mailto:${contact.email}`}>
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              {contact.email}
            </a>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <div className="flex items-center divide-x divide-white/25 text-white/78">
              {languages.map((language) => (
                <a
                  key={language}
                  href={`#${language.toLowerCase()}`}
                  className="px-2 transition first:pl-0 last:pr-0 hover:text-white"
                >
                  {language}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => {
                const Icon = socialIconMap[link.label as keyof typeof socialIconMap];
                return (
                  <a key={link.label} href={link.href} aria-label={link.label} className="text-white/75 transition hover:text-white">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-[92px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[92px] lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Ana menü">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`inline-flex h-[92px] items-center gap-1.5 border-b-2 text-[13px] font-bold transition ${
                  active
                    ? "border-oxynavy-900 text-oxynavy-950"
                    : "border-transparent text-oxynavy-950 hover:border-oxynavy-200 hover:text-oxynavy-500"
                }`}
              >
                {item.label}
                {item.hasChildren ? <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            to="/teklif-al"
            className="rounded bg-oxynavy-950 px-7 py-4 text-[12px] font-bold text-white transition hover:bg-oxynavy-800"
          >
            TEKLİF AL
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded border border-steel-200 text-oxynavy-950 lg:hidden"
          aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {isOpen ? (
        <div className="absolute left-0 top-full w-full border-t border-steel-100 bg-white px-4 pb-6 shadow-[0_14px_35px_rgba(2,20,35,0.08)] lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col py-3" aria-label="Mobil ana menü">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center justify-between border-b border-steel-100 py-4 text-sm font-bold text-oxynavy-950"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
                {item.hasChildren ? <ChevronDown className="h-4 w-4" aria-hidden="true" /> : null}
              </Link>
            ))}
            <Link
              to="/teklif-al"
              className="mt-5 inline-flex justify-center rounded bg-oxynavy-950 px-6 py-3.5 text-xs font-bold text-white"
              onClick={() => setIsOpen(false)}
            >
              TEKLİF AL
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
