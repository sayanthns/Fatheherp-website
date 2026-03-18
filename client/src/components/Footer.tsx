import { useTranslation } from "react-i18next";

const getPlatformLinks = (t: any) => [
  { label: t("footer.links.sales"), href: "#modules" },
  { label: t("footer.links.inventory"), href: "#modules" },
  { label: t("footer.links.procurement"), href: "#modules" },
  { label: t("footer.links.finance"), href: "#modules" },
  { label: t("footer.links.crm"), href: "#modules" },
  { label: t("footer.links.reports"), href: "#modules" },
];

const getCompanyLinks = (t: any) => [
  { label: t("footer.links.about"), href: "#about" },
  { label: t("footer.links.pricing"), href: "#pricing" },
  { label: t("footer.links.contact"), href: "#contact" },
  { label: t("footer.links.careers"), href: "#" },
  { label: t("footer.links.partner"), href: "#" },
];

const getResourceLinks = (t: any) => [
  { label: t("footer.links.knowledge"), href: "#" },
  { label: t("footer.links.docs"), href: "#" },
  { label: t("footer.links.api"), href: "#" },
  { label: t("footer.links.status"), href: "#" },
  { label: t("footer.links.integrations"), href: "#" },
];

const getLegalLinks = (t: any) => [
  { label: t("footer.links.privacy"), href: "#" },
  { label: t("footer.links.terms"), href: "#" },
  { label: t("footer.links.security"), href: "#" },
  { label: t("footer.links.eula"), href: "#" },
];

export default function Footer() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const platformLinks = getPlatformLinks(t);
  const companyLinks = getCompanyLinks(t);
  const resourceLinks = getResourceLinks(t);
  const legalLinks = getLegalLinks(t);

  const scrollTo = (href: string) => {
    if (href === "#") return;
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-foreground text-white/70">
      <div className="container py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-white/90 p-1 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={`${import.meta.env.BASE_URL}logo.png`}
                  alt="Fateh ERP Logo"
                  className="h-8 w-auto object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement?.nextElementSibling?.classList.remove('hidden');
                    target.parentElement?.classList.add('hidden');
                  }}
                />
              </div>
              <div className="hidden flex-col">
                <span className="font-display font-bold text-[1.1rem] leading-tight text-white">
                  Fateh<span className="text-coral"> ERP</span>
                </span>
                <span className="text-[0.6rem] font-body font-medium text-white/40 tracking-widest uppercase leading-none">
                  {t("footer.tagline")}
                </span>
              </div>
            </div>
            <p className="text-white/50 font-body text-sm leading-relaxed max-w-xs mb-6">
              {t("footer.description")}
            </p>
            <div className="flex gap-3">
              {["X", "in", "f"].map((icon) => (
                <button
                  key={icon}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white text-xs font-bold transition-colors"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-display font-semibold text-sm text-white mb-4">{t("footer.columns.platform")}</h4>
            <ul className="space-y-2.5">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-white/50 hover:text-white font-body text-sm transition-colors block w-full text-left ltr:text-left rtl:text-right"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-sm text-white mb-4">{t("footer.columns.company")}</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-white/50 hover:text-white font-body text-sm transition-colors block w-full text-left ltr:text-left rtl:text-right"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-semibold text-sm text-white mb-4">{t("footer.columns.resources")}</h4>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-white/50 hover:text-white font-body text-sm transition-colors block w-full text-left ltr:text-left rtl:text-right"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-sm text-white mb-4">{t("footer.columns.legal")}</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-white/50 hover:text-white font-body text-sm transition-colors block w-full text-left ltr:text-left rtl:text-right"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 font-body text-xs">
            &copy; {new Date().getFullYear()} Fateh ERP. {t("footer.copyright")}
          </p>
          <p className="text-white/30 font-body text-xs">
            {t("footer.built_for")}
          </p>
        </div>
      </div>
    </footer>
  );
}
