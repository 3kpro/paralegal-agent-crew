'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, PlayCircle, Clock, Eye, Zap } from 'lucide-react'

export default function DemoVideoSection() {
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayVideo = () => {
    setIsPlaying(true)
    // In a real implementation, this would trigger the video player
    console.log('Playing demo video...')
  }

  return (
    <section id="demo" className="py-24 bg-tron-grid">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-tron-grid rounded-full mb-6 border border-tron-cyan">
              <Eye className="w-4 h-4 text-tron-cyan" />
              <span className="text-sm font-semibold text-tron-cyan">
                See it in action
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-tron-text mb-6">
              Watch How It Works
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                In Just 60 Seconds
              </span>
            </h2>
            
            <p className="text-xl text-tron-text-muted max-w-3xl mx-auto">
              See how Content Cascade AI transforms trending topics into 
              published content across Twitter, LinkedIn, and email—automatically.
            </p>
          </motion.div>

          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-black rounded-2xl shadow-2xl overflow-hidden">
              {/* Video Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center relative">
                {!isPlaying ? (
                  <>
                    {/* Play Button Overlay */}
                    <button
                      onClick={handlePlayVideo}
                      className="group relative z-10"
                    >
                      <div className="w-24 h-24 bg-tron-cyan rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-12 h-12 text-tron-dark ml-1" fill="currentColor" />
                      </div>
                      <div className="absolute inset-0 bg-tron-cyan/20 rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                    </button>
                    
                    {/* Video Info Overlay */}
                    <div className="absolute bottom-6 left-6 flex items-center gap-4 text-white">
                      <div className="flex items-center gap-2 bg-black/50 rounded-full px-3 py-1 backdrop-blur-sm">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">2:34</span>
                      </div>
                      <div className="text-sm bg-black/50 rounded-full px-3 py-1 backdrop-blur-sm">
                        Full Product Demo
                      </div>
                    </div>

                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full"></div>
                      <div className="absolute bottom-10 right-10 w-24 h-24 border border-white rounded-full"></div>
                      <div className="absolute top-1/2 right-1/4 w-16 h-16 border border-white rounded-full"></div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-lg">Loading demo video...</p>
                      <p className="text-sm opacity-75">In production, this would be a real video player</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Video Controls Bar (when playing) */}
              {isPlaying && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4">
                  <div className="flex items-center gap-4">
                    <button className="hover:text-purple-400 transition-colors">
                      <PlayCircle className="w-6 h-6" />
                    </button>
                    <div className="flex-1 bg-tron-cyan h-2 rounded-full">
                      <div className="bg-purple-500 h-2 rounded-full w-1/3"></div>
                    </div>
                    <span className="text-sm">0:54 / 2:34</span>
                  </div>
                </div>
              )}
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 blur-xl"></div>
          </motion.div>

          {/* Video Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-tron-text mb-2">
                TrendPulse™ Discovery
              </h3>
              <p className="text-tron-text-muted">
                Watch how we automatically discover trending topics in your industry
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-white" fill="currentColor" />
              </div>
              <h3 className="text-xl font-semibold text-tron-text mb-2">
                AI Cascade™ Generation
              </h3>
              <p className="text-tron-text-muted">
                See AI transform topics into Twitter threads, LinkedIn posts, and emails
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PlayCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-tron-text mb-2">
                OmniFormat™ Publishing
              </h3>
              <p className="text-tron-text-muted">
                Watch content get formatted and scheduled across all your channels
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}