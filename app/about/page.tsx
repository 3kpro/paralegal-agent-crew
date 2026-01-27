import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About XELORA | A Product of 3KPRO.SERVICES",
  description:
    "XELORA is an AI-powered predictive intelligence platform for content creators, developed by 3KPRO.SERVICES, a Tulsa-based SaaS and web development company.",
  openGraph: {
    title: "About XELORA | A Product of 3KPRO.SERVICES",
    description:
      "XELORA is an AI-powered predictive intelligence platform for content creators, developed by 3KPRO.SERVICES.",
    url: "https://getxelora.com/about",
  },
  alternates: {
    canonical: "https://getxelora.com/about",
  },
};

"use client";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Info, Globe, Shield, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      <Navigation />
      
      <main className="flex-1 pt-32 pb-20 relative overflow-hidden">
        {/* Background with Grid Pattern */}
        <div 
          className="absolute inset-0 z-0 bg-grid-pattern opacity-10" 
          style={{ maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)" }} 
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-12"
          >
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground uppercase tracking-tighter">
                About <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">XELORA.</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                The predictive intelligence layer for creators. Engineered for momentum.
              </p>
            </div>

            <section className="space-y-6">
              <div className="p-8 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-foreground mb-6 uppercase tracking-tight">A Product of 3KPRO.SERVICES</h2>
                <p className="text-muted-foreground leading-relaxed mb-8 font-medium">
                  XELORA is developed and maintained by{" "}
                  <a
                    href="https://3kpro.services"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline underline-offset-8 decoration-white/20 hover:decoration-white transition-all font-bold"
                  >
                    3KPRO.SERVICES
                  </a>
                  , a professional IT solutions company based in Tulsa, Oklahoma. We specialize in SaaS development, precision digital infrastructure, and AI-powered business tools.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["SaaS Development", "IT Consulting", "Signal Engineering"].map(tag => (
                    <div key={tag} className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[9px] uppercase tracking-widest font-bold text-muted-foreground">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Predict Momentum",
                  description: "Viral Score™ algorithm analyzes millions of signals to predict performance with high accuracy.",
                  icon: Zap
                },
                {
                  title: "Engineer Virality",
                  description: "Platform-optimized content generation for the modern social stack.",
                  icon: Shield
                },
                {
                  title: "Real-Time Signals",
                  description: "Track emerging trends before they peak, giving you first-mover advantage.",
                  icon: Globe
                },
                {
                  title: "Professional Grade",
                  description: "Built on enterprise-standard infrastructure for high-scale content operations.",
                  icon: Info
                }
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all group">
                  <item.icon className="w-8 h-8 text-white mb-6 opacity-40 group-hover:opacity-80 transition-opacity" />
                  <h3 className="text-lg font-bold text-foreground mb-3 uppercase tracking-tight">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">{item.description}</p>
                </div>
              ))}
            </section>

            <section className="space-y-6 border-t border-white/10 pt-16">
              <h2 className="text-3xl font-bold text-foreground uppercase tracking-tight">The Vision</h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                We believe that success in content creation shouldn't be left to chance. By leveraging predictive analytics and structural intelligence, we're building tools that give creators the insights they need to dominate the digital landscape.
              </p>
            </section>

            <section className="p-10 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
              <h2 className="text-2xl font-bold text-foreground mb-8 uppercase tracking-tight">Technical Interface</h2>
              <div className="grid md:grid-cols-2 gap-10 text-sm">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-3 opacity-60">Primary Channel</div>
                  <a href="mailto:info@3kpro.services" className="text-lg text-foreground hover:opacity-80 transition-opacity font-bold">info@3kpro.services</a>
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-3 opacity-60">Geographic Node</div>
                  <div className="text-lg text-foreground font-bold">Tulsa // Oklahoma // USA</div>
                </div>
              </div>
            </section>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

