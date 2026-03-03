/*
 * Design: Fluid Commerce — Soft Corporate Dynamism
 * Help Banner: Warm CTA banner before footer
 */
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function HelpBanner() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  return (
    <section className="py-20 lg:py-24 bg-slate-50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-card rounded-2xl border border-border shadow-lg overflow-hidden"
        >
          <div className="grid md:grid-cols-[1fr,auto] items-center">
            <div className={`p-8 lg:p-10 ${isRTL ? 'text-right' : ''}`}>
              <h3 className="font-display font-extrabold text-2xl lg:text-3xl text-foreground leading-tight mb-3">
                {t("help_banner.title")}
              </h3>
              <p className="text-muted-foreground font-body text-base leading-relaxed mb-6 max-w-lg">
                {t("help_banner.description")}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  className="bg-primary hover:bg-primary-light text-white font-body font-semibold shadow-lg shadow-primary/20"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/settings");
                      const data = await res.json();
                      if (data.success && data.settings?.calendlyUrl) {
                        window.open(data.settings.calendlyUrl, "_blank");
                      } else {
                        toast.error(t("help_banner.toast_no_link"));
                      }
                    } catch (e) {
                      console.error(e);
                      toast.error(t("help_banner.toast_error"));
                    }
                  }}
                >
                  <Calendar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t("help_banner.btn_appointment")}
                </Button>
                <Button
                  variant="outline"
                  className="font-body font-semibold border-navy/20 text-navy hover:bg-navy/5 bg-transparent"
                  onClick={() => {
                    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <MessageCircle className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t("help_banner.btn_contact")}
                </Button>
              </div>
            </div>
            <div className="hidden md:block w-48 lg:w-56 h-full bg-gradient-to-br from-primary/10 to-navy/10 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
