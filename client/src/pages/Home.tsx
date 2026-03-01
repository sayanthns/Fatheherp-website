import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ModulesSection from "@/components/ModulesSection";
import StatsSection from "@/components/StatsSection";
import PricingSection from "@/components/PricingSection";
import ScaleSection from "@/components/ScaleSection";
import WhyFatehSection from "@/components/WhyFatehSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import AboutSection from "@/components/AboutSection";
import HelpBanner from "@/components/HelpBanner";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ModulesSection />
        <StatsSection />
        <PricingSection />
        <ScaleSection />
        <WhyFatehSection />
        <TestimonialsSection />
        <AboutSection />
        <HelpBanner />
        <CTASection />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
