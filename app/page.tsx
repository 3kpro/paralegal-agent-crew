"use client";

import {
  ModernHero,
  ModernFeatures,
  ModernPricing,
  StatsSection,
  FAQSection,
} from "../components/sections";
import { Navigation, Footer, ContactSection } from "../components";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navigation />

      <ModernHero />

      <StatsSection />

      <ModernFeatures />

      <ModernPricing />

      <FAQSection />

      <ContactSection />

      <Footer />
    </div>
  );
}
