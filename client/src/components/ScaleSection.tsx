/*
 * Design: Fluid Commerce — Soft Corporate Dynamism
 * Scale: Visual upgrade path with gradient background
 */
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

const benefits = [
  "Upgrade anytime, no long-term contracts",
  "Seamless data migration between plans",
  "Dedicated onboarding support",
  "Priority support as you grow",
];

export default function ScaleSection() {
  return (
    <section className="py-20 lg:py-24 bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground leading-tight mb-4">
              Scale Your Business with Confidence
            </h2>
            <p className="text-muted-foreground font-body text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
              Start with Starter and grow into Professional or Enterprise as your business scales.
              Your data moves seamlessly — no re-implementation needed. Pay only for what you use.
            </p>
          </motion.div>

          {/* Visual Path */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-12"
          >
            <div className="px-6 py-3 rounded-xl bg-white border border-border shadow-sm font-display font-semibold text-sm text-foreground">
              Starter
            </div>
            <ArrowRight className="w-5 h-5 text-coral hidden sm:block" />
            <div className="px-6 py-3 rounded-xl bg-navy text-white shadow-lg shadow-navy/20 font-display font-semibold text-sm">
              Professional
            </div>
            <ArrowRight className="w-5 h-5 text-coral hidden sm:block" />
            <div className="px-6 py-3 rounded-xl bg-white border border-border shadow-sm font-display font-semibold text-sm text-foreground">
              Enterprise
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-x-8 gap-y-3"
          >
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm font-body text-foreground/80">
                <CheckCircle className="w-4 h-4 text-coral shrink-0" />
                {b}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
