"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Beta Free",
    price: "Free",
    period: "during beta",
    description: "Full access to TrendPulse™ Beta features",
    icon: Sparkles,
    gradient: "from-green-400 to-blue-500",
    features: [
      "10 campaigns per month",
      "2 connected platforms",
      "TrendPulse™ Discovery (beta)",
      "AI Studio™ (GPT-4 & Claude)",
      "ContentFlow™ Publishing",
      "Analytics Hub™ Basic",
      "Community beta support",
      "Early access to new features",
    ],
    cta: "Join Beta Free",
    popular: false,
  },
  {
    name: "Pro Beta",
    price: "$19",
    period: "per month (50% off)",
    description: "Beta early adopter pricing - lock in now!",
    icon: Zap,
    gradient: "from-indigo-500 to-purple-600",
    features: [
      "Unlimited campaigns",
      "6 connected platforms",
      "Advanced TrendPulse™ with predictions",
      "Multi-provider AI Studio™",
      "Brand Voice AI™ training",
      "Media Generator™ access",
      "Advanced Analytics Hub™",
      "Priority beta support",
      "Custom automation workflows",
      "Export & backup tools",
    ],
    cta: "Start Beta Trial",
    popular: true,
  },
  {
    name: "Agency Beta",
    price: "$49",
    period: "per month (50% off)",
    description: "Multi-client agency management",
    icon: Crown,
    gradient: "from-purple-500 to-pink-600",
    features: [
      "Everything in Pro Beta",
      "Unlimited platforms",
      "White-label dashboard",
      "Team collaboration (10 seats)",
      "Client management tools",
      "Custom brand training",
      "Dedicated beta success manager",
      "API access & webhooks",
      "Priority feature requests",
      "Custom integrations",
    ],
    cta: "Contact Beta Sales",
    popular: false,
  },
];

export default function ModernPricing() {
  return (
    <section
      id="pricing"
      className="py-24 bg-tron-dark relative overflow-hidden"
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Beta Launch Pricing
            </span>
          </h2>
          <p className="text-xl text-tron-text-muted max-w-2xl mx-auto">
            Early adopter pricing available now. Lock in 50% savings for life.
            Beta features included.
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
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                <div
                  className={`h-full bg-tron-grid rounded-2xl p-8 shadow-xl border-2 ${
                    plan.popular ? "border-tron-cyan" : "border-tron-cyan"
                  } hover:shadow-2xl transition-all duration-300`}
                >
                  {/* Icon */}
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${plan.gradient} mb-4 shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold mb-2 text-tron-text">
                    {plan.name}
                  </h3>

                  {/* Description */}
                  <p className="text-tron-text-muted mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-tron-text">
                        {plan.price}
                      </span>
                      {plan.price !== "Free" && (
                        <span className="text-tron-text-muted">
                          / {plan.period}
                        </span>
                      )}
                    </div>
                    {plan.price === "Free" && (
                      <span className="text-tron-text-muted">
                        {plan.period}
                      </span>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      if (plan.cta === "Contact Sales") {
                        const contactElement =
                          document.getElementById("contact");
                        if (contactElement) {
                          contactElement.scrollIntoView({ behavior: "smooth" });
                        }
                      } else if (plan.cta === "Start 14-Day Trial") {
                        window.open("/trend-gen", "_blank");
                      } else {
                        window.open("/trend-gen", "_blank");
                      }
                    }}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg mb-8 transition-all duration-200 flex items-center justify-center gap-2 ${
                      plan.popular
                        ? "bg-tron-cyan text-tron-dark shadow-lg hover:shadow-xl hover:scale-105"
                        : "bg-tron-grid text-tron-text hover:bg-tron-grid border border-tron-cyan"
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
                        <span className="text-tron-text-muted">{feature}</span>
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
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-3xl font-bold mb-2">Enterprise</h3>
                <p className="text-tron-text-muted text-lg">
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
                className="flex-shrink-0 px-8 py-4 bg-tron-cyan text-tron-dark rounded-xl font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
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
          <p className="text-tron-text-muted">
            Have questions?{" "}
            <a
              href="#contact"
              className="text-tron-cyan hover:text-tron-magenta font-semibold underline"
            >
              Contact us
            </a>{" "}
            or check out our{" "}
            <a
              href="#faq"
              className="text-tron-cyan hover:text-tron-magenta font-semibold underline"
            >
              FAQ
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
