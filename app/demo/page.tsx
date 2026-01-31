"use client";

import Link from "next/link";
import { ArrowRight, Play, Info, Heart, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white bg-grid flex flex-col font-sans selection:bg-black selection:text-white text-black">
      {/* Local Structural Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-black bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center group gap-3">
            <div className="w-10 h-10 border border-black flex items-center justify-center font-bold text-xl tracking-tighter group-hover:bg-black group-hover:text-white transition-all">
              3K
            </div>
            <span className="text-xl font-bold tracking-tight uppercase">XELORA</span>
          </Link>

          <div className="flex items-center gap-8">
            <Link href="/" className="text-sm font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
              Platform
            </Link>
            <Link href="/signup">
               <button className="px-6 py-2 border border-black bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                 Get Started
               </button>
            </Link>
          </div>
        </div>
      </nav>
      
      <main className="flex-1 pt-40 pb-32 relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Header Section - Architectural Header */}
          <div className="mb-20 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 px-3 py-1 border border-black text-[10px] uppercase tracking-[0.3em] font-bold"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-black"></span>
              </span>
              Technical Documentation // v2.0
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9]"
            >
              DECODE THE <br />
              <span className="opacity-40 uppercase">Viral DNA.</span>
            </motion.h1 >
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 pt-8">
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-black/70 max-w-xl font-medium leading-relaxed"
              >
                High-momentum signals are no longer an accident. We decompose digital virality into structural data points, allowing you to engineer predictable resonance.
              </motion.p>
              <div className="hidden md:block w-32 h-px bg-black"></div>
            </div>
          </div>

          {/* Video Player - Structural Blueprint Frame */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Architectural Border Accents */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-black" />
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-black" />
            
            <div className="relative overflow-hidden border-2 border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)]">
              {/* Technical Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-black text-white">
                <div className="flex space-x-3">
                  <div className="w-3 h-3 border border-white/40" />
                  <div className="w-3 h-3 border border-white/40" />
                  <div className="w-3 h-3 border border-white/40" />
                </div>
                <div className="text-[10px] uppercase tracking-[0.4em] font-bold">
                  SIGNAL_DECONSTRUCTION_FEED // 001
                </div>
                <div className="text-[10px] font-mono">REC ● 00:60:00</div>
              </div>
              
              {/* Video Content */}
              <div className="aspect-video bg-zinc-100 relative group cursor-pointer">
                <video
                  controls
                  autoPlay
                  muted
                  loop
                  className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                  poster="/demo-thumbnail.jpg"
                >
                  <source src="/Xdemo/Xelora_demo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* HUD Overlay Subtle effect */}
                <div className="absolute inset-0 pointer-events-none border border-black/5 z-20" />
              </div>
            </div>
          </motion.div>

          {/* Feature Breakdown - Vector Grid */}
          <div className="mt-32">
            <div className="inline-flex items-center px-3 py-1 border border-black mb-12">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Decomposition Matrix</span>
            </div>
            
            <div className="flex flex-wrap justify-center overflow-hidden border-t border-l border-black">
              {[
                {
                  id: "01",
                  title: "The Hook",
                  description: "Immediate signal capture through pattern disruption. Engineering the first 2 seconds for maximum retention.",
                  tags: ["Contrarian", "Outcome", "Fear", "Curiosity"],
                  icon: "Pattern disruption"
                },
                {
                  id: "02",
                  title: "The Emotion",
                  description: "Neuro-chemical resonance engineered for sharing. Moving from passive consumption to active advocacy.",
                  tags: ["Awe", "Anger", "Value", "Identity"],
                  icon: "Neural resonance"
                },
                {
                  id: "03",
                  title: "The Value",
                  description: "Information arbitrage that builds status and trust. Creating a tangible 'Information ROI' for the user.",
                  tags: ["Utility", "Status", "Time", "Wealth"],
                  icon: "Data arbitrage"
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="w-full md:w-1/3 p-12 bg-white border-r border-b border-black group hover:bg-black hover:text-white transition-all duration-500"
                >
                  <div className="flex justify-between items-start mb-12">
                    <div className="text-4xl font-bold tracking-tighter opacity-10 group-hover:opacity-20 transition-opacity">{item.id}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest border border-black group-hover:border-white/20 px-2 py-1">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-6 uppercase tracking-tight">{item.title}</h3>
                  <p className="text-sm opacity-70 mb-10 leading-relaxed font-medium">{item.description}</p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="text-[9px] uppercase tracking-widest px-2 py-1 border border-black/10 group-hover:border-white/10 font-bold opacity-60">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Section - Structural Block */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-40 pt-20 border-t-2 border-black flex flex-col md:flex-row items-center justify-between gap-12"
          >
            <div className="max-w-2xl text-center md:text-left">
              <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
                READY TO <br />
                <span className="opacity-40 uppercase">Initialize?</span>
              </h2>
              <p className="text-black/60 font-medium uppercase tracking-[0.2em] text-xs">
                Systems online. Data channels established. Proceed to deployment.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/signup">
                <button className="h-16 px-12 bg-black text-white hover:bg-white hover:text-black border border-black transition-all font-bold uppercase tracking-[0.3em] text-sm">
                  Initialize Analysis
                </button>
              </Link>
              <Link href="/">
                <button className="h-16 px-12 border border-black hover:bg-black hover:text-white transition-all font-bold uppercase tracking-[0.3em] text-sm">
                  Structural Docs
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      
      {/* Structural Footer */}
      <footer className="bg-white border-t border-black py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-black flex items-center justify-center font-bold text-xs">3K</div>
              <span className="text-xl font-bold uppercase tracking-tighter">3KPRO.SYSTEMS</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-12">
               <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">© DATA_UNIT_{new Date().getFullYear()}</p>
               <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">TULSA // OK // USA // SECURE_NODE</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
