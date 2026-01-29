"use client";

import React, { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Brain, Clock, Star } from "@phosphor-icons/react";
import { BGPattern } from "@/components/ui/bg-pattern";

interface StatItem {
  value: string;
  label: string;
  icon: React.ElementType;
  color: string;
  animatedValue?: number;
}

const stats: StatItem[] = [
  {
    value: "87%",
    label: "Viral Prediction Accuracy",
    icon: Brain,
    color: "text-foreground",
    animatedValue: 87,
  },
  {
    value: "6",
    label: "Platform Integrations",
    icon: Brain,
    color: "text-foreground",
    animatedValue: 6,
  },
  {
    value: "<5s",
    label: "Content Generation",
    icon: Clock,
    color: "text-foreground",
    animatedValue: 5,
  },
  {
    value: "24/7",
    label: "AI-Powered Analysis",
    icon: Brain,
    color: "text-foreground",
    animatedValue: 24,
  },
];

const Counter = ({
  target,
  suffix = "",
  prefix = "",
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      const start = 0;
      const end = target;
      const startTime = Date.now();

      const updateCount = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentCount = Math.round(start + (end - start) * easeOut);

        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        }
      };

      updateCount();
    }
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
};

export const StatsSection: React.FC = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden border-y border-border">
      {/* Background Pattern */}
      <BGPattern
        variant="grid"
        mask="fade-center"
        size={24}
        fill="rgba(0,0,0,0.05)"
        className="z-0"
        style={{ zIndex: 0 }}
      />
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50 z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-none mb-6">
            <Star className="w-4 h-4 text-foreground" fill="currentColor" weight="duotone" />
            <span className="text-sm font-bold text-foreground">
              XELORA™ Platform
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 uppercase tracking-tighter">
            Built for Content Creators.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional-grade tools backed by predictive intelligence.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-border">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-12 bg-card border border-border transition-all duration-300 group hover:bg-muted"
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 mx-auto mb-6 flex items-center justify-center border border-border group-hover:bg-background transition-all duration-300`}
                >
                  <Icon className="w-6 h-6 text-foreground" weight="duotone" />
                </div>

                {/* Counter Value */}
                <div
                  className={`text-4xl md:text-6xl font-bold text-foreground mb-3 font-sans tracking-tighter`}
                >
                  {stat.value.includes("%") ? (
                    <>
                      <Counter target={stat.animatedValue || 0} />%
                    </>
                  ) : stat.value.includes("<") ? (
                    <>
                      {"<"}<Counter target={stat.animatedValue || 0} />s
                    </>
                  ) : stat.value.includes("/") ? (
                    <>
                      <Counter target={stat.animatedValue || 0} />/7
                    </>
                  ) : stat.value.includes("+") ? (
                    <>
                      <Counter target={stat.animatedValue || 0} />+
                    </>
                  ) : (
                    <Counter target={stat.animatedValue || 0} />
                  )}
                </div>

                {/* Label */}
                <div className="text-muted-foreground font-bold uppercase text-xs tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto font-medium">
            Start engineering viral momentum with AI-powered trend discovery and
            full campaign orchestration.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              window.location.href = "/signup";
            }}
            className="px-12 py-5 bg-foreground text-background font-bold text-lg border-2 border-foreground hover:bg-background hover:text-foreground transition-all duration-200 uppercase tracking-tighter"
          >
            Get Started Free
          </motion.button>
        </motion.div>
      </div>
    </section>

  );
};
