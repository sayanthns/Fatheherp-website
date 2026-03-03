/*
 * Design: Fluid Commerce — Soft Corporate Dynamism
 * CTA: Navy background, split layout with form
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Mail, MapPin, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CTASection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const adSource = sessionStorage.getItem('ad_source');
      const adCampaign = sessionStorage.getItem('ad_campaign');
      let finalSource = "CTA Demo Form";
      if (adSource) {
        finalSource = `CTA Demo Form via ${adSource}`;
        if (adCampaign) finalSource += ` [${adCampaign}]`;
      }

      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          businessName: formData.businessName,
          phoneNumber: formData.phone,
          source: finalSource,
          location: formData.message
        }),
      });
      toast.success(t("cta.form.success"));
      setFormData({ name: "", businessName: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Failed to submit demo request", error);
      toast.error(t("cta.form.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 lg:py-32 bg-navy overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-20 right-[10%] w-[400px] h-[400px] rounded-full bg-primary/8 blur-[120px]" />
      <div className="absolute bottom-10 left-[5%] w-[300px] h-[300px] rounded-full bg-blue-500/8 blur-[100px]" />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left — Content */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 30 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/25 text-primary-light text-xs font-body font-semibold tracking-wide uppercase mb-6">
              <Calendar className="w-3.5 h-3.5" />
              {t("cta.badge")}
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] text-white leading-tight mb-4">
              {t("cta.title")}
            </h2>
            <p className="text-slate-300 font-body text-lg leading-relaxed mb-10 max-w-md">
              {t("cta.description")}
            </p>

            <div className="space-y-4">
              <a
                href="tel:+966598076007"
                className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors font-body"
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <p className="text-xs text-slate-500 font-body">{t("cta.contact.call")}</p>
                  <p className="text-sm font-medium" dir="ltr">+966 598 076 007</p>
                </div>
              </a>
              <a
                href="mailto:sales@fateherp.com"
                className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors font-body"
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <p className="text-xs text-slate-500 font-body">{t("cta.contact.email")}</p>
                  <p className="text-sm font-medium">sales@fateherp.com</p>
                </div>
              </a>
              <div className="flex items-center gap-3 text-slate-300 font-body">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <p className="text-xs text-slate-500 font-body">{t("cta.contact.location")}</p>
                  <p className="text-sm font-medium">{t("cta.contact.location_val")}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -30 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h3 className="font-display font-bold text-xl text-white mb-2">
                {t("cta.form.title")}
              </h3>
              <p className="text-slate-400 font-body text-sm mb-6">
                {t("cta.form.desc")}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 font-body text-xs mb-1.5 block">
                      {t("cta.form.name")}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={isRTL ? "أحمد الدوسري" : "Ahmed Al-Dosari"}
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-body"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-body text-xs mb-1.5 block">
                      {t("cta.form.company")}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder={isRTL ? "شركتك التجارية" : "Your Trading Co."}
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-body"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 font-body text-xs mb-1.5 block">
                      {t("cta.form.email")}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ahmed@company.com"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-body"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-body text-xs mb-1.5 block">
                      {t("cta.form.phone")}
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+966 5XX XXX XXXX"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-body"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 font-body text-xs mb-1.5 block">
                    {t("cta.form.message_label")}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t("cta.form.message_placeholder")}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none font-body"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-light text-white font-body font-semibold h-11 shadow-lg shadow-primary/30"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <div className="flex items-center gap-2">
                      {t("cta.form.submit")}
                      <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  )}
                </Button>
                <p className="text-slate-500 font-body text-xs text-center">
                  {t("cta.form.footer")}
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
