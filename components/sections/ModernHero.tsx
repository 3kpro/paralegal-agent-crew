"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ModernHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#2b2b2b] pt-20">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-coral-500/10 rounded-full filter blur-3xl"
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
          {/* Beta Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#343a40] backdrop-blur-sm rounded-full shadow-lg mb-8 border-2 border-gray-700/50 hover:border-coral-500/50 transition-all duration-300"
          >
            <Sparkles className="w-5 h-5 text-coral-500" />
            <span className="text-sm font-semibold text-gray-100">
              🚀 TrendPulse™ Public Beta • Join 1000+ Creators
            </span>
            <span className="px-2 py-1 bg-coral-500/20 rounded-full text-xs font-semibold text-coral-400 border border-coral-500/30">
              LIVE
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-gray-100 via-white to-gray-100 bg-clip-text text-transparent">
              Predict What Goes Viral
            </span>
            <br />
            <span className="text-white">Before You Create</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            <span className="font-semibold text-white">TrendPulse™</span> with{" "}
            <span className="font-semibold text-coral-400">Viral Score™</span>{" "}
            predicts content performance before you publish.
            <span className="font-semibold text-white">
              {" "}
              Discover trending topics, get AI-powered viral predictions, and publish
              across 6+ platforms
            </span>
            <span className="font-bold text-coral-400">
              {" "}
              — know what will perform before you post
            </span>
            .
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
                href="/trend-gen"
                className="group relative px-8 py-4 bg-coral-500 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:bg-coral-600 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Join TrendPulse™ Beta
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <button className="px-8 py-4 bg-transparent text-gray-300 rounded-xl font-semibold text-lg border-2 border-gray-700/70 hover:bg-gray-700/30 hover:border-coral-500/50 transform hover:scale-105 transition-all duration-200">
              ⭐ Beta Features Overview
            </button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-coral-500" />
              <span>
                <strong className="text-white">2,500+</strong> beta creators
              </span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-700" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-coral-500" />
              <span>
                <strong className="text-gray-900">98%</strong> satisfaction rate
              </span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-300" />
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-coral-500" />
              <span>
                <strong className="text-gray-900">24hr</strong> avg response time
              </span>
            </div>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 flex flex-wrap gap-3 justify-center"
          >
            {[
              "🎯 Viral Score™ Predictions",
              "🧠 Intelligent Content Workflows",
              "🚀 6-Platform Auto-Publishing",
              "⚡ 10x Faster Content Pipeline",
              "🔒 Enterprise-Grade Security",
              "🎨 Brand Voice Intelligence",
              "📊 Real-Time Performance Tracking",
              "🔄 Predictive Trend Discovery",
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm border border-gray-200 hover:border-coral-300 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default"
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
          className="w-6 h-10 border-2 border-coral-400 rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-coral-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
