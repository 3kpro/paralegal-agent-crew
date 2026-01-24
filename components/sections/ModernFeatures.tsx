"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    label: "TREND PREDICTION",
    title: "See what's next before anyone else",
    description:
      "Our AI monitors millions of signals across social platforms, news, and forums. It identifies patterns that precede viral moments—giving you a 24-48 hour head start.",
    highlights: [
      "Real-time signal analysis",
      "Cross-platform pattern detection",
      "Momentum scoring algorithm",
    ],
    visual: (
      <div className="relative h-64 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl overflow-hidden">
        <div className="absolute inset-4 space-y-3">
          {[
            { width: "85%", label: "AI Tools", score: "Rising Fast", color: "bg-violet-500" },
            { width: "72%", label: "Remote Work", score: "Peaking", color: "bg-fuchsia-500" },
            { width: "45%", label: "Web3 Gaming", score: "Emerging", color: "bg-pink-400" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-800">{item.label}</span>
                <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
                  {item.score}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${item.color} rounded-full`} style={{ width: item.width }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    label: "AI CONTENT",
    title: "Generate content that captures attention",
    description:
      "Turn trending topics into platform-perfect content. Our AI writes hooks, posts, and threads optimized for each platform's algorithm and audience expectations.",
    highlights: [
      "Platform-specific optimization",
      "Hook and headline generation",
      "Tone and style matching",
    ],
    visual: (
      <div className="relative h-64 bg-gradient-to-br from-fuchsia-50 to-pink-50 rounded-2xl overflow-hidden p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full flex flex-col">
          <div className="flex gap-2 mb-3">
            {["Twitter", "LinkedIn", "Threads"].map((p) => (
              <span key={p} className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {p}
              </span>
            ))}
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-800 rounded w-3/4" />
            <div className="h-3 bg-gray-300 rounded w-full" />
            <div className="h-3 bg-gray-300 rounded w-5/6" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
          <div className="flex gap-2 mt-4">
            <div className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg">
              Copy
            </div>
            <div className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
              Regenerate
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: "VIRAL SCORING",
    title: "Know your content's potential before you post",
    description:
      "Every piece of content gets a viral potential score based on hook strength, emotional resonance, and timing. Stop guessing—start knowing.",
    highlights: [
      "Hook effectiveness analysis",
      "Emotional trigger detection",
      "Optimal timing suggestions",
    ],
    visual: (
      <div className="relative h-64 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl overflow-hidden p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" fill="none" stroke="#f3f4f6" strokeWidth="12" />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${0.87 * 352} ${352}`}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">87</span>
            </div>
          </div>
          <span className="text-sm font-semibold text-emerald-600">High viral potential</span>
        </div>
      </div>
    ),
  },
];

export default function ModernFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-32 bg-white" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-sm font-semibold text-violet-600 tracking-wider uppercase mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The unfair advantage for creators
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stop chasing trends. Start predicting them. XELORA gives you the tools
            to be first, not fast.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="space-y-32">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <span className="inline-block text-xs font-bold text-violet-600 tracking-wider uppercase mb-4 bg-violet-50 px-3 py-1 rounded-full">
                  {feature.label}
                </span>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-3 text-gray-700">
                      <span className="w-5 h-5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                {feature.visual}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-32"
        >
          <a
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:bg-gray-800 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Start predicting trends
            <span className="ml-1">→</span>
          </a>
          <p className="text-sm text-gray-500 mt-4">
            Free to start. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
