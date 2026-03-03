/*
 * Design: Fluid Commerce — Soft Corporate Dynamism
 * Testimonials: Card-based with subtle glass effect
 */
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

import { useState, useEffect, useRef } from "react";

interface Testimonial {
  id: string;
  quote: string;
  quote_ar: string;
  name: string;
  name_ar: string;
  role: string;
  role_ar: string;
  company: string;
  company_ar: string;
  rating: number;
}

export default function TestimonialsSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/testimonials")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTestimonials(data.testimonials);
        }
      })
      .catch(err => console.error("Error fetching testimonials", err));
  }, []);

  if (testimonials.length === 0) return null; // Don't render section if empty

  return (
    <section className="py-24 lg:py-32 bg-slate-50 overflow-hidden">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-coral/10 text-coral text-xs font-body font-semibold tracking-wide uppercase mb-4">
            {t("testimonials.badge")}
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] text-foreground leading-tight mb-4">
            {t("testimonials.title")}
          </h2>
          <p className="text-muted-foreground font-body text-lg leading-relaxed">
            {t("testimonials.description")}
          </p>
        </motion.div>

        {/* Horizontal Scrolling Wrapper */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {(testimonials || []).map((t, i) => (
              <motion.div
                key={t.id || i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-7 flex flex-col hover:shadow-lg hover:shadow-slate-200/50 transition-shadow min-w-[320px] max-w-[400px] snap-center shrink-0"
              >
                <Quote className="w-8 h-8 text-coral/20 mb-4" />

                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <p className="text-foreground/80 font-body text-sm leading-relaxed flex-1 mb-6 italic">
                  "{isRTL ? (t.quote_ar || t.quote) : t.quote}"
                </p>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center shrink-0 top-0">
                      <span className="text-white font-display font-bold text-sm">
                        {t.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-display font-semibold text-sm text-foreground">
                        {isRTL ? (t.name_ar || t.name) : t.name}
                      </p>
                      <p className="text-muted-foreground font-body text-xs">
                        {isRTL ? (t.role_ar || t.role) : t.role}, {isRTL ? (t.company_ar || t.company) : t.company}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Scroll Indication Fade */}
          <div className={`absolute ${isRTL ? 'left-0 bg-gradient-to-r' : 'right-0 bg-gradient-to-l'} top-0 bottom-0 w-16 from-slate-50 to-transparent pointer-events-none`} />
          <div className={`absolute ${isRTL ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'} top-0 bottom-0 w-16 from-slate-50 to-transparent pointer-events-none`} />
        </div>
      </div>
    </section>
  );
}
