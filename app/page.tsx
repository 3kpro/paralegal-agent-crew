"use client";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/landing/hero-section";
import { BentoGrid } from "@/components/landing/bento-grid";
import { PricingSection } from "@/components/landing/pricing-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <main className="flex-1">
        <HeroSection />
        <BentoGrid />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
