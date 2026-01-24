"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For creators just getting started with trend prediction",
    features: [
      "5 campaigns per month",
      "10 trend searches per day",
      "Viral score predictions",
      "Basic analytics",
      "Community support",
    ],
    cta: "Start free",
    href: "/signup",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For serious creators who want to stay ahead",
    features: [
      "Unlimited campaigns",
      "Unlimited trend searches",
      "Advanced analytics & insights",
      "Export campaign data",
      "Priority support",
      "Early access to features",
    ],
    cta: "Start free trial",
    href: "/signup?plan=pro",
    popular: true,
  },
  {
    name: "Team",
    price: "$79",
    period: "per month",
    description: "For agencies and teams who need more",
    features: [
      "Everything in Pro",
      "5 team members",
      "Custom AI models",
      "API access",
      "White-label reports",
      "Dedicated support",
    ],
    cta: "Contact sales",
    href: "#contact",
    popular: false,
  },
];

export default function ModernPricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="py-32 bg-white" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-violet-600 tracking-wider uppercase mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free. Upgrade when you're ready. No hidden fees.
          </p>
        </motion.div>

        {/* Pricing grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "bg-gray-900 text-white ring-2 ring-gray-900"
                  : "bg-gray-50 text-gray-900"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full">
                    Most popular
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-2 ${plan.popular ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.popular ? "text-gray-400" : "text-gray-500"}`}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className={`text-5xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}>
                  {plan.price}
                </span>
                <span className={`ml-2 ${plan.popular ? "text-gray-400" : "text-gray-500"}`}>
                  /{plan.period}
                </span>
              </div>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`block w-full py-3 px-6 rounded-full font-semibold text-center transition-all duration-200 mb-8 ${
                  plan.popular
                    ? "bg-white text-gray-900 hover:bg-gray-100"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {plan.cta}
              </Link>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.popular ? "text-violet-400" : "text-violet-500"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={plan.popular ? "text-gray-300" : "text-gray-600"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600 mb-4">
            Need something custom? We offer enterprise plans for larger teams.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-violet-600 font-semibold hover:text-violet-700 transition-colors"
          >
            Talk to sales
            <span>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
