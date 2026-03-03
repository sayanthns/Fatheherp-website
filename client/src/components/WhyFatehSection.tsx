/*
 * Design: Fluid Commerce — Soft Corporate Dynamism
 * WhyFateh: Value proposition section between pricing and testimonials
 */
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { TrendingUp, Settings, Eye, Headphones } from "lucide-react";

const getBenefits = (t: any) => [
  {
    icon: TrendingUp,
    title: t("features.benefits.scale.title"),
    description: t("features.benefits.scale.desc"),
  },
  {
    icon: Settings,
    title: t("features.benefits.tailored.title"),
    description: t("features.benefits.tailored.desc"),
  },
  {
    icon: Eye,
    title: t("features.benefits.costs.title"),
    description: t("features.benefits.costs.desc"),
  },
  {
    icon: Headphones,
    title: t("features.benefits.support.title"),
    description: t("features.benefits.support.desc"),
  },
];

export default function WhyFatehSection() {
  const { t } = useTranslation();
  const benefits = getBenefits(t);
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-navy/5 text-navy text-xs font-body font-semibold tracking-wide uppercase mb-4">
            {t("features.badge_why")}
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] text-foreground leading-tight mb-4">
            {t("features.title_why")}
          </h2>
          <p className="text-muted-foreground font-body text-lg leading-relaxed">
            {t("features.desc_why")}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-coral/10 flex items-center justify-center mx-auto mb-4">
                <b.icon className="w-6 h-6 text-coral" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground mb-2">
                {b.title}
              </h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                {b.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
