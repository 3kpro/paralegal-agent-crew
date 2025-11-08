"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Brain,
  Wand2,
  Settings,
  Play,
  Zap,
  Sparkles,
  Rocket,
  Target,
  TrendingUp,
  Shield,
  Clock,
  DollarSign,
  Loader2,
  Star,
  Check,
  ArrowRight,
} from "lucide-react";

interface AIProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  models: string[];
  speed: "ultra-fast" | "fast" | "balanced" | "quality";
  costRating: 1 | 2 | 3 | 4 | 5;
  specialty: string;
  available: boolean;
}

const providers: AIProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "Industry-leading models for creative and analytical tasks",
    icon: "⚡",
    models: ["GPT-4 Turbo", "GPT-4", "GPT-3.5 Turbo"],
    speed: "balanced",
    costRating: 4,
    specialty: "General Purpose Excellence",
    available: true,
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    description: "Advanced reasoning with extended context windows",
    icon: "🧠",
    models: ["Claude 3 Opus", "Claude 3 Sonnet", "Claude 3 Haiku"],
    speed: "balanced",
    costRating: 4,
    specialty: "Long-form Content & Analysis",
    available: true,
  },
  {
    id: "google",
    name: "Google Gemini",
    description: "Multimodal AI with exceptional reasoning capabilities",
    icon: "✨",
    models: ["Gemini Pro", "Gemini Ultra", "Gemini Flash"],
    speed: "fast",
    costRating: 3,
    specialty: "Multimodal & Research",
    available: true,
  },
  {
    id: "meta",
    name: "Meta Llama",
    description: "Open-source powerhouse for custom deployments",
    icon: "🦙",
    models: ["Llama 3 70B", "Llama 3 8B", "Llama 2"],
    speed: "fast",
    costRating: 2,
    specialty: "Cost-Effective Scale",
    available: true,
  },
  {
    id: "mistral",
    name: "Mistral AI",
    description: "European excellence in open and proprietary models",
    icon: "🌊",
    models: ["Mistral Large", "Mistral Medium", "Mixtral 8x7B"],
    speed: "fast",
    costRating: 2,
    specialty: "Multilingual & Efficient",
    available: true,
  },
  {
    id: "cohere",
    name: "Cohere",
    description: "Enterprise-grade NLP for business applications",
    icon: "🎯",
    models: ["Command R+", "Command R", "Command"],
    speed: "balanced",
    costRating: 3,
    specialty: "Enterprise Search & RAG",
    available: true,
  },
  {
    id: "groq",
    name: "Groq",
    description: "Lightning-fast inference with LPU technology",
    icon: "⚡",
    models: ["Llama 3 on Groq", "Mixtral on Groq"],
    speed: "ultra-fast",
    costRating: 2,
    specialty: "Real-time Generation",
    available: true,
  },
  {
    id: "perplexity",
    name: "Perplexity",
    description: "Search-augmented generation with citations",
    icon: "🔍",
    models: ["Perplexity Online", "Perplexity Chat"],
    speed: "balanced",
    costRating: 3,
    specialty: "Research & Fact-Checking",
    available: true,
  },
];

export default function AIStudioPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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

  function toggleProvider(providerId: string) {
    setSelectedProviders((prev) =>
      prev.includes(providerId)
        ? prev.filter((id) => id !== providerId)
        : [...prev, providerId]
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-tron-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-tron-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-tron-text-muted">Loading AI Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tron-dark p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Early Access Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 via-tron-cyan/10 to-tron-magenta/10 border-2 border-purple-500/30 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚀</span>
              <div>
                <h3 className="text-purple-300 font-bold text-lg">Coming Soon: AI Orchestration Powerhouse</h3>
                <p className="text-purple-200/80 text-sm">
                  Access 50+ AI models through one powerful interface. Mix and match providers for optimal results, speed, and cost.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-tron-text flex items-center gap-3 mb-3">
                <Brain className="w-10 h-10 text-tron-cyan" />
                AI Studio
                <span className="text-base px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 font-normal">
                  Beta
                </span>
              </h1>
              <p className="text-tron-text-muted text-lg">
                Orchestrate multiple AI providers for unmatched performance
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-tron-cyan">{providers.length}</div>
                <div className="text-xs text-tron-text-muted">AI Providers</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-tron-cyan">50+</div>
                <div className="text-xs text-tron-text-muted">Models</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: Zap, label: "Multi-Provider", desc: "Best model for each task" },
            { icon: TrendingUp, label: "Auto-Optimize", desc: "Smart routing & fallbacks" },
            { icon: DollarSign, label: "Cost Control", desc: "Balance quality & budget" },
            { icon: Shield, label: "Reliable", desc: "99.9% uptime guarantee" },
          ].map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-4"
            >
              <feature.icon className="w-6 h-6 text-tron-cyan mb-2" />
              <div className="font-semibold text-tron-text text-sm">{feature.label}</div>
              <div className="text-xs text-tron-text-muted mt-1">{feature.desc}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* AI Providers Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-tron-text mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-tron-cyan" />
            Available AI Providers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {providers.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                onClick={() => toggleProvider(provider.id)}
                className={`relative group cursor-pointer bg-tron-grid border-2 rounded-xl p-5 transition-all duration-300 hover:scale-105 ${
                  selectedProviders.includes(provider.id)
                    ? "border-tron-cyan shadow-xl shadow-tron-cyan/20"
                    : "border-tron-cyan/30 hover:border-tron-cyan/50"
                }`}
              >
                {/* Selection Indicator */}
                {selectedProviders.includes(provider.id) && (
                  <div className="absolute top-3 right-3 bg-tron-cyan text-tron-dark rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                )}

                {/* Provider Icon */}
                <div className="text-5xl mb-3">{provider.icon}</div>

                {/* Provider Name */}
                <h3 className="font-bold text-tron-text text-lg mb-2">
                  {provider.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-tron-text-muted mb-3 min-h-[2.5rem]">
                  {provider.description}
                </p>

                {/* Specialty */}
                <div className="bg-tron-cyan/10 border border-tron-cyan/30 rounded-lg px-2 py-1 mb-3">
                  <p className="text-xs text-tron-cyan font-medium">
                    {provider.specialty}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-tron-text-muted mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{provider.speed}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>{"$".repeat(provider.costRating)}</span>
                  </div>
                </div>

                {/* Models */}
                <div className="border-t border-tron-cyan/20 pt-3">
                  <p className="text-xs text-tron-text-muted mb-2">Models:</p>
                  <div className="flex flex-wrap gap-1">
                    {provider.models.slice(0, 2).map((model) => (
                      <span
                        key={model}
                        className="text-[10px] px-2 py-0.5 bg-tron-dark/50 text-tron-cyan rounded"
                      >
                        {model}
                      </span>
                    ))}
                    {provider.models.length > 2 && (
                      <span className="text-[10px] px-2 py-0.5 bg-tron-dark/50 text-tron-text-muted rounded">
                        +{provider.models.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-tron-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Prompt Generator Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-tron-grid border border-tron-cyan/30 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-tron-text mb-4 flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-tron-cyan" />
            Prompt Input
          </h2>

          <textarea
            value={currentPrompt}
            onChange={(e) => setCurrentPrompt(e.target.value)}
            placeholder="Enter your prompt here... Use templates or write custom prompts for content generation."
            rows={6}
            className="w-full p-4 bg-tron-dark border border-tron-cyan/30 rounded-lg text-tron-text placeholder:text-tron-text-muted focus:border-tron-cyan focus:outline-none resize-none mb-4"
          />

          <div className="flex items-center justify-between">
            <div className="text-sm text-tron-text-muted">
              {selectedProviders.length > 0 ? (
                <span className="text-tron-cyan">
                  {selectedProviders.length} provider{selectedProviders.length > 1 ? "s" : ""} selected
                </span>
              ) : (
                "Select providers above to get started"
              )}
            </div>
            <button
              disabled={true}
              className="bg-gradient-to-r from-tron-cyan to-tron-magenta hover:opacity-90 text-white px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2 cursor-not-allowed opacity-60"
            >
              <Rocket className="w-5 h-5" />
              Generate (Coming Soon)
            </button>
          </div>
        </motion.div>

        {/* Coming Soon Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              title: "Smart Routing",
              desc: "Automatically select the best model based on your prompt complexity, speed needs, and budget",
              icon: Target,
            },
            {
              title: "A/B Testing",
              desc: "Compare outputs from multiple providers side-by-side to find the best results",
              icon: TrendingUp,
            },
            {
              title: "Cost Analytics",
              desc: "Track usage, optimize spending, and get insights on provider performance vs. cost",
              icon: BarChart,
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + index * 0.1 }}
              className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6"
            >
              <feature.icon className="w-8 h-8 text-tron-cyan mb-3" />
              <h3 className="font-bold text-tron-text mb-2">{feature.title}</h3>
              <p className="text-sm text-tron-text-muted">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// Import BarChart separately to avoid the unused import issue
import { BarChart3 as BarChart } from "lucide-react";
