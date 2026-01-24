"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

const faqs = [
  {
    question: "How does XELORA predict trends?",
    answer:
      "Our AI analyzes millions of signals across social platforms, news, and forums in real-time. It identifies patterns that historically precede viral moments, giving you a 24-48 hour head start on emerging trends.",
  },
  {
    question: "Which platforms does it support?",
    answer:
      "We generate optimized content for Twitter, LinkedIn, Facebook, Instagram, TikTok, and Reddit. Each platform gets unique copy tailored to its character limits, tone, and audience expectations.",
  },
  {
    question: "How accurate is the viral scoring?",
    answer:
      "Our algorithm has an 87% accuracy rate in predicting content with high viral potential. This is based on analysis of 10,000+ viral posts and their common characteristics.",
  },
  {
    question: "Can I customize the AI's tone and style?",
    answer:
      "Yes! You can set tone (professional, casual, friendly), content focus (informative, discussion, tips), target audience, and length. We also provide quick presets for each platform.",
  },
  {
    question: "What's included in the Free plan?",
    answer:
      "The Free plan includes 5 campaigns per month and 10 trend searches per day. Perfect for trying out XELORA or for creators with lighter content needs.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel anytime with no contracts or cancellation fees. Your account remains active until the end of your billing period.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="faq" className="py-32 bg-gray-50" ref={ref}>
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-sm font-semibold text-violet-600 tracking-wider uppercase mb-4">
              FAQ
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Frequently asked questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about XELORA
            </p>
          </motion.div>

          {/* FAQ list */}
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="border border-gray-200 rounded-2xl bg-white overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-8">
                      {faq.question}
                    </span>
                    <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full border-2 transition-all duration-200 ${
                      isOpen ? "border-violet-500 bg-violet-500 text-white" : "border-gray-300 text-gray-400"
                    }`}>
                      <svg
                        className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5">
                          <p className="text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="text-gray-600">
              Still have questions?{" "}
              <a
                href="#contact"
                className="text-violet-600 font-semibold hover:text-violet-700 transition-colors"
              >
                Get in touch
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
