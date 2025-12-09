"use client";

import { motion } from "framer-motion";
import { Star, Quote, Twitter, Linkedin, MessageSquare } from "lucide-react";

const features = [
  {
    name: "XELORA™",
    role: "Real-Time Trend Detection",
    image: "TP",
    content:
      "Discover emerging trends across social platforms before they peak. Advanced AI algorithms analyze millions of data points to identify viral opportunities.",
    status: "available" as const,
    platform: "twitter",
    feature: "3-7 days early trend detection",
  },
  {
    name: "AI Studio™",
    role: "Multi-Model Content Creation",
    image: "AS",
    content:
      "Discover trending topics with AI-powered analysis. Full multi-model content generation with 8+ AI providers coming soon.",
    status: "beta" as const,
    platform: "linkedin",
    feature: "Trend discovery available",
  },
  {
    name: "Media Generator™",
    role: "AI-Powered Visuals",
    image: "MG",
    content:
      "Transform text into engaging visuals instantly. Our AI creates platform-optimized images, graphics, and video thumbnails that capture attention.",
    status: "coming-soon" as const,
    platform: "twitter",
    feature: "Visual AI in development",
  },
  {
    name: "Analytics Hub™",
    role: "Predictive Analytics",
    image: "AH",
    content:
      "Predict content performance before publishing. Our ML models analyze engagement patterns to optimize your content strategy for maximum impact.",
    status: "coming-soon" as const,
    platform: "email",
    feature: "ML models in training",
  },
  {
    name: "ContentFlow™",
    role: "Smart Automation",
    image: "CF",
    content:
      "Streamline your content workflow with intelligent automation. Schedule, adapt, and publish content across multiple platforms with perfect consistency.",
    status: "coming-soon" as const,
    platform: "linkedin",
    feature: "Platform integration pending",
  },
  {
    name: "Brand Voice™",
    role: "AI Style Adaptation",
    image: "BV",
    content:
      "Maintain consistent brand voice across all channels. Our AI learns your unique style and ensures every piece of content sounds authentically you.",
    status: "coming-soon" as const,
    platform: "email",
    feature: "AI training pipeline ready",
  },
];

const platformIcons = {
  twitter: Twitter,
  linkedin: Linkedin,
  email: MessageSquare,
};

export default function FeatureShowcase() {
  return (
    <section id="testimonials" className="py-24 bg-tron-dark">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-tron-cyan to-tron-magenta rounded-full mb-6 shadow-lg">
              <Star className="w-4 h-4 text-white" fill="currentColor" />
              <span className="text-sm font-bold text-white">
                Powered by Advanced AI Technology
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-tron-text mb-6">
              Next-Generation
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Content Creation Platform
              </span>
            </h2>

            <p className="text-xl text-tron-text-muted max-w-3xl mx-auto">
              Experience the power of multi-model AI, real-time trend detection, and
              intelligent automation working together seamlessly.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const PlatformIcon =
                platformIcons[
                  feature.platform as keyof typeof platformIcons
                ];

              const statusConfig = {
                available: {
                  label: "✓ Available Now",
                  bgColor: "bg-green-500/10",
                  borderColor: "border-green-500/30",
                  textColor: "text-green-400",
                  dotColor: "bg-green-500"
                },
                beta: {
                  label: "Beta Access",
                  bgColor: "bg-blue-500/10",
                  borderColor: "border-blue-500/30",
                  textColor: "text-blue-400",
                  dotColor: "bg-blue-500"
                },
                "coming-soon": {
                  label: "Coming Soon",
                  bgColor: "bg-gray-700/30",
                  borderColor: "border-gray-600/40",
                  textColor: "text-gray-400",
                  dotColor: "bg-gray-500"
                },
              };
              const status = statusConfig[feature.status];

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-[#343a40] rounded-2xl p-6 shadow-xl border-2 border-gray-700/50 hover:border-coral-500/50 hover:shadow-coral-500/10 transition-all duration-300 relative flex flex-col"
                >
                  {/* Header Row: Avatar and Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-coral-500 to-coral-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {feature.image}
                    </div>

                    {/* Status Badge - Cleaner Design */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${status.bgColor} ${status.borderColor}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${status.dotColor} animate-pulse`}></div>
                      <span className={`text-xs font-semibold ${status.textColor}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Feature Name & Role */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {feature.name}
                    </h3>
                    <p className="text-xs font-semibold text-coral-400 uppercase tracking-wide">
                      {feature.role}
                    </p>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-gray-300 leading-relaxed mb-4 flex-grow">
                    {feature.content}
                  </p>

                  {/* Key Feature */}
                  <div className="bg-[#2b2b2b] rounded-lg p-3 border border-coral-500/30">
                    <div className="text-sm font-semibold text-coral-400 flex items-center gap-2">
                      <span>⚡</span>
                      <span>{feature.feature}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-16"
          >
            <div className="bg-tron-grid rounded-2xl p-12 border border-tron-cyan">
              <h3 className="text-2xl font-bold text-tron-text mb-4">
                Ready to Transform Your Content Strategy?
              </h3>
              <p className="text-tron-text-muted mb-8 max-w-2xl mx-auto">
                Be the first to experience our next-generation AI content platform.
                Early access coming soon to selected partners.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const element = document.getElementById("contact");
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-tron-cyan to-tron-magenta text-tron-dark rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform transition-all duration-200"
                >
                  Request Early Access
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const element = document.getElementById("pricing");
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="px-8 py-4 bg-tron-grid border-2 border-tron-cyan text-tron-cyan rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:bg-tron-cyan/10 transform transition-all duration-200"
                >
                  View Plans
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
