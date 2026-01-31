"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Brain, Lightning as Zap, Target, CurrencyDollar as DollarSign } from "@phosphor-icons/react";
import { BGPattern } from "@/components/ui/bg-pattern";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { OrbitalLoader } from "@/components/ui/orbital-loader";

const AI_PROVIDERS = [
  { name: "OpenAI", logo: "/brands/openai.png" },
  { name: "Anthropic", logo: "/brands/anthropic.png" },
  { name: "Google", logo: "/brands/google.png" },
  { name: "Meta", logo: "/brands/meta.png" },
  { name: "Mistral", logo: "/brands/mistral.png" },
  { name: "Cohere", logo: "/brands/cohere.png" },
  { name: "Groq", logo: "/brands/groq.png" },
  { name: "Perplexity", logo: "/brands/perplexity.png" },
];

const FEATURES = [
  { icon: Zap, title: "Multi-Model", desc: "Best AI for each task" },
  { icon: Target, title: "Smart Routing", desc: "Auto-select by prompt" },
  { icon: DollarSign, title: "Cost Control", desc: "Track & optimize spend" },
];

export default function ReactorPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
     return (
       <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
         <BGPattern
             variant="dots"
             mask="fade-center"
             size={24}
             fill="rgba(255,255,255,0.15)"
             className="absolute inset-0 z-0 h-full w-full opacity-100"
             style={{ zIndex: 0 }}
         />
         <div className="text-center relative z-10">
            <OrbitalLoader className="w-10 h-10 text-coral-500 mx-auto" />
           <p className="text-gray-500 mt-4">Loading Reactor...</p>
         </div>
       </div>
     );
   }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden flex flex-col items-center justify-center px-4">
      {/* Background */}
      <BGPattern
        variant="dots"
        mask="fade-center"
        size={24}
        fill="rgba(255,255,255,0.1)"
        className="absolute inset-0 z-0"
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated Brain Icon */}
          <Brain
            className="w-20 h-20 mx-auto mb-6 text-coral-400 animate-pulse"
            weight="duotone"
          />

          {/* Title */}
          <h1 className="text-6xl md:text-7xl font-bold mb-4">
            <span className="bg-gradient-to-r from-coral-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Reactor
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-2xl text-gray-300 mb-6">
            50+ AI Models. One Interface.
          </p>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-coral-500/10 border border-coral-500/30 rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-coral-500"></span>
            </span>
            <span className="text-coral-300 font-medium">Coming Soon</span>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-16">
            The AI orchestration layer for creators. Mix and match providers for optimal results, speed, and cost.
          </p>
        </motion.div>

        {/* Provider Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-6">
            Powered by leading AI providers
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {AI_PROVIDERS.map((provider) => (
              <div
                key={provider.name}
                className="relative w-10 h-10 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <Image
                  src={provider.logo}
                  alt={provider.name}
                  fill
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Feature Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="p-6 bg-white/5 border border-white/10 rounded-xl"
            >
              <feature.icon className="w-8 h-8 text-coral-400 mb-3 mx-auto" weight="duotone" />
              <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Footer Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-gray-500 text-sm italic"
        >
          "Unlimited creativity. Controlled cost."
        </motion.p>
      </div>
    </div>
  );
}
