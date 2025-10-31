'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Sparkles, Layout, Clock, Shield, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: TrendingUp,
    title: 'TrendPulse™ Discovery',
    subtitle: 'Real-Time Intelligence',
    description: 'Advanced AI monitors 1M+ sources across platforms to identify trending topics 72 hours before they peak. Includes competitor analysis and viral prediction scoring.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Sparkles,
    title: 'AI Studio™ Multi-Provider',
    subtitle: 'Enterprise AI Generation',
    description: 'Choose from GPT-4, Claude 3.5 Sonnet, Gemini Pro, and 8+ premium AI models. Auto-optimization selects the best AI for each content type and platform.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Layout,
    title: 'ContentFlow™ Automation',
    subtitle: '6-Platform Publishing',
    description: 'One-click publishing to Twitter, LinkedIn, Facebook, Instagram, TikTok, and Reddit. Smart formatting, optimal timing, and engagement tracking included.',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: Clock,
    title: 'Analytics Hub™',
    subtitle: 'Performance Intelligence',
    description: 'Real-time performance tracking with predictive insights. A/B test headlines, track viral coefficients, and optimize content strategy with data-driven recommendations.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Shield,
    title: 'Brand Voice AI™',
    subtitle: 'Consistency Engine',
    description: 'Train custom AI models on your content to maintain perfect brand voice across all platforms. Includes tone scoring and compliance monitoring.',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    icon: BarChart3,
    title: 'Media Generator™',
    subtitle: 'Visual Content Creation',
    description: 'Generate custom images, infographics, and video thumbnails using DALL-E 3, Midjourney, and Stable Diffusion. Perfect brand alignment guaranteed.',
    gradient: 'from-yellow-500 to-orange-500'
  }
]

export default function ModernFeatures() {
  return (
    <section id="features" className="py-24 bg-tron-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

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
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Supercharged for Beta
            </span>
          </h2>
          <p className="text-xl text-tron-text-muted max-w-2xl mx-auto">
            Experience our most powerful features yet. The Beta release brings enhanced AI capabilities, faster processing, and seamless integrations.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="h-full bg-tron-grid rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-tron-cyan hover:border-tron-magenta">
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-1 text-tron-text">
                    {feature.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-sm font-semibold text-tron-magenta mb-3">
                    {feature.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-tron-text-muted leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover gradient effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                </div>
              </motion.div>
            )
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
          <p className="text-tron-text-muted mb-6 text-lg">
            Ready to experience the future of content creation?
          </p>
          <div className="flex flex-col items-center gap-4">
            <a
              href="/trend-gen"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              <Sparkles className="w-5 h-5" />
              Join TrendPulse™ Beta
            </a>
            <span className="text-sm text-tron-text-muted">Limited spots available</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
