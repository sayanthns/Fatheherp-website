/*
 * Design: Fluid Commerce — Soft Corporate Dynamism
 * Navbar: Sticky, transparent on hero (white text), glass on scroll (dark text)
 */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LeadCaptureDialog } from "@/components/LeadCaptureDialog";
import { frappeApi } from "@/lib/frappe-api";

const getNavLinks = (t: any) => [
  { label: t("nav.features"), href: "#features" },
  { label: t("nav.modules"), href: "#modules" },
  { label: t("nav.pricing"), href: "#pricing" },
  { label: t("nav.about"), href: "#about" },
  { label: t("nav.contact"), href: "#contact" },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const navLinks = getNavLinks(t);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"trial" | "demo">("trial");

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);

      // Hide navbar if scrolling down and past 100px. Show if scrolling up.
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openDialog = async (type: "trial" | "demo") => {
    setMobileOpen(false);
    if (type === "demo") {
      try {
        const data = await frappeApi.getSettings();
        if (data.success && data.settings?.calendlyUrl) {
          window.open(data.settings.calendlyUrl, "_blank");
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    setDialogType(type);
    setDialogOpen(true);
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-[0_1px_3px_oklch(0_0_0/0.05)] border-b border-slate-100 transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
      <nav className="container flex items-center justify-between h-18 lg:h-20">
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="flex items-center gap-2.5 group"
        >
          <div className="flex items-center justify-center overflow-hidden">
            <img
              src="/assets/fateh_website/fateh/logo.png"
              alt="Fateh ERP Logo"
              className="h-9 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement?.nextElementSibling?.classList.remove('hidden');
                target.parentElement?.classList.add('hidden');
              }}
            />
          </div>
          <div className="hidden flex-col">
            <span className="font-display font-bold text-[1.15rem] leading-tight tracking-tight text-navy">
              Fateh<span className="text-coral"> ERP</span>
            </span>
            <span className="text-[0.6rem] font-body font-medium tracking-widest uppercase leading-none text-slate-500">
              {t("footer.tagline")}
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="px-4 py-2 text-sm font-body font-medium transition-colors rounded-lg text-slate-600 hover:text-primary hover:bg-slate-50"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="font-body font-bold text-sm text-primary hover:bg-primary/5 transition-all px-3"
          >
            {t("common.language")}
          </Button>
          <Button
            variant="outline"
            className="font-body font-medium text-sm transition-colors border-slate-200 text-slate-700 hover:bg-slate-50 bg-white shadow-sm"
            onClick={() => openDialog("demo")}
          >
            {t("nav.demo")}
          </Button>
          <Button
            className="font-body font-medium text-sm bg-coral hover:bg-coral-light text-white shadow-md"
            onClick={() => openDialog("trial")}
          >
            {t("nav.trial")}
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 rounded-lg transition-colors hover:bg-slate-100 text-slate-600"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-border overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="px-4 py-3 text-left text-sm font-body font-medium text-foreground/70 hover:text-foreground hover:bg-slate-50 rounded-lg transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full font-body font-bold text-primary hover:bg-primary/5 justify-between px-4"
                  onClick={toggleLanguage}
                >
                  <span>{i18n.language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}</span>
                  <span>{t("common.language")}</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full font-body font-medium border-navy/20 text-navy bg-transparent"
                  onClick={() => openDialog("demo")}
                >
                  {t("nav.demo")}
                </Button>
                <Button
                  className="w-full font-body font-medium bg-coral hover:bg-coral-light text-white"
                  onClick={() => openDialog("trial")}
                >
                  {t("nav.trial")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LeadCaptureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogType === "trial" ? t("dialog.trial_title") : t("dialog.demo_title")}
        description={dialogType === "trial"
          ? t("dialog.trial_desc")
          : t("dialog.demo_desc")
        }
        source={dialogType === "trial" ? `Navigation (Free Trial) [${i18n.language}]` : `Navigation (Demo) [${i18n.language}]`}
      />
    </header>
  );
}
