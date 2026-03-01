import Navbar from "@/components/Navbar";
import PricingSection from "@/components/PricingSection";
import WhyFatehSection from "@/components/WhyFatehSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-20">
        <PricingSection />
        <WhyFatehSection />
        <CTASection />
      </div>
      <Footer />
    </div>
  );
}
