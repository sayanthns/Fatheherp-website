/*
 * Design: Fluid Commerce — Soft Corporate Dynamism
 * Pricing: Three-tier cards, center card elevated and highlighted
 * Feature comparison table below
 */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X, ChevronDown, ChevronUp, Star } from "lucide-react";
import { LeadCaptureDialog } from "@/components/LeadCaptureDialog";

export default function PricingSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [showComparison, setShowComparison] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [dialogType, setDialogType] = useState<"trial" | "demo">("trial"); // Added dialogType state
  const [pricing, setPricing] = useState<any>(null);

  useEffect(() => {
    fetch("/api/pricing")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.pricing) {
          setPricing(data.pricing);
        }
      })
      .catch(console.error);
  }, []);

  const handleCTA = (planName: string, planIdx: number) => {
    setSelectedPlan(planName);
    setDialogType(planIdx === 2 ? "demo" : "trial"); // Assuming the 3rd plan (index 2) is Enterprise/Demo
    setDialogOpen(true);
  };

  if (!pricing) {
    return (
      <section id="pricing" className="py-24 lg:py-32 bg-background flex justify-center min-h-[50vh]">
        <div className="animate-pulse space-y-8 flex flex-col items-center w-full max-w-5xl px-6">
          <div className="h-8 w-64 bg-slate-200 rounded mb-16 mt-8"></div>
          <div className="grid md:grid-cols-3 gap-6 w-full">
            <div className="bg-slate-100 rounded-2xl h-[28rem]"></div>
            <div className="bg-slate-200 rounded-2xl h-[30rem] -mt-4 shadow-xl"></div>
            <div className="bg-slate-100 rounded-2xl h-[28rem]"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className={`py-24 lg:py-32 bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
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
            {t("nav.pricing")}
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] text-foreground leading-tight mb-4">
            {t("pricing.title")}
            <span className="text-primary">{t("pricing.title_highlight")}</span>
          </h2>
          <p className="text-muted-foreground font-body text-lg leading-relaxed">
            {t("pricing.description")}
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-12">
          {(pricing?.plans || []).map((plan: any, i: number) => (
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
                    {t("pricing.most_popular")}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`font-display font-bold text-lg mb-1 ${plan.popular ? "text-white" : "text-foreground"
                    }`}
                >
                  {isRTL ? plan.name_ar : plan.name}
                </h3>
                <p
                  className={`text-sm font-body ${plan.popular ? "text-slate-300" : "text-muted-foreground"
                    }`}
                >
                  {isRTL ? plan.description_ar : plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`font-mono font-bold text-4xl ${plan.popular ? "text-white" : "text-foreground"
                      }`}
                  >
                    {isRTL ? plan.price_ar : plan.price}
                  </span>
                </div>
                <span
                  className={`text-sm font-body ${plan.popular ? "text-slate-400" : "text-muted-foreground"
                    }`}
                >
                  {isRTL ? plan.period_ar : plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {(isRTL ? (plan.features_ar || []) : (plan.features || [])).map((feat: string) => (
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
                onClick={() => handleCTA(isRTL ? plan.name_ar : plan.name, i)}
              >
                {isRTL ? plan.cta_ar : plan.cta}
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
            <span>{t("pricing.comparison_toggle")}</span>
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
                        {t("pricing.comparison_feature")}
                      </th>
                      <th className="text-center px-4 py-4 font-display font-bold text-foreground">
                        {isRTL ? 'المبتدئ' : 'Starter'}
                      </th>
                      <th className="text-center px-4 py-4 font-display font-bold text-primary">
                        {isRTL ? 'المحترف' : 'Professional'}
                      </th>
                      <th className="text-center px-4 py-4 font-display font-bold text-foreground">
                        {isRTL ? 'المؤسسات' : 'Enterprise'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(pricing?.comparisonCategories || []).map((cat: any) => (
                      <>
                        <tr key={cat.name} className="bg-slate-50/50">
                          <td
                            colSpan={4}
                            className="px-6 py-3 font-display font-semibold text-foreground text-xs uppercase tracking-wider"
                          >
                            {isRTL ? (cat.name_ar || cat.name) : cat.name}
                          </td>
                        </tr>
                        {(cat.features || []).map((feat: any) => (
                          <tr
                            key={feat.name}
                            className="border-b border-border/50 hover:bg-slate-50/30 transition-colors"
                          >
                            <td className="px-6 py-3 font-body text-foreground/80">
                              {isRTL ? feat.name_ar : feat.name}
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
        title={dialogType === "trial" ? t("dialog.trial_title") : t("dialog.demo_title")}
        description={dialogType === "trial"
          ? t("dialog.trial_desc")
          : t("dialog.demo_desc")
        }
        source={dialogType === "trial" ? `Pricing (Free Trial) [${i18n.language}]` : `Pricing (Demo) [${i18n.language}]`}
      />
    </section>
  );
}
