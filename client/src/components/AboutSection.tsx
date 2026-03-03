/*
 * Design: Fluid Commerce — Soft Corporate Dynamism
 * About: Split layout with image and value propositions
 */
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Target, Lightbulb, Handshake } from "lucide-react";

const TRADING_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663243613237/ZUJaVg8WakRBNHRrCPTKin/fateh-trading-2ZcLVBS5YwcM4T4vX3vc8c.webp";

const getValues = (t: any) => [
  {
    icon: Target,
    title: t("about.values.approach.title"),
    description: t("about.values.approach.desc"),
  },
  {
    icon: Lightbulb,
    title: t("about.values.scaling.title"),
    description: t("about.values.scaling.desc"),
  },
  {
    icon: Handshake,
    title: t("about.values.expertise.title"),
    description: t("about.values.expertise.desc"),
  },
];

export default function AboutSection() {
  const { t, i18n } = useTranslation();
  const values = getValues(t);
  const isRTL = i18n.language === 'ar';
  return (
    <section id="about" className="py-24 lg:py-32 bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Image */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-coral/5 to-navy/5 rounded-2xl blur-xl" />
            <img
              src={TRADING_IMG}
              alt="Saudi business professionals using Fateh ERP"
              className="relative rounded-xl shadow-xl w-full"
            />
            {/* Floating stat card */}
            <div className={`absolute -bottom-6 ${isRTL ? '-left-4 lg:-left-8' : '-right-4 lg:-right-8'} bg-white rounded-xl shadow-xl border border-border p-5`}>
              <p className="font-mono font-bold text-2xl text-navy">98%</p>
              <p className="text-muted-foreground font-body text-xs">{t("about.stat")}</p>
            </div>
          </motion.div>

          {/* Right — Content */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-navy/5 text-navy text-xs font-body font-semibold tracking-wide uppercase mb-4">
              {t("about.badge")}
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground leading-tight mb-4">
              {t("about.title")}
            </h2>
            <p className="text-muted-foreground font-body text-base leading-relaxed mb-8">
              {t("about.description")}
            </p>

            <div className="space-y-6">
              {values.map((v, i) => (
                <div key={v.title} className="flex gap-4">
                  <div className="w-11 h-11 rounded-lg bg-coral/10 flex items-center justify-center shrink-0">
                    <v.icon className="w-5 h-5 text-coral" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-foreground mb-1">
                      {v.title}
                    </h3>
                    <p className="text-muted-foreground font-body text-sm leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
