"use client";

import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, RadarProps } from "recharts";
import { TiktokLogo, XLogo, LinkedinLogo, InstagramLogo, YoutubeLogo, RedditLogo } from "@phosphor-icons/react";
import React from "react";

const radarData = [
  { subject: 'Emotion', A: 95, fullMark: 100 },
  { subject: 'Hook', A: 98, fullMark: 100 },
  { subject: 'Value', A: 86, fullMark: 100 },
  { subject: 'Story', A: 92, fullMark: 100 },
  { subject: 'Visual', A: 85, fullMark: 100 },
  { subject: 'Timing', A: 75, fullMark: 100 },
];

const trendingTopics = [
  { id: 1, name: "SaaS Pricing Models", score: 98 },
  { id: 2, name: "Remote Work 2.0", score: 94 },
  { id: 3, name: "AI Agents", score: 92 },
  { id: 4, name: "Minimalist Design", score: 89 },
  { id: 5, name: "React 19", score: 88 },
];

export function BentoGrid() {
  return (
    <section className="py-24 border-t border-black bg-white" id="services">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-3 py-1 border border-black mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Decomposition Matrix</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-8">SIGNAL <br/> ANALYTICS.</h2>
            <p className="text-lg text-black/60 font-medium leading-relaxed uppercase tracking-widest">Structural deconstruction of digital momentum across all active frequencies.</p>
          </div>
          <div className="hidden md:block w-32 h-px bg-black"></div>
        </div>

        <div className="flex flex-wrap justify-center overflow-hidden border-t border-l border-black">
          {/* Card 1: Viral DNA Decoder (Large Left) */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-2/3 p-12 md:p-16 bg-white border-r border-b border-black group hover:bg-black hover:text-white transition-all duration-700 relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="mb-12">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-4 group-hover:opacity-60">System Module // 01</div>
                <h3 className="text-3xl font-bold text-black group-hover:text-white uppercase tracking-tight mb-4">Viral DNA Decoder</h3>
                <p className="text-sm opacity-60 font-medium uppercase tracking-widest leading-relaxed max-w-md">Psychometric analysis of content potential through recursive signal processing.</p>
              </div>
              
              <div className="flex-1 w-full h-[350px] flex items-center justify-center relative border border-black/10 group-hover:border-white/10 bg-black/[0.01] group-hover:bg-white/[0.02]">
                 <ResponsiveContainer width="100%" height="100%">
                   <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                     <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
                     <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fillOpacity: 0.4, fontSize: 10, fontWeight: 700 }} />
                     <Radar
                       name="Viral Potential"
                       dataKey="A"
                       stroke="currentColor"
                       strokeWidth={2}
                       fill="currentColor"
                       fillOpacity={0.1}
                     />
                   </RadarChart>
                 </ResponsiveContainer>
                 <div className="absolute top-6 right-6 border border-black group-hover:border-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                    Score: 95/100
                 </div>
              </div>
            </div>
          </motion.div>

          <div className="w-full lg:w-1/3 flex flex-col">
            {/* Card 2: Multi-Platform (Top Right) */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-12 bg-white border-r border-b border-black flex-1 group hover:bg-black hover:text-white transition-all duration-500 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-4 group-hover:opacity-60">Distribution Node // 02</div>
                <h3 className="text-xl font-bold uppercase tracking-tight mb-8">Nodal Distribution</h3>
                
                <div className="grid grid-cols-3 gap-6 opacity-40 group-hover:opacity-100 transition-all duration-700 mt-12">
                  <XLogo size={32} weight="bold" />
                  <LinkedinLogo size={32} weight="bold" />
                  <TiktokLogo size={32} weight="bold" />
                  <InstagramLogo size={32} weight="bold" />
                  <YoutubeLogo size={32} weight="bold" />
                  <RedditLogo size={32} weight="bold" />
                </div>
                
                <p className="mt-12 text-[10px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-60 leading-relaxed">
                  Active synchronization across all structural content nodes.
                </p>
              </div>
            </motion.div>

            {/* Card 3: Real-time Signals (Bottom Right) */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-12 bg-white border-r border-b border-black flex-1 group hover:bg-black hover:text-white transition-all duration-500 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-4 group-hover:opacity-60">Real-time Feed // 03</div>
                <h3 className="text-xl font-bold uppercase mb-8 tracking-tight">Trending Signals</h3>
                <div className="space-y-4">
                  {trendingTopics.map((topic) => (
                    <div key={topic.id} className="flex items-center justify-between p-3 border border-black/5 group-hover:border-white/10 bg-black/[0.01] group-hover:bg-white/[0.05] transition-all">
                      <span className="text-[10px] font-bold uppercase tracking-widest">{topic.name}</span>
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-black group-hover:bg-white animate-pulse" />
                         <span className="text-[10px] font-mono font-bold opacity-60">#{topic.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white group-hover:from-black to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
