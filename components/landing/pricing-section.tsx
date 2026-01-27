"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: { monthly: 29, yearly: 290 },
    features: ["5 Analyze Credits/mo", "Basic Viral Score", "1 Platform", "Community Support"],
    popular: false
  },
  {
    name: "Pro",
    price: { monthly: 79, yearly: 790 },
    features: ["50 Analyze Credits/mo", "Deep DNA Analysis", "All 6 Platforms", "Priority Support", "Trend Alerts"],
    popular: true
  },
  {
    name: "Agency",
    price: { monthly: 199, yearly: 1990 },
    features: ["Unlimited Credits", "White-label Reports", "API Access", "Dedicated Success Mgr", "Team Seats (5)"],
    popular: false
  }
];

export function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <section className="py-32 border-t border-black bg-grid" id="pricing">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-3 py-1 border border-black mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Allocation Matrix</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-8">SYSTEM <br/> ACCESS.</h2>
            <p className="text-lg text-black/60 font-medium leading-relaxed uppercase tracking-widest">Structural flat-rate indices for multi-platform intelligence.</p>
          </div>
          
          <div className="flex items-center gap-2 p-1 border border-black bg-white mb-2">
            <button 
              onClick={() => setBilling("monthly")}
              className={cn(
                "px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                billing === "monthly" ? "bg-black text-white" : "text-black/40 hover:text-black"
              )}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBilling("yearly")}
              className={cn(
                "px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                billing === "yearly" ? "bg-black text-white" : "text-black/40 hover:text-black"
              )}
            >
              Yearly
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black border border-black overflow-hidden shadow-[30px_30px_0px_0px_rgba(0,0,0,0.05)]">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "relative p-12 bg-white flex flex-col group",
                plan.popular && "z-10 bg-zinc-50/50"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 w-full h-1 bg-black" />
              )}
              
              <div className="mb-12">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-4">
                  {plan.popular ? "Primary Selection" : "Standard Allocation"}
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tighter mb-6">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tighter">
                    ${billing === "monthly" ? plan.price.monthly : plan.price.yearly / 12}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-tighter opacity-40">/mo</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-2">
                   {billing === "yearly" ? "Billed annually // 20% discount applied" : "Standard monthly frequency"}
                </p>
              </div>
              
              <div className="space-y-4 mb-20 flex-grow">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center text-[10px] font-bold uppercase tracking-widest opacity-60">
                    <div className="w-1 h-1 bg-black mr-4" />
                    {feature}
                  </div>
                ))}
              </div>
              
              <button 
                className={cn(
                  "w-full py-6 text-[10px] font-bold uppercase tracking-[0.3em] transition-all border border-black",
                  plan.popular ? "bg-black text-white hover:bg-black/90" : "bg-white text-black hover:bg-black hover:text-white"
                )}
              >
                Initialize Protocol
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
