/*
 * Design: Fluid Commerce — Soft Corporate Dynamism
 * Hero: Full-width dark navy background with floating dashboard mockup
 * Diagonal clip-path bottom, gradient orbs, staggered entrance animations
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Shield, Globe, Server } from "lucide-react";
import { LeadCaptureDialog } from "@/components/LeadCaptureDialog";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663243613237/ZUJaVg8WakRBNHRrCPTKin/fateh-hero-bg-3DcCFadWtBHB98iJZD65zp.webp";
const DASHBOARD_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663243613237/ZUJaVg8WakRBNHRrCPTKin/fateh-dashboard-TFt7bikrqWFZE8j9swnDzY.webp";

const trustBadges = [
  { icon: CheckCircle, label: "ZATCA Phase 2 Ready" },
  { icon: Shield, label: "ISO 27001 Certified" },
  { icon: Globe, label: "200+ Businesses" },
  { icon: Server, label: "Cloud Infrastructure" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HeroSection() {
  const { t, i18n } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"trial" | "demo">("trial");

  const trustBadges = [
    { icon: CheckCircle, label: t("hero.badges.zatca") },
    { icon: Shield, label: t("hero.badges.iso") },
    { icon: Globe, label: t("hero.badges.businesses") },
    { icon: Server, label: t("hero.badges.cloud") },
  ];

  const isRTL = i18n.language === 'ar';

  const openDialog = async (type: "trial" | "demo") => {
    if (type === "demo") {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
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

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-navy min-h-[100vh] flex items-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/90 to-navy-light/80" />

      {/* Ambient orbs */}
      <div className="absolute top-20 left-[10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-20 right-[10%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px]" />

      <div className="container relative z-10 pt-28 pb-20 lg:pt-32 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-xl"
          >
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-100 text-xs font-body font-semibold tracking-wide uppercase mb-6 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                <CheckCircle className="w-3.5 h-3.5 text-blue-300" />
                {t("hero.badge")}
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl leading-[1.08] text-white mb-6"
            >
              {t("hero.title")}
              <br />
              {t("hero.title_sub")}{" "}
              <span className="text-primary">{t("hero.title_highlight")}</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="text-lg text-slate-300 font-body leading-relaxed mb-8 max-w-md"
            >
              {t("hero.description")}
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-3 mb-10">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary-light text-white font-body font-semibold text-base px-7 h-12 shadow-[0_4px_20px_var(--color-primary)/0.35] hover:shadow-[0_4px_24px_var(--color-primary)/0.5] transition-all"
                onClick={() => openDialog("trial")}
              >
                {t("hero.trial_btn")}
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 font-body font-semibold text-base px-7 h-12 bg-transparent"
                onClick={() => openDialog("demo")}
              >
                {t("hero.demo_btn")}
              </Button>
            </motion.div>

            <motion.div
              variants={item}
              className="flex flex-wrap gap-x-6 gap-y-3"
            >
              {trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 text-slate-400 text-sm font-body"
                >
                  <badge.icon className="w-4 h-4 text-primary/70" />
                  {badge.label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -60 : 60, rotateY: isRTL ? 5 : -5 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Glow behind dashboard */}
              <div className="absolute -inset-4 bg-primary/10 rounded-2xl blur-2xl" />
              <img
                src={DASHBOARD_IMG}
                alt="Fateh ERP Trading Dashboard"
                className="relative rounded-xl shadow-2xl border border-white/10 w-full"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Diagonal bottom divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0 80L1440 80L1440 30C1200 60 720 0 0 50L0 80Z" fill="oklch(0.99 0.001 260)" />
        </svg>
      </div>

      <LeadCaptureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogType === "trial" ? t("dialog.trial_title") : t("dialog.demo_title")}
        description={dialogType === "trial"
          ? t("dialog.trial_desc")
          : t("dialog.demo_desc")
        }
        source={dialogType === "trial" ? `Hero (Free Trial) [${i18n.language}]` : `Hero (Demo) [${i18n.language}]`}
      />
    </section>
  );
}
