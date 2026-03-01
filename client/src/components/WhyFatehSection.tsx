/*
 * Design: Fluid Commerce — Soft Corporate Dynamism
 * WhyFateh: Value proposition section between pricing and testimonials
 */
import { motion } from "framer-motion";
import { TrendingUp, Settings, Eye, Headphones } from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "Scale Efficiently",
    description:
      "Start with the Starter plan and grow into Professional or Enterprise as your trading volume increases. Your data migrates seamlessly — no re-implementation needed.",
  },
  {
    icon: Settings,
    title: "Tailored for Trading",
    description:
      "Unlike generic ERPs, every module in Fateh is optimized for trading workflows — from goods procurement to multi-store sales and ZATCA-compliant invoicing.",
  },
  {
    icon: Eye,
    title: "Transparent Costs",
    description:
      "No hidden fees, no surprise charges. Our per-user pricing is straightforward, and you can upgrade or downgrade at any time without penalties.",
  },
  {
    icon: Headphones,
    title: "Continuous Support",
    description:
      "Our Saudi-based support team understands your business. From onboarding to ongoing optimization, we are with you every step of the way.",
  },
];

export default function WhyFatehSection() {
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
            Why Fateh ERP
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] text-foreground leading-tight mb-4">
            Why Fateh ERP Works
            <br />
            for <span className="text-coral">Your Business</span>
          </h2>
          <p className="text-muted-foreground font-body text-lg leading-relaxed">
            Scale efficiently, customize your plan, and benefit from transparent costs.
            Elevate your trading operations with continuous support and cutting-edge updates.
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
