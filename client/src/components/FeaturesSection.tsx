/*
 * Design: Fluid Commerce — Soft Corporate Dynamism
 * Features: Staggered two-column layout with icon cards
 * Warm slate backgrounds, soft shadows, coral accents
 */
import { motion } from "framer-motion";
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

const features = [
  {
    icon: FileText,
    title: "ZATCA E-Invoicing",
    description:
      "Fully compliant with ZATCA Phase 2 requirements. Generate, validate, and submit e-invoices automatically — no manual configuration needed.",
    color: "bg-coral/10 text-coral",
  },
  {
    icon: ShoppingCart,
    title: "Sales & POS",
    description:
      "Manage quotations, sales orders, and invoices seamlessly. Built-in POS for retail operations with real-time inventory sync.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Package,
    title: "Inventory Management",
    description:
      "Track stock across multiple warehouses in real time. Automated reorder points, batch tracking, and comprehensive stocktaking tools.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Calculator,
    title: "Financial Accounting",
    description:
      "Complete double-entry accounting with VAT management. Automated journal entries, bank reconciliation, and financial reporting.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Users,
    title: "CRM & Customer Management",
    description:
      "Track leads, manage customer relationships, and run loyalty programs. Integrated communication history for every client.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: BarChart3,
    title: "Procurement & Purchasing",
    description:
      "Streamline supplier management, purchase orders, and requisitions. Compare quotes and track deliveries from a single dashboard.",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: Shield,
    title: "Data Security & Compliance",
    description:
      "Enterprise-grade security with role-based access control, audit trails, and full compliance with Saudi data protection regulations.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: Zap,
    title: "Fast Implementation",
    description:
      "Go live in 2-4 weeks with our guided onboarding. Dedicated implementation team handles data migration and user training.",
    color: "bg-sky-50 text-sky-600",
  },
];

export default function FeaturesSection() {
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
            Why Fateh ERP
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] text-foreground leading-tight mb-4">
            Everything Your Trading
            <br />
            Business Needs
          </h2>
          <p className="text-muted-foreground font-body text-lg leading-relaxed">
            Purpose-built for Saudi trading companies. From e-invoicing to multi-warehouse inventory,
            every feature is designed to simplify your operations.
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
