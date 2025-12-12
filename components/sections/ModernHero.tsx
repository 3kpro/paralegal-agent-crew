"use client";

import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ModernHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#2b2b2b] pt-20">
      {/* Minimal cyan accents background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-[#00C7F2]/5 rounded-full filter blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-72 h-72 bg-coral-500/5 rounded-full filter blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a2030] backdrop-blur-sm rounded-full shadow-lg mb-8 border-2 border-[#00C7F2]/30 hover:border-[#00C7F2]/60 transition-all duration-300"
          >
            <Zap className="w-5 h-5 text-[#00C7F2]" />
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
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight uppercase tracking-tight"
          >
            <span className="bg-gradient-to-r from-white via-coral-400 to-tron-cyan bg-clip-text text-transparent">
              Predict Momentum
            </span>
            <br />
            <span className="text-[#F5F7FA]">Engineer Virality</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
          >
            XELORA analyzes emerging signals across platforms to reveal what&apos;s about to rise.
            <br />
            <span className="text-[#00C7F2] font-semibold">
              Before creators see it. Before the internet reacts to it.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <div className="relative">
              <Link
                href="/signup"
                className="group relative px-8 py-4 bg-coral-500 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:bg-coral-600 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 uppercase tracking-wide"
              >
                <Zap className="w-5 h-5" />
                Get Early Access
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400 mt-16"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#00C7F2]" />
              <span>
                <strong className="text-[#F5F7FA]">Real-time</strong> signal analysis
              </span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-[#00C7F2]/30" />
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#A17CF9]" />
              <span>
                <strong className="text-[#F5F7FA]">Predictive</strong> momentum detection
              </span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-[#00C7F2]/30" />
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#00C7F2]" />
              <span>
                <strong className="text-[#F5F7FA]">6+ platforms</strong> engineered
              </span>
            </div>
          </motion.div>

          {/* Capability Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 flex flex-wrap gap-3 justify-center"
          >
            {[
              "Signal Tracking",
              "Momentum Prediction",
              "Multi-Platform Engineering",
              "Real-Time Analysis",
              "Trend Forecasting",
              "Content Optimization",
              "Virality Prediction",
              "Audience Intelligence",
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                className="px-4 py-2 bg-[#00C7F2]/10 rounded-full text-sm font-medium text-[#00C7F2] shadow-sm border border-[#00C7F2]/30 hover:border-[#00C7F2]/60 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default uppercase tracking-wide"
              >
                {feature}
              </motion.div>
            ))}
          </motion.div>
        </div>
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
          className="w-6 h-10 border-2 border-[#00C7F2]/60 rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-[#00C7F2] rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
