"use client";

import { motion } from "framer-motion";
import { MagicWand, Brain, TrendUp as TrendingUp, ArrowRight, Play, Users, ChartBar as BarChart3, TwitterLogo as Twitter, LinkedinLogo as Linkedin, InstagramLogo as Instagram, VideoCamera as Video } from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";

export default function ModernBentoHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-coral-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
          
          {/* LEFT COLUMN: Main Copy (Span 7) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 flex flex-col justify-center text-left"
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full w-fit mb-6 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-coral-500"></span>
              </span>
              <span className="text-xs font-medium text-coral-300 tracking-wide uppercase">v2.0 Now Live</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
              Predict Viral <br />
              <span className="text-gradient-accent">Before You Post</span>
            </h1>

            <p className="text-lg text-gray-400 mb-8 max-w-xl leading-relaxed">
              Stop guessing. XELORA's Viral Score™ is trained on <span className="text-white font-semibold">10,000+ proven viral posts</span> from Reddit, analyzing patterns that actually went viral—not just trending.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="btn-primary flex items-center gap-2 group">
                Start Creating Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" weight="duotone" />
              </Link>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="btn-secondary flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" weight="duotone" />
                Watch Demo
              </button>
            </div>

            {/* Mini Social Proof */}
            <div className="mt-10 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0a0f] bg-gray-800 overflow-hidden relative">
                     <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" fill />
                  </div>
                ))}
              </div>
              <p>Trusted by <span className="text-white font-medium">1,000+</span> creators</p>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Bento Grid Visuals (Span 5) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4 h-full min-h-[500px]">
            
            {/* Card 1: Viral Score Demo (Large Vertical) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="col-span-2 glass-panel p-6 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <MagicWand className="w-6 h-6 text-coral-400" weight="duotone" />
              </div>
              <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Viral Prediction</h3>
              
              {/* Mock UI */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-2 w-24 bg-gray-700 rounded-full"></div>
                    <div className="h-2 w-16 bg-gray-800 rounded-full"></div>
                  </div>
                  <div className="text-2xl font-bold text-green-400">92/100</div>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "92%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-full"
                  />
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    <span className="text-green-400 font-semibold">Proven Pattern:</span> Matches 847 viral posts from r/entrepreneur. Hook structure has 12x avg engagement.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Analytics (Small Square) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-panel p-5 flex flex-col justify-between group hover:border-blue-500/30 transition-colors"
            >
              <BarChart3 className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" weight="duotone" />
              <div>
                <div className="text-2xl font-bold text-white">2.4M</div>
                <div className="text-xs text-gray-400">Views Tracked</div>
              </div>
            </motion.div>

            {/* Card 3: Speed (Small Square) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-panel p-5 flex flex-col justify-between group hover:border-yellow-500/30 transition-colors"
            >
              <Brain className="w-8 h-8 text-yellow-400 mb-2 group-hover:scale-110 transition-transform" weight="duotone" />
              <div>
                <div className="text-2xl font-bold text-white">10x</div>
                <div className="text-xs text-gray-400">Faster Workflow</div>
              </div>
            </motion.div>

            {/* Card 4: Platform Integration (Wide Bottom) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="col-span-2 glass-panel p-5 flex items-center justify-between"
            >
              <div className="flex -space-x-3">
                 {[
                   { Icon: Twitter, color: "text-blue-400" },
                   { Icon: Linkedin, color: "text-blue-600" },
                   { Icon: Instagram, color: "text-pink-500" },
                   { Icon: Video, color: "text-white" }
                 ].map(({ Icon, color }, i) => (
                   <div key={i} className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center z-10 hover:z-20 hover:scale-110 transition-all">
                     <Icon className={`w-5 h-5 ${color}`} weight="duotone" />
                   </div>
                 ))}
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">Multi-Platform</div>
                <div className="text-xs text-gray-400">Auto-Publishing</div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
