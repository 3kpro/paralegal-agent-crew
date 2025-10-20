'use client'

import { motion } from 'framer-motion'
import { Sparkles, Zap, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ModernHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-tron-dark">
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
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-tron-grid rounded-full shadow-lg mb-8 border border-tron-cyan"
          >
            <Sparkles className="w-4 h-4 text-tron-cyan" />
            <span className="text-sm font-semibold text-tron-text">
              🚀 Join 1,200+ creators on the waitlist • Early access available
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
              Turn Trending Topics
            </span>
            <br />
            <span className="text-tron-text">
              Into Published Content
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-tron-text-muted mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            <span className="font-semibold text-tron-magenta">TrendPulse™</span> discovers what's hot before your competitors, 
            <span className="font-semibold text-tron-cyan"> AI Cascade™</span> generates professional content, 
            and <span className="font-semibold text-tron-green">OmniFormat™</span> publishes everywhere—
            <span className="font-bold text-tron-text"> automatically</span>.
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
              className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Try TrendPulse™ Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button className="px-8 py-4 bg-tron-cyan text-tron-dark rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-2 border-tron-cyan hover:border-tron-magenta">
              🎥 Watch Demo (2 min)
            </button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-tron-text-muted"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-tron-green" />
              <span>
                <strong className="text-tron-text">500+</strong> campaigns launched
              </span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-tron-cyan" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-tron-magenta" />
              <span>
                <strong className="text-tron-text">10K+</strong> pieces of content generated
              </span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-tron-cyan" />
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-tron-green" />
              <span>
                <strong className="text-tron-text">98%</strong> user satisfaction
              </span>
            </div>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 flex flex-wrap gap-3 justify-center"
          >
            {[
              'TrendPulse™ Discovery',
              'AI Cascade™ Generation',
              'OmniFormat™ Publishing',
              'SmartScheduler™',
              'BrandGuard™ Protection'
            ].map((feature, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-tron-grid rounded-full text-sm font-medium text-tron-text shadow-md border border-tron-cyan hover:border-tron-magenta hover:shadow-lg transition-all duration-200"
              >
                {feature}
              </div>
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
