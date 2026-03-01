/*
 * Design: Fluid Commerce — Soft Corporate Dynamism
 * Help Banner: Warm CTA banner before footer
 */
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function HelpBanner() {
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
            <div className="p-8 lg:p-10">
              <h3 className="font-display font-extrabold text-2xl lg:text-3xl text-foreground leading-tight mb-3">
                Help Is Just One Tap Away
              </h3>
              <p className="text-muted-foreground font-body text-base leading-relaxed mb-6 max-w-lg">
                At Fateh ERP, we reach out to trading businesses at periodic intervals, offering
                assistance on a no-obligation basis. Book an appointment for an exploratory call
                with our subject matter expert.
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
                        toast.error("Calendly schedule link not configured yet.");
                      }
                    } catch (e) {
                      console.error(e);
                      toast.error("Failed to connect to server.");
                    }
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule an Appointment
                </Button>
                <Button
                  variant="outline"
                  className="font-body font-semibold border-navy/20 text-navy hover:bg-navy/5 bg-transparent"
                  onClick={() => {
                    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Us
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
