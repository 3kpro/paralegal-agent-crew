"use client";

// Force rebuild - XELORA Landing Page
import {
  ModernHero,
  ModernFeatures,
  DemoVideoSection,
  TestimonialsSection,
  ModernPricing,
  FAQSection,
  WaitlistSection,
} from "../components/sections";
import { Navigation, Footer, ContactSection } from "../components";

export default function HomePage() {
  const handleContactClick = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation onContactClick={handleContactClick} />

      <ModernHero />

      <DemoVideoSection />

      <ModernFeatures />

      <TestimonialsSection />

      <ModernPricing />

      <FAQSection />

      <WaitlistSection />

      <ContactSection />

      <Footer />
    </div>
  );
}
