/*
 * Design: Fluid Commerce — Soft Corporate Dynamism
 * Features: Staggered two-column layout with icon cards
 * Warm slate backgrounds, soft shadows, coral accents
 */
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  FileText,
  ShoppingCart,
  Package,
  Calculator,
  Users,
  BarChart3,
  Shield,
  Zap,
} from "lucide-react";

const getFeatures = (t: any) => [
  {
    icon: FileText,
    title: t("features.list.zatca.title"),
    description: t("features.list.zatca.desc"),
    color: "bg-coral/10 text-coral",
  },
  {
    icon: ShoppingCart,
    title: t("features.list.sales.title"),
    description: t("features.list.sales.desc"),
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Package,
    title: t("features.list.inventory.title"),
    description: t("features.list.inventory.desc"),
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Calculator,
    title: t("features.list.accounting.title"),
    description: t("features.list.accounting.desc"),
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Users,
    title: t("features.list.crm.title"),
    description: t("features.list.crm.desc"),
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: BarChart3,
    title: t("features.list.procurement.title"),
    description: t("features.list.procurement.desc"),
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: Shield,
    title: t("features.list.security.title"),
    description: t("features.list.security.desc"),
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: Zap,
    title: t("features.list.implementation.title"),
    description: t("features.list.implementation.desc"),
    color: "bg-sky-50 text-sky-600",
  },
];

export default function FeaturesSection() {
  const { t } = useTranslation();
  const features = getFeatures(t);
  return (
    <section id="features" className="py-24 lg:py-32 bg-background">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-coral/10 text-coral text-xs font-body font-semibold tracking-wide uppercase mb-4">
            {t("features.badge")}
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] text-foreground leading-tight mb-4">
            {t("features.title")}
          </h2>
          <p className="text-muted-foreground font-body text-lg leading-relaxed">
            {t("features.description")}
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group relative bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`w-11 h-11 rounded-lg ${feature.color} flex items-center justify-center mb-4`}
              >
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
