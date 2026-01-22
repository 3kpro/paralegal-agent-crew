"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightning as Zap, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";
import { BGPattern } from "@/components/ui/bg-pattern";

// Skeleton loader for hero content
const HeroSkeleton = () => (
  <div className="max-w-5xl mx-auto text-center animate-pulse">
    {/* Badge skeleton */}
    <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a2030]/50 rounded-full mb-8">
      <div className="w-5 h-5 bg-[#00C7F2]/20 rounded-full" />
      <div className="w-40 h-4 bg-white/10 rounded" />
      <div className="w-12 h-5 bg-coral-500/20 rounded-full" />
    </div>
    {/* Headline skeleton */}
    <div className="space-y-4 mb-6">
      <div className="h-12 md:h-16 bg-white/5 rounded-lg mx-auto w-3/4" />
      <div className="h-12 md:h-16 bg-white/5 rounded-lg mx-auto w-2/3" />
    </div>
    {/* Subheadline skeleton */}
    <div className="space-y-3 mb-12 max-w-3xl mx-auto">
      <div className="h-6 bg-white/5 rounded mx-auto w-full" />
      <div className="h-6 bg-[#00C7F2]/10 rounded mx-auto w-4/5" />
    </div>
    {/* CTA skeleton */}
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <div className="w-48 h-14 bg-coral-500/20 rounded-xl" />
      <div className="w-40 h-14 bg-white/5 rounded-xl border border-[#00C7F2]/20" />
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] pt-20">
      {/* Background Pattern: z-0 to sit above background color but below content */}
      <BGPattern
        variant="dots"
        mask="fade-center"
        size={24}
        fill="rgba(255,255,255,0.2)"
        className="z-0"
        style={{ zIndex: 0 }}
      />

      {/* Minimal cyan accents background - render immediately */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-20 w-72 h-72 bg-[#00C7F2]/5 rounded-full filter blur-3xl animate-pulse"
        />
        <div
          className="absolute top-40 right-20 w-72 h-72 bg-coral-500/5 rounded-full filter blur-3xl animate-pulse"
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a2030] backdrop-blur-sm rounded-full shadow-lg mb-8 border-2 border-[#00C7F2]/30 hover:border-[#00C7F2]/60 transition-all duration-300"
              >
                <Zap className="w-5 h-5 text-[#00C7F2]" weight="duotone" />
                <span className="text-sm font-semibold text-[#F5F7FA] uppercase tracking-wide">
                  XELORA • Predictive Intelligence
                </span>
                <span className="px-2 py-1 bg-coral-500/20 rounded-full text-xs font-semibold text-coral-500 border border-coral-500/30 uppercase">
                  Live
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight uppercase tracking-tight"
              >
                <span className="bg-gradient-to-r from-white via-coral-400 to-tron-cyan bg-clip-text text-transparent">
                  Predict Momentum
                </span>
                <br />
                <span className="text-[#F5F7FA]">Engineer Virality</span>
              </motion.h1>

              {/* Value Proposition - Clearer subheading */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg md:text-xl text-coral-400 font-semibold mb-4 max-w-2xl mx-auto"
              >
                AI-powered content creation that predicts viral trends before they peak
              </motion.p>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
              >
                XELORA analyzes emerging signals across platforms to reveal what&apos;s about to rise.
                <br />
                <span className="text-[#00C7F2]">
                  Before creators see it. Before the internet reacts to it.
                </span>
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
              >
                <div className="relative">
                  <Link
                    href="/signup"
                    className="group relative px-8 py-4 bg-coral-500 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:bg-coral-600 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 uppercase tracking-wide"
                  >
                    <Zap className="w-5 h-5" weight="duotone" />
                    Get Early Access
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" weight="duotone" />
                  </Link>
                </div>

                <button
                  onClick={() => {
                    const featuresElement = document.getElementById("features");
                    if (featuresElement) {
                      featuresElement.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="px-8 py-4 bg-transparent text-[#F5F7FA] rounded-xl font-semibold text-lg border-2 border-[#00C7F2]/50 hover:bg-[#00C7F2]/10 hover:border-[#00C7F2] transform hover:scale-105 transition-all duration-200 uppercase tracking-wide"
                >
                  Explore Features
                </button>
              </motion.div>

              {/* Key Features */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400 mt-16"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#00C7F2]" weight="duotone" />
                  <span>
                    <strong className="text-[#F5F7FA]">Viral DNA™</strong> decoded
                  </span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-[#00C7F2]/30" />
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#A17CF9]" weight="duotone" />
                  <span>
                    <strong className="text-[#F5F7FA]">Hook + Emotion + Value</strong> analysis
                  </span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-[#00C7F2]/30" />
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#00C7F2]" weight="duotone" />
                  <span>
                    <strong className="text-[#F5F7FA]">Know WHY</strong> before you post
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
                    className="px-4 py-2 bg-[#00C7F2]/10 rounded-full text-sm font-medium text-[#00C7F2] shadow-sm border border-[#00C7F2]/30 hover:border-[#00C7F2]/60 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default uppercase tracking-wide"
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
          className="w-6 h-10 border-2 border-[#00C7F2]/60 rounded-full flex items-start justify-center p-2 cursor-pointer hover:border-[#00C7F2] transition-colors"
          onClick={() => {
            const features = document.getElementById("features");
            if (features) {
              features.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <div className="w-1 h-2 bg-[#00C7F2] rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
