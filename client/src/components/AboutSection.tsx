/*
 * Design: Fluid Commerce — Soft Corporate Dynamism
 * About: Split layout with image and value propositions
 */
import { motion } from "framer-motion";
import { Target, Lightbulb, Handshake } from "lucide-react";

const TRADING_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663243613237/ZUJaVg8WakRBNHRrCPTKin/fateh-trading-2ZcLVBS5YwcM4T4vX3vc8c.webp";

const values = [
  {
    icon: Target,
    title: "Trading-First Approach",
    description:
      "Every feature is designed with traders in mind. We understand the unique challenges of buying, selling, and managing goods in the Saudi market.",
  },
  {
    icon: Lightbulb,
    title: "Smart Scaling",
    description:
      "Start with what you need and grow at your own pace. Our modular architecture means you only pay for the capabilities your business requires.",
  },
  {
    icon: Handshake,
    title: "Local Expertise",
    description:
      "Our team speaks your language, understands Saudi regulations, and provides support during your business hours. We are your technology partner.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-24 lg:py-32 bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
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
            <div className="absolute -bottom-6 -right-4 lg:-right-8 bg-white rounded-xl shadow-xl border border-border p-5">
              <p className="font-mono font-bold text-2xl text-navy">98%</p>
              <p className="text-muted-foreground font-body text-xs">Customer Satisfaction</p>
            </div>
          </motion.div>

          {/* Right — Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-navy/5 text-navy text-xs font-body font-semibold tracking-wide uppercase mb-4">
              About Fateh ERP
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground leading-tight mb-4">
              The Perfect Solution for
              <br />
              Saudi Traders
            </h2>
            <p className="text-muted-foreground font-body text-base leading-relaxed mb-8">
              Fateh ERP was built from the ground up to address the specific needs of trading
              businesses in Saudi Arabia. We combine enterprise-grade technology with deep local
              expertise to deliver a platform that truly works for you.
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
