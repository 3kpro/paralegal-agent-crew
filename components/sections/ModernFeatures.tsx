'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Sparkles, Layout, Clock, Shield, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: TrendingUp,
    title: 'TrendPulse™',
    subtitle: 'Trend Discovery',
    description: 'Know what\'s hot before your competitors. Our AI scans trending topics across industries and serves them fresh to your dashboard.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Sparkles,
    title: 'AI Cascade™',
    subtitle: 'Content Generation',
    description: 'One topic, infinite content. Generate professional Twitter threads, LinkedIn posts, and email newsletters—all powered by Claude Opus.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Layout,
    title: 'OmniFormat™',
    subtitle: 'Multi-Channel Publishing',
    description: 'Write once, publish everywhere. Content automatically formatted for Twitter, LinkedIn, email, and more—no copy-paste needed.',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: Clock,
    title: 'SmartScheduler™',
    subtitle: 'Intelligent Timing',
    description: 'Post when your audience is listening. AI analyzes engagement patterns and schedules content for maximum impact.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Shield,
    title: 'BrandGuard™',
    subtitle: 'Voice Protection',
    description: 'Keep your voice consistent. AI learns your brand guidelines and ensures every piece of content matches your style.',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    icon: BarChart3,
    title: 'ImpactMetrics™',
    subtitle: 'Analytics Dashboard',
    description: 'See what moves the needle. Track engagement, measure ROI, and discover what content resonates with your audience.',
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
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Complex Simplicity
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We offer a lot, but you don't need to know a lot to get started. From zero to full-blown campaign in minutes.
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
                  <h3 className="text-2xl font-bold mb-1 text-gray-900">
                    {feature.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-sm font-semibold text-purple-600 mb-3">
                    {feature.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed">
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
          <p className="text-gray-600 mb-6 text-lg">
            Ready to transform your content workflow?
          </p>
          <a
            href="/trend-gen"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            <Sparkles className="w-5 h-5" />
            Start Creating Now
          </a>
        </motion.div>
      </div>
    </section>
  )
}
