'use client'

import { motion } from 'framer-motion'
import { Check, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    description: 'Perfect for trying out Content Cascade AI',
    icon: Sparkles,
    gradient: 'from-gray-400 to-gray-600',
    features: [
      '5 campaigns per month',
      '1 connected channel',
      'Basic trends (curated)',
      'Standard AI model',
      'Community support',
      'Email delivery'
    ],
    cta: 'Get Started Free',
    popular: false
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'For serious content creators',
    icon: Zap,
    gradient: 'from-indigo-500 to-purple-600',
    features: [
      'Unlimited campaigns',
      '3 connected channels',
      'Real-time TrendPulse™',
      'Claude Opus AI Cascade™',
      'Priority support',
      'ImpactMetrics™ dashboard',
      '10 Automation Recipes™',
      'BrandGuard™ protection',
      'SmartScheduler™',
      'OmniFormat™ publishing'
    ],
    cta: 'Start 14-Day Trial',
    popular: true
  },
  {
    name: 'Agency',
    price: '$99',
    period: 'per month',
    description: 'For agencies and teams',
    icon: Crown,
    gradient: 'from-purple-500 to-pink-600',
    features: [
      'Everything in Pro',
      '10 connected channels',
      'White-label options',
      'Team collaboration (5 seats)',
      'API access',
      'Custom Automation Recipes™',
      'Dedicated account manager',
      'Advanced analytics',
      'Priority AI processing',
      'Custom integrations'
    ],
    cta: 'Contact Sales',
    popular: false
  }
]

export default function ModernPricing() {
  return (
    <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 via-white to-purple-50 relative overflow-hidden">
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
              Simple, Transparent Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free, upgrade when you're ready. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className={`h-full bg-white rounded-2xl p-8 shadow-xl border-2 ${
                  plan.popular ? 'border-purple-500' : 'border-gray-200'
                } hover:shadow-2xl transition-all duration-300`}>
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${plan.gradient} mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">
                    {plan.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      {plan.price !== 'Free' && (
                        <span className="text-gray-600">
                          / {plan.period}
                        </span>
                      )}
                    </div>
                    {plan.price === 'Free' && (
                      <span className="text-gray-600">
                        {plan.period}
                      </span>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button className={`w-full py-4 px-6 rounded-xl font-semibold text-lg mb-8 transition-all duration-200 flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}>
                    {plan.cta}
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {/* Features List */}
                  <div className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center mt-0.5`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-700">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
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
                <p className="text-indigo-100 text-lg">
                  Custom solutions for large organizations. Self-hosted options, SLAs, and dedicated support.
                </p>
              </div>
              <button className="flex-shrink-0 px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
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
            Have questions?{' '}
            <a href="#contact" className="text-purple-600 hover:text-purple-700 font-semibold underline">
              Contact us
            </a>
            {' '}or check out our{' '}
            <a href="#faq" className="text-purple-600 hover:text-purple-700 font-semibold underline">
              FAQ
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
