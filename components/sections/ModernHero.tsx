"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";
import { BGPattern } from "@/components/ui/bg-pattern";

// Skeleton loader for hero content
const HeroSkeleton = () => (
  <div className="max-w-5xl mx-auto text-center animate-pulse">
    {/* Badge skeleton */}
    <div className="inline-flex items-center gap-2 px-6 py-3 bg-muted border border-border rounded-none mb-8">
      <div className="w-5 h-5 bg-foreground/10 rounded-none" />
      <div className="w-40 h-4 bg-foreground/5 rounded-none" />
    </div>
    {/* Headline skeleton */}
    <div className="space-y-4 mb-6">
      <div className="h-12 md:h-16 bg-foreground/5 rounded-none mx-auto w-3/4" />
      <div className="h-12 md:h-16 bg-foreground/5 rounded-none mx-auto w-2/3" />
    </div>
    {/* Subheadline skeleton */}
    <div className="space-y-3 mb-12 max-w-3xl mx-auto">
      <div className="h-6 bg-foreground/5 rounded-none mx-auto w-full" />
    </div>
    {/* CTA skeleton */}
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <div className="w-48 h-14 bg-foreground/10 rounded-none border border-border" />
      <div className="w-40 h-14 bg-background rounded-none border border-border" />
    </div>
  </div>
);

export default function ModernHero() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Quick load - show content after a brief moment to ensure smooth transition
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-20">
      {/* Background Pattern */}
      <BGPattern
        variant="dots"
        mask="fade-center"
        size={24}
        fill="rgba(0,0,0,0.05)"
        className="z-0"
        style={{ zIndex: 0 }}
      />

      {/* Subtle accents background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-20 w-72 h-72 bg-foreground/5 rounded-full filter blur-3xl animate-pulse"
        />
        <div
          className="absolute bottom-20 right-20 w-72 h-72 bg-foreground/5 rounded-full filter blur-3xl animate-pulse"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <AnimatePresence mode="wait">
          {!isLoaded ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <HeroSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="max-w-5xl mx-auto text-center"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-muted backdrop-blur-sm border border-border hover:border-foreground transition-all duration-300 mb-10"
              >
                <Brain className="w-4 h-4 text-foreground" weight="bold" />
                <span className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em]">
                  XELORA PROTOCOL • PREDICTIVE INTELLIGENCE
                </span>
                <span className="px-2 py-0.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest ml-2">
                  v1.0
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] uppercase tracking-tighter text-foreground"
              >
                Predict <span className="text-muted-foreground">Momentum.</span>
                <br />
                Engineer <span className="text-muted-foreground">Virality.</span>
              </motion.h1>

              {/* Value Proposition */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-xl md:text-2xl text-foreground font-bold mb-4 max-w-2xl mx-auto uppercase tracking-tighter"
              >
                Deploy AI-Engineered content for your next viral campaign.
              </motion.p>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
              >
                XELORA decodes the psychometric DNA of trending topics to generate high-performance content before the peak.
                <br />
                <span className="text-foreground font-bold">
                  Stop guessing. Start building with data-backed momentum.
                </span>
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
              >
                <Link
                  href="/signup"
                  className="px-12 py-5 bg-foreground text-background font-bold text-lg border-2 border-foreground hover:bg-background hover:text-foreground transition-all duration-200 uppercase tracking-tighter"
                >
                  Join the Beta
                </Link>

                <button
                  onClick={() => {
                    const featuresElement = document.getElementById("features");
                    if (featuresElement) {
                      featuresElement.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="px-12 py-5 bg-background text-foreground font-bold text-lg border-2 border-border hover:border-foreground transition-all duration-200 uppercase tracking-tighter"
                >
                  Explore Strategy
                </button>
              </motion.div>

              {/* Key Features */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground mt-16"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-foreground" weight="duotone" />
                  <span>
                    <strong className="text-foreground">Viral DNA™</strong> decoded
                  </span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-foreground" weight="duotone" />
                  <span>
                    <strong className="text-foreground">Hook + Emotion + Value</strong> analysis
                  </span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-foreground" weight="duotone" />
                  <span>
                    <strong className="text-foreground">Know WHY</strong> before you post
                  </span>
                </div>
              </motion.div>

              {/* Capability Pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-16 flex flex-wrap gap-3 justify-center"
              >
                {[
                  "Viral DNA™ Analysis",
                  "Hook Detection",
                  "Emotion Mapping",
                  "Value Prop Scoring",
                  "Psychometric AI",
                  "Multi-Platform",
                  "Trend Forecasting",
                  "Content Engineering",
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.35 + index * 0.05 }}
                    className="px-4 py-2 bg-muted rounded-none text-sm font-bold text-foreground shadow-sm border border-border hover:border-foreground transition-all duration-200 cursor-default uppercase tracking-wide"
                  >
                    {feature}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-12 bg-border relative cursor-pointer group"
          onClick={() => {
            const features = document.getElementById("features");
            if (features) {
              features.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground scale-0 group-hover:scale-100 transition-transform" />
        </motion.div>
      </motion.div>
    </section>
  );
}
