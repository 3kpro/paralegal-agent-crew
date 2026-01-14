"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Question as HelpCircle } from "@phosphor-icons/react";
import { BGPattern } from "@/components/ui/bg-pattern";

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How does XELORA work?",
        answer:
          "XELORA discovers trending topics with real search volume data, scores them with our Viral Score™ algorithm (0-100), and reveals the Viral DNA™ (Hook, Emotion, Value) behind each trend. You then generate platform-optimized content for Twitter, LinkedIn, Facebook, Instagram, TikTok, and Reddit. The entire process takes under 60 seconds.",
      },
      {
        question: "Do I need any technical skills to use it?",
        answer:
          "Not at all! XELORA is designed for creators, not developers. The interface is simple: browse trends, pick one, select platforms, customize your tone and audience, then generate. No coding or technical knowledge required.",
      },
      {
        question: "Which platforms does it support?",
        answer:
          "We generate optimized content for Twitter, LinkedIn, Facebook, Instagram, TikTok, and Reddit. Each platform gets unique copy tailored to its character limits, tone, and audience expectations.",
      },
    ],
  },
  {
    category: "AI & Content Quality",
    questions: [
      {
        question: "Can I customize the AI's tone and style?",
        answer:
          "Yes! You can set tone (professional, casual, friendly), content focus (informative, discussion, tips, etc.), target audience, and length. We also provide quick presets for each platform like 'TikTok Viral' or 'LinkedIn Pro'.",
      },
      {
        question: "Can I edit the content after generation?",
        answer:
          "Absolutely! All content can be edited directly in the dashboard before you copy or export it. You can also regenerate with different settings if you want a fresh take.",
      },
      {
        question: "How original is the AI-generated content?",
        answer:
          "Each piece of content is uniquely generated based on the trending topic and your settings. The AI creates original copy inspired by the trend's Viral DNA™, not copied text. Every campaign is unique.",
      },
    ],
  },
  {
    category: "Pricing & Plans",
    questions: [
      {
        question: "What's included in the Free plan?",
        answer:
          "The Free plan includes 5 campaigns per month and 10 trend searches per day. Perfect for trying out XELORA or for creators with lighter content needs.",
      },
      {
        question: "Can I cancel anytime?",
        answer:
          "Yes, you can cancel your subscription anytime. No contracts, no cancellation fees. Your account remains active until the end of your billing period.",
      },
      {
        question: "What's the difference between Free and Pro?",
        answer:
          "Pro gives you unlimited campaigns, unlimited trend searches, and priority AI generation. Great for agencies, heavy creators, or anyone producing daily content.",
      },
    ],
  },
  {
    category: "Features & How It Works",
    questions: [
      {
        question: "What is Viral Score™?",
        answer:
          "Our algorithm scores trends 0-100 based on volume, multi-source validation, freshness, keyword signals, benchmarking against 10k+ proven viral hits, and AI content analysis. Higher scores = higher viral potential.",
      },
      {
        question: "What is Viral DNA™?",
        answer:
          "Viral DNA™ reveals WHY a topic might go viral by analyzing its Hook (how it grabs attention), Emotion (what it triggers), and Value (what readers gain). This helps you understand the psychology behind viral content.",
      },
      {
        question: "Can I validate my own content ideas?",
        answer:
          "Yes! The 'Promote Your Idea' flow lets you input your own product, service, or topic. XELORA will generate content for it across all platforms without needing a trending topic.",
      },
    ],
  },
];

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section id="faq" className="py-24 bg-[#2b2b2b] relative overflow-hidden">
      {/* Background Pattern */}
      <BGPattern
        variant="dots"
        mask="fade-center"
        size={24}
        fill="rgba(255,255,255,0.12)"
        className="z-0"
        style={{ zIndex: 0 }}
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-coral-500/20 rounded-full mb-6 border border-coral-500/30">
              <HelpCircle className="w-4 h-4 text-coral-400" weight="duotone" />
              <span className="text-sm font-semibold text-coral-400">
                Frequently Asked Questions
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need to Know
            </h2>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Got questions? We've got answers. If you can't find what you're
              looking for,
              <a
                href="#contact"
                className="text-coral-500 hover:text-coral-400 font-semibold"
              >
                {" "}
                reach out to our team
              </a>
              .
            </p>
          </motion.div>

          {/* FAQ Categories */}
          <div className="space-y-12">
            {faqs.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6 pb-3 border-b-2 border-coral-500/50">
                  {category.category}
                </h3>

                <div className="space-y-4">
                  {category.questions.map((faq, questionIndex) => {
                    const isOpen =
                      openItems[`${categoryIndex}-${questionIndex}`];

                    return (
                      <div
                        key={questionIndex}
                        className="bg-[#343a40] rounded-xl shadow-sm border-2 border-gray-700/50 hover:border-coral-500/50 transition-all duration-200 overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            toggleItem(categoryIndex, questionIndex)
                          }
                          className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-[#3a4046] transition-colors duration-200"
                        >
                          <span className="font-semibold text-white text-lg pr-8">
                            {faq.question}
                          </span>
                          <div className="flex-shrink-0">
                            {isOpen ? (
                              <Minus className="w-6 h-6 text-coral-500" weight="duotone" />
                            ) : (
                              <Plus className="w-6 h-6 text-gray-400" weight="duotone" />
                            )}
                          </div>
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6">
                                <p className="text-gray-300 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-16 bg-[#343a40] rounded-2xl p-12 border-2 border-gray-700/50 hover:border-coral-500/50 transition-all duration-200"
          >
            <h3 className="text-2xl font-bold mb-4 text-white">
              Still Have Questions?
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Our team is here to help! Book a free 15-minute consultation to
              discuss your content strategy and see if XELORA is
              right for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  const contactElement = document.getElementById("contact");
                  if (contactElement) {
                    contactElement.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="px-8 py-4 bg-coral-500 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-coral-500/20 transition-all duration-200"
              >
                Book Free Consultation
              </button>
              <button
                onClick={() => {
                  const contactElement = document.getElementById("contact");
                  if (contactElement) {
                    contactElement.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="px-8 py-4 bg-transparent text-white rounded-xl font-semibold text-lg border-2 border-gray-700/70 hover:border-coral-500/50 transition-all duration-200"
              >
                Contact Support
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
