"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Brain,
  Zap,
  Sparkles,
  Target,
  TrendingUp,
  Shield,
  Clock,
  DollarSign,
  Star,
  Cpu,
  Wind,
  Search,
  Layers,
  Aperture,
  Image as ImageIcon,
  Video,
  Wand2,
  Palette,
  MessageSquare,
  Rocket,
  BarChart3 as BarChart
} from "lucide-react";

interface AIProvider {
  id: string;
  name: string;
  description: string;
  icon?: any;
  image?: string;
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
    icon: Aperture,
    image: "/brands/openai.png",
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
    icon: Brain,
    image: "/brands/anthropic.png",
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
    icon: Star,
    image: "/brands/google.png",
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
    icon: Layers,
    image: "/brands/meta.png",
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
    icon: Wind,
    image: "/brands/mistral.png",
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
    icon: Target,
    image: "/brands/cohere.png",
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
    icon: Cpu,
    image: "/brands/groq.png",
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
    icon: Search,
    image: "/brands/perplexity.png",
    models: ["Perplexity Online", "Perplexity Chat"],
    speed: "balanced",
    costRating: 3,
    specialty: "Research & Fact-Checking",
    available: true,
  },
];

const AI_CAPABILITIES = [
  {
    title: "Generate Images with Banana Pro",
    description: "Create stunning visuals with DALL-E 3, Midjourney, and Stable Diffusion - all in one place",
    icon: ImageIcon,
    status: "Coming Soon",
    color: "from-purple-500 to-pink-500",
    features: ["Text-to-Image", "Image Editing", "Style Transfer", "Upscaling"]
  },
  {
    title: "Video Gen with Veo 3.0",
    description: "Generate viral TikTok, Reels, and YouTube Shorts scripts with hooks that stop the scroll",
    icon: Video,
    status: "Coming Soon",
    color: "from-blue-500 to-cyan-500",
    features: ["Hook Generator", "Script Templates", "Trending Sounds", "CTA Optimizer"]
  },
  {
    title: "Content Remixer",
    description: "Transform one blog post into 50+ pieces: tweets, reels, carousels, and more",
    icon: Wand2,
    status: "Coming Soon",
    color: "from-orange-500 to-red-500",
    features: ["Multi-Platform", "Auto-Resize", "Voice Matching", "Hashtag AI"]
  },
  {
    title: "AI Gen Prompt Library",
    description: "Access 1000+ proven prompts for every platform and content type",
    icon: MessageSquare,
    status: "Coming Soon",
    color: "from-green-500 to-emerald-500",
    features: ["Viral Templates", "Industry-Specific", "A/B Tested", "Custom Builder"]
  }
];

import { BGPattern } from "@/components/ui/bg-pattern";
// ... imports ...

// ... (providers array)

export default function AIStudioPage() {
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
          <div className="w-8 h-8 border-2 border-tron-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-tron-text-muted">Loading Reactor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 relative overflow-hidden">
        <BGPattern
            variant="dots"
            mask="fade-center"
            size={24}
            fill="rgba(255,255,255,0.15)"
            className="absolute inset-0 z-0 h-full w-full opacity-100"
            style={{ zIndex: 0 }}
        />

        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Brain className="w-24 h-24 text-coral-400 mx-auto mb-6 animate-pulse" />
            <h2 className="text-6xl font-bold bg-gradient-to-r from-coral-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Reactor
            </h2>
            <div className="inline-block px-6 py-3 bg-coral-500/20 border-2 border-coral-500/50 rounded-full mb-6">
              <p className="text-2xl font-semibold text-coral-300">Coming Soon</p>
            </div>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto">
              50+ AI models. One powerful interface. Unlimited creativity.
            </p>
            <p className="text-gray-500 text-sm mt-4">
              We're working hard to bring you the ultimate AI model switching experience
            </p>
          </motion.div>
        </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold text-white flex items-center gap-3 mb-3">
                <Brain className="w-12 h-12 text-coral-400" />
                Reactor
                <span className="text-sm px-3 py-1 bg-coral-500/20 border border-coral-500/30 rounded-full text-coral-300 font-normal">
                  Coming Soon
                </span>
              </h1>
              <p className="text-gray-300 text-xl">
                50+ AI models. One powerful interface. Unlimited creativity.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-6 bg-[#343a40] border border-gray-700/50 rounded-xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-coral-400 to-purple-400 bg-clip-text text-transparent">50+</div>
                <div className="text-xs text-gray-400">AI Models</div>
              </div>
              <div className="w-px h-12 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">8</div>
                <div className="text-xs text-gray-400">Providers</div>
              </div>
              <div className="w-px h-12 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">∞</div>
                <div className="text-xs text-gray-400">Possibilities</div>
              </div>
            </div>
          </div>

          {/* Coming Soon Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 via-coral-500/10 to-blue-500/10 border-2 border-coral-500/30 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <Rocket className="w-8 h-8 text-coral-400" />
              <div>
                <h3 className="text-coral-300 font-bold text-lg">AI Orchestration Powerhouse</h3>
                <p className="text-gray-300 text-sm">
                  Mix and match AI providers for optimal results, speed, and cost. Full rollout Q1 2025.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Feature Showcase - THE HOOK */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Palette className="w-8 h-8 text-coral-400" />
            What You'll Create
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {AI_CAPABILITIES.map((capability, idx) => (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="relative group bg-[#2b2b2b] border-2 border-gray-700/50 hover:border-coral-500/50 rounded-xl p-6 transition-all duration-300 overflow-hidden"
              >
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${capability.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${capability.color}`}>
                        <capability.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{capability.title}</h3>
                        <span className="text-xs px-2 py-1 bg-coral-500/20 border border-coral-500/30 rounded-full text-coral-300">
                          {capability.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4">
                    {capability.description}
                  </p>

                  {/* Feature List */}
                  <div className="grid grid-cols-2 gap-2">
                    {capability.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                        <Sparkles className="w-3 h-3 text-coral-400" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
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
              transition={{ delay: 0.6 + index * 0.1 }}
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
          transition={{ delay: 0.9 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-tron-text mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-tron-cyan" />
            Integrated AI Providers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {providers.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 + index * 0.05 }}
                className="relative group bg-tron-grid border-2 border-tron-cyan/30 hover:border-tron-cyan/50 rounded-xl p-5 transition-all duration-300 hover:scale-105"
              >
                {/* Provider Icon */}
                <div className="mb-3 h-12 flex items-center">
                  {provider.image ? (
                    <div className="relative w-12 h-12">
                      <Image
                        src={provider.image}
                        alt={provider.name}
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <provider.icon className="w-12 h-12 text-tron-cyan" strokeWidth={1.5} />
                  )}
                </div>

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

        {/* Coming Soon Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
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
              transition={{ delay: 1.5 + index * 0.1 }}
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
