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
          "XELORA discovers trending topics with real search volume data, scores them with our Viral Score™ algorithm (0-100), and reveals the Viral DNA™ (Hook, Emotion, Value) behind each trend. You then generate platform-optimized content variations for all major platforms. The entire process is engineered to move from data to draft in under 60 seconds.",
      },
      {
        question: "Do I need any technical skills to use it?",
        answer:
          "Not at all. XELORA is designed for creators and strategists. The interface is high-density but intuitive: browse trends, analyze the DNA, select platforms, and generate. No prompt engineering or coding required.",
      },
      {
        question: "Which platforms are supported?",
        answer:
          "Currently, XELORA generates high-performance content for Twitter, LinkedIn, Facebook, Instagram, TikTok, and Reddit. Each output is uniquely tailored to the specific character limits and psychological drivers of that platform.",
      },
    ],
  },
  {
    category: "Strategy & Performance",
    questions: [
      {
        question: "Can I customize the AI's output?",
        answer:
          "Yes. You have full control over tone, content focus, target audience, and length. You can also use platform-specific presets like 'LinkedIn Authority' or 'Twitter Viral Hook' to guide the engine.",
      },
      {
        question: "Can I schedule content directly?",
        answer:
          "Native scheduling and one-click publishing are currently in development as part of our Phase 2 roadmap. For now, XELORA provides a seamless 'Copy to Draft' workflow to get your campaigns into your favorite management tools instantly.",
      },
      {
        question: "What is Viral Score™?",
        answer:
          "Our algorithm scores trends 0-100 by benchmarking them against a database of 10k+ proven viral hits. It analyzes sentiment, keyword velocity, and psychometric alignment to predict engagement before you post.",
      },
    ],
  },
  {
    category: "Features",
    questions: [
      {
        question: "What is Viral DNA™?",
        answer:
          "Viral DNA™ reveals the psychological mechanics of a trend. We break every viral topic down into its Hook (Attention), Emotion (Trigger), and Value (Promise). Understanding the DNA allows you to repeat success predictably.",
      },
      {
        question: "Can I validate my own ideas?",
        answer:
          "Yes. The 'Promote Your Idea' feature allows you to bypass trend discovery and input your own product, service, or concept. XELORA will apply the same Viral DNA™ analysis to engineer content for your specific offering.",
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
    <section id="faq" className="py-24 bg-background relative overflow-hidden border-t border-border">
      {/* Background Pattern */}
      <BGPattern
        variant="grid"
        mask="fade-center"
        size={24}
        fill="rgba(0,0,0,0.05)"
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-none mb-6">
              <HelpCircle className="w-4 h-4 text-foreground" weight="duotone" />
              <span className="text-sm font-bold text-foreground">
                FREQUENTLY ASKED QUESTIONS
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 uppercase tracking-tighter">
              The Intelligence <span className="text-muted-foreground">Layer.</span>
            </h2>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Insights on how we decode viral momentum and engineer content.
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
                <h3 className="text-sm font-bold text-foreground mb-6 pb-2 border-b border-border uppercase tracking-widest">
                  {category.category}
                </h3>

                <div className="space-y-0 border-x border-t border-border">
                  {category.questions.map((faq, questionIndex) => {
                    const isOpen =
                      openItems[`${categoryIndex}-${questionIndex}`];

                    return (
                      <div
                        key={questionIndex}
                        className="bg-card border-b border-border transition-all duration-200 overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            toggleItem(categoryIndex, questionIndex)
                          }
                          className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-muted transition-colors duration-200"
                        >
                          <span className="font-bold text-foreground text-lg pr-8 tracking-tight">
                            {faq.question}
                          </span>
                          <div className="flex-shrink-0">
                            {isOpen ? (
                              <Minus className="w-5 h-5 text-foreground" weight="bold" />
                            ) : (
                              <Plus className="w-5 h-5 text-muted-foreground" weight="bold" />
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
                              <div className="px-8 pb-8 pt-0">
                                <p className="text-muted-foreground leading-relaxed font-medium">
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
            className="text-center mt-20 p-12 bg-muted border border-border"
          >
            <h3 className="text-2xl font-bold mb-4 text-foreground uppercase tracking-tighter">
              Still Have Questions?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto font-medium">
              Our team is ready to discuss your specific content engineering needs and how XELORA can optimize your workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  window.location.href = "mailto:support@xelora.app";
                }}
                className="px-10 py-4 bg-foreground text-background font-bold text-lg border border-foreground hover:bg-background hover:text-foreground transition-all duration-200 uppercase tracking-tighter"
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
