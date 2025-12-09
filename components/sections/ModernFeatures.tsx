"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Sparkles,
  Layout,
  Clock,
  Shield,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Viral Score™ Predictions",
    subtitle: "Predictive Trend Intelligence",
    description:
      "AI predicts viral potential (0-100 score) before you create. 4-factor algorithm analyzes Volume, Multi-source validation, Specificity, and Freshness. Know what will perform before you post.",
    gradient: "from-emerald-500 to-teal-500",
    status: "available" as const,
  },
  {
    icon: Sparkles,
    title: "AI Content Studio™",
    subtitle: "Intelligent Content Generation",
    description:
      "Discover trending topics with our AI-powered trend analysis. Full multi-model content generation coming soon with support for 50+ AI providers.",
    gradient: "from-purple-500 to-pink-500",
    status: "beta" as const,
  },
  {
    icon: Layout,
    title: "ContentFlow™ Automation",
    subtitle: "6-Platform Publishing",
    description:
      "One-click publishing to Twitter, LinkedIn, Facebook, Instagram, TikTok, and Reddit. Smart formatting, optimal timing, and engagement tracking.",
    gradient: "from-orange-500 to-red-500",
    status: "coming-soon" as const,
  },
  {
    icon: Clock,
    title: "Analytics Hub™",
    subtitle: "Performance Intelligence",
    description:
      "Real-time performance tracking with predictive insights. A/B test headlines, track viral coefficients, and optimize content strategy with data-driven recommendations.",
    gradient: "from-green-500 to-emerald-500",
    status: "coming-soon" as const,
  },
  {
    icon: Shield,
    title: "Brand Voice AI™",
    subtitle: "Consistency Engine",
    description:
      "Train custom AI models on your content to maintain perfect brand voice across all platforms. Includes tone scoring and compliance monitoring.",
    gradient: "from-indigo-500 to-purple-500",
    status: "coming-soon" as const,
  },
  {
    icon: BarChart3,
    title: "Media Generator™",
    subtitle: "Visual Content Creation",
    description:
      "Generate custom images, infographics, and video thumbnails using DALL-E 3, Midjourney, and Stable Diffusion. Perfect brand alignment guaranteed.",
    gradient: "from-yellow-500 to-orange-500",
    status: "coming-soon" as const,
  },
];

export default function ModernFeatures() {
  return (
    <section
      id="features"
      className="py-24 bg-[#2b2b2b] relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-gray-900 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.05))] -z-10" />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Supercharged for Beta
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience our most powerful features yet. The Beta release brings
            enhanced AI capabilities, faster processing, and seamless
            integrations.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="h-full bg-[#343a40] rounded-2xl p-6 shadow-xl transition-all duration-300 border-2 border-gray-700/50 hover:border-coral-500/50 hover:shadow-coral-500/10 flex flex-col">
                  {/* Icon and Status Badge Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-sm group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Status Badge - Cleaner Design */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${status.bgColor} ${status.borderColor}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${status.dotColor} animate-pulse`}></div>
                      <span className={`text-xs font-semibold ${status.textColor}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-2 text-white">
                    {feature.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-xs font-semibold text-coral-400 mb-3 uppercase tracking-wide">
                    {feature.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-gray-300 leading-relaxed flex-grow">
                    {feature.description}
                  </p>

                  {/* Hover gradient effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300 pointer-events-none`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-gray-300 mb-6 text-lg">
            Ready to experience the future of content creation?
          </p>
          <div className="flex flex-col items-center gap-4">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-coral-500 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:bg-coral-600 transform hover:scale-105 transition-all duration-200"
            >
              <Sparkles className="w-5 h-5" />
              Join XELORA™ Beta
            </a>
            <span className="text-sm text-gray-400">
              Limited spots available
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
