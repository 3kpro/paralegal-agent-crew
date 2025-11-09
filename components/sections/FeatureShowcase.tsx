"use client";

import { motion } from "framer-motion";
import { Star, Quote, Twitter, Linkedin, MessageSquare } from "lucide-react";

const features = [
  {
    name: "TrendPulse™",
    role: "Real-Time Trend Detection",
    image: "TP",
    content:
      "Discover emerging trends across social platforms before they peak. Advanced AI algorithms analyze millions of data points to identify viral opportunities.",
    rating: 5,
    platform: "twitter",
    feature: "3-7 days early trend detection",
  },
  {
    name: "AI Studio™",
    role: "Multi-Model Content Creation",
    image: "AS",
    content:
      "Harness the power of multiple AI models working together. Create high-quality content faster with our hybrid AI approach combining multiple leading models.",
    rating: 5,
    platform: "linkedin",
    feature: "6+ AI models integrated",
  },
  {
    name: "Media Generator™",
    role: "AI-Powered Visuals",
    image: "MG",
    content:
      "Transform text into engaging visuals instantly. Our AI creates platform-optimized images, graphics, and video thumbnails that capture attention.",
    rating: 5,
    platform: "twitter",
    feature: "1-click visual creation",
  },
  {
    name: "Analytics Hub™",
    role: "Predictive Analytics",
    image: "AH",
    content:
      "Predict content performance before publishing. Our ML models analyze engagement patterns to optimize your content strategy for maximum impact.",
    rating: 5,
    platform: "email",
    feature: "90% prediction accuracy",
  },
  {
    name: "ContentFlow™",
    role: "Smart Automation",
    image: "CF",
    content:
      "Streamline your content workflow with intelligent automation. Schedule, adapt, and publish content across multiple platforms with perfect consistency.",
    rating: 5,
    platform: "linkedin",
    feature: "6 platforms supported",
  },
  {
    name: "Brand Voice™",
    role: "AI Style Adaptation",
    image: "BV",
    content:
      "Maintain consistent brand voice across all channels. Our AI learns your unique style and ensures every piece of content sounds authentically you.",
    rating: 5,
    platform: "email",
    feature: "Custom AI fine-tuning",
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

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-tron-grid rounded-2xl p-8 shadow-lg border border-tron-cyan hover:shadow-xl transition-shadow duration-300 relative"
                >
                  {/* Quote Icon */}
                  <div className="absolute top-6 right-6 opacity-10">
                    <Quote className="w-12 h-12 text-tron-cyan" />
                  </div>

                  {/* Feature Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                    className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-tron-cyan to-tron-magenta text-tron-dark rounded-full text-xs font-bold shadow-lg"
                  >
                    COMING SOON
                  </motion.div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(feature.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-tron-magenta"
                        fill="currentColor"
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-tron-text-muted mb-6 leading-relaxed">
                    {feature.content}
                  </p>

                  {/* Key Feature */}
                  <div className="bg-tron-grid rounded-lg p-3 mb-6 border border-tron-cyan">
                    <div className="text-sm font-semibold text-tron-cyan">
                      ⚡ Capability: {feature.feature}
                    </div>
                  </div>

                  {/* Feature Title */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {feature.image}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-tron-text">
                        {feature.name}
                      </div>
                      <div className="text-sm text-tron-text-muted">
                        {feature.role}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-tron-text-muted">
                        <PlatformIcon className="w-4 h-4" />
                        Coming Soon
                      </div>
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
