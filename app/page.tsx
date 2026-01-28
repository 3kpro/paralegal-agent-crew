"use client";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import ModernHero from "@/components/sections/ModernHero";
import ModernFeatures from "@/components/sections/ModernFeatures";
import { StatsSection } from "@/components/sections/StatsSection";
import { PricingSection } from "@/components/landing/pricing-section";
import FAQSection from "@/components/sections/FAQSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <main className="flex-1">
        <ModernHero />
        <ModernFeatures />
        <StatsSection />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
