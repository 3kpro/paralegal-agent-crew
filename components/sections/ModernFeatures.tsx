"use client";

import { motion } from "framer-motion";
import {
  TrendUp as TrendingUp,
  Sparkle as Sparkles,
  Layout,
  Clock,
  Shield,
  ChartBar as BarChart3,
} from "@phosphor-icons/react";
import { BGPattern } from "@/components/ui/bg-pattern";

const features = [
  {
    icon: TrendingUp,
    title: "Viral Score™ + Viral DNA™",
    subtitle: "Predictive Viral Analysis",
    description:
      "We don't just tell you what's trending—we tell you WHY. Our AI decodes the Viral DNA™ of every topic: the Hook (how it grabs attention), the Emotion (what it triggers), and the Value (what readers gain). Stop guessing. Start engineering virality.",
    gradient: "from-emerald-500 to-teal-500",
    status: "available" as const,
  },
  {
    icon: Sparkles,
    title: "Multi-Platform Content Generation",
    subtitle: "Platform-Optimized Writing",
    description:
      "Generate perfectly optimized content for Twitter, LinkedIn, Facebook, Instagram, TikTok, and Reddit. Each platform gets unique copy tailored to its character limits, tone, and audience expectations.",
    gradient: "from-purple-500 to-pink-500",
    status: "available" as const,
  },
  {
    icon: Layout,
    title: "Discovery + Validate Workflow",
    subtitle: "Data-Driven Content Strategy",
    description:
      "Browse real-time trending topics with search volume data, or validate your own content ideas with our Viral Score algorithm. Make confident decisions backed by predictive intelligence.",
    gradient: "from-orange-500 to-red-500",
    status: "available" as const,
  },
];

export default function ModernFeatures() {
  return (
    <section
      id="features"
      className="py-24 bg-background relative overflow-hidden border-t border-border"
    >
      {/* Background Pattern */}
      <BGPattern
        variant="grid"
        mask="fade-edges"
        size={24}
        fill="rgba(0,0,0,0.05)"
        className="z-0"
        style={{ zIndex: 0 }}
      />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-foreground uppercase tracking-tighter">
            Architect for <span className="text-muted-foreground">Attention.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Moving beyond generic AI generation to precise content engineering.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const statusConfig = {
              available: {
                label: "✓ Available Now",
                bgColor: "bg-green-500/10",
                borderColor: "border-green-500/30",
                textColor: "text-green-400",
                dotColor: "bg-green-500"
              },
              beta: {
                label: "Beta Access",
                bgColor: "bg-blue-500/10",
                borderColor: "border-blue-500/30",
                textColor: "text-blue-400",
                dotColor: "bg-blue-500"
              },
              "coming-soon": {
                label: "Coming Soon",
                bgColor: "bg-gray-700/30",
                borderColor: "border-gray-600/40",
                textColor: "text-gray-400",
                dotColor: "bg-gray-500"
              },
            };
            const status = statusConfig[feature.status];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="h-full bg-card rounded-none p-8 shadow-sm transition-all duration-300 border border-border hover:border-foreground flex flex-col">
                  {/* Icon and Status Badge Row */}
                  <div className="flex items-start justify-between mb-8">
                    <div
                      className={`inline-flex p-3 rounded-none bg-foreground shadow-sm group-hover:bg-muted transition-colors duration-300`}
                    >
                      <Icon className="w-6 h-6 text-background" weight="duotone" />
                    </div>

                    {/* Status Badge */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-none border border-border bg-muted`}>
                      <div className={`w-1.5 h-1.5 rounded-full bg-foreground`}></div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest text-foreground`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-2 text-foreground uppercase tracking-tight">
                    {feature.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">
                    {feature.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed flex-grow font-medium">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-20"
        >
          <p className="text-muted-foreground mb-8 text-lg font-medium">
            Ready to experience the future of content engineering?
          </p>
          <div className="flex flex-col items-center gap-4">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 px-12 py-5 bg-foreground text-background font-bold text-lg border-2 border-foreground hover:bg-background hover:text-foreground transition-all duration-200 uppercase tracking-tighter"
            >
              <Sparkles className="w-5 h-5" weight="bold" />
              Access the Protocol
            </a>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Limited slots available for Beta
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
