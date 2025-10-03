'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, HelpCircle } from 'lucide-react'

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How does Content Cascade AI work?",
        answer: "Content Cascade AI uses our TrendPulse™ technology to discover trending topics in your industry, then AI Cascade™ generates professional content in multiple formats (Twitter threads, LinkedIn posts, emails), and finally OmniFormat™ publishes or schedules across all your channels. The entire process takes under 60 seconds."
      },
      {
        question: "Do I need any technical skills to use it?",
        answer: "Not at all! Content Cascade AI is designed for creators, not developers. If you can post on social media, you can use our platform. Our onboarding wizard walks you through connecting your accounts and launching your first campaign in under 5 minutes."
      },
      {
        question: "Which platforms does it support?",
        answer: "Currently, we support Twitter, LinkedIn, and email marketing platforms. We're adding Instagram, Facebook, TikTok, and YouTube in Q2 2025. You can also export content to any platform manually."
      }
    ]
  },
  {
    category: "AI & Content Quality",
    questions: [
      {
        question: "Will the AI content sound like my voice?",
        answer: "Yes! Our BrandGuard™ technology learns your writing style from your previous content. You can also set tone preferences (professional, casual, technical, etc.) and the AI adapts accordingly. Most users can't tell the difference between AI and human-written content after the initial setup."
      },
      {
        question: "Can I edit the content before publishing?",
        answer: "Absolutely! All content goes through our preview system where you can edit, refine, or completely rewrite before scheduling or publishing. We recommend reviewing content initially as the AI learns your preferences."
      },
      {
        question: "How original is the AI-generated content?",
        answer: "Each piece of content is uniquely generated based on trending topics and your brand voice. Our AI doesn't copy or plagiarize—it creates original content inspired by trends. We also include a plagiarism checker for peace of mind."
      },
      {
        question: "What if my industry is very niche?",
        answer: "TrendPulse™ works across all industries! You can specify your niche during setup (SaaS, coaching, e-commerce, etc.) and our trend discovery focuses on your specific market. The more specific you are, the better your results."
      }
    ]
  },
  {
    category: "Pricing & Plans",
    questions: [
      {
        question: "Is there a free trial?",
        answer: "Yes! We offer a 14-day free trial with full access to all features. No credit card required. You can generate up to 50 pieces of content and connect 2 channels during your trial."
      },
      {
        question: "Can I cancel anytime?",
        answer: "Yes, you can cancel your subscription anytime with one click. No contracts, no cancellation fees. Your account remains active until the end of your billing period."
      },
      {
        question: "Do you offer refunds?",
        answer: "We offer a 30-day money-back guarantee on all plans. If you're not satisfied with Content Cascade AI, contact us within 30 days for a full refund."
      }
    ]
  },
  {
    category: "Security & Data",
    questions: [
      {
        question: "Is my data safe and secure?",
        answer: "Security is our top priority. We use enterprise-grade encryption, SOC 2 compliance, and never store your social media passwords. We only access the minimum permissions needed to post content on your behalf."
      },
      {
        question: "Do you store my content?",
        answer: "We temporarily store generated content for 30 days to enable editing and rescheduling. After that, it's automatically deleted. You own 100% of your content—we never use it for training or other purposes."
      },
      {
        question: "Can I disconnect my accounts anytime?",
        answer: "Yes, you can disconnect any connected account with one click. This immediately revokes our access to post on your behalf. Your content history remains in your dashboard for reference."
      }
    ]
  },
  {
    category: "Features & Limits",
    questions: [
      {
        question: "How much content can I generate?",
        answer: "It depends on your plan: Starter (50/month), Pro (unlimited), Agency (unlimited). Most users on Pro create 5-10 pieces per day. There are no hidden limits or throttling."
      },
      {
        question: "Can I schedule content in advance?",
        answer: "Yes! Our SmartScheduler™ can schedule content weeks or months in advance. It even suggests optimal posting times based on your audience engagement patterns."
      },
      {
        question: "Do you provide analytics?",
        answer: "Pro and Agency plans include ImpactMetrics™ with detailed analytics: engagement rates, best-performing content, audience growth, and ROI tracking. You can export reports for clients or internal use."
      }
    ]
  }
]

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({})

  const toggleItem = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <section id="faq" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full mb-6">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-700">
                Frequently Asked Questions
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to Know
            </h2>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Got questions? We've got answers. If you can't find what you're looking for, 
              <a href="#contact" className="text-indigo-600 hover:text-indigo-700 font-semibold"> reach out to our team</a>.
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-indigo-100">
                  {category.category}
                </h3>
                
                <div className="space-y-4">
                  {category.questions.map((faq, questionIndex) => {
                    const isOpen = openItems[`${categoryIndex}-${questionIndex}`]
                    
                    return (
                      <div
                        key={questionIndex}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleItem(categoryIndex, questionIndex)}
                          className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                        >
                          <span className="font-semibold text-gray-900 text-lg pr-8">
                            {faq.question}
                          </span>
                          <div className="flex-shrink-0">
                            {isOpen ? (
                              <Minus className="w-6 h-6 text-indigo-600" />
                            ) : (
                              <Plus className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6">
                                <p className="text-gray-600 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
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
            className="text-center mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-white"
          >
            <h3 className="text-2xl font-bold mb-4">
              Still Have Questions?
            </h3>
            <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
              Our team is here to help! Book a free 15-minute consultation to discuss 
              your content strategy and see if Content Cascade AI is right for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  const contactElement = document.getElementById('contact')
                  if (contactElement) {
                    contactElement.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
                Book Free Consultation
              </button>
              <button 
                onClick={() => {
                  const contactElement = document.getElementById('contact')
                  if (contactElement) {
                    contactElement.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                className="px-8 py-4 bg-transparent text-white rounded-xl font-semibold text-lg border-2 border-white hover:bg-white hover:text-indigo-600 transition-all duration-200">
                Contact Support
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}