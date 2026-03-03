/*
 * Design: Fluid Commerce — Soft Corporate Dynamism
 * Modules: Tab-based showcase with images, trading-focused
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  Package,
  ShoppingBag,
  Calculator,
  Users,
  BarChart3,
} from "lucide-react";

const TRADING_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663243613237/ZUJaVg8WakRBNHRrCPTKin/fateh-trading-2ZcLVBS5YwcM4T4vX3vc8c.webp";
const INVENTORY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663243613237/ZUJaVg8WakRBNHRrCPTKin/fateh-inventory-ZogsW3eF9aVCDVzbEHytXf.webp";
const FINANCE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663243613237/ZUJaVg8WakRBNHRrCPTKin/fateh-finance-LNqQqE4MwHSkTLErgGyeZ7.webp";
const DASHBOARD_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663243613237/ZUJaVg8WakRBNHRrCPTKin/fateh-dashboard-TFt7bikrqWFZE8j9swnDzY.webp";

const getModules = (t: any) => [
  {
    id: "sales",
    icon: Receipt,
    label: t("modules.items.sales.label"),
    title: t("modules.items.sales.title"),
    description: t("modules.items.sales.desc"),
    features: t("modules.items.sales.features", { returnObjects: true }) as string[],
    image: TRADING_IMG,
  },
  {
    id: "inventory",
    icon: Package,
    label: t("modules.items.inventory.label"),
    title: t("modules.items.inventory.title"),
    description: t("modules.items.inventory.desc"),
    features: t("modules.items.inventory.features", { returnObjects: true }) as string[],
    image: INVENTORY_IMG,
  },
  {
    id: "procurement",
    icon: ShoppingBag,
    label: t("modules.items.procurement.label"),
    title: t("modules.items.procurement.title"),
    description: t("modules.items.procurement.desc"),
    features: t("modules.items.procurement.features", { returnObjects: true }) as string[],
    image: DASHBOARD_IMG,
  },
  {
    id: "finance",
    icon: Calculator,
    label: t("modules.items.finance.label"),
    title: t("modules.items.finance.title"),
    description: t("modules.items.finance.desc"),
    features: t("modules.items.finance.features", { returnObjects: true }) as string[],
    image: FINANCE_IMG,
  },
  {
    id: "crm",
    icon: Users,
    label: t("modules.items.crm.label"),
    title: t("modules.items.crm.title"),
    description: t("modules.items.crm.desc"),
    features: t("modules.items.crm.features", { returnObjects: true }) as string[],
    image: TRADING_IMG,
  },
  {
    id: "reports",
    icon: BarChart3,
    label: t("modules.items.reports.label"),
    title: t("modules.items.reports.title"),
    description: t("modules.items.reports.desc"),
    features: t("modules.items.reports.features", { returnObjects: true }) as string[],
    image: DASHBOARD_IMG,
  },
];

export default function ModulesSection() {
  const { t, i18n } = useTranslation();
  const modules = getModules(t);
  const [activeModule, setActiveModule] = useState(0);
  const current = modules[activeModule];
  const isRTL = i18n.language === 'ar';

  return (
    <section id="modules" className="py-24 lg:py-32 bg-slate-50">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-navy/5 text-navy text-xs font-body font-semibold tracking-wide uppercase mb-4">
            {t("modules.badge")}
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] text-foreground leading-tight mb-4">
            {t("modules.title")}
          </h2>
          <p className="text-muted-foreground font-body text-lg leading-relaxed">
            {t("modules.description")}
          </p>
        </motion.div>

        {/* Module Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {modules.map((mod, i) => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-body font-medium transition-all duration-200 ${activeModule === i
                  ? "bg-navy text-white shadow-lg shadow-navy/20"
                  : "bg-white text-foreground/70 hover:bg-white hover:text-foreground border border-border hover:shadow-sm"
                }`}
            >
              <mod.icon className="w-4 h-4" />
              {mod.label}
            </button>
          ))}
        </div>

        {/* Module Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: isRTL ? -16 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 16 : -16 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-10 items-center"
          >
            {/* Left — Text */}
            <div>
              <h3 className="font-display font-bold text-2xl lg:text-3xl text-foreground mb-4">
                {current.title}
              </h3>
              <p className="text-muted-foreground font-body text-base leading-relaxed mb-8">
                {current.description}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {current.features.map((feat) => (
                  <div
                    key={feat}
                    className="flex items-center gap-2.5 text-sm font-body text-foreground/80"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-coral shrink-0" />
                    {feat}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Image */}
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-br from-coral/5 to-blue-500/5 rounded-2xl blur-xl" />
              <img
                src={current.image}
                alt={current.title}
                className="relative rounded-xl shadow-xl border border-border w-full"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
