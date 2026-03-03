/*
 * Design: Fluid Commerce — Soft Corporate Dynamism
 * Stats: Navy background with animated counters and trust metrics
 */
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const getStats = (t: any) => [
  { value: 200, suffix: "+", label: t("stats.items.businesses") },
  { value: 25, suffix: "K+", label: t("stats.items.licenses") },
  { value: 12, suffix: "+", label: t("stats.items.industries") },
  { value: 5, suffix: "+", label: t("stats.items.countries") },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref} className="font-mono font-bold text-4xl lg:text-5xl text-white">
      {count}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const { t } = useTranslation();
  const stats = getStats(t);
  return (
    <section className="relative py-20 lg:py-24 bg-navy overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-0 left-[20%] w-[300px] h-[300px] rounded-full bg-coral/8 blur-[100px]" />
      <div className="absolute bottom-0 right-[15%] w-[250px] h-[250px] rounded-full bg-blue-500/8 blur-[80px]" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white leading-tight mb-3">
            {t("stats.title")}
          </h2>
          <p className="text-slate-400 font-body text-lg">
            {t("stats.description")}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <p className="text-slate-400 font-body text-sm mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
