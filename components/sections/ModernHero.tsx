"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ModernHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#fafafa]">
      {/* Subtle gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-violet-200/40 via-fuchsia-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-sky-200/40 via-cyan-200/30 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Announcement badge */}
          {mounted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white rounded-full shadow-sm border border-gray-200/80"
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">
                Now in Public Beta
              </span>
              <span className="text-gray-300">|</span>
              <Link href="/signup" className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors">
                Get early access →
              </Link>
            </motion.div>
          )}

          {/* Main headline */}
          {mounted && (
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6"
            >
              Know what goes viral
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                before it happens
              </span>
            </motion.h1>
          )}

          {/* Subheadline */}
          {mounted && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              XELORA predicts trending content before it peaks. Create campaigns
              that capture momentum at the perfect moment.
            </motion.p>
          )}

          {/* CTA buttons */}
          {mounted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Link
                href="/signup"
                className="group px-8 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:bg-gray-800 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Start for free
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <button
                onClick={() => {
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-4 text-gray-700 font-semibold text-lg hover:text-gray-900 transition-colors"
              >
                See how it works
              </button>
            </motion.div>
          )}

          {/* Social proof */}
          {mounted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex -space-x-3">
                {[
                  "bg-gradient-to-br from-violet-400 to-violet-600",
                  "bg-gradient-to-br from-fuchsia-400 to-fuchsia-600",
                  "bg-gradient-to-br from-pink-400 to-pink-600",
                  "bg-gradient-to-br from-sky-400 to-sky-600",
                  "bg-gradient-to-br from-emerald-400 to-emerald-600",
                ].map((gradient, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full ${gradient} border-2 border-white shadow-sm`}
                  />
                ))}
                <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-xs font-semibold text-gray-600">
                  +50
                </div>
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-700">50+ creators</span> are already predicting trends
              </p>
            </motion.div>
          )}
        </div>

        {/* Feature highlights */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-24 max-w-5xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Predict",
                  description: "AI analyzes signals across platforms to identify emerging trends before they peak",
                  accent: "from-violet-500 to-fuchsia-500"
                },
                {
                  title: "Create",
                  description: "Generate platform-optimized content in seconds with trend-aware AI writing",
                  accent: "from-fuchsia-500 to-pink-500"
                },
                {
                  title: "Capture",
                  description: "Schedule campaigns at the perfect moment to ride the wave of momentum",
                  accent: "from-pink-500 to-rose-500"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  className="group p-8 bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all duration-300"
                >
                  <div className={`w-12 h-1 bg-gradient-to-r ${feature.accent} rounded-full mb-6`} />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
