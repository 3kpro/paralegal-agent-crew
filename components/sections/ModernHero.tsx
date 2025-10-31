'use client'

import { motion } from 'framer-motion'
import { Sparkles, Zap, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ModernHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-tron-dark pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Enhanced Beta Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-tron-magenta to-tron-cyan rounded-full shadow-xl mb-8 border border-tron-cyan"
          >
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
            <span className="text-sm font-bold text-white">
              🚀 TrendPulse™ Public Beta • Join 1000+ Creators
            </span>
            <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-semibold text-white">
              LIVE
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Content Creation
            </span>
            <br />
            <span className="text-tron-text">
              At The Speed Of AI
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-tron-text-muted mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Experience the future of content creation with our <span className="font-semibold text-tron-magenta">Public Beta</span>. 
            <span className="font-semibold text-tron-cyan"> TrendPulse™</span> delivers enterprise-grade AI tools to
            <span className="font-semibold text-tron-green"> discover trending topics, generate viral content, and publish across 6+ platforms</span>
            <span className="font-bold text-tron-text"> — all in minutes, not hours</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link
              href="/trend-gen"
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Join TrendPulse™ Beta
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button className="px-8 py-4 bg-tron-dark text-tron-cyan rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-2 border-tron-cyan hover:border-tron-magenta">
              ⭐ Beta Features Overview
            </button>
          </motion.div>

          {/* Enhanced Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-tron-text-muted"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-tron-magenta" />
              <span>
                <strong className="text-tron-text">2,500+</strong> beta creators
              </span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-tron-magenta" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-tron-cyan" />
              <span>
                <strong className="text-tron-text">98%</strong> satisfaction rate
              </span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-tron-magenta" />
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-tron-cyan" />
              <span>
                <strong className="text-tron-text">24hr</strong> avg response time
              </span>
            </div>
          </motion.div>

          {/* Enhanced Beta Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 flex flex-wrap gap-3 justify-center"
          >
            {[
              '🎯 Real-Time Trend Detection',
              '🧠 GPT-4 & Claude AI Generation',
              '🚀 6-Platform Auto-Publishing',
              '⚡ 10x Faster Content Pipeline',
              '🔒 Enterprise-Grade Security',
              '🎨 Brand Voice Intelligence',
              '📊 Predictive Analytics',
              '🔄 Content Automation Workflows'
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                className="px-4 py-2 bg-gradient-to-r from-tron-grid to-tron-dark rounded-full text-sm font-medium text-tron-text shadow-md border border-tron-magenta hover:border-tron-cyan hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-default"
              >
                {feature}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-tron-cyan rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-tron-cyan rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
