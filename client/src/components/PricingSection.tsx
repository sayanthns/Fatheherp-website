/*
 * Design: Fluid Commerce — Soft Corporate Dynamism
 * Pricing: Three-tier cards, center card elevated and highlighted
 * Feature comparison table below
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X, ChevronDown, ChevronUp, Star } from "lucide-react";
import { LeadCaptureDialog } from "@/components/LeadCaptureDialog";

const plans = [
  {
    name: "Starter",
    price: "2,499",
    period: "SAR / Business / Year",
    description: "For small traders and single-store businesses getting started with digital operations.",
    popular: false,
    features: [
      "ZATCA Phase 2 E-Invoicing",
      "Core Accounting & VAT",
      "Sales & Quotations",
      "1 Business Entity",
      "Single-Store Inventory",
      "Unlimited Users",
      "15 Support Tickets / Year",
      "Email Support",
    ],
    cta: "Get Started",
  },
  {
    name: "Professional",
    price: "5,999",
    period: "SAR / Business / Year",
    description: "For growing traders with multiple stores, advanced inventory needs, and CRM requirements.",
    popular: true,
    features: [
      "Everything in Starter",
      "Up to 3 Business Branches",
      "Multi-Warehouse Management",
      "Advanced Cost Accounting",
      "CRM & Loyalty Programs",
      "Unlimited Users",
      "40 Support Tickets / Year",
      "Priority Phone & Email Support",
    ],
    cta: "Get Started",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "Tailored Pricing",
    description: "For large trading groups and holding companies needing unlimited power and custom integrations.",
    popular: false,
    features: [
      "Everything in Professional",
      "Unlimited Business Entities",
      "HR & Payroll Modules",
      "Advanced Project Management",
      "Custom Integrations & API",
      "Unlimited Users & Branches",
      "24/7 Dedicated Support",
      "Dedicated Account Manager",
    ],
    cta: "Request Quote",
  },
];

const comparisonCategories = [
  {
    name: "Sales Management",
    features: [
      { name: "E-Invoicing (ZATCA Phase 2)", starter: true, professional: true, enterprise: true },
      { name: "Quotations & Sales Orders", starter: true, professional: true, enterprise: true },
      { name: "Cloud POS", starter: false, professional: true, enterprise: true },
      { name: "Price Lists & Offers", starter: false, professional: true, enterprise: true },
      { name: "Sales Commission", starter: false, professional: true, enterprise: true },
      { name: "Installment Management", starter: false, professional: false, enterprise: true },
    ],
  },
  {
    name: "Inventory & Procurement",
    features: [
      { name: "Single-Store Inventory", starter: true, professional: true, enterprise: true },
      { name: "Multi-Warehouse", starter: false, professional: true, enterprise: true },
      { name: "Batch & Serial Tracking", starter: false, professional: true, enterprise: true },
      { name: "Purchase Orders", starter: true, professional: true, enterprise: true },
      { name: "Supplier Management", starter: true, professional: true, enterprise: true },
      { name: "Automated Reorder Points", starter: false, professional: true, enterprise: true },
    ],
  },
  {
    name: "Finance & Accounting",
    features: [
      { name: "Core Accounting", starter: true, professional: true, enterprise: true },
      { name: "VAT Management", starter: true, professional: true, enterprise: true },
      { name: "Bank Reconciliation", starter: false, professional: true, enterprise: true },
      { name: "Cost Centers", starter: false, professional: true, enterprise: true },
      { name: "Asset Management", starter: false, professional: false, enterprise: true },
      { name: "Group Company Consolidation", starter: false, professional: false, enterprise: true },
    ],
  },
  {
    name: "CRM & Support",
    features: [
      { name: "Customer Database", starter: true, professional: true, enterprise: true },
      { name: "Lead Management", starter: false, professional: true, enterprise: true },
      { name: "Loyalty Points", starter: false, professional: true, enterprise: true },
      { name: "Customer Segmentation", starter: false, professional: false, enterprise: true },
    ],
  },
];

export default function PricingSection() {
  const [showComparison, setShowComparison] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  const handleCTA = (planName: string) => {
    setSelectedPlan(planName);
    setDialogOpen(true);
  };

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-background">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-body font-semibold tracking-wide uppercase mb-4">
            Pricing
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] text-foreground leading-tight mb-4">
            Pricing That Aligns with
            <br />
            Your <span className="text-primary">Success</span>
          </h2>
          <p className="text-muted-foreground font-body text-lg leading-relaxed">
            Transparent, scalable plans designed for trading businesses of every size.
            Start small and grow — no hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-12">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`relative rounded-2xl p-7 flex flex-col ${plan.popular
                ? "bg-navy text-white shadow-2xl shadow-navy/25 scale-[1.03] z-10 border-2 border-primary/30"
                : "bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-primary text-white text-xs font-body font-semibold shadow-lg shadow-primary/30">
                    <Star className="w-3 h-3 fill-current" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`font-display font-bold text-lg mb-1 ${plan.popular ? "text-white" : "text-foreground"
                    }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm font-body ${plan.popular ? "text-slate-300" : "text-muted-foreground"
                    }`}
                >
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`font-mono font-bold text-4xl ${plan.popular ? "text-white" : "text-foreground"
                      }`}
                  >
                    {plan.price}
                  </span>
                </div>
                <span
                  className={`text-sm font-body ${plan.popular ? "text-slate-400" : "text-muted-foreground"
                    }`}
                >
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <Check
                      className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? "text-primary-light" : "text-primary"
                        }`}
                    />
                    <span
                      className={`text-sm font-body ${plan.popular ? "text-slate-200" : "text-foreground/80"
                        }`}
                    >
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full font-body font-semibold h-11 ${plan.popular
                  ? "bg-primary hover:bg-primary-light text-white shadow-lg shadow-primary/30"
                  : "bg-navy hover:bg-navy-light text-white"
                  }`}
                onClick={() => handleCTA(plan.name)}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison Toggle */}
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="w-full flex items-center justify-between px-6 py-4 bg-card border border-border rounded-xl hover:shadow-sm transition-shadow font-body font-medium text-foreground"
          >
            <span>Explore Comprehensive Feature Comparison</span>
            {showComparison ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {showComparison && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-4 font-display font-bold text-foreground w-[40%]">
                        Feature
                      </th>
                      <th className="text-center px-4 py-4 font-display font-bold text-foreground">
                        Starter
                      </th>
                      <th className="text-center px-4 py-4 font-display font-bold text-primary">
                        Professional
                      </th>
                      <th className="text-center px-4 py-4 font-display font-bold text-foreground">
                        Enterprise
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonCategories.map((cat) => (
                      <>
                        <tr key={cat.name} className="bg-slate-50/50">
                          <td
                            colSpan={4}
                            className="px-6 py-3 font-display font-semibold text-foreground text-xs uppercase tracking-wider"
                          >
                            {cat.name}
                          </td>
                        </tr>
                        {cat.features.map((feat) => (
                          <tr
                            key={feat.name}
                            className="border-b border-border/50 hover:bg-slate-50/30 transition-colors"
                          >
                            <td className="px-6 py-3 font-body text-foreground/80">
                              {feat.name}
                            </td>
                            <td className="text-center px-4 py-3">
                              {feat.starter ? (
                                <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                              ) : (
                                <X className="w-4 h-4 text-slate-300 mx-auto" />
                              )}
                            </td>
                            <td className="text-center px-4 py-3">
                              {feat.professional ? (
                                <Check className="w-4 h-4 text-primary mx-auto" />
                              ) : (
                                <X className="w-4 h-4 text-slate-300 mx-auto" />
                              )}
                            </td>
                            <td className="text-center px-4 py-3">
                              {feat.enterprise ? (
                                <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                              ) : (
                                <X className="w-4 h-4 text-slate-300 mx-auto" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <LeadCaptureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={`Get Started with ${selectedPlan}`}
        description="Enter your details below and our team will get your trading business set up immediately."
        source={`${selectedPlan} Plan (Pricing Page)`}
      />
    </section>
  );
}
