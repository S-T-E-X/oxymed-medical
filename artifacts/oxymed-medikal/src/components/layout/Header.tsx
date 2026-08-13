import { useRef, useState } from "react";
import { ChevronDown, Instagram, Linkedin, Mail, Menu, Phone, X, Youtube } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useListSettings, useListProductCategories } from "@workspace/api-client-react";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import { trackInteraction } from "../common/VisitorTracker";
import { navItems, type NavItemDef } from "../../data/home";
import { useI18n } from "../../i18n/I18nProvider";
import { useLocalizedPath } from "../../i18n/useLocalizedPath";
import { pickLocalizedName } from "../../i18n/pickLocalizedName";

const socialIconMap = {
  LinkedIn: Linkedin,
  Instagram,
  YouTube: Youtube
};

function isActivePath(currentPath: string, href: string) {
  const target = href.split("#")[0];
  if (target === "/") {
    return currentPath === "/";
  }
  return currentPath === target;
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [urunlerOpen, setUrunlerOpen] = useState(false);
  const [corporateOpen, setCorporateOpen] = useState(false);
  const urunlerTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const corporateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { pathname } = useLocation();
  const { data: rawSettings } = useListSettings();
  const settings = rawSettings as Record<string, string> | undefined;
  const { data: categories = [] } = useListProductCategories();
  const { t, locale } = useI18n();
  const path = useLocalizedPath();

  const phone = settings?.["phone"] ?? "+90 232 870 0 222";
  const email = settings?.["email"] ?? "info@oxymed.com.tr";

  const socialLinks = [
    { label: "LinkedIn", href: settings?.["linkedin"] ?? "#" },
    { label: "Instagram", href: settings?.["instagram"] ?? "#" },
    { label: "YouTube", href: settings?.["youtube"] ?? "#" },
  ];

  /** Nav entries either point at a translated route or a Turkish-only page. */
  function hrefFor(item: NavItemDef): string {
    return item.route ? path(item.route) : item.href ?? "/";
  }

  const productsHref = path("products");
  const quoteHref = path("quote");

  function openUrunler() {
    if (urunlerTimeout.current) clearTimeout(urunlerTimeout.current);
    setUrunlerOpen(true);
  }

  function closeUrunler() {
    urunlerTimeout.current = setTimeout(() => setUrunlerOpen(false), 120);
  }

  function openCorporate() {
    if (corporateTimeout.current) clearTimeout(corporateTimeout.current);
    setCorporateOpen(true);
  }

  function closeCorporate() {
    corporateTimeout.current = setTimeout(() => setCorporateOpen(false), 120);
  }

  return (
    <header className="relative z-30 bg-white shadow-[0_2px_16px_rgba(2,20,35,0.05)]">
      <div className="bg-oxynavy-950 text-white">
        <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-between gap-4 px-4 text-[11px] font-medium sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-white/82">
            <a
              className="inline-flex items-center gap-2 transition hover:text-white"
              href={`tel:${phone}`}
              onClick={() => trackInteraction("Telefon (Üst Menü)")}
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              <span dir="ltr">{phone}</span>
            </a>
            <a
              className="inline-flex items-center gap-2 transition hover:text-white"
              href={`mailto:${email}`}
              onClick={() => trackInteraction("E-posta (Üst Menü)")}
            >
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              <span dir="ltr">{email}</span>
            </a>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <LanguageSwitcher />
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

        <nav className="hidden items-center gap-8 lg:flex" aria-label={t("common.nav.mainMenu")}>
          {navItems.map((item) => {
            const href = hrefFor(item);
            const active = isActivePath(pathname, href);
            const label = t(`common.nav.${item.key}`);
            const baseClass = `inline-flex h-[92px] items-center gap-1.5 border-b-2 text-[13px] font-bold transition ${
              active
                ? "border-oxynavy-900 text-oxynavy-950"
                : "border-transparent text-oxynavy-950 hover:border-oxynavy-200 hover:text-oxynavy-500"
            }`;

            if (item.dropdown === "corporate") {
              return (
                <div
                  key={item.key}
                  className="relative"
                  onMouseEnter={openCorporate}
                  onMouseLeave={closeCorporate}
                >
                  <Link to={href} className={baseClass}>
                    {label}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${corporateOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                  </Link>
                  {corporateOpen && (
                    <div
                      className="absolute start-0 top-full z-50 min-w-[210px] rounded-xl border border-steel-100 bg-white py-2 shadow-[0_14px_35px_rgba(2,20,35,0.12)]"
                      onMouseEnter={openCorporate}
                      onMouseLeave={closeCorporate}
                    >
                      <Link to="/kurumsal" className="flex px-4 py-2.5 text-[13px] font-bold text-oxynavy-950 hover:bg-steel-50" onClick={() => setCorporateOpen(false)}>
                        Hakkımızda
                      </Link>
                      <Link to="/sertifikalar" className="flex px-4 py-2.5 text-[13px] text-steel-700 hover:bg-steel-50 hover:text-oxynavy-950" onClick={() => setCorporateOpen(false)}>
                        Sertifikalar
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            if (item.dropdown === "categories") {
              return (
                <div
                  key={item.key}
                  className="relative"
                  onMouseEnter={openUrunler}
                  onMouseLeave={closeUrunler}
                >
                  <Link to={href} className={baseClass}>
                    {label}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${urunlerOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </Link>

                  {urunlerOpen && (
                    <div
                      className="absolute start-0 top-full z-50 min-w-[230px] rounded-xl border border-steel-100 bg-white py-2 shadow-[0_14px_35px_rgba(2,20,35,0.12)]"
                      onMouseEnter={openUrunler}
                      onMouseLeave={closeUrunler}
                    >
                      <Link
                        to={productsHref}
                        className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold text-oxynavy-950 hover:bg-steel-50"
                        onClick={() => setUrunlerOpen(false)}
                      >
                        {t("common.nav.allProducts")}
                      </Link>
                      {categories.length > 0 && (
                        <div className="my-1 border-t border-steel-100" />
                      )}
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`${productsHref}?category=${cat.id}`}
                          className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-steel-700 hover:bg-steel-50 hover:text-oxynavy-950"
                          onClick={() => setUrunlerOpen(false)}
                        >
                          {pickLocalizedName(cat, "name", locale)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.key}
                to={href}
                className={baseClass}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            to={quoteHref}
            className="rounded bg-oxynavy-950 px-7 py-4 text-[12px] font-bold text-white transition hover:bg-oxynavy-800"
            onClick={() => trackInteraction("Teklif Al (Üst Menü)")}
          >
            {t("common.cta.getQuote")}
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded border border-steel-200 text-oxynavy-950 lg:hidden"
          aria-label={isOpen ? t("common.nav.closeMenu") : t("common.nav.openMenu")}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {isOpen ? (
        <div className="absolute start-0 top-full w-full border-t border-steel-100 bg-white px-4 pb-6 shadow-[0_14px_35px_rgba(2,20,35,0.08)] lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col py-3" aria-label={t("common.nav.mobileMenu")}>
            {navItems.map((item) => item.dropdown === "corporate" ? (
              <div key={item.key} className="border-b border-steel-100">
                <Link to="/kurumsal" className="flex items-center justify-between py-4 text-sm font-bold text-oxynavy-950" onClick={() => setIsOpen(false)}>
                  {t(`common.nav.${item.key}`)}
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </Link>
                <div className="mb-3 space-y-1 border-s border-steel-200 ps-4">
                  <Link to="/kurumsal" className="block py-2 text-sm font-semibold text-steel-700" onClick={() => setIsOpen(false)}>Hakkımızda</Link>
                  <Link to="/sertifikalar" className="block py-2 text-sm font-semibold text-steel-700" onClick={() => setIsOpen(false)}>Sertifikalar</Link>
                </div>
              </div>
            ) : (
              <Link
                key={item.key}
                to={hrefFor(item)}
                className="flex items-center justify-between border-b border-steel-100 py-4 text-sm font-bold text-oxynavy-950"
                onClick={() => setIsOpen(false)}
              >
                {t(`common.nav.${item.key}`)}
                {item.dropdown === "categories" ? <ChevronDown className="h-4 w-4" aria-hidden="true" /> : null}
              </Link>
            ))}

            <div className="border-b border-steel-100">
              <p className="pt-4 text-[11px] font-extrabold text-steel-600">{t("common.nav.language")}</p>
              <LanguageSwitcher variant="panel" onSelect={() => setIsOpen(false)} />
            </div>

            <Link
              to={quoteHref}
              className="mt-5 inline-flex justify-center rounded bg-oxynavy-950 px-6 py-3.5 text-xs font-bold text-white"
              onClick={() => {
                trackInteraction("Teklif Al (Mobil Menü)");
                setIsOpen(false);
              }}
            >
              {t("common.cta.getQuote")}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
