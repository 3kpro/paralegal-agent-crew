"use client";

import React, { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Zap, Clock, Star } from "lucide-react";

interface StatItem {
  value: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  animatedValue?: number;
}

const stats: StatItem[] = [
  {
    value: "100+",
    label: "Early Access Users",
    icon: Users,
    color: "text-coral-500",
    animatedValue: 100,
  },
  {
    value: "6",
    label: "Platform Integrations",
    icon: Zap,
    color: "text-coral-600",
    animatedValue: 6,
  },
  {
    value: "24/7",
    label: "AI-Powered Trend Discovery",
    icon: Star,
    color: "text-green-500",
    animatedValue: 24,
  },
  {
    value: "48h",
    label: "Average Response Time",
    icon: Clock,
    color: "text-amber-500",
    animatedValue: 48,
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
    <section className="py-20 bg-[#2b2b2b] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-coral-500/5 to-transparent opacity-50" />
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-coral-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-coral-500/5 rounded-full blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-coral-500/20 border border-coral-500/30 rounded-full mb-6">
            <Star className="w-4 h-4 text-coral-400" fill="currentColor" />
            <span className="text-sm font-semibold text-coral-400">
              TrendPulse™ Platform
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Built for Content Creators
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Professional-grade tools backed by real technology
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: `0 20px 40px rgba(0, 0, 0, 0.2)`,
                }}
                className="text-center p-8 bg-[#343a40] backdrop-blur-sm border-2 border-gray-700/50 rounded-2xl hover:border-coral-500/50 hover:shadow-xl hover:shadow-coral-500/10 transition-all duration-300 group"
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`w-16 h-16 mx-auto mb-6 ${stat.color} bg-gradient-to-br from-coral-500/10 to-transparent rounded-2xl flex items-center justify-center border border-gray-700/30 group-hover:border-coral-500/30 group-hover:shadow-sm transition-all duration-300`}
                >
                  <Icon className="w-8 h-8" />
                </motion.div>

                {/* Counter Value */}
                <div
                  className={`text-4xl md:text-5xl font-bold ${stat.color} mb-3 font-mono`}
                >
                  {stat.animatedValue ? (
                    stat.value.includes("%") ? (
                      <>
                        <Counter target={stat.animatedValue} />%
                      </>
                    ) : stat.value.includes("h") ? (
                      <>
                        <Counter target={stat.animatedValue} />h
                      </>
                    ) : stat.value.includes("+") ? (
                      <>
                        <Counter target={stat.animatedValue} />+
                      </>
                    ) : (
                      <Counter target={stat.animatedValue} />
                    )
                  ) : (
                    stat.value
                  )}
                </div>

                {/* Label */}
                <div className="text-gray-300 font-medium leading-tight">
                  {stat.label}
                </div>

                {/* Beta Badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="mt-4 inline-flex px-3 py-1 bg-coral-500/20 border border-coral-500/30 rounded-full"
                >
                  <span className="text-xs font-semibold text-coral-400">
                    BETA
                  </span>
                </motion.div>
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
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            Start creating viral content with AI-powered trend discovery and
            multi-platform publishing
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              window.location.href = "/trend-gen";
            }}
            className="px-8 py-4 bg-coral-500 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:bg-coral-600 transform transition-all duration-200"
          >
            Get Started Free
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
