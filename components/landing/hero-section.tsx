"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Terminal as TerminalIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  const [typedText, setTypedText] = useState("");
  const command = 'xelora analyze --topic "Signal Momentum"';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= command.length) {
        setTypedText(command.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 pt-24 overflow-hidden bg-white bg-dots-xelora">
      <div className="z-10 flex flex-col items-center max-w-5xl text-center space-y-12">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
        >
            <div className="inline-flex items-center gap-3 px-3 py-1 border border-black mb-4 text-[10px] uppercase tracking-[0.3em] font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-black"></span>
              </span>
              Architectural Intelligence Unit
            </div>
            
            <h1 className="text-6xl md:text-9xl font-bold tracking-tighter leading-[0.85] uppercase">
              PREDICT VIRAL <br />
              <span className="opacity-40">MOMENTUM.</span>
            </h1>
        </motion.div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 max-w-4xl w-full">
          <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-black/60 max-w-xl text-left font-medium uppercase tracking-widest leading-relaxed"
          >
            The predictive intelligence layer for creators. Stop guessing. Start engineering resonance.
          </motion.p>
          <div className="hidden md:block w-32 h-px bg-black"></div>
        </div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 w-full justify-start"
        >
          <Link href="/signup">
             <button className="h-16 px-12 bg-black text-white hover:bg-white hover:text-black border border-black transition-all font-bold uppercase tracking-[0.3em] text-xs">
               Initialize Analysis <ArrowRight className="ml-3 h-4 w-4 inline-block" />
             </button>
          </Link>
          <Link href="/demo">
             <button className="h-16 px-12 border border-black hover:bg-black hover:text-white transition-all font-bold uppercase tracking-[0.3em] text-xs">
               Watch Demo
             </button>
          </Link>
        </motion.div>

        {/* Mock Terminal - Structural Style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-3xl mt-20 border-2 border-black bg-white shadow-[30px_30px_0px_0px_rgba(0,0,0,0.05)] overflow-hidden font-mono text-sm group"
        >
          <div className="flex items-center px-6 py-4 border-b-2 border-black bg-black text-white">
            <div className="flex space-x-3">
              <div className="w-3 h-3 border border-white/40" />
              <div className="w-3 h-3 border border-white/40" />
              <div className="w-3 h-3 border border-white/40" />
            </div>
            <div className="ml-6 text-[10px] uppercase tracking-[0.4em] font-bold">
              XELORA_CORE_PROCESSOR // v1.0.4
            </div>
          </div>
          <div className="p-8 text-left space-y-3 h-[240px] overflow-hidden relative font-medium text-black">
            <div className="flex items-center overflow-hidden">
              <span className="mr-3 opacity-40">➜</span>
              <span className="tracking-tight">{typedText}</span>
              <span className="animate-pulse ml-1">_</span>
            </div>
            {typedText === command && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-2 pt-4"
              >
                <div className="text-black/40 text-xs font-bold uppercase tracking-widest">Analyzing topic signals...</div>
                <div className="text-black opacity-60 text-xs font-bold uppercase tracking-widest">Scanning 12M+ data points across 6 structural nodes.</div>
                
                <div className="mt-8 p-6 border border-black bg-black text-white flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-1.5 h-1.5 bg-white rotate-45"></div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.3em] font-bold opacity-60 mb-1">Momentum Index</div>
                      <div className="text-3xl font-bold tracking-tighter uppercase">98/100</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">Status</div>
                    <div className="text-xs font-bold uppercase text-green-400">High Resolution</div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Soft gradient at bottom */}
             <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
