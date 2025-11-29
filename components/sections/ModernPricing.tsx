"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "Free",
    period: "forever",
    description: "Perfect for content creators getting started",
    icon: Sparkles,
    gradient: "from-green-400 to-blue-500",
    features: [
      "5 trend campaigns per month",
      "10 trend searches per day",
      "Viral Score™ predictions",
      "TrendPulse™ Discovery",
      "Basic analytics",
      "Community support",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For professionals and creators",
    icon: Zap,
    gradient: "from-indigo-500 to-purple-600",
    features: [
      "Unlimited trend campaigns",
      "Unlimited trend searches",
      "Advanced Viral Score™ analytics",
      "Export campaign data",
      "10GB storage",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Premium",
    price: "$79",
    period: "per month",
    description: "For agencies and power users",
    icon: Crown,
    gradient: "from-purple-500 to-pink-600",
    features: [
      "Everything in Pro",
      "White-label TrendPulse™",
      "Custom Viral Score™ models",
      "100GB storage",
      "24/7 priority support",
      "API access & webhooks",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function ModernPricing() {
  return (
    <section
      id="pricing"
      className="py-24 bg-[#343a40] relative overflow-hidden"
    >
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
            TrendPulse™ Launch Pricing
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Start for free. Upgrade anytime for unlimited access.
            More TrendPulse features coming soon.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-coral-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                <div
                  className={`h-full bg-[#2b2b2b] rounded-2xl p-8 shadow-xl border-2 ${
                    plan.popular ? "border-coral-500/50 shadow-coral-500/20" : "border-gray-700/50"
                  } hover:border-coral-500/70 transition-all duration-300`}
                >
                  {/* Icon */}
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${plan.gradient} mb-4 shadow-sm`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold mb-2 text-white">
                    {plan.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-300 mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-white">
                        {plan.price}
                      </span>
                      {plan.price !== "Free" && (
                        <span className="text-gray-400">
                          / {plan.period}
                        </span>
                      )}
                    </div>
                    {plan.price === "Free" && (
                      <span className="text-gray-400">
                        {plan.period}
                      </span>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      if (plan.cta === "Contact Sales" || plan.cta === "Contact Beta Sales") {
                        const contactElement =
                          document.getElementById("contact");
                        if (contactElement) {
                          contactElement.scrollIntoView({ behavior: "smooth" });
                        }
                      } else {
                        window.location.href = "/signup";
                      }
                    }}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg mb-8 transition-all duration-200 flex items-center justify-center gap-2 ${
                      plan.popular
                        ? "bg-coral-500 text-white shadow-xl hover:shadow-2xl hover:bg-coral-600 hover:scale-105"
                        : "bg-transparent text-gray-300 border-2 border-gray-600 hover:bg-gray-700/50 hover:border-gray-500"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {/* Features List */}
                  <div className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-start gap-3"
                      >
                        <div
                          className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center mt-0.5`}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Enterprise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto mt-12"
        >
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-8 md:p-12 text-white shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-3xl font-bold mb-2">Enterprise</h3>
                <p className="text-gray-200 text-lg">
                  Custom solutions for large organizations. Self-hosted options,
                  SLAs, and dedicated support.
                </p>
              </div>
              <button
                onClick={() => {
                  const contactElement = document.getElementById("contact");
                  if (contactElement) {
                    contactElement.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="flex-shrink-0 px-8 py-4 bg-coral-500 text-white rounded-xl font-semibold text-lg hover:bg-coral-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </motion.div>

        {/* FAQ Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600">
            Have questions?{" "}
            <a
              href="#contact"
              className="text-coral-500 hover:text-coral-600 font-semibold underline"
            >
              Contact us
            </a>{" "}
            or check out our{" "}
            <a
              href="#faq"
              className="text-coral-500 hover:text-coral-600 font-semibold underline"
            >
              FAQ
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
